import React from 'react';
import {
  Sliders,
  Volume2,
  Disc,
} from 'lucide-react';
import { ChannelStripData, ChannelColor } from '../types/mixer';

interface TopChannelBarProps {
  channel: ChannelStripData;
  onUpdateChannel: (updated: ChannelStripData) => void;
  onOpenEqModal: () => void;
  onOpenDetailModal: () => void;
}

const colorBadges: Record<ChannelColor, { bg: string; text: string; border: string; glow: string }> = {
  black: { bg: 'bg-[#15181e]', text: 'text-zinc-200', border: 'border-zinc-700', glow: '' },
  red: { bg: 'bg-[#3b0d11]', text: 'text-red-100', border: 'border-red-600', glow: 'shadow-red-950/60' },
  green: { bg: 'bg-[#0b2913]', text: 'text-emerald-100', border: 'border-emerald-600', glow: 'shadow-emerald-950/60' },
  yellow: { bg: 'bg-[#332604]', text: 'text-amber-100', border: 'border-amber-500', glow: 'shadow-amber-950/60' },
  blue: { bg: 'bg-[#0d223f]', text: 'text-blue-100', border: 'border-blue-600', glow: 'shadow-blue-950/60' },
  magenta: { bg: 'bg-[#360d32]', text: 'text-fuchsia-100', border: 'border-fuchsia-600', glow: 'shadow-fuchsia-950/60' },
  cyan: { bg: 'bg-[#092a30]', text: 'text-cyan-100', border: 'border-cyan-500', glow: 'shadow-cyan-950/60' },
  white: { bg: 'bg-[#e2e8f0]', text: 'text-zinc-950', border: 'border-white', glow: '' },
};

