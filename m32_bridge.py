#!/usr/bin/env python3
"""M32 Remote — bridge v2 (เสิร์ฟหน้าแอป + ตัวกลาง WebSocket <-> OSC/UDP พร้อมระบบความปลอดภัย)

ติดตั้ง:  pip install websockets
รัน:      python m32_bridge.py [IP ของ M32]      (ไม่ใส่ IP ก็ได้ — กรอกในหน้า Setup ของแอป)
แล้วเปิด Safari บน iPad ที่ URL ที่โปรแกรมพิมพ์ให้ (วาง m32-remote.html ไว้โฟลเดอร์เดียวกัน)

ความปลอดภัย (ตรวจที่ bridge ไม่ใช่แค่ในแอป):
  1) ต้องจับคู่ด้วยรหัส 6 หลักที่แสดงใน Terminal (ใส่ผิด 5 ครั้งถูกล็อก 60 วินาที)
  2) หลังจับคู่เป็น READ-ONLY ก่อน: อ่านค่าเฟเดอร์/มิวต์ทั้งหมดจากเครื่องให้ครบ แล้วจึงกด ARM ได้
  3) ARM แล้วส่งได้เฉพาะคำสั่งในรายการอนุญาต ตรวจชนิดและช่วงค่า จำกัดอัตรา
  4) คำสั่งเสี่ยง (+48V, โหลดซีน, Oscillator, Talkback, เปลี่ยนชนิดเอฟเฟกต์ ฯลฯ) ต้องเปิด Advanced ก่อน
  5) DISARM อัตโนมัติเมื่อ M32 เงียบเกิน 6 วินาที / เริ่มอ่านค่าใหม่ / หลุดการเชื่อมต่อ
  6) ควบคุมได้ทีละอุปกรณ์เดียว และรับ IP ของคอนโซลเฉพาะวงเครือข่ายภายใน
"""
import asyncio, hmac, http.server, ipaddress, json, math, os, re, secrets, socket, struct, sys, threading, time, types

HERE = os.path.dirname(os.path.abspath(__file__))
PAGE = os.path.join(HERE, "index.html")
HTTP_PORT, WS_PORT, OSC_PORT = 8000, 8080, 10023
STATE = types.SimpleNamespace(active=None, target=None, auth=None, sock=None)

# ---------------- OSC ----------------
def pad(b: bytes) -> bytes:
    b += b"\0"
    return b + b"\0" * (-len(b) % 4)

def encode(addr, args):
    tag, body = ",", b""
    for a in args:
        if isinstance(a, bool) or isinstance(a, int):
            tag += "i"; body += struct.pack(">i", int(a))
        elif isinstance(a, float):
            tag += "f"; body += struct.pack(">f", a)
        else:
            tag += "s"; body += pad(str(a).encode())
    return pad(addr.encode()) + pad(tag.encode()) + body

def parse_osc(d):
    def s(p):
        e = d.index(b"\0", p)
        return d[p:e].decode(errors="replace"), (e + 4) & ~3
    addr, p = s(0)
    tag, p = s(p)
    out = []
    for t in tag[1:]:
        if t == "f": out.append(struct.unpack_from(">f", d, p)[0]); p += 4
        elif t == "i": out.append(struct.unpack_from(">i", d, p)[0]); p += 4
        elif t == "s": v, p = s(p); out.append(v)
        else: break
    return addr, out

def lin01(v):
    """ค่าเมเตอร์เชิงเส้น (1.0 = 0 dBFS) -> 0..1 บนสเกล -60..0 dB"""
    return max(0.0, min(1.0, (20 * math.log10(max(float(v), 1e-5)) + 60) / 60))

def gr_db(v):
    """ตัวคูณเกน (1.0 = ไม่ลด) -> จำนวน dB ที่ลด 0..40"""
    return max(0.0, min(40.0, -20 * math.log10(max(float(v), 1e-5))))

