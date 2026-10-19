import React, { useRef, useState, useCallback } from 'react';
import {
  Mic,
  Disc,
  Radio,
  Sliders,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ChannelStripData, ChannelColor } from '../types/mixer';

interface FaderChannelStripProps {
  channel: ChannelStripData;
  isSelected: boolean;
  onSelect: (chId: number) => void;
  onUpdateFader: (chId: number, linearVal: number) => void;
  onToggleMute: (chId: number) => void;
  onToggleSolo: (chId: number) => void;
  onOpenEq: (chId: number) => void;
  onClearClip: (chId: number) => void;
  onUpdatePan: (chId: number, pan: number) => void;
  sendsOnFaderBus: number | null;
  onUpdateSendLevel?: (chId: number, busId: number, linearVal: number) => void;
}

// Map linear 0..1 to dB (-90 to +10 dB, with 0 dB at 0.75)
export function linearToDb(val: number): number {
  if (val <= 0.001) return -90;
  if (val <= 0.5) {
    return -90 + (val / 0.5) * 70; // -90 to -20
  } else if (val <= 0.75) {
    return -20 + ((val - 0.5) / 0.25) * 20; // -20 to 0
  } else {
    return 0 + ((val - 0.75) / 0.25) * 10; // 0 to +10
  }
}

export function dbToLinear(db: number): number {
  if (db <= -85) return 0;
  if (db <= -20) {
    return ((db + 90) / 70) * 0.5;
  } else if (db <= 0) {
    return 0.5 + ((db + 20) / 20) * 0.25;
  } else {
    return 0.75 + (Math.min(10, db) / 10) * 0.25;
  }
}

// Authentic M32 LCD Scribble Strip Backlight Colors
const m32LcdColors: Record<
  ChannelColor,
  { bg: string; text: string; border: string; glow: string; badge: string }
> = {
  black: {
    bg: 'bg-zinc-950',
    text: 'text-zinc-200',
    border: 'border-zinc-800',
    glow: '',
    badge: 'bg-zinc-800 text-zinc-300',
  },
  red: {
    bg: 'bg-[#400d12]',
    text: 'text-red-100',
    border: 'border-red-600',
    glow: 'shadow-red-950/80',
    badge: 'bg-red-600 text-white',
  },
  green: {
    bg: 'bg-[#0a2f14]',
    text: 'text-emerald-100',
    border: 'border-emerald-500',
    glow: 'shadow-emerald-950/80',
    badge: 'bg-emerald-600 text-white',
  },
  yellow: {
    bg: 'bg-[#3b2d03]',
    text: 'text-amber-100',
    border: 'border-amber-500',
    glow: 'shadow-amber-950/80',
    badge: 'bg-amber-500 text-black',
  },
  blue: {
    bg: 'bg-[#0c2447]',
    text: 'text-blue-100',
    border: 'border-blue-500',
    glow: 'shadow-blue-950/80',
    badge: 'bg-blue-600 text-white',
  },
  magenta: {
    bg: 'bg-[#3d0d38]',
    text: 'text-fuchsia-100',
    border: 'border-fuchsia-500',
    glow: 'shadow-fuchsia-950/80',
    badge: 'bg-fuchsia-600 text-white',
  },
  cyan: {
    bg: 'bg-[#083138]',
    text: 'text-cyan-100',
    border: 'border-cyan-400',
    glow: 'shadow-cyan-950/80',
    badge: 'bg-cyan-500 text-black',
  },
  white: {
    bg: 'bg-[#e2e8f0]',
    text: 'text-zinc-950',
    border: 'border-white',
    glow: 'shadow-white/20',
    badge: 'bg-black text-white',
  },
};