export const TopChannelBar: React.FC<TopChannelBarProps> = ({
  channel,
  onUpdateChannel,
  onOpenEqModal,
  onOpenDetailModal,
}) => {
  const badgeStyle = colorBadges[channel.color] || colorBadges.black;

  // Mini EQ curve SVG path
  const b1 = channel.eqBands[0]?.gain || 0;
  const b2 = channel.eqBands[1]?.gain || 0;
  const b3 = channel.eqBands[2]?.gain || 0;
  const b4 = channel.eqBands[3]?.gain || 0;

  const eqPath = `M 0 16 Q 25 ${16 - b1 * 0.9} 50 ${16 - b2 * 0.9} T 75 ${16 - b3 * 0.9} T 100 ${16 - b4 * 0.9}`;

  return (
    <div className="h-13 bg-[#111317] border-b border-[#232733] px-2 sm:px-3 flex items-center justify-between gap-1.5 shrink-0 select-none overflow-x-auto scrollbar-none font-mono">
      {/* 1. CHANNEL SCRIBBLE DISPLAY */}
      <div
        onClick={onOpenDetailModal}
        className={`h-10 px-2 rounded-xs border flex items-center gap-1.5 cursor-pointer transition-all shrink-0 hover:brightness-110 shadow-inner m32-btn ${badgeStyle.bg} ${badgeStyle.border} ${badgeStyle.glow}`}
        title="Tap to open Channel Processing Inspector"
      >
        <div className="flex flex-col items-center justify-center font-bold leading-none">
          <span className="text-[9px] opacity-70">CH</span>
          <span className="text-xs">{String(channel.id).padStart(2, '0')}</span>
        </div>
        <div className="flex flex-col justify-center">
          <span className={`text-[11px] font-bold tracking-tight ${badgeStyle.text} truncate max-w-[85px]`}>
            {channel.name}
          </span>
          <span className="text-[8px] text-zinc-400">
            {channel.fader <= -85 ? '-∞' : `${channel.fader.toFixed(1)}dB`} · {channel.pan === 0 ? 'C' : channel.pan < 0 ? `L${Math.abs(channel.pan)}` : `R${channel.pan}`}
          </span>
        </div>
      </div>

      {/* 2. CONFIG / PREAMP SECTION (Midas PRO Preamp) */}
      <div className="flex items-center gap-2 bg-[#171a22] px-2 py-1 rounded-sm border border-[#262c3b] shrink-0">
        <div className="flex flex-col items-center">
          <span className="text-[8px] text-zinc-400">GAIN</span>
          <span className="text-[10px] font-bold text-cyan-400">+{channel.gain}dB</span>
        </div>

        <input
          type="range"
          min="-12"
          max="60"
          value={channel.gain}
          onChange={(e) =>
            onUpdateChannel({ ...channel, gain: parseInt(e.target.value, 10) })
          }
          className="w-14 h-1 accent-cyan-400 cursor-pointer"
          title={`Analog Preamp Gain: +${channel.gain} dB`}
        />

        {/* +48V Phantom Power */}
        <button
          onClick={() =>
            onUpdateChannel({ ...channel, phantom48v: !channel.phantom48v })
          }
          className={`px-1.5 py-0.5 rounded-xs text-[9px] font-extrabold cursor-pointer border transition-all m32-btn ${
            channel.phantom48v
              ? 'bg-rose-600 text-white border-rose-400 led-glow-red'
              : 'bg-[#0f1116] text-zinc-400 border-[#2b303d] hover:text-white'
          }`}
          title="+48V Phantom Power"
        >
          +48V
        </button>

        {/* Phase Invert */}
        <button
          onClick={() =>
            onUpdateChannel({ ...channel, polarityInvert: !channel.polarityInvert })
          }
          className={`px-1.5 py-0.5 rounded-xs text-[9px] font-extrabold cursor-pointer border transition-all m32-btn ${
            channel.polarityInvert
              ? 'bg-amber-500 text-black border-amber-300 led-glow-amber'
              : 'bg-[#0f1116] text-zinc-400 border-[#2b303d] hover:text-white'
          }`}
          title="Polarity Invert (Ø)"
        >
          Ø
        </button>

        {/* Low Cut (HPF) */}
        <div className="flex items-center gap-1 pl-1 border-l border-[#262c3b]">
          <button
            onClick={() =>
              onUpdateChannel({ ...channel, lowCutEnabled: !channel.lowCutEnabled })
            }
            className={`px-1.5 py-0.5 rounded-xs text-[9px] font-extrabold cursor-pointer border transition-all m32-btn ${
              channel.lowCutEnabled
                ? 'bg-rose-600 text-white border-rose-400 led-glow-red'
                : 'bg-[#0f1116] text-zinc-400 border-[#2b303d] hover:text-white'
            }`}
          >
            LC
          </button>
          <span className="text-[9px] text-zinc-400">
            {Math.round(channel.lowCutFreq)}Hz
          </span>
        </div>
      </div>

      {/* 3. NOISE GATE SECTION */}
      <div className="flex items-center gap-2 bg-[#171a22] px-2 py-1 rounded-sm border border-[#262c3b] shrink-0">
        <button
          onClick={() =>
            onUpdateChannel({
              ...channel,
              gate: { ...channel.gate, enabled: !channel.gate.enabled },
            })
          }
          className={`px-1.5 py-0.5 rounded-xs text-[9px] font-extrabold cursor-pointer border transition-all m32-btn ${
            channel.gate.enabled
              ? 'bg-amber-500 text-black border-amber-300 led-glow-amber'
              : 'bg-[#0f1116] text-zinc-400 border-[#2b303d] hover:text-white'
          }`}
        >
          GATE
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[8px] text-zinc-400">THRESH</span>
          <span className="text-[10px] font-bold text-amber-400">
            {channel.gate.threshold}dB
          </span>
        </div>
        <input
          type="range"
          min="-80"
          max="0"
          value={channel.gate.threshold}
          onChange={(e) =>
            onUpdateChannel({
              ...channel,
              gate: { ...channel.gate, threshold: parseInt(e.target.value, 10) },
            })
          }
          className="w-12 h-1 accent-amber-500 cursor-pointer"
        />
      </div>

      {/* 4. COMPRESSOR SECTION */}
      <div className="flex items-center gap-2 bg-[#171a22] px-2 py-1 rounded-sm border border-[#262c3b] shrink-0">
        <button
          onClick={() =>
            onUpdateChannel({
              ...channel,
              compressor: { ...channel.compressor, enabled: !channel.compressor.enabled },
            })
          }
          className={`px-1.5 py-0.5 rounded-xs text-[9px] font-extrabold cursor-pointer border transition-all m32-btn ${
            channel.compressor.enabled
              ? 'bg-cyan-500 text-black border-cyan-300 led-glow-cyan'
              : 'bg-[#0f1116] text-zinc-400 border-[#2b303d] hover:text-white'
          }`}
        >
          COMP
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[8px] text-zinc-400">THRESH</span>
          <span className="text-[10px] font-bold text-cyan-400">
            {channel.compressor.threshold}dB
          </span>
        </div>
        <input
          type="range"
          min="-60"
          max="0"
          value={channel.compressor.threshold}
          onChange={(e) =>
            onUpdateChannel({
              ...channel,
              compressor: { ...channel.compressor, threshold: parseInt(e.target.value, 10) },
            })
          }
          className="w-12 h-1 accent-cyan-400 cursor-pointer"
        />
      </div>

      {/* 5. LIVE PEQ MINI CURVE WITH COLOR NODES */}
      <div className="flex items-center gap-2 bg-[#171a22] px-2 py-1 rounded-sm border border-[#262c3b] shrink-0">
        <button
          onClick={() =>
            onUpdateChannel({ ...channel, eqEnabled: !channel.eqEnabled })
          }
          className={`px-1.5 py-0.5 rounded-xs text-[9px] font-extrabold cursor-pointer border transition-all m32-btn ${
            channel.eqEnabled
              ? 'bg-amber-500 text-black border-amber-300 led-glow-amber'
              : 'bg-[#0f1116] text-zinc-400 border-[#2b303d] hover:text-white'
          }`}
        >
          EQ
        </button>

        {/* Live SVG Curve */}
        <div
          onClick={onOpenEqModal}
          className="w-22 h-6.5 bg-[#0a0c10] rounded-xs border border-[#2b303d] hover:border-amber-400 cursor-pointer p-0.5 relative flex items-center justify-center transition-all group"
          title="Click to expand Full Parametric EQ screen"
        >
          <svg className="w-full h-full" viewBox="0 0 100 32" preserveAspectRatio="none">
            <path
              d={eqPath}
              fill="none"
              stroke={channel.eqEnabled ? '#f59e0b' : '#52525b'}
              strokeWidth="1.8"
            />
            {/* Color-coded node dots */}
            <circle cx="25" cy={16 - b1 * 0.9} r="2.5" fill="#38bdf8" />
            <circle cx="50" cy={16 - b2 * 0.9} r="2.5" fill="#34d399" />
            <circle cx="75" cy={16 - b3 * 0.9} r="2.5" fill="#facc15" />
            <circle cx="95" cy={16 - b4 * 0.9} r="2.5" fill="#f472b6" />
          </svg>
          <span className="absolute text-[7px] font-bold text-zinc-500 group-hover:text-amber-400 bg-black/80 px-1 rounded-xs">
            VIEW PEQ
          </span>
        </div>
      </div>

      {/* 6. ROTARY PAN & STEREO MAIN ASSIGN */}
      <div className="flex items-center gap-2 bg-[#171a22] px-2 py-1 rounded-sm border border-[#262c3b] shrink-0">
        <div className="flex flex-col items-center">
          <span className="text-[8px] text-zinc-400">PAN</span>
          <span className="text-[9px] font-bold text-zinc-200">
            {channel.pan === 0 ? 'CENTER' : channel.pan < 0 ? `L ${Math.abs(channel.pan)}%` : `R ${channel.pan}%`}
          </span>
        </div>
        <input
          type="range"
          min="-100"
          max="100"
          value={channel.pan}
          onChange={(e) =>
            onUpdateChannel({ ...channel, pan: parseInt(e.target.value, 10) })
          }
          className="w-12 h-1 accent-zinc-200 cursor-pointer"
        />

        <div className="flex items-center gap-1 pl-1 border-l border-[#262c3b]">
          <button
            onClick={() => onUpdateChannel({ ...channel, mainLR: !channel.mainLR })}
            className={`px-1.5 py-0.5 rounded-xs text-[9px] font-extrabold cursor-pointer border transition-all m32-btn ${
              channel.mainLR
                ? 'bg-amber-500 text-black border-amber-300 led-glow-amber'
                : 'bg-[#0f1116] text-zinc-400 border-[#2b303d]'
            }`}
            title="Main Stereo L/R Bus Routing"
          >
            LR
          </button>
          <button
            onClick={() => onUpdateChannel({ ...channel, monoCenter: !channel.monoCenter })}
            className={`px-1.5 py-0.5 rounded-xs text-[9px] font-extrabold cursor-pointer border transition-all m32-btn ${
              channel.monoCenter
                ? 'bg-cyan-500 text-black border-cyan-300 led-glow-cyan'
                : 'bg-[#0f1116] text-zinc-400 border-[#2b303d]'
            }`}
            title="Mono / Subwoofer Bus Routing"
          >
            MONO
          </button>
        </div>
      </div>
    </div>
  );
};
