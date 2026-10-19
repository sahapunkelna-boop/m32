import { OscMessageLog } from '../types/mixer';

class OscBridge {
  private logs: OscMessageLog[] = [];
  private maxLogs: number = 80;
  private logListeners: ((logs: OscMessageLog[]) => void)[] = [];
  private isSimulationEnabled: boolean = true;

  // Real WebSocket Bridge connection
  private socket: WebSocket | null = null;
  private realWsUrl: string = 'ws://192.168.1.100:8080';
  private isRealWsConnected: boolean = false;
  private onIncomingOscCommand?: (address: string, args: (string | number)[]) => void;
  private statusListeners: ((connected: boolean) => void)[] = [];
  
  // Bridge v2 security state
  private isPairedState: boolean = false;
  private isArmedState: boolean = false;
  private isAdvState: boolean = false;
  private authToken: string | null = null;
  private syncProgress: { current: number; total: number } = { current: 0, total: 0 };
  private bridgeStateListeners: ((state: {
    paired: boolean;
    armed: boolean;
    adv: boolean;
    syncProgress: { current: number; total: number };
    lastMsg?: string;
  }) => void)[] = [];

  public connectRealWebSocket(url: string) {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    this.realWsUrl = url;
    try {
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        this.isRealWsConnected = true;
        this.logMessage('in', '/sys/connect', ['Connected to Real M32 UDP Bridge']);
        this.notifyStatusListeners(true);
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (!data) return;

          // Bridge v2 message protocol
          if (data.type === 'auth_required') {
            this.isPairedState = false;
            this.isArmedState = false;
            this.notifyBridgeStateListeners('Auth Required: Enter 6-digit PIN');
          } else if (data.type === 'paired') {
            this.isPairedState = true;
            this.authToken = data.token;
            this.notifyBridgeStateListeners('Paired successfully');
          } else if (data.type === 'pair_fail') {
            this.notifyBridgeStateListeners(`Pairing failed: ${data.msg}`);
          } else if (data.type === 'armed') {
            this.isArmedState = true;
            this.isAdvState = Boolean(data.adv);
            this.notifyBridgeStateListeners(data.adv ? 'Armed (Advanced Mode)' : 'Armed (Standard Mode)');
          } else if (data.type === 'disarmed') {
            this.isArmedState = false;
            this.notifyBridgeStateListeners(`Disarmed: ${data.reason}`);
          } else if (data.type === 'sync_start') {
            this.syncProgress = { current: 0, total: data.total || 100 };
            this.notifyBridgeStateListeners('Reading console state...');
          } else if (data.type === 'sync_complete') {
            this.syncProgress = { current: data.count, total: data.count };
            this.notifyBridgeStateListeners(`Snapshot complete: ${data.count} items`);
          } else if (data.type === 'osc') {
            const addr = data.addr;
            const args = data.args || [];
            this.logMessage('in', addr, args);
            if (this.onIncomingOscCommand) {
              this.onIncomingOscCommand(addr, args);
            }
          } else if (data.address) {
            // Legacy/Direct format
            this.logMessage('in', data.address, data.args || []);
            if (this.onIncomingOscCommand) {
              this.onIncomingOscCommand(data.address, data.args || []);
            }
          }
        } catch {
          // non-json or binary
        }
      };

      this.socket.onclose = () => {
        this.isRealWsConnected = false;
        this.isPairedState = false;
        this.isArmedState = false;
        this.notifyStatusListeners(false);
        this.notifyBridgeStateListeners('Disconnected');
      };