def parse_meter_blob(data):
    """แปลงบล็อบ /meters/N เป็น (addr, args) ตามที่แอปใช้ หรือ None ถ้าไม่รู้จัก
    0: 70 ระดับ (ch32 aux8 fx8 bus16 mtx6) | 1: 32 ระดับ + 32 gate GR + 32 dyn GR (dB)
    2: 25 ระดับ (bus16 mtx6 mainLR mono) + 24 dyn GR (dB) | 15: RTA 100 ช่อง (dB)"""
    try:
        e = data.index(b"\0")
        addr = data[:e].decode(errors="ignore")
        m = re.fullmatch(r"/meters/(\d+)", addr)
        if not m: return None
        bank = int(m.group(1))
        i = data.find(b",b", e)
        if i < 0: return None
        i += 4
        blob = data[i + 4:]
        n = struct.unpack_from("<i", blob, 0)[0]
        if n < 0 or n > 200: return None
        if bank == 15:
            sh = struct.unpack_from("<%dh" % (2 * n), blob, 4)
            return addr, [round(x / 256.0, 1) for x in sh]
        fl = struct.unpack_from("<%df" % n, blob, 4)
        if bank == 0 and n >= 70: return addr, [round(lin01(v), 3) for v in fl[:70]]
        if bank == 1 and n >= 96: return addr, [round(lin01(v), 3) for v in fl[:32]] + [round(gr_db(v), 1) for v in fl[32:96]]
        if bank == 2 and n >= 49: return addr, [round(lin01(v), 3) for v in fl[:25]] + [round(gr_db(v), 1) for v in fl[25:49]]
    except Exception:
        pass
    return None

def encode_cmd(addr, args, t):
    """แอประบุชนิด: i=int, s=string, f=float (JSON แยก 1 กับ 1.0 ไม่ได้)"""
    if t == "i": args = [int(a) for a in args]
    elif t == "s": args = [str(a) for a in args]
    elif t == "f": args = [float(a) for a in args]
    return encode(addr, args)

# ---------------- รายการอนุญาต ----------------
_CH = r"(?:ch/(?:0[1-9]|[12]\d|3[0-2])|auxin/0[1-8]|fxrtn/0[1-8]|bus/(?:0[1-9]|1[0-6])|mtx/0[1-6]|main/(?:st|m))"
_SRC = r"(?:ch/(?:0[1-9]|[12]\d|3[0-2])|auxin/0[1-8]|fxrtn/0[1-8]|bus/(?:0[1-9]|1[0-6]))"
TIER1 = [re.compile(p) for p in [
    rf"/{_CH}/mix/(?:fader|on)", r"/dca/[1-8]/(?:fader|on)",
    rf"/{_SRC}/mix/(?:st|mono|mlevel)", rf"/{_SRC}/mix/(?:0[1-9]|1[0-6])/(?:level|on)",
    rf"/{_CH}/eq/on", rf"/{_CH}/eq/[1-6]/(?:f|g|q)",
    rf"/{_CH}/gate/(?:on|thr|range|attack|hold|release|mode)", rf"/{_CH}/gate/filter/(?:on|f)",
    rf"/{_CH}/dyn/(?:on|thr|ratio|attack|release|mgain)",
    rf"/{_CH}/preamp/(?:rtntrim|invert|hpon|hpf)", rf"/{_CH}/delay/(?:on|time)", rf"/{_CH}/insert/(?:on|pos)",
    rf"/{_CH}/automix/(?:group|weight)", rf"/{_CH}/grp/(?:dca|mute)", rf"/{_CH}/config/(?:name|color)",
    r"/-stat/solosw/(?:0[1-9]|[1-7]\d|80)", r"/headamp/(?:0\d\d|1[01]\d|12[0-7])/gain",
    r"/fx/[1-8]/par/(?:0[1-9]|[1-5]\d|6[0-4])", r"/config/chlink/\d+", r"/config/amixenable/[XY]", r"/-prefs/rta/source"]]
TIER2 = [re.compile(p) for p in [
    r"/headamp/(?:0\d\d|1[01]\d|12[0-7])/phantom", r"/-action/(?:goscene|clearsolo)", r"/-stat/osc/on",
    r"/config/osc/(?:type|level|f1|f2|dest)", r"/config/solo/\w+", r"/config/talk/(?:A|B)/\w+", r"/-stat/talk/[AB]",
    r"/fx/[1-8]/type", r"/fx/[1-4]/source/[lr]", r"/config/mute/[1-6]",
    r"/config/routing/IN/(?:1-8|9-16|17-24|25-32|AUX)", r"/outputs/main/(?:0[1-9]|1[0-6])/(?:src|pos|invert|delay/on|delay/time)",
    r"/outputs/aux/0[1-6]/(?:src|pos|invert)", r"/outputs/p16/(?:0[1-9]|1[0-6])/(?:src|pos|invert)"]]
_BOOL_END = ("/on", "/hpon", "/invert", "/phantom", "/mono", "/st", "/clearsolo")

