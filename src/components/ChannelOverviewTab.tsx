import React, { useState } from 'react';
import { ChannelStripData } from '../types/mixer';
import { EqEditorModal } from './EqEditorModal';
import { Sliders, Zap, Disc, Mic, Volume2 } from 'lucide-react';

interface ChannelOverviewTabProps {
  channels: ChannelStripData[];
  selectedChannelId: number;
  onSelectChannel: (id: number) => void;
  onUpdateChannel: (updated: ChannelStripData) => void;
  onOpenEqModal: () => void;
}

export const ChannelOverviewTab: React.FC<ChannelOverviewTabProps> = ({
  channels,
  selectedChannelId,
  onSelectChannel,
  onUpdateChannel,
  onOpenEqModal,
}) => {
  const [listCategory, setListCategory] = useState<'inputs' | 'buses'>('inputs');
  const channel = channels.find((c) => c.id === selectedChannelId) || channels[0];

  const visibleList = listCategory === 'inputs' ? channels.slice(0, 32) : channels.slice(40, 56);

  return (
    <div className="flex-1 bg-zinc-950 flex overflow-hidden select-none">
      {/* Left Column: Quick Channel List */}
      <div className="w-28 sm:w-32 bg-[#0f1117] border-r border-[#202532] flex flex-col overflow-y-auto scrollbar-none py-2 px-1 shrink-0">
        <div className="grid grid-cols-2 gap-1 mb-2">
          <button
            onClick={() => setListCategory('inputs')}
            className={`py-1 rounded text-[9px] font-mono font-bold border cursor-pointer ${
              listCategory === 'inputs' ? 'bg-cyan-500 text-black border-cyan-300' : 'bg-[#151922] text-zinc-400 border-[#1f2533]'
            }`}
          >
            CH 1-32
          </button>
          <button
            onClick={() => setListCategory('buses')}
            className={`py-1 rounded text-[9px] font-mono font-bold border cursor-pointer ${
              listCategory === 'buses' ? 'bg-amber-500 text-black border-amber-300' : 'bg-[#151922] text-zinc-400 border-[#1f2533]'
            }`}
          >
            BUS 1-16
          </button>
        </div>

        <div className="space-y-1">
          {visibleList.map((ch) => {
            const isSel = ch.id === selectedChannelId;
            return (
              <button
                key={ch.id}
                onClick={() => onSelectChannel(ch.id)}
                className={`w-full py-1.5 px-1.5 rounded-xs text-[10px] font-mono flex items-center justify-between cursor-pointer border transition-all ${
                  isSel
                    ? 'bg-cyan-500 text-black font-bold border-cyan-300 shadow-sm'
                    : 'bg-[#151922] text-zinc-400 border-[#1f2533] hover:text-white'
                }`}
              >
                <span>{String(ch.id).padStart(2, '0')}</span>
                <span className="truncate max-w-[50px]">{ch.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Channel Strip Processing Blocks (Identical to M32-Edit Channel tab) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Channel Banner */}
        <div className="bg-[#13161f] border border-[#232936] rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-cyan-500 text-black font-mono font-bold text-sm flex items-center justify-center shadow-md">
              {String(channel.id).padStart(2, '0')}
            </div>
            <div>
              <div className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <span>{channel.name}</span>
                <span className="text-xs font-mono text-cyan-400">CHANNEL PROCESSING BLOCK</span>
              </div>
              <div className="text-[11px] font-mono text-zinc-400">
                Source: Local In {channel.id} · Pan: {channel.pan}% · Fader:{' '}
                {channel.fader <= -85 ? '-∞' : `${channel.fader.toFixed(1)} dB`}
              </div>
            </div>
          </div>

          <button
            onClick={onOpenEqModal}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs rounded cursor-pointer shadow-md"
          >
            EXPAND FULL PEQ SCREEN
          </button>
        </div>

        {/* Processing Blocks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
          {/* 1. CONFIG & PREAMP */}
          <div className="bg-[#12141a] border border-[#232936] rounded-lg p-3.5 space-y-3">
            <div className="text-amber-400 font-bold border-b border-[#232936] pb-1.5 flex justify-between">
              <span>CONFIG / PREAMP</span>
              <span className="text-cyan-400">+{channel.gain} dB</span>
            </div>

            <div>
              <span className="text-zinc-400 block text-[10px] mb-1">ANALOG PREAMP GAIN</span>
              <input
                type="range"
                min="-12"
                max="60"
                value={channel.gain}
                onChange={(e) =>
                  onUpdateChannel({ ...channel, gain: parseInt(e.target.value, 10) })
                }
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() =>
                  onUpdateChannel({ ...channel, phantom48v: !channel.phantom48v })
                }
                className={`py-1.5 rounded text-[11px] font-bold border cursor-pointer ${
                  channel.phantom48v
                    ? 'bg-rose-600 text-white border-rose-400 shadow-md'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                }`}
              >
                +48V PHANTOM
              </button>

              <button
                onClick={() =>
                  onUpdateChannel({ ...channel, polarityInvert: !channel.polarityInvert })
                }
                className={`py-1.5 rounded text-[11px] font-bold border cursor-pointer ${
                  channel.polarityInvert
                    ? 'bg-amber-500 text-black border-amber-300 shadow-md'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                }`}
              >
                Ø POLARITY INV
              </button>
            </div>

            <div className="pt-2 border-t border-[#232936] space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-400">LOW CUT (HPF)</span>
                <span className="text-rose-400">{Math.round(channel.lowCutFreq)} Hz</span>
              </div>
              <input
                type="range"
                min="20"
                max="400"
                value={channel.lowCutFreq}
                onChange={(e) =>
                  onUpdateChannel({ ...channel, lowCutFreq: parseInt(e.target.value, 10) })
                }
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>
          </div>

          {/* 2. NOISE GATE / EXPANDER */}
          <div className="bg-[#12141a] border border-[#232936] rounded-lg p-3.5 space-y-3">
            <div className="text-amber-400 font-bold border-b border-[#232936] pb-1.5 flex justify-between items-center">
              <span>NOISE GATE</span>
              <button
                onClick={() =>
                  onUpdateChannel({
                    ...channel,
                    gate: { ...channel.gate, enabled: !channel.gate.enabled },
                  })
                }
                className={`px-2 py-0.5 rounded text-[10px] border cursor-pointer ${
                  channel.gate.enabled
                    ? 'bg-amber-500 text-black font-bold border-amber-300'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                }`}
              >
                {channel.gate.enabled ? 'ACTIVE' : 'BYPASS'}
              </button>
            </div>

            <div>
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-400">THRESHOLD</span>
                <span className="text-amber-400">{channel.gate.threshold} dB</span>
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
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-400">RANGE</span>
                <span className="text-amber-400">{channel.gate.range} dB</span>
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

            <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-400 pt-1">
              <span>Attack: {channel.gate.attack}ms</span>
              <span>Release: {channel.gate.release}ms</span>
            </div>
          </div>

          {/* 3. DYNAMICS / COMPRESSOR */}
          <div className="bg-[#12141a] border border-[#232936] rounded-lg p-3.5 space-y-3">
            <div className="text-cyan-400 font-bold border-b border-[#232936] pb-1.5 flex justify-between items-center">
              <span>COMPRESSOR</span>
              <button
                onClick={() =>
                  onUpdateChannel({
                    ...channel,
                    compressor: { ...channel.compressor, enabled: !channel.compressor.enabled },
                  })
                }
                className={`px-2 py-0.5 rounded text-[10px] border cursor-pointer ${
                  channel.compressor.enabled
                    ? 'bg-cyan-500 text-black font-bold border-cyan-300'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                }`}
              >
                {channel.compressor.enabled ? 'ACTIVE' : 'BYPASS'}
              </button>
            </div>

            <div>
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-400">THRESHOLD</span>
                <span className="text-cyan-400">{channel.compressor.threshold} dB</span>
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
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-400">RATIO</span>
                <span className="text-cyan-400">{channel.compressor.ratio}:1</span>
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

            <div className="flex justify-between text-[10px] text-zinc-400 pt-1">
              <span>Makeup: +{channel.compressor.makeupGain}dB</span>
              <span>Parallel Mix: {channel.compressor.mix}%</span>
            </div>
          </div>
        </div>

        {/* 4. Mini EQ Summary and Sends */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          {/* EQ Quick Curve & Controls */}
          <div className="bg-[#12141a] border border-[#232936] rounded-lg p-3.5 space-y-3">
            <div className="text-amber-400 font-bold border-b border-[#232936] pb-1.5 flex justify-between">
              <span>PARAMETRIC EQ (PEQ) BANDS</span>
              <button
                onClick={onOpenEqModal}
                className="text-amber-300 hover:underline cursor-pointer"
              >
                Full PEQ View &gt;
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {channel.eqBands.map((band) => (
                <div key={band.id} className="bg-[#0e1015] p-2 rounded border border-zinc-800">
                  <div className="flex justify-between text-[11px] font-bold text-amber-400">
                    <span>BAND {band.id}</span>
                    <span>{band.gain > 0 ? `+${band.gain}` : band.gain} dB</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    {band.frequency >= 1000 ? `${(band.frequency / 1000).toFixed(1)}k` : band.frequency} Hz · Q {band.q}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Bus Sends 1-8 */}
          <div className="bg-[#12141a] border border-[#232936] rounded-lg p-3.5 space-y-3">
            <div className="text-amber-400 font-bold border-b border-[#232936] pb-1.5">
              BUS SENDS 01 - 08 (IEM / MONITORS)
            </div>

            <div className="grid grid-cols-4 gap-2">
              {channel.sends.slice(0, 8).map((s) => (
                <div key={s.busId} className="bg-[#0e1015] p-1.5 rounded border border-zinc-800 text-center">
                  <span className="text-[10px] text-amber-400 font-bold block">BUS {s.busId}</span>
                  <span className="text-[10px] text-zinc-300">
                    {s.level <= -85 ? '-∞' : `${s.level.toFixed(1)}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