      this.socket.onerror = () => {
        this.isRealWsConnected = false;
        this.notifyStatusListeners(false);
      };
    } catch {
      this.isRealWsConnected = false;
      this.notifyStatusListeners(false);
    }
  }

  public disconnectRealWebSocket() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isRealWsConnected = false;
    this.notifyStatusListeners(false);
  }

  public isRealConnected(): boolean {
    return this.isRealWsConnected;
  }

  public getRealWsUrl(): string {
    return this.realWsUrl;
  }

  public subscribeRealStatus(callback: (connected: boolean) => void) {
    this.statusListeners.push(callback);
    callback(this.isRealWsConnected);
    return () => {
      this.statusListeners = this.statusListeners.filter((cb) => cb !== callback);
    };
  }

  private notifyStatusListeners(status: boolean) {
    this.statusListeners.forEach((cb) => cb(status));
  }

  private notifyBridgeStateListeners(lastMsg?: string) {
    const st = {
      paired: this.isPairedState,
      armed: this.isArmedState,
      adv: this.isAdvState,
      syncProgress: this.syncProgress,
      lastMsg,
    };
    this.bridgeStateListeners.forEach((cb) => cb(st));
  }

  public subscribeBridgeState(
    callback: (state: {
      paired: boolean;
      armed: boolean;
      adv: boolean;
      syncProgress: { current: number; total: number };
      lastMsg?: string;
    }) => void
  ) {
    this.bridgeStateListeners.push(callback);
    callback({
      paired: this.isPairedState,
      armed: this.isArmedState,
      adv: this.isAdvState,
      syncProgress: this.syncProgress,
    });
    return () => {
      this.bridgeStateListeners = this.bridgeStateListeners.filter((cb) => cb !== callback);
    };
  }

  public pair(code: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: 'pair', code: code.trim() }));
    }
  }

  public setTargetIp(ip: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: 'set_target', ip: ip.trim(), token: this.authToken }));
    }
  }

  public requestSync() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: 'sync', token: this.authToken }));
    }
  }

  public arm(adv: boolean = false) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: 'arm', adv, token: this.authToken }));
    }
  }

  public disarm() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: 'disarm', token: this.authToken }));
    }
  }

  public getBridgeSecurityState() {
    return {
      paired: this.isPairedState,
      armed: this.isArmedState,
      adv: this.isAdvState,
      syncProgress: this.syncProgress,
    };
  }

  public setIncomingCommandHandler(
    handler: (address: string, args: (string | number)[]) => void
  ) {
    this.onIncomingOscCommand = handler;
  }

  public logMessage(direction: 'in' | 'out', address: string, args: (string | number)[]) {
    const logItem: OscMessageLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString() + '.' + String(Date.now() % 1000).padStart(3, '0'),
      direction,
      address,
      args,
    };

    this.logs.unshift(logItem);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    this.notifyListeners();

    // If connected to real hardware bridge, transmit over WebSocket with Bridge v2 format
    if (direction === 'out' && this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        const firstArg = args[0];
        let argType = 'f';
        if (typeof firstArg === 'string') {
          argType = 's';
        } else if (typeof firstArg === 'number') {
          argType = Number.isInteger(firstArg) ? 'i' : 'f';
        }

        const msgObj = {
          type: 'cmd',
          addr: address,
          args,
          t: argType,
          token: this.authToken,
          // Legacy format compatibility
          address,
        };
        this.socket.send(JSON.stringify(msgObj));
      } catch {
        // ignore send error
      }
    }
  }

  public subscribeLogs(callback: (logs: OscMessageLog[]) => void) {
    this.logListeners.push(callback);
    callback([...this.logs]);
    return () => {
      this.logListeners = this.logListeners.filter((cb) => cb !== callback);
    };
  }

  private notifyListeners() {
    const copy = [...this.logs];
    this.logListeners.forEach((cb) => cb(copy));
  }

  public getLogs(): OscMessageLog[] {
    return [...this.logs];
  }

  public clearLogs() {
    this.logs = [];
    this.notifyListeners();
  }

  // M32 / X32 OSC command formatters (Genuine specification)
  public sendChannelFader(chIndex: number, linearVal: number) {
    const chStr = String(chIndex + 1).padStart(2, '0');
    const addr = `/ch/${chStr}/mix/fader`;
    this.logMessage('out', addr, [Number(linearVal.toFixed(3))]);
  }

  public sendChannelMute(chIndex: number, isMuted: boolean) {
    const chStr = String(chIndex + 1).padStart(2, '0');
    // In M32 OSC: 1 is unmuted (active), 0 is muted
    const addr = `/ch/${chStr}/mix/on`;
    this.logMessage('out', addr, [isMuted ? 0 : 1]);
  }

  public sendChannelPan(chIndex: number, panPercent: number) {
    const chStr = String(chIndex + 1).padStart(2, '0');
    const normPan = (panPercent + 100) / 200;
    const addr = `/ch/${chStr}/mix/pan`;
    this.logMessage('out', addr, [Number(normPan.toFixed(3))]);
  }

  public sendChannelName(chIndex: number, name: string) {
    const chStr = String(chIndex + 1).padStart(2, '0');
    const addr = `/ch/${chStr}/config/name`;
    this.logMessage('out', addr, [name]);
  }

  public sendChannelEqBand(
    chIndex: number,
    bandIdx: number,
    freq: number,
    gainDb: number,
    q: number
  ) {
    const chStr = String(chIndex + 1).padStart(2, '0');
    const bStr = String(bandIdx + 1);
    this.logMessage('out', `/ch/${chStr}/eq/${bStr}/f`, [Math.round(freq)]);
    this.logMessage('out', `/ch/${chStr}/eq/${bStr}/g`, [Number(gainDb.toFixed(1))]);
    this.logMessage('out', `/ch/${chStr}/eq/${bStr}/q`, [Number(q.toFixed(2))]);
  }

  public sendBusFader(busIndex: number, linearVal: number) {
    const bStr = String(busIndex + 1).padStart(2, '0');
    this.logMessage('out', `/bus/${bStr}/mix/fader`, [Number(linearVal.toFixed(3))]);
  }

  public sendMainFader(linearVal: number) {
    this.logMessage('out', `/main/st/mix/fader`, [Number(linearVal.toFixed(3))]);
  }

  public sendDcaFader(dcaIndex: number, linearVal: number) {
    this.logMessage('out', `/dca/${dcaIndex + 1}/fader`, [Number(linearVal.toFixed(3))]);
  }

  public sendSceneRecall(sceneIndex: number, sceneName: string) {
    this.logMessage('out', `/-action/goshow`, [sceneIndex, sceneName]);
  }

  // Simulate incoming OSC replies from M32 DSP Core
  public simulateIncomingTelemetry(address: string, args: (string | number)[]) {
    if (!this.isSimulationEnabled) return;
    this.logMessage('in', address, args);
  }
}

export const oscBridge = new OscBridge();
