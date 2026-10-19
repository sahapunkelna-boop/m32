import React, { useState } from 'react';
import {
  X,
  Zap,
  Sliders,
  Shield,
  Layers,
  Radio,
  Volume2,
  Mic,
  Disc,
  Activity,
  Check,
} from 'lucide-react';
import { ChannelStripData, ChannelColor, ChannelIcon } from '../types/mixer';

interface ChannelDetailModalProps {
  channel: ChannelStripData;
  onClose: () => void;
  onUpdateChannel: (updated: ChannelStripData) => void;
  onOpenEq: () => void;
}

const colorOptions: ChannelColor[] = [
  'black',
  'red',
  'green',
  'yellow',
  'blue',
  'magenta',
  'cyan',
  'white',
];

const colorHex: Record<ChannelColor, string> = {
  black: '#18181b',
  red: '#ef4444',
  green: '#22c55e',
  yellow: '#eab308',
  blue: '#3b82f6',
  magenta: '#d946ef',
  cyan: '#06b6d4',
  white: '#f4f4f5',
};

const iconOptions: { id: ChannelIcon; label: string }[] = [
  { id: 'mic', label: 'Mic' },
  { id: 'mic-lead', label: 'Lead Vox' },
  { id: 'kick', label: 'Kick' },
  { id: 'snare', label: 'Snare' },
  { id: 'toms', label: 'Toms' },
  { id: 'hihat', label: 'Hi-Hat' },
  { id: 'guitar-ac', label: 'Acoustic' },
  { id: 'guitar-el', label: 'E-Guitar' },
  { id: 'bass', label: 'Bass' },
  { id: 'keys', label: 'Keyboard' },
  { id: 'brass', label: 'Brass' },
  { id: 'strings', label: 'Strings' },
  { id: 'dj', label: 'DJ' },
  { id: 'laptop', label: 'Laptop' },
  { id: 'talkback', label: 'Talkback' },
  { id: 'monitor', label: 'Monitor' },
];