def classify(addr):
    """1 = อนุญาตปกติ, 2 = เสี่ยง (ต้องเปิด Advanced), 0 = ปฏิเสธ"""
    if not isinstance(addr, str) or len(addr) > 64: return 0
    if any(p.fullmatch(addr) for p in TIER1): return 1
    if any(p.fullmatch(addr) for p in TIER2): return 2
    return 0

def valid(addr, args, t):
    if not isinstance(args, list) or len(args) != 1: return False
    v = args[0]
    if t == "s": return isinstance(v, str) and len(v) <= 12 and v.isprintable() and addr.endswith("/config/name")
    if isinstance(v, bool) or not isinstance(v, (int, float)) or not math.isfinite(v): return False
    if t == "i":
        if int(v) != v: return False
        if addr == "/-prefs/rta/source": return 0 <= v <= 73
        if addr.endswith(_BOOL_END) or "/solosw/" in addr: return v in (0, 1)
        return 0 <= v <= 65535
    if t == "f": return 0.0 <= v <= 1.0
    return False

def snapshot_addrs():
    bases = [f"/ch/{i:02d}" for i in range(1, 33)] + [f"/auxin/{i:02d}" for i in range(1, 9)] + \
            [f"/fxrtn/{i:02d}" for i in range(1, 9)] + [f"/bus/{i:02d}" for i in range(1, 17)] + \
            [f"/mtx/{i:02d}" for i in range(1, 7)] + ["/main/st", "/main/m"]
    out = [f"/dca/{i}/fader" for i in range(1, 9)] + [f"/dca/{i}/on" for i in range(1, 9)]
    for b in bases:
        out.extend([f"{b}/mix/fader", f"{b}/mix/on", f"{b}/config/name", f"{b}/config/color"])
    return out

# ---------------- การจับคู่และการรับรอง ----------------
class AuthManager:
    def __init__(self):
        self.code = f"{secrets.randbelow(1_000_000):06d}"
        self.token = secrets.token_hex(24)
        self.fails = 0
        self.lock_until = 0

    def verify(self, code):
        if time.time() < self.lock_until:
            return False, f"ถูกล็อก — รออีก {int(self.lock_until - time.time())} วินาที"
        if hmac.compare_digest(str(code).strip(), self.code):
            self.fails = 0
            return True, self.token
        self.fails += 1
        if self.fails >= 5:
            self.lock_until = time.time() + 60
            self.fails = 0
            return False, "ใส่รหัสผิดเกิน 5 ครั้ง — ล็อก 60 วินาที"
        return False, f"รหัสไม่ถูกต้อง (เหลือ {5 - self.fails} ครั้ง)"

# ---------------- เซสชันการเชื่อมต่อ ----------------
class ClientSession:
    def __init__(self, ws, auth_token):
        self.ws = ws
        self.auth_token = auth_token
        self.paired = False
        self.armed = False
        self.adv = False
        self.reading = False
        self.expected = set()
        self.received = set()
        self.sync_deadline = 0
        self.last_rx = time.time()
        self.bucket = 40.0
        self.last_leak = time.time()

    def allow_cmd(self):
        now = time.time()
        self.bucket = min(40.0, self.bucket + (now - self.last_leak) * 60)
        self.last_leak = now
        if self.bucket >= 1.0:
            self.bucket -= 1.0; return True
        return False

    def disarm(self, reason):
        if self.armed:
            self.armed = False
            asyncio.create_task(self.send({"type": "disarmed", "reason": reason}))
            print(f"[*] DISARM: {reason}")

    async def send(self, obj):
        try:
            await self.ws.send(json.dumps(obj))
        except Exception:
            pass

def check_ip(ip):
    try:
        a = ipaddress.ip_address(ip)
        return not (a.is_multicast or a.is_unspecified or a.is_loopback)
    except ValueError:
        return False