export const FaderChannelStrip: React.FC<FaderChannelStripProps> = ({
  channel,
  isSelected,
  onSelect,
  onUpdateFader,
  onToggleMute,
  onToggleSolo,
  onOpenEq,
  onClearClip,
  onUpdatePan,
  sendsOnFaderBus,
  onUpdateSendLevel,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastTapTime, setLastTapTime] = useState(0);

  // If in SOF mode, the fader value is the send level to that bus
  const currentSend = sendsOnFaderBus && Array.isArray(channel?.sends)
    ? channel.sends.find((s) => s.busId === sendsOnFaderBus)
    : null;
  const effectiveFaderLinear = sendsOnFaderBus && currentSend
    ? dbToLinear(currentSend.level)
    : channel.faderLinear;
  const effectiveFaderDb = sendsOnFaderBus && currentSend
    ? currentSend.level
    : channel.fader;

  // Ultra-stable multi-touch & pointer tracking
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const target = e.currentTarget;
    try {
      target.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    setIsDragging(true);

    // Double tap detection for snap to 0.0 dB (Unity gain)
    const now = Date.now();
    if (now - lastTapTime < 320) {
      const unityLinear = dbToLinear(0);
      if (sendsOnFaderBus && onUpdateSendLevel) {
        onUpdateSendLevel(channel.id, sendsOnFaderBus, unityLinear);
      } else {
        onUpdateFader(channel.id, unityLinear);
      }
      setLastTapTime(0);
      return;
    }
    setLastTapTime(now);

    updateFaderFromPointer(e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
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

      if (sendsOnFaderBus && onUpdateSendLevel) {
        onUpdateSendLevel(channel.id, sendsOnFaderBus, normalized);
      } else {
        onUpdateFader(channel.id, normalized);
      }
    },
    [channel.id, onUpdateFader, sendsOnFaderBus, onUpdateSendLevel]
  );

  const nudgeFader = (deltaDb: number) => {
    const newDb = Math.min(10, Math.max(-90, effectiveFaderDb + deltaDb));
    const newLinear = dbToLinear(newDb);
    if (sendsOnFaderBus && onUpdateSendLevel) {
      onUpdateSendLevel(channel.id, sendsOnFaderBus, newLinear);
    } else {
      onUpdateFader(channel.id, newLinear);
    }
  };

  const lcdStyle = m32LcdColors[channel.color] || m32LcdColors.black;

  // 14-step LED Ladder Meter (-48 dBFS to 0 dBFS CLIP)
  const meterDb = channel.meterLevel;
  const segmentDbs = [-48, -42, -36, -30, -24, -18, -14, -10, -7, -4, -2, -1, -0.5, 0];

  return (
    <div
      className={`w-[105px] sm:w-[114px] flex flex-col items-center bg-[#13161c] border-r border-[#202530] py-1 px-1 select-none shrink-0 transition-colors ${
        isSelected ? 'bg-[#181d26] ring-1 ring-cyan-400/70' : ''
      }`}
    >
      {/* 1. M32 ILLUMINATED 'SEL' BUTTON */}
      <button
        onClick={() => onSelect(channel.id)}
        className={`w-full py-1 rounded text-[11px] font-mono font-extrabold tracking-wider uppercase transition-all cursor-pointer border ${
          isSelected
            ? 'bg-gradient-to-b from-cyan-400 to-cyan-600 text-black border-cyan-200 shadow-md shadow-cyan-900/50'
            : 'bg-[#222733] text-zinc-300 border-[#333a4d] hover:bg-[#2c3342] hover:text-white'
        }`}
      >
        SEL
      </button>

      {/* 2. AUTHENTIC M32 LCD SCRIBBLE STRIP DISPLAY */}
      <div
        onClick={() => onSelect(channel.id)}
        className={`w-full my-1.5 p-1 rounded-sm border flex flex-col justify-between h-14 cursor-pointer overflow-hidden transition-all shadow-inner ${
          lcdStyle.bg
        } ${lcdStyle.border} ${lcdStyle.glow}`}
      >
        {/* Top: Channel Number & Dynamics Indicators */}
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-mono font-bold px-1 rounded-xs ${lcdStyle.badge}`}>
            {String(channel.id).padStart(2, '0')}
          </span>
          <div className="flex items-center gap-0.5">
            {channel.gate.enabled && (
              <span className="text-[8px] font-mono font-bold px-0.5 rounded bg-black/60 text-amber-300">
                G
              </span>
            )}
            {channel.compressor.enabled && (
              <span className="text-[8px] font-mono font-bold px-0.5 rounded bg-black/60 text-cyan-300">
                C
              </span>
            )}
          </div>
        </div>

        {/* Center: Channel Name */}
        <div className={`text-center truncate px-0.5 font-bold text-xs tracking-tight ${lcdStyle.text}`}>
          {channel.name}
        </div>

        {/* Bottom: dB Level & Pan */}
        <div className="flex items-center justify-between text-[10px] font-mono font-bold">
          <span className="truncate">
            {effectiveFaderDb <= -85 ? '-∞' : `${effectiveFaderDb.toFixed(1)}`}
          </span>
          <span className="text-[9px] opacity-75">
            {channel.pan === 0 ? 'C' : channel.pan < 0 ? `L${Math.abs(channel.pan)}` : `R${channel.pan}`}
          </span>
        </div>
      </div>

      {/* 3. MINI EQ CURVE BUTTON */}
      <button
        onClick={() => onOpenEq(channel.id)}
        title="Open Parametric EQ & RTA"
        className="w-full h-6 mb-1 bg-[#0b0d12] rounded-xs border border-[#232936] hover:border-amber-500/60 p-0.5 flex items-center justify-center relative cursor-pointer group"
      >
        <svg className="w-full h-full opacity-80 group-hover:opacity-100" viewBox="0 0 80 20" preserveAspectRatio="none">
          <path
            d={`M 0 10 Q 20 ${10 - channel.eqBands[0].gain * 0.5} 40 ${
              10 - channel.eqBands[1].gain * 0.5
            } T 60 ${10 - channel.eqBands[2].gain * 0.5} T 80 ${
              10 - channel.eqBands[3].gain * 0.5
            }`}
            fill="none"
            stroke={channel.eqEnabled ? '#f59e0b' : '#64748b'}
            strokeWidth="1.8"
          />
        </svg>
        <span className="absolute text-[8px] font-mono font-bold text-zinc-400 group-hover:text-amber-400 bg-black/75 px-1 rounded-xs">
          PEQ
        </span>
      </button>

      {/* 4. PAN SLIDER */}
      <div className="w-full flex items-center justify-between px-1 mb-1 text-[8px] font-mono text-zinc-400">
        <span>L</span>
        <input
          type="range"
          min="-100"
          max="100"
          value={channel.pan}
          onChange={(e) => onUpdatePan(channel.id, parseInt(e.target.value, 10))}
          className="w-12 h-1 bg-[#232936] rounded appearance-none cursor-pointer accent-zinc-300"
          title={`Pan: ${channel.pan === 0 ? 'Center' : channel.pan < 0 ? `L ${Math.abs(channel.pan)}%` : `R ${channel.pan}%`}`}
        />
        <span>R</span>
      </div>

      {/* 5. AUTHENTIC MUTE & SOLO BUTTONS */}
      <div className="w-full grid grid-cols-2 gap-1 mb-1">
        <button
          onClick={() => onToggleMute(channel.id)}
          className={`py-1.5 rounded-sm text-[11px] font-mono font-black tracking-tight transition-all cursor-pointer border ${
            channel.muted
              ? 'bg-gradient-to-b from-red-600 to-red-700 text-white border-red-400 shadow-md shadow-red-950 animate-pulse'
              : 'bg-[#1a1e27] text-zinc-400 border-[#2a303f] hover:bg-[#252b38] hover:text-white'
          }`}
          title="Mute Channel"
        >
          MUTE
        </button>

        <button
          onClick={() => onToggleSolo(channel.id)}
          className={`py-1.5 rounded-sm text-[11px] font-mono font-black tracking-tight transition-all cursor-pointer border ${
            channel.solo
              ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-black border-amber-300 shadow-md shadow-amber-950'
              : 'bg-[#1a1e27] text-zinc-400 border-[#2a303f] hover:bg-[#252b38] hover:text-white'
          }`}
          title="Solo In-Place"
        >
          SOLO
        </button>
      </div>

      {/* 6. 100mm FADER TRACK & DUAL LED METER */}
      <div className="w-full flex-1 min-h-[220px] max-h-[380px] flex items-stretch gap-1 relative px-0.5">
        {/* dB Scale Markings */}
        <div className="flex flex-col justify-between text-[8px] font-mono text-zinc-500 py-1 text-right select-none w-4">
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

        {/* Fader Track Slot */}
        <div
          ref={trackRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="flex-1 bg-fader-track rounded-xs relative touch-fader cursor-pointer flex justify-center border border-[#1e222b] shadow-inner"
          title="Touch & Drag to mix. Double-tap to snap 0.0 dB"
        >
          {/* Silver center guide line */}
          <div className="w-1.5 h-full bg-[#0a0c10] border-x border-[#1a1d26]" />

          {/* 0.0dB Unity Reference Mark */}
          <div
            className="absolute left-0 right-0 h-px bg-zinc-400/50 pointer-events-none"
            style={{ top: `${(1 - dbToLinear(0)) * 100}%` }}
          />

          {/* Sculpted M32 Motorized Fader Cap */}
          <div
            className="fader-cap absolute w-11 sm:w-12 h-10 rounded-xs cursor-grab active:cursor-grabbing transition-transform duration-75 flex items-center justify-center z-10 border border-[#4c566a]/60"
            style={{
              top: `${(1 - effectiveFaderLinear) * 100}%`,
              transform: 'translateY(-50%)',
            }}
          >
            {/* Center Neon Slit */}
            <div className="w-full h-1 bg-white shadow-sm shadow-white" />
          </div>
        </div>

        {/* 14-Step LED Ladder Meter */}
        <div className="w-2.5 flex flex-col-reverse justify-between py-1 bg-[#090b0f] rounded-xs border border-[#1a1e26] px-0.5">
          {segmentDbs.map((segDb, idx) => {
            const isLit = meterDb >= segDb;
            const isClip = segDb >= 0;
            const isAmber = segDb >= -10 && segDb < 0;

            let colorClass = 'bg-[#151921]';
            if (isLit) {
              if (isClip) colorClass = 'bg-red-500 led-glow-red';
              else if (isAmber) colorClass = 'bg-amber-400 led-glow-amber';
              else colorClass = 'bg-emerald-500 led-glow-green';
            }

            return (
              <div
                key={idx}
                className={`w-full h-1 rounded-[1px] transition-colors duration-75 ${colorClass}`}
                onClick={isClip ? () => onClearClip(channel.id) : undefined}
              />
            );
          })}
        </div>
      </div>

      {/* 7. NUDGE BUTTONS */}
      <div className="w-full flex items-center justify-between gap-1 mt-1 text-[9px] font-mono">
        <button
          onClick={() => nudgeFader(-0.5)}
          className="flex-1 py-0.5 bg-[#181d26] hover:bg-[#232936] text-zinc-400 hover:text-white rounded-xs border border-[#262c3b] cursor-pointer"
          title="Nudge -0.5 dB"
        >
          -0.5
        </button>
        <button
          onClick={() => nudgeFader(0.5)}
          className="flex-1 py-0.5 bg-[#181d26] hover:bg-[#232936] text-zinc-400 hover:text-white rounded-xs border border-[#262c3b] cursor-pointer"
          title="Nudge +0.5 dB"
        >
          +0.5
        </button>
      </div>
    </div>
  );
};
