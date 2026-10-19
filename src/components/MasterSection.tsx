import React, { useRef, useState, useCallback } from 'react';
import {
  Lock,
  Unlock,
  Volume2,
  VolumeX,
  Mic,
  Headphones,
  AlertCircle,
} from 'lucide-react';
import { linearToDb, dbToLinear } from './FaderChannelStrip';

interface MasterSectionProps {
  mainFaderLinear: number;
  onUpdateMainFader: (linearVal: number) => void;
  monoFaderLinear: number;
  onUpdateMonoFader: (linearVal: number) => void;
  isMainMuted: boolean;
  onToggleMainMute: () => void;
  hasActiveSolos: boolean;
  onClearAllSolos: () => void;
  leftMeterDb: number;
  rightMeterDb: number;
  activeMuteGroups: number[];
  onToggleMuteGroup: (grpNum: number) => void;
}

export const MasterSection: React.FC<MasterSectionProps> = ({
  mainFaderLinear,
  onUpdateMainFader,
  monoFaderLinear,
  onUpdateMonoFader,
  isMainMuted,
  onToggleMainMute,
  hasActiveSolos,
  onClearAllSolos,
  leftMeterDb,
  rightMeterDb,
  activeMuteGroups,
  onToggleMuteGroup,
}) => {
  const [isLocked, setIsLocked] = useState(false);
  const [monitorLevel, setMonitorLevel] = useState(70);
  const [isTalkbackActive, setIsTalkbackActive] = useState(false);
  const [lastTapTime, setLastTapTime] = useState(0);

  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const mainDb = linearToDb(mainFaderLinear);
  const monoDb = linearToDb(monoFaderLinear);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isLocked) return;
    e.preventDefault();
    e.stopPropagation();
    const target = e.currentTarget;
    try {
      target.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    setIsDragging(true);

    const now = Date.now();
    if (now - lastTapTime < 320) {
      onUpdateMainFader(dbToLinear(0));
      setLastTapTime(0);
      return;
    }
    setLastTapTime(now);

    updateFaderFromPointer(e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || isLocked) return;
    updateFaderFromPointer(e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    setIsDragging(false);
  };

  const updateFaderFromPointer = useCallback(
    (clientY: number) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const relativeY = clientY - rect.top;
      const clampedY = Math.max(0, Math.min(rect.height, relativeY));
      const normalized = Math.max(0, Math.min(1, 1 - clampedY / rect.height));
      onUpdateMainFader(normalized);
    },
    [onUpdateMainFader]
  );

  const segmentDbs = [-48, -42, -36, -30, -24, -18, -14, -10, -7, -4, -2, -1, -0.5, 0];

  return (
    <aside className="w-48 sm:w-56 bg-[#101318] border-l border-[#232733] p-2 flex flex-col justify-between shrink-0 select-none font-mono">
      {/* 1. TOP MASTER SECTION: SOLO CLEAR, TALKBACK & MONITOR LEVEL */}
      <div className="space-y-1.5">
        {/* Solo Clear & Safety Lock Row */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onClearAllSolos}
            disabled={!hasActiveSolos}
            className={`flex-1 py-1 px-2 rounded-xs text-[11px] font-extrabold transition-all cursor-pointer border flex items-center justify-center gap-1 m32-btn ${
              hasActiveSolos
                ? 'bg-amber-500 text-black border-amber-300 animate-pulse shadow-md shadow-amber-950 led-glow-amber'
                : 'bg-[#161a22] text-zinc-600 border-[#262c3b] opacity-50 cursor-not-allowed'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>SOLO CLR</span>
          </button>

          <button
            onClick={() => setIsLocked(!isLocked)}
            className={`p-1.5 rounded-xs border transition-all cursor-pointer m32-btn ${
              isLocked
                ? 'bg-red-950 text-red-300 border-red-700 shadow-md'
                : 'bg-[#161a22] text-zinc-400 border-[#262c3b] hover:text-white'
            }`}
            title={isLocked ? 'Master Fader Locked' : 'Lock Master Fader'}
          >
            {isLocked ? <Lock className="w-3.5 h-3.5 text-red-400" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Talkback & Phones Monitor */}
        <div className="bg-[#141820] p-2 rounded-sm border border-[#232936] space-y-1.5">
          <div className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1 text-zinc-400">
              <Headphones className="w-3.5 h-3.5 text-cyan-400" />
              <span>MONITOR</span>
            </div>
            <span className="text-zinc-200 font-bold">{monitorLevel}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={monitorLevel}
            onChange={(e) => setMonitorLevel(parseInt(e.target.value, 10))}
            className="w-full h-1 accent-cyan-400 cursor-pointer"
          />

          <button
            onClick={() => setIsTalkbackActive(!isTalkbackActive)}
            className={`w-full py-1 rounded-xs text-[10px] font-extrabold flex items-center justify-center gap-1 transition-all border cursor-pointer m32-btn ${
              isTalkbackActive
                ? 'bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-950 animate-pulse led-glow-red'
                : 'bg-[#0e1015] text-zinc-400 border-[#232936] hover:text-white'
            }`}
          >
            <Mic className="w-3 h-3" />
            <span>{isTalkbackActive ? 'TALKBACK ON' : 'TALKBACK'}</span>
          </button>
        </div>

        {/* Mute Groups 1 to 6 */}
        <div className="space-y-1">
          <span className="text-[9px] font-bold text-zinc-400 block px-0.5">
            MUTE GROUPS
          </span>
          <div className="grid grid-cols-3 gap-1">
            {[1, 2, 3, 4, 5, 6].map((num) => {
              const isActive = activeMuteGroups.includes(num);
              return (
                <button
                  key={num}
                  onClick={() => onToggleMuteGroup(num)}
                  className={`py-1 rounded-xs text-[9px] font-bold transition-all border cursor-pointer m32-btn ${
                    isActive
                      ? 'bg-rose-600 text-white border-rose-400 animate-pulse led-glow-red'
                      : 'bg-[#151921] text-zinc-400 border-[#262c3b] hover:text-zinc-200'
                  }`}
                >
                  MUTE {num}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. CENTER & BOTTOM: MAIN STEREO L/R FADER & HI-RES STEREO METERS */}
      <div className="flex flex-col items-center mt-2">
        {/* Main LCD Banner */}
        <div className="w-full py-1 px-2 rounded-xs bg-[#3b0d11] border border-red-600 mb-2 flex items-center justify-between shadow-inner">
          <span className="font-display font-bold text-xs text-red-100 tracking-wider">
            MAIN L/R
          </span>
          <span className="text-xs font-bold text-red-100">
            {mainDb <= -85 ? '-∞' : `${mainDb.toFixed(1)} dB`}
          </span>
        </div>

        {/* Fader & Stereo Meters Container */}
        <div className="w-full h-[220px] sm:h-[300px] flex items-stretch gap-2 px-0.5">
          {/* Decibel Scale */}
          <div className="flex flex-col justify-between text-[8px] text-zinc-500 py-1 text-right select-none w-4">
            <span>+10</span>
            <span>+5</span>
            <span className="text-zinc-200 font-bold">0</span>
            <span>-5</span>
            <span>-10</span>
            <span>-20</span>
            <span>-30</span>
            <span>-50</span>
            <span>-∞</span>
          </div>

          {/* Main Fader Track */}
          <div
            ref={trackRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`flex-1 bg-fader-track rounded-xs relative touch-fader flex justify-center border border-[#1e222b] shadow-inner group ${
              isLocked ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'
            }`}
            title={isLocked ? 'Master is Locked' : 'Main LR Fader. Double-tap to snap 0.0dB'}
          >
            <div className="w-1.5 h-full bg-[#0a0c10] border-x border-[#1a1d26]" />

            {/* 0.0dB Unity Reference Mark */}
            <div
              className="absolute left-0 right-0 h-px bg-red-500/70 pointer-events-none"
              style={{ top: `${(1 - dbToLinear(0)) * 100}%` }}
            />

            {/* Sculpted Red Master Fader Cap */}
            <div
              className="absolute w-12 sm:w-14 h-10 rounded-xs bg-gradient-to-b from-red-500 via-red-700 to-red-950 shadow-xl border border-red-400/60 cursor-grab active:cursor-grabbing transition-transform duration-75 flex items-center justify-center z-10"
              style={{
                top: `${(1 - mainFaderLinear) * 100}%`,
                transform: 'translateY(-50%)',
              }}
            >
              <div className="w-full h-1 bg-white shadow-sm shadow-white" />
            </div>
          </div>

          {/* Dual Hi-Res Stereo Meters (Left & Right) */}
          <div className="flex items-center gap-1">
            {/* Left Meter */}
            <div className="w-2 flex flex-col-reverse justify-between py-1 bg-[#090b0f] rounded-xs border border-[#1a1e26] px-0.2">
              {segmentDbs.map((segDb, idx) => {
                const isLit = leftMeterDb >= segDb;
                const isClip = segDb >= 0;
                const isAmber = segDb >= -10 && segDb < 0;
                let colorClass = 'bg-[#151922]';
                if (isLit) {
                  if (isClip) colorClass = 'bg-red-500 led-glow-red';
                  else if (isAmber) colorClass = 'bg-amber-400 led-glow-amber';
                  else colorClass = 'bg-emerald-500 led-glow-green';
                }
                return <div key={idx} className={`w-full h-1 rounded-[1px] ${colorClass}`} />;
              })}
            </div>

            {/* Right Meter */}
            <div className="w-2 flex flex-col-reverse justify-between py-1 bg-[#090b0f] rounded-xs border border-[#1a1e26] px-0.2">
              {segmentDbs.map((segDb, idx) => {
                const isLit = rightMeterDb >= segDb;
                const isClip = segDb >= 0;
                const isAmber = segDb >= -10 && segDb < 0;
                let colorClass = 'bg-[#151922]';
                if (isLit) {
                  if (isClip) colorClass = 'bg-red-500 led-glow-red';
                  else if (isAmber) colorClass = 'bg-amber-400 led-glow-amber';
                  else colorClass = 'bg-emerald-500 led-glow-green';
                }
                return <div key={idx} className={`w-full h-1 rounded-[1px] ${colorClass}`} />;
              })}
            </div>
          </div>
        </div>

        {/* Master Mute Button */}
        <button
          onClick={onToggleMainMute}
          className={`w-full mt-2 py-1.5 rounded-xs text-xs font-black tracking-wider transition-all border cursor-pointer m32-btn ${
            isMainMuted
              ? 'bg-gradient-to-b from-red-600 to-red-700 text-white border-red-400 shadow-lg shadow-red-950 led-glow-red animate-pulse'
              : 'bg-[#171a22] text-zinc-400 border-[#2b303d] hover:bg-[#202532] hover:text-white'
          }`}
        >
          {isMainMuted ? 'MAIN MUTED' : 'MAIN MUTE'}
        </button>
      </div>
    </aside>
  );
};