# ---------------- ตัวจัดการโปรโตคอล OSC ผ่าน UDP ----------------
class OscBridgeProtocol(asyncio.DatagramProtocol):
    def connection_made(self, transport):
        self.transport = transport

    def datagram_received(self, data, addr):
        if STATE.target and addr[0] != STATE.target[0]:
            return
        c = STATE.active
        if not c:
            return
        c.last_rx = time.time()

        # ตรวจสอบว่าเป็นมิเตอร์ไบนารี
        parsed = parse_meter_blob(data)
        if parsed:
            m_addr, m_args = parsed
            asyncio.create_task(c.send({"type": "osc", "addr": m_addr, "args": m_args}))
            return

        try:
            o_addr, o_args = parse_osc(data)
        except Exception:
            return

        if c.reading and o_addr in c.expected:
            c.received.add(o_addr)
            if len(c.received) >= len(c.expected):
                c.reading = False
                asyncio.create_task(c.send({"type": "sync_complete", "count": len(c.received)}))
                print(f"[+] ซิงก์ค่าจาก M32 ครบสมบูรณ์ ({len(c.received)} ค่า)")

        asyncio.create_task(c.send({"type": "osc", "addr": o_addr, "args": o_args}))

# ---------------- ตัวจัดการ WebSocket ----------------
async def ws_handler(ws):
    c = ClientSession(ws, STATE.auth.token)
    if STATE.active and STATE.active.ws != ws:
        await c.send({"type": "error", "msg": "มีอุปกรณ์อื่นควบคุมอยู่แล้ว (อนุญาตเพียง 1 เครื่อง)"})
        await ws.close(1008, "busy")
        return

    STATE.active = c
    print(f"[+] iPad เชื่อมต่อเข้ามาแล้ว ({ws.remote_address[0]})")
    await c.send({"type": "auth_required"})

    try:
        async for msg in ws:
            try:
                data = json.loads(msg)
            except Exception:
                continue

            kind = data.get("type")

            # 1. จับคู่
            if kind == "pair":
                ok, res = STATE.auth.verify(data.get("code"))
                if ok:
                    c.paired = True
                    await c.send({"type": "paired", "token": res})
                    print(f"[+] การจับคู่สำเร็จ! IP: {ws.remote_address[0]}")
                else:
                    await c.send({"type": "pair_fail", "msg": res})
                continue

            # ตรวจสอบการจับคู่สำหรับคำสั่งหลังจากนี้
            if not c.paired:
                if data.get("token") == c.auth_token:
                    c.paired = True
                else:
                    await c.send({"type": "error", "msg": "กรุณาจับคู่ด้วยรหัส 6 หลักก่อน"})
                    continue

            # 2. ตั้งค่า IP ปลายทาง
            if kind == "set_target":
                ip = data.get("ip")
                if not check_ip(ip):
                    await c.send({"type": "error", "msg": "IP ของคอนโซลไม่ถูกต้อง หรือเป็น Loopback"})
                    continue
                STATE.target = (ip, OSC_PORT)
                c.disarm("เปลี่ยน IP เป้าหมาย")
                await c.send({"type": "target_set", "ip": ip, "port": OSC_PORT})
                print(f"[*] ตั้งเป้าหมาย M32 ที่: {ip}:{OSC_PORT}")
                continue

            if not STATE.target:
                await c.send({"type": "error", "msg": "ยังไม่ได้ระบุ IP ของ M32"})
                continue

            # 3. ซิงก์ค่าเริ่มต้น (READ-ONLY)
            if kind == "sync":
                c.disarm("กำลังโหลดค่าสแน็ปช็อตใหม่")
                c.reading = True
                c.expected = set(snapshot_addrs())
                c.received.clear()
                c.sync_deadline = time.time() + 10.0
                await c.send({"type": "sync_start", "total": len(c.expected)})
                for a in c.expected:
                    if STATE.sock:
                        STATE.sock.sendto(encode(a, []), STATE.target)
                    await asyncio.sleep(0.002)
                continue

            # 4. ARM / DISARM
            if kind == "arm":
                if c.reading:
                    await c.send({"type": "error", "msg": "กำลังซิงก์ค่าอยู่ ยังไม่สามารถ ARM ได้"})
                    continue
                if len(c.received) < len(c.expected) * 0.9 and len(c.expected) > 0:
                    await c.send({"type": "error", "msg": "ยังอ่านค่าจากเครื่องไม่ครบ (กด Sync ก่อน)"})
                    continue
                c.armed = True
                c.adv = bool(data.get("adv", False))
                await c.send({"type": "armed", "adv": c.adv})
                print(f"[!] คอนโซล ARMED (ควบคุมได้แล้ว) [Advanced: {c.adv}]")
                continue

            if kind == "disarm":
                c.disarm("ผู้ใช้กด Disarm")
                continue

            # 5. ส่งคำสั่งควบคุม OSC ไปยัง M32 จริง
            if kind == "cmd":
                if not c.armed:
                    await c.send({"type": "rejected", "reason": "ระบบยังไม่ได้ ARM (โหมดอ่านอย่างเดียว)"})
                    continue
                addr = data.get("addr", "")
                args = data.get("args", [])
                t = data.get("t", "f")

                tier = classify(addr)
                if tier == 0 or (tier == 2 and not c.adv):
                    await c.send({"type": "rejected", "reason": "คำสั่งไม่อยู่ในรายการอนุญาต หรือต้องเปิดสิทธิ์ Advanced"})
                    continue
                if not valid(addr, args, t):
                    await c.send({"type": "rejected", "reason": "ค่าหรือชนิดของอาร์กิวเมนต์ไม่ถูกต้อง"})
                    continue
                if not c.allow_cmd():
                    await c.send({"type": "rejected", "reason": "ส่งคำสั่งถี่เกินไป (Rate Limit)"})
                    continue

                if STATE.sock:
                    raw = encode_cmd(addr, args, t)
                    STATE.sock.sendto(raw, STATE.target)

    finally:
        if STATE.active == c:
            c.disarm("การเชื่อมต่อหลุด")
            STATE.active = None
            print("[-] iPad ตัดการเชื่อมต่อ")

