import React from 'react';
import { ChannelStripData } from '../types/mixer';

interface MeterBridgeViewProps {
  channels: ChannelStripData[];
  leftMeterDb: number;
  rightMeterDb: number;
  onSelectChannel: (id: number) => void;
  selectedChannelId: number;
}

const segmentDbs = [-48, -42, -36, -30, -24, -18, -14, -10, -7, -4, -2, -1, -0.5, 0];

export const MeterBridgeView: React.FC<MeterBridgeViewProps> = ({
  channels,
  leftMeterDb,
  rightMeterDb,
  onSelectChannel,
  selectedChannelId,
}) => {
  return (
    <div className="flex-1 bg-zinc-950 p-4 flex flex-col gap-4 overflow-y-auto select-none">
      {/* Top Section: Channels 1-32 Meter Bridge */}
      <div className="bg-[#12141a] border border-[#232936] rounded-lg p-3">
        <div className="flex items-center justify-between border-b border-[#232936] pb-2 mb-3">
          <span className="text-xs font-mono font-bold text-amber-400">
            CHANNELS 01 - 32 INPUT METER BRIDGE (HIGH RESOLUTION PEAK & CLIP)
          </span>
          <span className="text-[10px] font-mono text-zinc-400">
            Midas Pro Preamps · 96kHz / 24-bit AD Converters
          </span>
        </div>

        {/* 32 Channels Grid */}
        <div className="grid grid-cols-8 sm:grid-cols-16 lg:grid-cols-32 gap-1 items-stretch">
          {channels.slice(0, 32).map((ch) => {
            const isSel = ch.id === selectedChannelId;
            return (
              <div
                key={ch.id}
                onClick={() => onSelectChannel(ch.id)}
                className={`flex flex-col items-center bg-[#0d0f14] p-1 rounded-sm border cursor-pointer transition-all hover:border-amber-400/60 ${
                  isSel ? 'border-cyan-400 bg-[#161b24]' : 'border-[#1e2330]'
                }`}
              >
                {/* Channel Label */}
                <span className="text-[9px] font-mono font-bold text-zinc-300">
                  {String(ch.id).padStart(2, '0')}
                </span>

                {/* Meter Ladder */}
                <div className="w-2.5 h-36 flex flex-col-reverse justify-between py-1 bg-zinc-950 rounded-xs border border-[#1a1e28] px-0.5 my-1">
                  {segmentDbs.map((segDb, idx) => {
                    const isLit = ch.meterLevel >= segDb;
                    const isClip = segDb >= 0;
                    const isAmber = segDb >= -10 && segDb < 0;

                    let colorClass = 'bg-[#151922]';
                    if (isLit) {
                      if (isClip) colorClass = 'bg-red-500 led-glow-red';
                      else if (isAmber) colorClass = 'bg-amber-400 led-glow-amber';
                      else colorClass = 'bg-emerald-500 led-glow-green';
                    }

                    return <div key={idx} className={`w-full h-1.5 rounded-[1px] ${colorClass}`} />;
                  })}
                </div>

                {/* Channel Name */}
                <span className="text-[8px] font-mono text-zinc-400 truncate w-full text-center">
                  {ch.name.slice(0, 5)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Section: Mix Buses 1-16 & Master LR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Mix Buses 1-16 */}
        <div className="lg:col-span-2 bg-[#12141a] border border-[#232936] rounded-lg p-3">
          <div className="flex items-center justify-between border-b border-[#232936] pb-2 mb-3">
            <span className="text-xs font-mono font-bold text-amber-400">
              MIX BUSSES 01 - 16 OUTPUT METERS (IEM / WEDGES / FX)
            </span>
          </div>

          <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5">
            {Array.from({ length: 16 }, (_, i) => {
              const busNum = i + 1;
              const busCh = channels[40 + i];
              const busLevel = busCh ? busCh.meterLevel : -18 + Math.sin(busNum * 1.5) * 12;
              return (
                <div
                  key={busNum}
                  onClick={() => busCh && onSelectChannel(busCh.id)}
                  className={`flex flex-col items-center bg-[#0d0f14] p-1 rounded-sm border cursor-pointer transition-all hover:border-amber-400/60 ${
                    busCh && busCh.id === selectedChannelId ? 'border-amber-400 bg-[#1a1814]' : 'border-[#1e2330]'
                  }`}
                >
                  <span className="text-[9px] font-mono font-bold text-amber-400">
                    B{String(busNum).padStart(2, '0')}
                  </span>

                  <div className="w-2.5 h-28 flex flex-col-reverse justify-between py-1 bg-zinc-950 rounded-xs border border-[#1a1e28] px-0.5 my-1">
                    {segmentDbs.map((segDb, idx) => {
                      const isLit = busLevel >= segDb;
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
                  <span className="text-[8px] font-mono text-zinc-500">BUS</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Master Stereo LR & Mono */}
        <div className="bg-[#12141a] border border-[#232936] rounded-lg p-3 flex flex-col justify-between">
          <div className="border-b border-[#232936] pb-2 mb-2">
            <span className="text-xs font-mono font-bold text-red-400">
              MAIN STEREO L/R & MONO / SUB
            </span>
          </div>

          <div className="flex items-center justify-around py-2">
            {/* Left */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-mono font-bold text-red-300">LEFT</span>
              <div className="w-3.5 h-36 flex flex-col-reverse justify-between py-1 bg-zinc-950 rounded-xs border border-[#1a1e28] px-0.5 my-1">
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
                  return <div key={idx} className={`w-full h-1.5 rounded-[1px] ${colorClass}`} />;
                })}
              </div>
              <span className="text-[10px] font-mono text-zinc-300 font-bold">
                {leftMeterDb <= -85 ? '-∞' : `${leftMeterDb.toFixed(1)}`}
              </span>
            </div>

            {/* Right */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-mono font-bold text-red-300">RIGHT</span>
              <div className="w-3.5 h-36 flex flex-col-reverse justify-between py-1 bg-zinc-950 rounded-xs border border-[#1a1e28] px-0.5 my-1">
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
                  return <div key={idx} className={`w-full h-1.5 rounded-[1px] ${colorClass}`} />;
                })}
              </div>
              <span className="text-[10px] font-mono text-zinc-300 font-bold">
                {rightMeterDb <= -85 ? '-∞' : `${rightMeterDb.toFixed(1)}`}
              </span>
            </div>

            {/* Mono / Sub */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-mono font-bold text-cyan-300">MONO</span>
              <div className="w-3.5 h-36 flex flex-col-reverse justify-between py-1 bg-zinc-950 rounded-xs border border-[#1a1e28] px-0.5 my-1">
                {segmentDbs.map((segDb, idx) => {
                  const isLit = leftMeterDb - 2 >= segDb;
                  const isClip = segDb >= 0;
                  const isAmber = segDb >= -10 && segDb < 0;
                  let colorClass = 'bg-[#151922]';
                  if (isLit) {
                    if (isClip) colorClass = 'bg-red-500 led-glow-red';
                    else if (isAmber) colorClass = 'bg-amber-400 led-glow-amber';
                    else colorClass = 'bg-emerald-500 led-glow-green';
                  }
                  return <div key={idx} className={`w-full h-1.5 rounded-[1px] ${colorClass}`} />;
                })}
              </div>
              <span className="text-[10px] font-mono text-zinc-300 font-bold">SUB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
