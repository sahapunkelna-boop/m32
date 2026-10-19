import React, { useState } from 'react';
import {
  X,
  Share2,
  PlusSquare,
  Tablet,
  Download,
  Copy,
  Check,
  Sparkles,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface IpadInstallGuideModalProps {
  onClose: () => void;
}

export const IpadInstallGuideModal: React.FC<IpadInstallGuideModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeMethod, setActiveMethod] = useState<'safari' | 'mobileconfig' | 'ipa'>('safari');

  const appUrl = 'https://ais-pre-fm23xc6oa64hpmj2yhlsmk-222202023746.asia-east1.run.app';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 select-none font-mono">
      <div className="bg-[#12151e] border-2 border-[#2b3348] rounded-xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#171b26] border-b border-[#252b3b] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/40">
              <Tablet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-zinc-100 tracking-wide font-display">
                  ติดตั้ง M32-MIX ลงบน IPAD (INSTALL TO IPAD)
                </span>
                <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-600/60 px-1.5 py-0.5 rounded font-black">
                  STANDALONE PWA
                </span>
              </div>
              <span className="text-[10px] text-zinc-400">
                ติดตั้งเป็นแอปเต็มหน้าจอ 100% ไร้แถบ Safari รองรับมัลติทัช 10 นิ้วพร้อมกัน
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Method Selector Tabs */}
        <div className="flex items-center bg-[#0d0f16] p-1.5 border-b border-[#202534] gap-1 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveMethod('safari')}
            className={`px-3 py-1.5 rounded font-bold cursor-pointer transition-all flex items-center gap-1.5 shrink-0 ${
              activeMethod === 'safari'
                ? 'bg-amber-500 text-black border border-amber-300 shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>วิธีที่ 1: ติดตั้งผ่าน Safari (แนะนำ - ง่ายที่สุด)</span>
          </button>

          <button
            onClick={() => setActiveMethod('mobileconfig')}
            className={`px-3 py-1.5 rounded font-bold cursor-pointer transition-all flex items-center gap-1.5 shrink-0 ${
              activeMethod === 'mobileconfig'
                ? 'bg-cyan-500 text-black border border-cyan-300 shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>วิธีที่ 2: ไฟล์ติดตั้ง (.mobileconfig)</span>
          </button>

          <button
            onClick={() => setActiveMethod('ipa')}
            className={`px-3 py-1.5 rounded font-bold cursor-pointer transition-all flex items-center gap-1.5 shrink-0 ${
              activeMethod === 'ipa'
                ? 'bg-purple-500 text-white border border-purple-300 shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>วิธีที่ 3: Native App (.ipa)</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Quick URL Box */}
          <div className="bg-[#090b10] border border-zinc-800 rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="truncate w-full sm:w-auto">
              <span className="text-[9px] text-zinc-500 block font-bold">URL สำหรับเปิดใน Safari บน iPad</span>
              <span className="text-xs text-amber-300 font-mono font-bold select-all break-all">
                {appUrl}
              </span>
            </div>
            <button
              onClick={handleCopyLink}
              className="w-full sm:w-auto px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0 border border-zinc-700 active:scale-95 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'คัดลอกลิงก์แล้ว!' : 'คัดลอกลิงก์'}</span>
            </button>
          </div>

          {/* TAB 1: SAFARI ADD TO HOME SCREEN */}
          {activeMethod === 'safari' && (
            <div className="space-y-3">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-amber-200 text-xs">
                💡 <b>วิธีนี้คือวิธีทางการของ Apple สำหรับ iPadOS</b>: ไม่ต้องเสียบสายคอมพิวเตอร์ และไม่ต้องเจลเบรก จะได้แอปเต็มจอ 100% ทันที
              </div>

              {/* 3 Step Visual Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="bg-[#161a25] border border-zinc-700 rounded-lg p-3 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="w-6 h-6 rounded-full bg-amber-500 text-black font-black text-xs flex items-center justify-center mb-2">
                      1
                    </div>
                    <span className="text-xs font-bold text-zinc-200 block">เปิดใน Safari</span>
                    <span className="text-[10px] text-zinc-400 block mt-1">
                      เปิดเบราว์เซอร์ Safari บน iPad แล้วไปที่ลิงก์ด้านบน
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono bg-black/40 p-1.5 rounded">
                    Safari บน iPad
                  </div>
                </div>

                <div className="bg-[#161a25] border border-zinc-700 rounded-lg p-3 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="w-6 h-6 rounded-full bg-amber-500 text-black font-black text-xs flex items-center justify-center mb-2">
                      2
                    </div>
                    <span className="text-xs font-bold text-zinc-200 block">แตะปุ่มแชร์ (Share)</span>
                    <span className="text-[10px] text-zinc-400 block mt-1">
                      แตะปุ่มไอคอนสี่เหลี่ยมลูกศรชี้ขึ้น <b>⎋</b> ที่มุมขวาบนของ Safari
                    </span>
                  </div>
                  <div className="text-[10px] text-amber-400 font-mono bg-black/40 p-1.5 rounded flex items-center gap-1">
                    <Share2 className="w-3 h-3" /> แตะไอคอนแชร์ ⎋
                  </div>
                </div>

                <div className="bg-[#161a25] border border-zinc-700 rounded-lg p-3 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="w-6 h-6 rounded-full bg-amber-500 text-black font-black text-xs flex items-center justify-center mb-2">
                      3
                    </div>
                    <span className="text-xs font-bold text-zinc-200 block">เพิ่มไปยังหน้าจอโฮม</span>
                    <span className="text-[10px] text-zinc-400 block mt-1">
                      เลื่อนลงมาเลือก <b>"เพิ่มไปยังหน้าจอโฮม" (Add to Home Screen)</b> แล้วกด "เพิ่ม"
                    </span>
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono bg-black/40 p-1.5 rounded flex items-center gap-1">
                    <PlusSquare className="w-3 h-3" /> Add to Home Screen
                  </div>
                </div>
              </div>

              {/* What you get */}
              <div className="bg-[#0e1119] border border-zinc-800 rounded-lg p-3 space-y-1.5">
                <span className="text-xs font-bold text-zinc-300 block">ประโยชน์หลังจากติดตั้งลง iPad:</span>
                <ul className="text-[11px] text-zinc-400 space-y-1 list-disc list-inside">
                  <li><b>เต็มหน้าจอ 100%</b>: ไร้แถบพิมพ์ URL ด้านบน และไร้แถบ Bookmark</li>
                  <li><b>มัลติทัช 10 นิ้ว</b>: สามารถใช้นิ้วมือรูดปรับเฟดเดอร์พร้อมกันหลายๆ ช่องได้ไม่เลื่อนหลุด</li>
                  <li><b>เปิดได้รวดเร็ว</b>: มีไอคอน M32-Mix บนหน้าจอโฮมของ iPad เหมือนแอปจาก App Store</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: APPLE CONFIGURATION PROFILE (.mobileconfig) */}
          {activeMethod === 'mobileconfig' && (
            <div className="space-y-3">
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3 text-cyan-200 text-xs">
                📲 <b>Apple Configuration Profile</b>: เป็นไฟล์โปรไฟล์ติดตั้งสำหรับอุปกรณ์ iOS / iPadOS โดยเฉพาะ เมื่อดาวน์โหลดแล้ว ระบบจะสร้าง Web Clip ไอคอน M32 ลงหน้าจอให้อัตโนมัติ
              </div>

              <div className="bg-[#161a25] border border-zinc-700 rounded-lg p-4 space-y-3">
                <div>
                  <span className="text-xs font-bold text-zinc-200 block">ดาวน์โหลดไฟล์ติดตั้ง M32-Mix.mobileconfig:</span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">
                    เปิดหน้านี้บน iPad แล้วกดปุ่มดาวน์โหลดด้านล่างนี้ได้โดยตรง
                  </span>
                </div>

                <a
                  href="/m32-mix.mobileconfig"
                  download="m32-mix.mobileconfig"
                  className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-black font-black text-xs rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>ดาวน์โหลดตัวติดตั้งสำหรับ iPad (m32-mix.mobileconfig)</span>
                </a>

                <div className="text-[10px] text-zinc-400 space-y-1 pt-1 border-t border-zinc-800">
                  <p className="font-bold text-zinc-300">ขั้นตอนการติดตั้งไฟล์บน iPad:</p>
                  <ol className="list-decimal list-inside space-y-0.5 text-zinc-400">
                    <li>กดปุ่มดาวน์โหลด &gt; กด "อนุญาต" (Allow) เมื่อ iPad ถาม</li>
                    <li>เปิดแอป <b>การตั้งค่า (Settings)</b> บน iPad</li>
                    <li>แตะที่แถบ <b>"ดาวน์โหลดโปรไฟล์แล้ว" (Profile Downloaded)</b> ด้านบน</li>
                    <li>แตะปุ่ม <b>"ติดตั้ง" (Install)</b> ที่มุมขวาบน จะได้ไอคอน M32-Mix บนหน้าจอทันที</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NATIVE APP PACKAGING (CAPACITOR / XCODE) */}
          {activeMethod === 'ipa' && (
            <div className="space-y-3">
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 text-purple-200 text-xs">
                ⚙️ <b>สำหรับนำขึ้น Apple App Store หรือติดตั้งผ่าน Xcode / AltStore</b>: สามารถห่อหุ้มโค้ดโปรเจกต์นี้ด้วย <b>Capacitor</b> เพื่อบิลด์เป็นไฟล์ .ipa หรือโปรเจกต์ Xcode ได้ทันที
              </div>

              <div className="bg-[#0a0c12] border border-zinc-800 rounded-lg p-3 font-mono text-[11px] text-zinc-300 space-y-2">
                <span className="text-amber-400 font-bold block">คำสั่งบิลด์เป็น Native iOS App (รันในคอมพิวเตอร์):</span>
                <div className="bg-black/60 p-2.5 rounded border border-zinc-800 text-emerald-400 select-all overflow-x-auto space-y-1">
                  <div>npm install @capacitor/core @capacitor/cli @capacitor/ios</div>
                  <div>npx cap init M32Mix com.midas.m32mix --web-dir dist</div>
                  <div>npm run build</div>
                  <div>npx cap add ios</div>
                  <div>npx cap open ios</div>
                </div>
                <span className="text-[10px] text-zinc-500 block">
                  เมื่อรันคำสั่งด้านบน โปรแกรม Xcode จะเปิดขึ้นมา จากนั้นสามารถเสียบสาย iPad แล้วกด Run เพื่อติดตั้งลงเครื่องจริง หรือ Sign &amp; Export เป็นไฟล์ .ipa ได้ทันที
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#171b26] border-t border-[#252b3b] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Midas M32-Mix iPadOS 15, 16, 17, 18 Compatible</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-lg cursor-pointer transition-all"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