# ---------------- การเฝ้าระวังความปลอดภัย ----------------
async def watchdog_task():
    while True:
        await asyncio.sleep(1.0)
        c = STATE.active
        if not c:
            continue
        # หลุดการเชื่อมต่อหากคอนโซลเงียบเกิน 6 วินาที
        if c.armed and (time.time() - c.last_rx > 6.0):
            c.disarm("M32 เงียบเกิน 6 วินาที — ตัดการควบคุมอัตโนมัติ")
        # แจ้งเตือนเมื่อซิงก์หมดเวลา
        if c.reading and time.time() > c.sync_deadline:
            c.reading = False
            missing = len(c.expected) - len(c.received)
            await c.send({"type": "sync_timeout", "missing": missing})
            print(f"[!] ซิงก์หมดเวลา (ขาด {missing} ค่า)")

# ---------------- เว็บเซิร์ฟเวอร์แบบ Static ----------------
def run_http():
    class Handler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=HERE, **kwargs)
        def log_message(self, *a):
            pass # ปิดล็อก HTTP กวนหน้าจอ
    server = http.server.ThreadingHTTPServer(("0.0.0.0", HTTP_PORT), Handler)
    server.serve_forever()

def get_lan_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

# ---------------- โปรแกรมหลัก ----------------
async def main():
    import websockets
    STATE.auth = AuthManager()
    target_ip = sys.argv[1] if len(sys.argv) > 1 else None
    if target_ip and check_ip(target_ip):
        STATE.target = (target_ip, OSC_PORT)

    # เปิด UDP socket
    loop = asyncio.get_running_loop()
    transport, protocol = await loop.create_datagram_endpoint(
        lambda: OscBridgeProtocol(),
        local_addr=("0.0.0.0", 0)
    )
    STATE.sock = transport

    # รันเซิร์ฟเวอร์ไฟล์หน้าเว็บ
    threading.Thread(target=run_http, daemon=True).start()

    lan_ip = get_lan_ip()
    print("=" * 66)
    print("   MIDAS M32 REMOTE BRIDGE v2 — REAL HARDWARE GATEWAY")
    print("=" * 66)
    print(f" [1] รหัสจับคู่ (PIN 6 หลัก):      \033[1;32m{STATE.auth.code}\033[0m")
    print(f" [2] เว็บแอปบน iPad:            http://{lan_ip}:{HTTP_PORT}/")
    print(f" [3] WebSocket Gateway:         ws://{lan_ip}:{WS_PORT}")
    if STATE.target:
        print(f" [4] ปลายทาง M32 ปัจจุบัน:        {STATE.target[0]}:{STATE.target[1]}")
    else:
        print(" [4] ปลายทาง M32:               (กรอก IP ในหน้า SETUP ของแอป)")
    print("=" * 66)
    print(" ความปลอดภัย: บล็อกการส่งคำสั่งจนกว่าจะจับคู่สำเร็จและกด ARM")
    print(" กด Ctrl+C เพื่อหยุดการทำงาน\n")

    asyncio.create_task(watchdog_task())

    async with websockets.serve(ws_handler, "0.0.0.0", WS_PORT):
        await asyncio.Future()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n[!] ปิดบริดจ์แล้ว")
