import React from 'react';
import { Layers } from 'lucide-react';

export type BankType =
  | 'ch1-8'
  | 'ch9-16'
  | 'ch17-24'
  | 'ch25-32'
  | 'aux-fx'
  | 'bus1-8'
  | 'bus9-16'
  | 'mtx-main'
  | 'dca';

interface BankSelectorProps {
  currentBank: BankType;
  onSelectBank: (bank: BankType) => void;
  sendsOnFaderBus: number | null;
  onToggleSendsOnFader: (busId: number | null) => void;
}

const banks: { id: BankType; label: string; sub: string }[] = [
  { id: 'ch1-8', label: 'CH 01-08', sub: 'Drums / Perc' },
  { id: 'ch9-16', label: 'CH 09-16', sub: 'Gtrs / Keys / Vox' },
  { id: 'ch17-24', label: 'CH 17-24', sub: 'Brass / Wireless' },
  { id: 'ch25-32', label: 'CH 25-32', sub: 'Stage / Ambient' },
  { id: 'aux-fx', label: 'AUX / FX', sub: 'USB / FX Ret' },
  { id: 'bus1-8', label: 'BUS 01-08', sub: 'IEM / Mon 1-8' },
  { id: 'bus9-16', label: 'BUS 09-16', sub: 'FX / Subs 9-16' },
  { id: 'mtx-main', label: 'MTX / MAIN', sub: 'Matrix & Main' },
  { id: 'dca', label: 'DCA 1-8', sub: 'Control Groups' },
];

const busLabels: { id: number; name: string }[] = [
  { id: 1, name: 'Lead Vox IEM' },
  { id: 2, name: 'Drummer IEM' },
  { id: 3, name: 'Bass IEM' },
  { id: 4, name: 'Guitar IEM' },
  { id: 5, name: 'Keys IEM' },
  { id: 6, name: 'Stage Wedge L' },
  { id: 7, name: 'Stage Wedge R' },
  { id: 8, name: 'Sidefill' },
  { id: 9, name: 'Plate Reverb' },
  { id: 10, name: 'Hall Reverb' },
  { id: 11, name: 'Stereo Delay' },
  { id: 12, name: 'Chorus FX' },
  { id: 13, name: 'Drum Subgroup' },
  { id: 14, name: 'Vocal Subgroup' },
  { id: 15, name: 'Broadcast Out' },
  { id: 16, name: 'Lobby Feed' },
];

export const BankSelector: React.FC<BankSelectorProps> = ({
  currentBank,
  onSelectBank,
  sendsOnFaderBus,
  onToggleSendsOnFader,
}) => {
  return (
    <div className="bg-[#12151b] border-b border-[#232733] px-2 py-1 flex flex-col gap-1 shrink-0 select-none font-mono">
      {/* Top Bank Buttons Row */}
      <div className="flex items-center justify-between gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
        <div className="flex items-center gap-1.5">
          {banks.map((b) => {
            const isActive = currentBank === b.id;
            return (
              <button
                key={b.id}
                onClick={() => onSelectBank(b.id)}
                className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xs transition-all min-w-[82px] sm:min-w-[92px] cursor-pointer border m32-btn ${
                  isActive
                    ? 'bg-[#1e232e] text-amber-400 border-amber-400 shadow-md shadow-amber-950/40 ring-1 ring-amber-400/50'
                    : 'bg-[#151921] text-zinc-300 border-[#252b38] hover:bg-[#1a202a] hover:text-white'
                }`}
              >
                <span className={`text-xs sm:text-[13px] font-black tracking-tight ${isActive ? 'text-amber-400' : 'text-zinc-200'}`}>
                  {b.label}
                </span>
                <span className="text-[10px] text-zinc-400 font-sans font-medium tracking-tight truncate max-w-[80px]">
                  {b.sub}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sends on Fader Toggle Button (The Signature M32 Amber Button) */}
        <div className="flex items-center gap-1 pl-2 border-l border-[#232733] shrink-0">
          <button
            onClick={() => {
              if (sendsOnFaderBus !== null) {
                onToggleSendsOnFader(null);
              } else {
                onToggleSendsOnFader(1); // default Bus 1
              }
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xs text-xs sm:text-sm font-black tracking-wider uppercase transition-all cursor-pointer border m32-btn ${
              sendsOnFaderBus !== null
                ? 'bg-amber-500 text-black border-amber-300 shadow-lg shadow-amber-950 led-glow-amber animate-pulse'
                : 'bg-[#151921] text-zinc-200 border-[#252b38] hover:bg-[#1c222e] hover:text-amber-400'
            }`}
            title="Sends on Fader: Mix monitoring IEMs directly with console faders"
          >
            <Layers className="w-4 h-4" />
            <span>SOF</span>
            {sendsOnFaderBus !== null && (
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[11px] text-amber-200 font-black">
                BUS {String(sendsOnFaderBus).padStart(2, '0')}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Sends on Fader Bus Picker Bar (when SOF is active) */}
      {sendsOnFaderBus !== null && (
        <div className="bg-[#241703] border border-amber-700/60 rounded-xs p-1.5 flex items-center gap-2 overflow-x-auto text-xs shadow-inner">
          <div className="flex items-center gap-1 text-xs font-black text-amber-400 shrink-0 pr-2 border-r border-amber-800/50">
            <span>SENDS ON FADER:</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {busLabels.map((bus) => {
              const isSelected = sendsOnFaderBus === bus.id;
              return (
                <button
                  key={bus.id}
                  onClick={() => onToggleSendsOnFader(bus.id)}
                  className={`px-2.5 py-1 rounded-xs text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-amber-500 text-black font-black border-amber-300 shadow-md shadow-amber-950 led-glow-amber'
                      : 'bg-[#131720] text-amber-200/90 border-amber-900/40 hover:bg-amber-950/70 hover:text-white'
                  }`}
                >
                  B{bus.id} · {bus.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