export const ChannelDetailModal: React.FC<ChannelDetailModalProps> = ({
  channel,
  onClose,
  onUpdateChannel,
  onOpenEq,
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'gate' | 'comp' | 'sends' | 'routing'>('config');

  const toggleDca = (dcaNum: number) => {
    const current = channel.dcaAssign || [];
    const updated = current.includes(dcaNum)
      ? current.filter((n) => n !== dcaNum)
      : [...current, dcaNum];
    onUpdateChannel({ ...channel, dcaAssign: updated });
  };

  const toggleMuteGroup = (grpNum: number) => {
    const current = channel.muteGroupAssign || [];
    const updated = current.includes(grpNum)
      ? current.filter((n) => n !== grpNum)
      : [...current, grpNum];
    onUpdateChannel({ ...channel, muteGroupAssign: updated });
  };

  const updateSend = (busId: number, level: number) => {
    const updatedSends = channel.sends.map((s) =>
      s.busId === busId ? { ...s, level } : s
    );
    onUpdateChannel({ ...channel, sends: updatedSends });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 select-none">
      <div className="w-full max-w-4xl bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden">
        {/* Header Bar */}
        <div className="h-14 bg-zinc-950 border-b border-zinc-800 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-cyan-500 text-black font-bold font-mono text-sm flex items-center justify-center shadow-md">
              {String(channel.id).padStart(2, '0')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-zinc-100">{channel.name}</span>
                <span className="text-xs font-mono text-cyan-400">CHANNEL INSPECTOR</span>
              </div>
              <div className="text-[10px] text-zinc-400 font-mono">
                Gain: +{channel.gain}dB · Pan: {channel.pan}% · Fader:{' '}
                {channel.fader <= -85 ? '-∞' : `${channel.fader.toFixed(1)}dB`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenEq}
              className="px-3 py-1.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 text-xs font-mono font-bold cursor-pointer"
            >
              OPEN PEQ
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-zinc-950/80 border-b border-zinc-800 px-4 flex items-center gap-2 text-xs font-mono">
          {[
            { id: 'config', label: 'PREAMP / CONFIG' },
            { id: 'gate', label: 'GATE / EXPANDER' },
            { id: 'comp', label: 'COMPRESSOR' },
            { id: 'sends', label: 'BUS SENDS' },
            { id: 'routing', label: 'DCA / MUTE GROUPS' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-2.5 px-3 border-b-2 font-bold cursor-pointer transition-all ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-300 bg-zinc-900'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 bg-zinc-900 space-y-4">
          {/* 1. CONFIG & PREAMP TAB */}
          {activeTab === 'config' && (
            <div className="space-y-4">
              {/* Preamp Controls */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="font-bold text-xs text-zinc-300 font-mono">
                    MIDAS PRO ANALOG PREAMP
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500">
                    Input Source: Local In {channel.id}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  {/* Gain Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-zinc-400">ANALOG GAIN</span>
                      <span className="text-cyan-400 font-bold">+{channel.gain} dB</span>
                    </div>
                    <input
                      type="range"
                      min="-12"
                      max="60"
                      value={channel.gain}
                      onChange={(e) =>
                        onUpdateChannel({ ...channel, gain: parseInt(e.target.value, 10) })
                      }
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-zinc-600">
                      <span>-12 dB</span>
                      <span>+24 dB</span>
                      <span>+60 dB</span>
                    </div>
                  </div>

                  {/* 48V Phantom & Polarity Invert */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        onUpdateChannel({ ...channel, phantom48v: !channel.phantom48v })
                      }
                      className={`flex-1 py-3 rounded-lg text-xs font-mono font-bold transition-all border cursor-pointer ${
                        channel.phantom48v
                          ? 'bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-950 animate-pulse'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-850'
                      }`}
                    >
                      +48V PHANTOM
                    </button>

                    <button
                      onClick={() =>
                        onUpdateChannel({ ...channel, polarityInvert: !channel.polarityInvert })
                      }
                      className={`flex-1 py-3 rounded-lg text-xs font-mono font-bold transition-all border cursor-pointer ${
                        channel.polarityInvert
                          ? 'bg-amber-500 text-black border-amber-300 shadow-md'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-850'
                      }`}
                    >
                      Ø PHASE INV
                    </button>
                  </div>

                  {/* Channel Delay */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-zinc-400">TIME DELAY</span>
                      <span className="text-cyan-400 font-bold">{channel.delayMs} ms</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={channel.delayMs}
                      onChange={(e) =>
                        onUpdateChannel({ ...channel, delayMs: parseInt(e.target.value, 10) })
                      }
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Scribble Strip Customization */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-4">
                <span className="font-bold text-xs text-zinc-300 font-mono">
                  LCD SCRIBBLE STRIP DISPLAY
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono text-zinc-400 block mb-1">
                      CHANNEL NAME
                    </label>
                    <input
                      type="text"
                      value={channel.name}
                      onChange={(e) => onUpdateChannel({ ...channel, name: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 rounded-lg text-sm text-zinc-100 font-mono focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono text-zinc-400 block mb-1">
                      BACKLIGHT COLOR
                    </label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {colorOptions.map((c) => (
                        <button
                          key={c}
                          onClick={() => onUpdateChannel({ ...channel, color: c })}
                          className={`w-7 h-7 rounded border-2 transition-all cursor-pointer ${
                            channel.color === c ? 'border-white scale-110' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: colorHex[c] }}
                          title={c}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1.5">
                    CHANNEL ICON
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {iconOptions.map((ico) => (
                      <button
                        key={ico.id}
                        onClick={() => onUpdateChannel({ ...channel, icon: ico.id })}
                        className={`px-2.5 py-1 rounded text-[11px] font-mono cursor-pointer border ${
                          channel.icon === ico.id
                            ? 'bg-cyan-500 text-black font-bold border-cyan-300'
                            : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-850'
                        }`}
                      >
                        {ico.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. GATE / EXPANDER TAB */}
          {activeTab === 'gate' && (
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-zinc-300 font-mono">NOISE GATE / EXPANDER</span>
                  <button
                    onClick={() =>
                      onUpdateChannel({
                        ...channel,
                        gate: { ...channel.gate, enabled: !channel.gate.enabled },
                      })
                    }
                    className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold border cursor-pointer ${
                      channel.gate.enabled
                        ? 'bg-amber-500 text-black border-amber-300'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    GATE {channel.gate.enabled ? 'ACTIVE' : 'BYPASS'}
                  </button>
                </div>
                <span className="text-[11px] font-mono text-zinc-500">
                  Dynamics Processing Unit 1
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-zinc-400">THRESHOLD</span>
                      <span className="text-amber-400 font-bold">{channel.gate.threshold} dB</span>
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
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-zinc-400">RANGE (ATTENUATION)</span>
                      <span className="text-amber-400 font-bold">{channel.gate.range} dB</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      value={channel.gate.range}
                      onChange={(e) =>
                        onUpdateChannel({
                          ...channel,
                          gate: { ...channel.gate, range: parseInt(e.target.value, 10) },
                        })
                      }
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-zinc-400">ATTACK TIME</span>
                      <span className="text-amber-400 font-bold">{channel.gate.attack} ms</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={channel.gate.attack}
                      onChange={(e) =>
                        onUpdateChannel({
                          ...channel,
                          gate: { ...channel.gate, attack: parseInt(e.target.value, 10) },
                        })
                      }
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-zinc-400">RELEASE TIME</span>
                      <span className="text-amber-400 font-bold">{channel.gate.release} ms</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="1000"
                      value={channel.gate.release}
                      onChange={(e) =>
                        onUpdateChannel({
                          ...channel,
                          gate: { ...channel.gate, release: parseInt(e.target.value, 10) },
                        })
                      }
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. COMPRESSOR TAB */}
          {activeTab === 'comp' && (
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-zinc-300 font-mono">
                    PEAK / RMS COMPRESSOR
                  </span>
                  <button
                    onClick={() =>
                      onUpdateChannel({
                        ...channel,
                        compressor: { ...channel.compressor, enabled: !channel.compressor.enabled },
                      })
                    }
                    className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold border cursor-pointer ${
                      channel.compressor.enabled
                        ? 'bg-cyan-500 text-black border-cyan-300'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    COMP {channel.compressor.enabled ? 'ACTIVE' : 'BYPASS'}
                  </button>
                </div>
                <span className="text-[11px] font-mono text-zinc-500">
                  Dynamics Processing Unit 2
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Threshold & Ratio */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-zinc-400">THRESHOLD</span>
                      <span className="text-cyan-400 font-bold">{channel.compressor.threshold} dB</span>
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
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-zinc-400">RATIO</span>
                      <span className="text-cyan-400 font-bold">{channel.compressor.ratio}:1</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      step="0.5"
                      value={channel.compressor.ratio}
                      onChange={(e) =>
                        onUpdateChannel({
                          ...channel,
                          compressor: { ...channel.compressor, ratio: parseFloat(e.target.value) },
                        })
                      }
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Attack & Release */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-zinc-400">ATTACK TIME</span>
                      <span className="text-cyan-400 font-bold">{channel.compressor.attack} ms</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={channel.compressor.attack}
                      onChange={(e) =>
                        onUpdateChannel({
                          ...channel,
                          compressor: { ...channel.compressor, attack: parseInt(e.target.value, 10) },
                        })
                      }
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-zinc-400">RELEASE TIME</span>
                      <span className="text-cyan-400 font-bold">{channel.compressor.release} ms</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="1000"
                      value={channel.compressor.release}
                      onChange={(e) =>
                        onUpdateChannel({
                          ...channel,
                          compressor: { ...channel.compressor, release: parseInt(e.target.value, 10) },
                        })
                      }
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Makeup Gain & Parallel Mix */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-zinc-400">MAKEUP GAIN</span>
                      <span className="text-cyan-400 font-bold">+{channel.compressor.makeupGain} dB</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="24"
                      value={channel.compressor.makeupGain}
                      onChange={(e) =>
                        onUpdateChannel({
                          ...channel,
                          compressor: { ...channel.compressor, makeupGain: parseInt(e.target.value, 10) },
                        })
                      }
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-zinc-400">PARALLEL MIX %</span>
                      <span className="text-cyan-400 font-bold">{channel.compressor.mix}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={channel.compressor.mix}
                      onChange={(e) =>
                        onUpdateChannel({
                          ...channel,
                          compressor: { ...channel.compressor, mix: parseInt(e.target.value, 10) },
                        })
                      }
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. BUS SENDS TAB */}
          {activeTab === 'sends' && (
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-4">
              <span className="font-bold text-xs text-zinc-300 font-mono">
                16 MIX BUS SEND LEVELS
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {channel.sends.map((s) => (
                  <div key={s.busId} className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-amber-400 font-bold">BUS {s.busId}</span>
                      <span className="text-zinc-300">
                        {s.level <= -85 ? '-∞' : `${s.level.toFixed(1)}dB`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-90"
                      max="10"
                      value={s.level}
                      onChange={(e) => updateSend(s.busId, parseFloat(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. DCA & MUTE GROUPS TAB */}
          {activeTab === 'routing' && (
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-4">
              {/* DCA Groups */}
              <div className="space-y-2">
                <span className="font-bold text-xs text-zinc-300 font-mono">
                  DCA CONTROL GROUP ASSIGNMENT (1-8)
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
                    const isAssigned = (channel.dcaAssign || []).includes(num);
                    return (
                      <button
                        key={num}
                        onClick={() => toggleDca(num)}
                        className={`py-2 rounded font-mono font-bold text-xs cursor-pointer border ${
                          isAssigned
                            ? 'bg-amber-500 text-black border-amber-300'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-850'
                        }`}
                      >
                        DCA {num}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mute Groups */}
              <div className="space-y-2 pt-3 border-t border-zinc-800">
                <span className="font-bold text-xs text-zinc-300 font-mono">
                  MUTE GROUP ASSIGNMENT (1-6)
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((num) => {
                    const isAssigned = (channel.muteGroupAssign || []).includes(num);
                    return (
                      <button
                        key={num}
                        onClick={() => toggleMuteGroup(num)}
                        className={`py-2 rounded font-mono font-bold text-xs cursor-pointer border ${
                          isAssigned
                            ? 'bg-rose-600 text-white border-rose-400'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-850'
                        }`}
                      >
                        MUTE GRP {num}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main Stereo Bus Routing */}
              <div className="space-y-2 pt-3 border-t border-zinc-800 flex items-center gap-4">
                <button
                  onClick={() => onUpdateChannel({ ...channel, mainLR: !channel.mainLR })}
                  className={`py-2 px-4 rounded font-mono font-bold text-xs cursor-pointer border ${
                    channel.mainLR
                      ? 'bg-cyan-500 text-black border-cyan-300'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                  }`}
                >
                  MAIN STEREO L/R: {channel.mainLR ? 'ON' : 'OFF'}
                </button>

                <button
                  onClick={() => onUpdateChannel({ ...channel, monoCenter: !channel.monoCenter })}
                  className={`py-2 px-4 rounded font-mono font-bold text-xs cursor-pointer border ${
                    channel.monoCenter
                      ? 'bg-cyan-500 text-black border-cyan-300'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                  }`}
                >
                  MONO / SUB BUS: {channel.monoCenter ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
