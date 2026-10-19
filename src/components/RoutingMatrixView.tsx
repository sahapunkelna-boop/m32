import React, { useState } from 'react';
import { Layers, Check, ArrowRight, RefreshCw } from 'lucide-react';

export const RoutingMatrixView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inputs' | 'outputs' | 'card' | 'aes50'>('inputs');

  const [inputPatch, setInputPatch] = useState({
    ch1_8: 'Local 1-8',
    ch9_16: 'Local 9-16',
    ch17_24: 'Local 17-24',
    ch25_32: 'Local 25-32',
    auxIn: 'Aux In 1-4',
  });

  const [xlrOutPatch, setXlrOutPatch] = useState({
    out1_4: 'Bus 1-4 (Post-Fader IEM)',
    out5_8: 'Bus 5-8 (Stage Wedges)',
    out9_12: 'Bus 9-12 (FX / Matrix)',
    out13_16: 'Main L / Main R / Mono Sub',
  });

  return (
    <div className="flex-1 bg-zinc-950 p-4 flex flex-col gap-4 overflow-y-auto select-none">
      {/* Header */}
      <div className="bg-[#12141a] border border-[#232936] rounded-lg p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <div>
            <div className="text-xs font-mono font-bold text-zinc-100">
              MIDAS M32 ROUTING & I/O PATCH MATRIX
            </div>
            <div className="text-[10px] font-mono text-zinc-400">
              40-Input, 25-Bus Digital Console Routing Engine (Local XLR, AES50, USB Card)
            </div>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 text-xs font-mono">
          {[
            { id: 'inputs', label: 'INPUTS 1-32' },
            { id: 'outputs', label: 'XLR OUTPUTS 1-16' },
            { id: 'card', label: 'CARD USB 32x32' },
            { id: 'aes50', label: 'AES50 A/B STAGEBOX' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3 py-1.5 rounded-sm font-bold cursor-pointer transition-colors border ${
                activeTab === tab.id
                  ? 'bg-cyan-500 text-black border-cyan-300'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'inputs' && (
        <div className="bg-[#12141a] border border-[#232936] rounded-lg p-4 space-y-4 font-mono">
          <div className="border-b border-[#232936] pb-2 text-xs text-amber-400 font-bold">
            CHANNEL INPUT ASSIGNMENT (BLOCK OF 8)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Ch 1-8 */}
            <div className="bg-[#0e1015] p-3 rounded border border-zinc-800 space-y-2">
              <span className="text-zinc-300 font-bold">CHANNELS 01 - 08</span>
              <div className="grid grid-cols-2 gap-1.5">
                {['Local 1-8', 'AES50-A 1-8', 'AES50-B 1-8', 'Card 1-8'].map((src) => (
                  <button
                    key={src}
                    onClick={() => setInputPatch({ ...inputPatch, ch1_8: src })}
                    className={`py-1.5 px-2 rounded text-[11px] border cursor-pointer ${
                      inputPatch.ch1_8 === src
                        ? 'bg-cyan-500 text-black font-bold border-cyan-300'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                    }`}
                  >
                    {src}
                  </button>
                ))}
              </div>
            </div>

            {/* Ch 9-16 */}
            <div className="bg-[#0e1015] p-3 rounded border border-zinc-800 space-y-2">
              <span className="text-zinc-300 font-bold">CHANNELS 09 - 16</span>
              <div className="grid grid-cols-2 gap-1.5">
                {['Local 9-16', 'AES50-A 9-16', 'AES50-B 9-16', 'Card 9-16'].map((src) => (
                  <button
                    key={src}
                    onClick={() => setInputPatch({ ...inputPatch, ch9_16: src })}
                    className={`py-1.5 px-2 rounded text-[11px] border cursor-pointer ${
                      inputPatch.ch9_16 === src
                        ? 'bg-cyan-500 text-black font-bold border-cyan-300'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                    }`}
                  >
                    {src}
                  </button>
                ))}
              </div>
            </div>

            {/* Ch 17-24 */}
            <div className="bg-[#0e1015] p-3 rounded border border-zinc-800 space-y-2">
              <span className="text-zinc-300 font-bold">CHANNELS 17 - 24</span>
              <div className="grid grid-cols-2 gap-1.5">
                {['Local 17-24', 'AES50-A 17-24', 'AES50-B 17-24', 'Card 17-24'].map((src) => (
                  <button
                    key={src}
                    onClick={() => setInputPatch({ ...inputPatch, ch17_24: src })}
                    className={`py-1.5 px-2 rounded text-[11px] border cursor-pointer ${
                      inputPatch.ch17_24 === src
                        ? 'bg-cyan-500 text-black font-bold border-cyan-300'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                    }`}
                  >
                    {src}
                  </button>
                ))}
              </div>
            </div>

            {/* Ch 25-32 */}
            <div className="bg-[#0e1015] p-3 rounded border border-zinc-800 space-y-2">
              <span className="text-zinc-300 font-bold">CHANNELS 25 - 32</span>
              <div className="grid grid-cols-2 gap-1.5">
                {['Local 25-32', 'AES50-A 25-32', 'AES50-B 25-32', 'Card 25-32'].map((src) => (
                  <button
                    key={src}
                    onClick={() => setInputPatch({ ...inputPatch, ch25_32: src })}
                    className={`py-1.5 px-2 rounded text-[11px] border cursor-pointer ${
                      inputPatch.ch25_32 === src
                        ? 'bg-cyan-500 text-black font-bold border-cyan-300'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                    }`}
                  >
                    {src}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'outputs' && (
        <div className="bg-[#12141a] border border-[#232936] rounded-lg p-4 space-y-4 font-mono">
          <div className="border-b border-[#232936] pb-2 text-xs text-amber-400 font-bold">
            PHYSICAL XLR ANALOG OUTPUTS PATCHING (1-16)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-[#0e1015] p-3 rounded border border-zinc-800 space-y-1">
              <span className="text-zinc-300 font-bold">OUTPUTS 01 - 04 (MONITORS)</span>
              <div className="text-cyan-400 text-[11px]">Bus 01-04 (Post-Fader IEM)</div>
            </div>

            <div className="bg-[#0e1015] p-3 rounded border border-zinc-800 space-y-1">
              <span className="text-zinc-300 font-bold">OUTPUTS 05 - 08 (WEDGES)</span>
              <div className="text-cyan-400 text-[11px]">Bus 05-08 (Post-EQ Stage Wedges)</div>
            </div>

            <div className="bg-[#0e1015] p-3 rounded border border-zinc-800 space-y-1">
              <span className="text-zinc-300 font-bold">OUTPUTS 09 - 12 (MATRIX / DELAY)</span>
              <div className="text-cyan-400 text-[11px]">Matrix 01-04 (Speaker Processing)</div>
            </div>

            <div className="bg-[#0e1015] p-3 rounded border border-zinc-800 space-y-1">
              <span className="text-zinc-300 font-bold">OUTPUTS 13 - 16 (FOH PA)</span>
              <div className="text-red-400 text-[11px] font-bold">
                Out 15: Main L (Post) · Out 16: Main R (Post) · Out 14: Mono/Sub
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'card' && (
        <div className="bg-[#12141a] border border-[#232936] rounded-lg p-4 space-y-3 font-mono text-xs">
          <div className="text-amber-400 font-bold">KLARK TEKNIK DN32-USB EXPANSION CARD</div>
          <p className="text-zinc-400 text-[11px]">
            32-Channel bidirectional USB 2.0 Audio Interface for DAW Multitrack Recording & Playback.
          </p>
          <div className="bg-[#0e1015] p-3 rounded border border-zinc-800 grid grid-cols-2 gap-4">
            <div>
              <span className="text-zinc-400 block text-[10px]">RECORDING STREAM</span>
              <span className="text-cyan-400 font-bold">32 Channels Direct Preamp Taps</span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[10px]">VIRTUAL SOUNDCHECK</span>
              <span className="text-emerald-400 font-bold">Ready (1-Tap Playback Switch)</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'aes50' && (
        <div className="bg-[#12141a] border border-[#232936] rounded-lg p-4 space-y-3 font-mono text-xs">
          <div className="text-amber-400 font-bold">AES50 SUPERMAC DIGITAL AUDIO NETWORK</div>
          <p className="text-zinc-400 text-[11px]">
            Dual AES50 ports provide up to 96 bidirectional channels over ruggedized Cat5e cable.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0e1015] p-3 rounded border border-zinc-800">
              <span className="text-zinc-400 block text-[10px]">AES50 PORT A</span>
              <span className="text-emerald-400 font-bold">DL32 Stage Box (Connected · 48kHz Lock)</span>
            </div>
            <div className="bg-[#0e1015] p-3 rounded border border-zinc-800">
              <span className="text-zinc-400 block text-[10px]">AES50 PORT B</span>
              <span className="text-zinc-500 font-bold">Broadcast Relay (Standby)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
