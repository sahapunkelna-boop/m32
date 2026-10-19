import React, { useState } from 'react';
import {
  Sparkles,
  Power,
  Layers,
  Sliders,
  Check,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Grid,
  ShieldCheck,
  ShieldAlert,
  VolumeX,
  AlertTriangle,
  Zap,
  Radio,
  RefreshCw,
  Activity,
  Volume2,
} from 'lucide-react';
import { audioEngine } from '../services/audioEngine';

export type FxPluginId =
  | 'dn360'
  | 'lexicon480'
  | 'emt250'
  | 'la2a'
  | '1176'
  | 'fairchild670'
  | 'pultec_eqp'
  | 'pultec_meq'
  | 'emt140'
  | 'delay2290'
  | 'dimension_d'
  | 'spl_transient'
  | 'bbe_maximizer'
  | 'sub_octaver'
  | 'deesser'
  | 'quantum_reverb'
  | 'feedback_destroyer';

export interface FxPluginDef {
  id: FxPluginId;
  name: string;
  category: 'Reverb' | 'Dynamics' | 'EQ' | 'Modulation' | 'Special';
  modelTitle: string;
  inspiredBy: string;
  rackUnits: '1U' | '2U' | '3U';
  defaultParams: Record<string, number | string>;
}

export const ALL_16_FX_PLUGINS: FxPluginDef[] = [
  {
    id: 'dn360',
    name: 'Klark Teknik DN360',
    category: 'EQ',
    modelTitle: 'KLARK TEKNIK DN360 DUAL 31-BAND GRAPHIC EQUALISER',
    inspiredBy: 'British Broadcast Standard 31-Band Oil-Damped Faders',
    rackUnits: '3U',
    defaultParams: { f63: 0, f125: -1.5, f250: -2.0, f500: 0, f1k: 1.0, f2k: 1.5, f4k: 2.0, f8k: 1.5, f16k: 1.0 },
  },
  {
    id: 'lexicon480',
    name: 'Lexicon 480L Digital Reverb',
    category: 'Reverb',
    modelTitle: 'LEXICON 480L DIGITAL EFFECTS SYSTEM',
    inspiredBy: 'LARC Remote Controlled Concert Hall & Ambience Processor',
    rackUnits: '2U',
    defaultParams: { preDelay: 35, decay: 2.8, size: 75, diffusion: 80, highCut: 8500, mix: 100 },
  },
  {
    id: 'emt250',
    name: 'EMT 250 Electronic Reverb',
    category: 'Reverb',
    modelTitle: 'EMT 250 ELECTRONIC REVERBERATOR',
    inspiredBy: 'Iconic 1976 Space-Age 4-Lever Lever-Action Processor',
    rackUnits: '3U',
    defaultParams: { decayTime: 2.4, lowDecay: 1.2, highDecay: 0.8, preDelay: 20 },
  },
  {
    id: 'la2a',
    name: 'Teletronix LA-2A Leveler',
    category: 'Dynamics',
    modelTitle: 'TELETRONIX MODEL LA-2A LEVELING AMPLIFIER',
    inspiredBy: 'T4-B Electro-Optical Tube Leveler & Attenuator',
    rackUnits: '3U',
    defaultParams: { peakReduction: 55, gain: 42, mode: 'Compress' },
  },
  {
    id: '1176',
    name: 'Urei 1176LN Peak Limiter',
    category: 'Dynamics',
    modelTitle: 'UREI 1176LN SOLID STATE PEAK LIMITER',
    inspiredBy: 'Rev. E Blackface Class-A Ultra-Fast FET Compressor',
    rackUnits: '2U',
    defaultParams: { input: 30, output: 24, attack: 3, release: 5, ratio: '4:1' },
  },
  {
    id: 'fairchild670',
    name: 'Fairchild 670 Tube Limiter',
    category: 'Dynamics',
    modelTitle: 'FAIRCHILD MODEL 670 DUAL TUBE LIMITER',
    inspiredBy: 'Holy Grail 20-Tube Variable-Mu Mastering Limiter',
    rackUnits: '3U',
    defaultParams: { threshold: 4.5, timeConstant: 2, dcBias: 50, outputGain: 3.0 },
  },
  {
    id: 'pultec_eqp',
    name: 'Pultec EQP-1A Tube EQ',
    category: 'EQ',
    modelTitle: 'PULTEC PROGRAM EQUALIZER MODEL EQP-1A',
    inspiredBy: 'Classic Passive Tube Program EQ with Simultaneous Boost & Atten',
    rackUnits: '3U',
    defaultParams: { lowFreq: 60, lowBoost: 4.5, lowAtten: 2.0, hiFreq: 10, hiBoost: 5.0, hiAtten: 1.0, bandwidth: 4.0 },
  },
  {
    id: 'pultec_meq',
    name: 'Pultec MEQ-5 Midrange EQ',
    category: 'EQ',
    modelTitle: 'PULTEC MID-RANGE EQUALIZER MODEL MEQ-5',
    inspiredBy: 'Passive Inductor Tube Midrange Dip and Peak Sculptor',
    rackUnits: '2U',
    defaultParams: { lowPeakFreq: 500, lowPeak: 3.5, midDipFreq: 1000, midDip: -2.5, hiPeakFreq: 3000, hiPeak: 3.0 },
  },
  {
    id: 'emt140',
    name: 'EMT 140 Plate Reverb',
    category: 'Reverb',
    modelTitle: 'EMT 140 ELEKTRONIK REVERBERATION UNIT',
    inspiredBy: 'German Studio Hammertone Mechanical Steel Plate',
    rackUnits: '2U',
    defaultParams: { decay: 2.1, preDelay: 18, damp: 45, warmth: 60, mix: 100 },
  },
  {
    id: 'delay2290',
    name: 'TC 2290 Dynamic Delay',
    category: 'Modulation',
    modelTitle: 'TC ELECTRONIC 2290 DYNAMIC DIGITAL STEREO DELAY',
    inspiredBy: 'Dynamic Stereo Ducking Delay with Chorus & Panning',
    rackUnits: '2U',
    defaultParams: { timeL: 375, timeR: 500, feedback: 35, filterCut: 6000, ducking: 25 },
  },
  {
    id: 'dimension_d',
    name: 'Roland Dimension D',
    category: 'Modulation',
    modelTitle: 'ROLAND DIMENSION D SDD-320 SPATIAL EXPANDER',
    inspiredBy: 'Analog BBD Bucket-Brigade True Spatial Stereo Expansion',
    rackUnits: '1U',
    defaultParams: { mode: 'Mode 3', intensity: 75 },
  },
  {
    id: 'spl_transient',
    name: 'SPL Transient Designer',
    category: 'Dynamics',
    modelTitle: 'SPL TRANSIENT DESIGNER (WAVE DESIGNER)',
    inspiredBy: 'Differential Envelope Shaper Technology',
    rackUnits: '1U',
    defaultParams: { attack: 4.5, sustain: -3.0, output: 0 },
  },
  {
    id: 'bbe_maximizer',
    name: 'BBE Sonic Maximizer',
    category: 'Special',
    modelTitle: 'BBE SONIC MAXIMIZER HIGH DEFINITION AUDIO',
    inspiredBy: 'Phase Alignment Sub-Harmonic & High Frequency Enhancer',
    rackUnits: '1U',
    defaultParams: { loContour: 5.5, process: 6.0, output: 0 },
  },
  {
    id: 'sub_octaver',
    name: 'Sub Octaver / Bass Enhancer',
    category: 'Special',
    modelTitle: 'SUB-OCTAVE HARMONIC GENERATOR ENGINE',
    inspiredBy: 'Analog Sub-Harmonic Synthesizer for Low-End Punch',
    rackUnits: '1U',
    defaultParams: { subOct1: 65, subOct2: 40, dryMix: 80, rangeHz: 90 },
  },
  {
    id: 'deesser',
    name: 'Precision Dual-Band De-Esser',
    category: 'Dynamics',
    modelTitle: 'PRECISION DUAL-BAND SIBILANCE SUPPRESSOR',
    inspiredBy: 'Dynamic High-Frequency Sibilance Tamer with Listen Audition',
    rackUnits: '1U',
    defaultParams: { freq: 6200, threshold: -24, reduction: 5.5, listen: 0 },
  },
  {
    id: 'quantum_reverb',
    name: 'Quantum Leap / Reverse Reverb',
    category: 'Reverb',
    modelTitle: 'QUANTUM LEAP NON-LINEAR GATED REVERBERATOR',
    inspiredBy: '1980s Non-Linear Gated Snare & Reverse Ambience',
    rackUnits: '2U',
    defaultParams: { gateTime: 240, density: 85, slope: -15, hiCut: 7500 },
  },
  {
    id: 'feedback_destroyer',
    name: 'FBQ2496 Feedback Destroyer PRO',
    category: 'Special',
    modelTitle: 'KLARK TEKNIK / BEHRINGER FBQ2496 PRO FEEDBACK SUPPRESSOR',
    inspiredBy: 'Real-Time Acoustic Feedback Killer with 24 Ultra-Narrow 1/60th Octave Notch Filters',
    rackUnits: '1U',
    defaultParams: {
      mode: 'Auto',
      sensitivity: 75,
      notchDepth: -36,
      bandwidth: '1/60 oct',
      speed: 'Fast (<0.2s)',
      algorithm: 'Speech/Live',
      activeNotches: 6,
      caughtFreq1: 2450,
      caughtDepth1: -28,
      caughtFreq2: 3820,
      caughtDepth2: -34,
      caughtFreq3: 6180,
      caughtDepth3: -24,
      caughtFreq4: 1150,
      caughtDepth4: -18,
      caughtFreq5: 4750,
      caughtDepth5: -30,
      caughtFreq6: 8200,
      caughtDepth6: -26,
      panicKill: 0,
      ringOutRoom: 0,
    },
  },
];

interface RackSlotItem {
  slotId: number;
  pluginId: FxPluginId;
  bypassed: boolean;
  insertChannel: string;
  params: Record<string, number | string>;
}

const defaultRackSlots: RackSlotItem[] = [
  { slotId: 1, pluginId: 'lexicon480', bypassed: false, insertChannel: 'Bus 9-10 (FX 1 Send/Return)', params: { ...ALL_16_FX_PLUGINS[1].defaultParams } },
  { slotId: 2, pluginId: 'emt140', bypassed: false, insertChannel: 'Bus 11-12 (FX 2 Send/Return)', params: { ...ALL_16_FX_PLUGINS[8].defaultParams } },
  { slotId: 3, pluginId: 'delay2290', bypassed: false, insertChannel: 'Bus 13-14 (FX 3 Send/Return)', params: { ...ALL_16_FX_PLUGINS[9].defaultParams } },
  { slotId: 4, pluginId: 'dimension_d', bypassed: false, insertChannel: 'Bus 15-16 (FX 4 Send/Return)', params: { ...ALL_16_FX_PLUGINS[10].defaultParams } },
  { slotId: 5, pluginId: 'la2a', bypassed: false, insertChannel: 'Ch 14 (Lead Vocal Insert)', params: { ...ALL_16_FX_PLUGINS[3].defaultParams } },
  { slotId: 6, pluginId: '1176', bypassed: false, insertChannel: 'Ch 01 (Kick Drum Insert)', params: { ...ALL_16_FX_PLUGINS[4].defaultParams } },
  { slotId: 7, pluginId: 'feedback_destroyer', bypassed: false, insertChannel: 'Ch 06 (Lead Vocal Mic Insert)', params: { ...ALL_16_FX_PLUGINS[16].defaultParams } },
  { slotId: 8, pluginId: 'dn360', bypassed: false, insertChannel: 'Main Stereo L/R Master Insert', params: { ...ALL_16_FX_PLUGINS[0].defaultParams } },
];

// Physical Rack Mounting Screw Component
const RackScrew: React.FC = () => (
  <div className="w-4 h-4 rounded-full screw-head flex items-center justify-center border border-zinc-700/80 shadow-md shrink-0 select-none">
    <div className="w-2.5 h-0.5 bg-zinc-950 rounded-full rotate-45 relative">
      <div className="w-2.5 h-0.5 bg-zinc-950 rounded-full rotate-90 absolute top-0 left-0" />
    </div>
  </div>
);

// Vintage Analog Circular / Rectangular VU Meter
const AnalogVuMeter: React.FC<{
  reductionValue: number;
  label?: string;
  width?: string;
  isCircular?: boolean;
}> = ({ reductionValue, label = 'GAIN REDUCTION', width = 'w-44 sm:w-52', isCircular = false }) => {
  const angle = Math.max(-30, Math.min(25, -30 + reductionValue * 1.1));

  return (
    <div
      className={`${width} h-22 sm:h-26 bg-vu-amber ${isCircular ? 'rounded-full' : 'rounded-sm'} border-2 border-[#1c1917] p-1.5 relative flex flex-col justify-between items-center shadow-2xl overflow-hidden select-none`}
    >
      <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/35 to-transparent pointer-events-none rounded-t-sm" />
      <div className="absolute inset-0 shadow-[inset_0_4px_12px_rgba(0,0,0,0.6)] pointer-events-none" />

      <div className="w-full flex justify-between text-[8px] sm:text-[9px] font-mono font-black text-zinc-900 pt-0.5 px-2 tracking-tighter">
        <span>-20</span>
        <span>-10</span>
        <span>-7</span>
        <span>-5</span>
        <span>-3</span>
        <span>-1</span>
        <span className="text-red-700 font-extrabold">0</span>
        <span className="text-red-700 font-extrabold">+1</span>
        <span className="text-red-700 font-extrabold">+3</span>
      </div>

      <svg className="w-full h-8 -mt-1" viewBox="0 0 160 30">
        <path d="M 15 22 Q 80 5 125 15" fill="none" stroke="#18181b" strokeWidth="1.5" />
        <path d="M 125 15 Q 140 19 150 25" fill="none" stroke="#b91c1c" strokeWidth="2.5" />
      </svg>

      <div
        className="absolute bottom-2 left-1/2 w-0.5 h-16 sm:h-20 bg-zinc-950 origin-bottom transition-transform duration-100 ease-out z-10"
        style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
      >
        <div className="w-1.5 h-4 bg-red-600 -top-1 -left-0.5 absolute rounded-t-xs" />
      </div>

      <div className="w-6 h-6 rounded-full bg-gradient-to-b from-zinc-700 to-zinc-950 absolute -bottom-3 left-1/2 -translate-x-1/2 border border-zinc-600 shadow-md z-20" />

      <div className="w-full flex items-center justify-between px-2 text-[7px] font-mono font-bold text-zinc-800 z-10 pb-0.5">
        <span>VU</span>
        <span className="tracking-widest text-[6px] opacity-80">{label}</span>
        <span>100%</span>
      </div>
    </div>
  );
};

// Vintage Bakelite Knob
const BakeliteKnob: React.FC<{
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  label: string;
  readout: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'black' | 'silver' | 'gold' | 'blue';
}> = ({
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
  readout,
  size = 'md',
  color = 'black',
}) => {
  const fraction = (value - min) / (max - min);
  const rotAngle = -135 + fraction * 270;

  return (
    <div className="flex flex-col items-center select-none space-y-1">
      <span className="text-[9px] font-mono font-bold text-zinc-300 tracking-wider text-center truncate max-w-[85px]">
        {label}
      </span>

      <div className="relative group cursor-pointer">
        <div className="absolute -inset-2 rounded-full border border-dashed border-zinc-600/40 pointer-events-none" />

        <div
          className={`rounded-full flex items-center justify-center transition-transform shadow-2xl relative ${
            size === 'lg'
              ? 'w-16 h-16 sm:w-20 sm:h-20'
              : size === 'sm'
              ? 'w-10 h-10 sm:w-11 sm:h-11'
              : 'w-12 h-12 sm:w-14 sm:h-14'
          } ${
            color === 'black'
              ? 'bg-gradient-to-b from-[#2a2e38] via-[#12141a] to-[#0a0c10] border-2 border-zinc-700 ring-1 ring-black'
              : color === 'silver'
              ? 'bg-gradient-to-b from-[#f1f5f9] via-[#cbd5e1] to-[#64748b] border-2 border-slate-400 ring-1 ring-slate-700'
              : color === 'blue'
              ? 'bg-gradient-to-b from-[#38bdf8] via-[#0284c7] to-[#0c4a6e] border-2 border-cyan-400 ring-1 ring-black'
              : 'bg-gradient-to-b from-[#fef08a] via-[#eab308] to-[#854d0e] border-2 border-amber-400 ring-1 ring-amber-950'
          }`}
          style={{ transform: `rotate(${rotAngle}deg)` }}
        >
          <div
            className={`rounded-full shadow-inner ${
              size === 'lg' ? 'w-8 h-8 sm:w-10 sm:h-10' : size === 'sm' ? 'w-5 h-5' : 'w-6 h-6 sm:w-7 sm:h-7'
            } ${
              color === 'black'
                ? 'bg-gradient-to-tr from-[#3f4553] to-[#1a1d24] border border-zinc-600'
                : 'bg-gradient-to-tr from-white to-slate-400 border border-slate-300'
            }`}
          />
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-3 sm:h-4 bg-white rounded-full shadow-md shadow-white" />
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-16 h-1 accent-amber-400 cursor-pointer opacity-70 hover:opacity-100"
      />

      <span className="text-[10px] font-mono font-black text-amber-400 bg-black/80 px-1.5 py-0.5 rounded-xs border border-zinc-800 shadow-inner">
        {readout}
      </span>
    </div>
  );
};

// Chickenhead Rotary Switch Knob (Pultec Style)
const ChickenheadKnob: React.FC<{
  options: (number | string)[];
  selected: number | string;
  onChange: (val: number | string) => void;
  label: string;
  unit?: string;
}> = ({ options, selected, onChange, label, unit = '' }) => {
  const currentIndex = options.indexOf(selected);
  const rotAngle = -120 + (currentIndex / Math.max(1, options.length - 1)) * 240;

  return (
    <div className="flex flex-col items-center space-y-1 select-none">
      <span className="text-[9px] font-mono font-bold text-zinc-300 tracking-wider">
        {label}
      </span>

      <div className="relative cursor-pointer py-1">
        {/* Chickenhead pointer shape */}
        <div
          onClick={() => {
            const nextIdx = (currentIndex + 1) % options.length;
            onChange(options[nextIdx]);
          }}
          className="w-12 h-12 rounded-full bg-gradient-to-b from-zinc-700 to-zinc-950 border border-zinc-600 relative flex items-center justify-center shadow-lg transition-transform"
          style={{ transform: `rotate(${rotAngle}deg)` }}
          title={`Click to step switch: ${selected}${unit}`}
        >
          {/* Beak point */}
          <div className="absolute -top-3 w-3 h-6 bg-gradient-to-t from-zinc-800 to-zinc-950 border border-zinc-500 rounded-t-full" />
          <div className="w-1 h-5 bg-white absolute -top-2 rounded-full" />
        </div>
      </div>

      <span className="text-[10px] font-mono font-black text-cyan-300 bg-black/80 px-2 py-0.5 rounded-xs border border-cyan-800">
        {selected}{unit}
      </span>
    </div>
  );
};

export const EffectsRackView: React.FC = () => {
  const [rackSlots, setRackSlots] = useState<RackSlotItem[]>(defaultRackSlots);
  const [selectedSlotId, setSelectedSlotId] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'stack' | 'focused' | 'catalog'>('focused');
  const [catalogFilter, setCatalogFilter] = useState<'ALL' | 'Reverb' | 'Dynamics' | 'EQ' | 'Modulation' | 'Special'>('ALL');
  const [isChangingPlugin, setIsChangingPlugin] = useState(false);

  const activeSlot = rackSlots.find((s) => s.slotId === selectedSlotId) || rackSlots[0];
  const activeDef = ALL_16_FX_PLUGINS.find((p) => p.id === activeSlot.pluginId) || ALL_16_FX_PLUGINS[0];

  const toggleSlotBypass = (slotId: number) => {
    setRackSlots((prev) =>
      prev.map((s) => (s.slotId === slotId ? { ...s, bypassed: !s.bypassed } : s))
    );
  };

  const updateSlotParam = (slotId: number, key: string, value: number | string) => {
    setRackSlots((prev) =>
      prev.map((s) =>
        s.slotId === slotId ? { ...s, params: { ...s.params, [key]: value } } : s
      )
    );
  };

  const changeSlotPlugin = (slotId: number, newPluginId: FxPluginId) => {
    const pluginDef = ALL_16_FX_PLUGINS.find((p) => p.id === newPluginId);
    if (!pluginDef) return;
    setRackSlots((prev) =>
      prev.map((s) =>
        s.slotId === slotId
          ? {
              ...s,
              pluginId: newPluginId,
              params: { ...pluginDef.defaultParams },
            }
          : s
      )
    );
    setIsChangingPlugin(false);
  };

  const filteredCatalog =
    catalogFilter === 'ALL'
      ? ALL_16_FX_PLUGINS
      : ALL_16_FX_PLUGINS.filter((p) => p.category === catalogFilter);

  // Helper render for specific physical hardware unit
  const renderHardwareUnitFaceplate = (slot: RackSlotItem, isFullZoom: boolean) => {
    const def = ALL_16_FX_PLUGINS.find((p) => p.id === slot.pluginId) || ALL_16_FX_PLUGINS[0];

    return (
      <div
        key={slot.slotId}
        onClick={() => {
          setSelectedSlotId(slot.slotId);
          if (viewMode === 'stack') setViewMode('focused');
        }}
        className={`border-2 rounded-xs p-3 sm:p-4 relative shadow-2xl transition-all cursor-pointer ${
          def.id === 'pultec_eqp' || def.id === 'pultec_meq'
            ? 'bg-pultec-blue'
            : def.id === 'lexicon480'
            ? 'bg-lexicon-beige'
            : def.id === 'la2a'
            ? 'bg-brushed-silver'
            : def.id === 'emt140'
            ? 'bg-emt-green'
            : def.id === 'fairchild670'
            ? 'bg-fairchild-grey'
            : def.id === 'emt250'
            ? 'bg-space-age'
            : def.id === 'feedback_destroyer'
            ? 'bg-gradient-to-r from-[#14171d] via-[#1c222c] to-[#12151b]'
            : 'bg-brushed-black'
        } ${selectedSlotId === slot.slotId ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-zinc-700/80'}`}
      >
        {/* 4 Corner Rack Screws */}
        <div className="absolute top-2 left-2"><RackScrew /></div>
        <div className="absolute top-2 right-2"><RackScrew /></div>
        <div className="absolute bottom-2 left-2"><RackScrew /></div>
        <div className="absolute bottom-2 right-2"><RackScrew /></div>

        {/* Chassis Top Bar / Header */}
        <div className="flex items-center justify-between border-b border-black/40 pb-2 mb-3 px-6">
          <div className="flex items-center gap-3">
            <div className="h-6 px-2 rounded-xs bg-black/80 text-amber-400 font-mono font-black text-xs flex items-center justify-center border border-amber-600/60 shadow-md">
              SLOT {slot.slotId}
            </div>
            <div>
              <span className={`text-xs sm:text-sm font-black tracking-wider block ${def.id === 'lexicon480' || def.id === 'la2a' ? 'text-zinc-950' : 'text-zinc-100'}`}>
                {def.modelTitle}
              </span>
              <span className={`text-[9px] font-mono block ${def.id === 'lexicon480' || def.id === 'la2a' ? 'text-zinc-700' : 'text-zinc-400'}`}>
                {def.inspiredBy} · <b className="text-cyan-400">{slot.insertChannel}</b>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSlotId(slot.slotId);
                setIsChangingPlugin(true);
              }}
              className="px-2 py-1 rounded-xs text-[9px] font-black bg-zinc-900/90 text-amber-300 border border-amber-500/60 hover:bg-zinc-800 transition-all"
            >
              CHANGE FX ({def.name})
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSlotBypass(slot.slotId);
              }}
              className={`px-2.5 py-1 rounded-xs text-[10px] font-black border cursor-pointer ${
                slot.bypassed
                  ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  : 'bg-emerald-600 text-white border-emerald-400 shadow-md led-glow-green'
              }`}
            >
              {slot.bypassed ? 'BYPASS' : 'ACTIVE'}
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SPECIFIC HARDWARE FACEPLATE VISUAL RENDER PER PLUGIN      */}
        {/* ========================================================= */}
        <div className="px-6 py-2">
          {/* 1. KLARK TEKNIK DN360 (31-BAND GEQ) */}
          {def.id === 'dn360' && (
            <div className="grid grid-cols-9 gap-1.5 bg-[#090b0f] p-3 rounded-xs border border-zinc-800 shadow-inner">
              {[
                { freq: '63Hz', key: 'f63' },
                { freq: '125Hz', key: 'f125' },
                { freq: '250Hz', key: 'f250' },
                { freq: '500Hz', key: 'f500' },
                { freq: '1kHz', key: 'f1k' },
                { freq: '2kHz', key: 'f2k' },
                { freq: '4kHz', key: 'f4k' },
                { freq: '8kHz', key: 'f8k' },
                { freq: '16kHz', key: 'f16k' },
              ].map((f) => (
                <div key={f.key} className="flex flex-col items-center space-y-1">
                  <span className="text-[8px] font-bold text-zinc-300">{f.freq}</span>
                  <div className="h-24 flex items-center justify-center py-1">
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      step="0.5"
                      value={Number(slot.params[f.key]) || 0}
                      onChange={(e) => updateSlotParam(slot.slotId, f.key, parseFloat(e.target.value))}
                      className="h-20 w-1.5 accent-red-500 cursor-pointer"
                      style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                    />
                  </div>
                  <span className="text-[8px] font-bold text-amber-400">
                    {Number(slot.params[f.key]) > 0 ? `+${slot.params[f.key]}` : slot.params[f.key]}dB
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* 2. LEXICON 480L DIGITAL EFFECTS SYSTEM */}
          {def.id === 'lexicon480' && (
            <div className="space-y-3">
              <div className="bg-[#1c0505] p-2 rounded-xs border-2 border-[#3b0d11] shadow-inner flex items-center justify-between text-red-500 font-mono text-xs">
                <span className="font-black drop-shadow-[0_0_6px_#ef4444]">PROG 01: [480L CONCERT HALL]</span>
                <span className="text-[10px]">RT:{slot.params.decay}s · PRE:{slot.params.preDelay}ms · SIZE:{slot.params.size}%</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 bg-[#b3ac9b] p-2.5 rounded-xs border border-zinc-600 shadow-inner">
                {[
                  { label: 'RTIME', key: 'decay', min: 0.3, max: 12.0, step: 0.1, val: Number(slot.params.decay), unit: 's' },
                  { label: 'PRE-D', key: 'preDelay', min: 0, max: 200, step: 1, val: Number(slot.params.preDelay), unit: 'ms' },
                  { label: 'SIZE', key: 'size', min: 10, max: 100, step: 1, val: Number(slot.params.size), unit: '%' },
                  { label: 'DIFF', key: 'diffusion', min: 0, max: 100, step: 1, val: Number(slot.params.diffusion), unit: '%' },
                  { label: 'COLOR', key: 'highCut', min: 2000, max: 18000, step: 100, val: Number(slot.params.highCut), unit: 'Hz' },
                  { label: 'MIX', key: 'mix', min: 0, max: 100, step: 1, val: Number(slot.params.mix), unit: '%' },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col items-center space-y-1">
                    <span className="text-[9px] font-black text-zinc-900">{s.label}</span>
                    <input
                      type="range"
                      min={s.min}
                      max={s.max}
                      step={s.step}
                      value={s.val}
                      onChange={(e) => updateSlotParam(slot.slotId, s.key, parseFloat(e.target.value))}
                      className="h-20 w-2 accent-red-600 cursor-pointer"
                      style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                    />
                    <span className="text-[9px] font-bold text-zinc-950 bg-white/70 px-1 rounded-xs">{s.val}{s.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. EMT 250 ELECTRONIC REVERBERATOR (4-LEVER ICONIC PILLAR) */}
          {def.id === 'emt250' && (
            <div className="grid grid-cols-4 gap-4 items-center bg-[#181a20] p-4 rounded-xs border border-zinc-700 shadow-inner">
              {[
                { label: 'DECAY (s)', key: 'decayTime', min: 0.4, max: 5.0, step: 0.1, val: Number(slot.params.decayTime), unit: 's', color: 'accent-red-500' },
                { label: 'LOW DECAY', key: 'lowDecay', min: 0.5, max: 2.0, step: 0.1, val: Number(slot.params.lowDecay), unit: 'x', color: 'accent-amber-500' },
                { label: 'HIGH DECAY', key: 'highDecay', min: 0.2, max: 1.5, step: 0.1, val: Number(slot.params.highDecay), unit: 'x', color: 'accent-emerald-500' },
                { label: 'PRE-DELAY', key: 'preDelay', min: 0, max: 100, step: 1, val: Number(slot.params.preDelay), unit: 'ms', color: 'accent-cyan-500' },
              ].map((lever) => (
                <div key={lever.label} className="flex flex-col items-center space-y-2">
                  <span className="text-[10px] font-black text-zinc-200">{lever.label}</span>
                  <div className="h-28 w-6 bg-[#0f1116] rounded-full border border-zinc-700 flex items-center justify-center p-1">
                    <input
                      type="range"
                      min={lever.min}
                      max={lever.max}
                      step={lever.step}
                      value={lever.val}
                      onChange={(e) => updateSlotParam(slot.slotId, lever.key, parseFloat(e.target.value))}
                      className={`h-24 w-3 cursor-pointer ${lever.color}`}
                      style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                    />
                  </div>
                  <span className="text-[10px] font-black text-amber-400 bg-black px-2 py-0.5 rounded border border-zinc-800">
                    {lever.val}{lever.unit}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* 4. TELETRONIX LA-2A OPTICAL LEVELER */}
          {def.id === 'la2a' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <BakeliteKnob
                label="GAIN (MAKEUP)"
                value={Number(slot.params.gain)}
                min={0}
                max={60}
                onChange={(v) => updateSlotParam(slot.slotId, 'gain', v)}
                readout={`+${slot.params.gain} dB`}
                size="lg"
                color="black"
              />
              <div className="flex flex-col items-center">
                <AnalogVuMeter reductionValue={Number(slot.params.peakReduction)} label="LA-2A REDUCTION" />
                <button
                  onClick={() => updateSlotParam(slot.slotId, 'mode', slot.params.mode === 'Compress' ? 'Limit' : 'Compress')}
                  className="mt-2 px-3 py-1 rounded text-[9px] font-black bg-zinc-900 text-amber-300 border border-zinc-700 cursor-pointer"
                >
                  MODE: {slot.params.mode}
                </button>
              </div>
              <BakeliteKnob
                label="PEAK REDUCTION"
                value={Number(slot.params.peakReduction)}
                min={0}
                max={100}
                onChange={(v) => updateSlotParam(slot.slotId, 'peakReduction', v)}
                readout={`${slot.params.peakReduction}`}
                size="lg"
                color="black"
              />
            </div>
          )}

          {/* 5. UREI 1176LN FET PEAK LIMITER */}
          {def.id === '1176' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <BakeliteKnob
                label="INPUT DRIVE"
                value={Number(slot.params.input)}
                min={0}
                max={60}
                onChange={(v) => updateSlotParam(slot.slotId, 'input', v)}
                readout={`${slot.params.input}`}
                color="black"
              />
              <div className="flex items-center justify-center gap-3">
                <BakeliteKnob
                  label="ATTACK"
                  value={Number(slot.params.attack)}
                  min={1}
                  max={7}
                  onChange={(v) => updateSlotParam(slot.slotId, 'attack', v)}
                  readout={`${slot.params.attack}`}
                  color="black"
                />
                <BakeliteKnob
                  label="RELEASE"
                  value={Number(slot.params.release)}
                  min={1}
                  max={7}
                  onChange={(v) => updateSlotParam(slot.slotId, 'release', v)}
                  readout={`${slot.params.release}`}
                  color="black"
                />
              </div>
              <BakeliteKnob
                label="OUTPUT LEVEL"
                value={Number(slot.params.output)}
                min={0}
                max={60}
                onChange={(v) => updateSlotParam(slot.slotId, 'output', v)}
                readout={`${slot.params.output}`}
                color="black"
              />
              <div className="flex flex-col items-center space-y-2">
                <AnalogVuMeter reductionValue={Number(slot.params.input) * 0.7} label="1176 GAIN REDUCTION" width="w-40" />
                <div className="flex items-center gap-1">
                  {['4:1', '8:1', '12:1', '20:1', 'ALL'].map((r) => (
                    <button
                      key={r}
                      onClick={() => updateSlotParam(slot.slotId, 'ratio', r)}
                      className={`px-1.5 py-0.5 rounded-xs text-[9px] font-black border cursor-pointer ${
                        slot.params.ratio === r ? 'bg-amber-400 text-black border-white' : 'bg-zinc-900 text-zinc-400 border-zinc-700'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 6. FAIRCHILD 670 DUAL TUBE LIMITER */}
          {def.id === 'fairchild670' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center bg-[#1c1e22] p-4 rounded-xs border border-zinc-700 shadow-inner">
              <BakeliteKnob
                label="INPUT THRESHOLD"
                value={Number(slot.params.threshold)}
                min={0}
                max={10}
                step={0.5}
                onChange={(v) => updateSlotParam(slot.slotId, 'threshold', v)}
                readout={`${slot.params.threshold}`}
                size="lg"
                color="silver"
              />
              <div className="flex flex-col items-center">
                <AnalogVuMeter reductionValue={Number(slot.params.threshold) * 3} label="FAIRCHILD 670 VU" width="w-44" />
              </div>
              <ChickenheadKnob
                label="TIME CONSTANT"
                options={[1, 2, 3, 4, 5, 6]}
                selected={Number(slot.params.timeConstant)}
                onChange={(v) => updateSlotParam(slot.slotId, 'timeConstant', v)}
              />
              <BakeliteKnob
                label="OUTPUT MAKEUP"
                value={Number(slot.params.outputGain)}
                min={0}
                max={15}
                step={0.5}
                onChange={(v) => updateSlotParam(slot.slotId, 'outputGain', v)}
                readout={`+${slot.params.outputGain} dB`}
                size="lg"
                color="silver"
              />
            </div>
          )}

          {/* 7. PULTEC EQP-1A TUBE PROGRAM EQUALIZER */}
          {def.id === 'pultec_eqp' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 items-center">
              <ChickenheadKnob
                label="LOW FREQ (CPS)"
                options={[20, 30, 60, 100]}
                selected={Number(slot.params.lowFreq)}
                onChange={(v) => updateSlotParam(slot.slotId, 'lowFreq', v)}
                unit="Hz"
              />
              <BakeliteKnob
                label="LOW BOOST"
                value={Number(slot.params.lowBoost)}
                min={0}
                max={10}
                step={0.5}
                onChange={(v) => updateSlotParam(slot.slotId, 'lowBoost', v)}
                readout={`${slot.params.lowBoost}`}
                color="black"
              />
              <BakeliteKnob
                label="LOW ATTEN"
                value={Number(slot.params.lowAtten)}
                min={0}
                max={10}
                step={0.5}
                onChange={(v) => updateSlotParam(slot.slotId, 'lowAtten', v)}
                readout={`${slot.params.lowAtten}`}
                color="black"
              />
              <ChickenheadKnob
                label="HIGH FREQ (KCS)"
                options={[3, 4, 5, 8, 10, 12, 16]}
                selected={Number(slot.params.hiFreq)}
                onChange={(v) => updateSlotParam(slot.slotId, 'hiFreq', v)}
                unit="kHz"
              />
              <BakeliteKnob
                label="HIGH BOOST"
                value={Number(slot.params.hiBoost)}
                min={0}
                max={10}
                step={0.5}
                onChange={(v) => updateSlotParam(slot.slotId, 'hiBoost', v)}
                readout={`${slot.params.hiBoost}`}
                color="black"
              />
              <BakeliteKnob
                label="HIGH ATTEN"
                value={Number(slot.params.hiAtten)}
                min={0}
                max={10}
                step={0.5}
                onChange={(v) => updateSlotParam(slot.slotId, 'hiAtten', v)}
                readout={`${slot.params.hiAtten}`}
                color="black"
              />
            </div>
          )}

          {/* 8. PULTEC MEQ-5 MIDRANGE TUBE EQUALIZER */}
          {def.id === 'pultec_meq' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 items-center">
              <div className="flex flex-col items-center space-y-2">
                <ChickenheadKnob
                  label="LOW PEAK (CPS)"
                  options={[200, 300, 500, 700, 1000]}
                  selected={Number(slot.params.lowPeakFreq)}
                  onChange={(v) => updateSlotParam(slot.slotId, 'lowPeakFreq', v)}
                  unit="Hz"
                />
                <BakeliteKnob
                  label="LOW PEAK BOOST"
                  value={Number(slot.params.lowPeak)}
                  min={0}
                  max={10}
                  step={0.5}
                  onChange={(v) => updateSlotParam(slot.slotId, 'lowPeak', v)}
                  readout={`+${slot.params.lowPeak} dB`}
                  color="black"
                />
              </div>
              <div className="flex flex-col items-center space-y-2">
                <ChickenheadKnob
                  label="MID DIP (CPS)"
                  options={[200, 500, 700, 1000, 1500, 2000, 3000]}
                  selected={Number(slot.params.midDipFreq)}
                  onChange={(v) => updateSlotParam(slot.slotId, 'midDipFreq', v)}
                  unit="Hz"
                />
                <BakeliteKnob
                  label="MID DIP ATTEN"
                  value={Number(slot.params.midDip)}
                  min={-10}
                  max={0}
                  step={0.5}
                  onChange={(v) => updateSlotParam(slot.slotId, 'midDip', v)}
                  readout={`${slot.params.midDip} dB`}
                  color="black"
                />
              </div>
              <div className="flex flex-col items-center space-y-2">
                <ChickenheadKnob
                  label="HIGH PEAK (KCS)"
                  options={[1500, 2000, 3000, 4000, 5000]}
                  selected={Number(slot.params.hiPeakFreq)}
                  onChange={(v) => updateSlotParam(slot.slotId, 'hiPeakFreq', v)}
                  unit="Hz"
                />
                <BakeliteKnob
                  label="HIGH PEAK BOOST"
                  value={Number(slot.params.hiPeak)}
                  min={0}
                  max={10}
                  step={0.5}
                  onChange={(v) => updateSlotParam(slot.slotId, 'hiPeak', v)}
                  readout={`+${slot.params.hiPeak} dB`}
                  color="black"
                />
              </div>
            </div>
          )}

          {/* 9. EMT 140 GERMAN PLATE REVERB */}
          {def.id === 'emt140' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
              <BakeliteKnob label="DECAY (s)" value={Number(slot.params.decay)} min={0.5} max={6.0} step={0.1} onChange={(v) => updateSlotParam(slot.slotId, 'decay', v)} readout={`${slot.params.decay}s`} color="gold" />
              <BakeliteKnob label="PRE-DELAY" value={Number(slot.params.preDelay)} min={0} max={150} onChange={(v) => updateSlotParam(slot.slotId, 'preDelay', v)} readout={`${slot.params.preDelay}ms`} color="gold" />
              <BakeliteKnob label="HIGH DAMP" value={Number(slot.params.damp)} min={0} max={100} onChange={(v) => updateSlotParam(slot.slotId, 'damp', v)} readout={`${slot.params.damp}%`} color="gold" />
              <BakeliteKnob label="WARMTH DRIVE" value={Number(slot.params.warmth)} min={0} max={100} onChange={(v) => updateSlotParam(slot.slotId, 'warmth', v)} readout={`${slot.params.warmth}%`} color="gold" />
            </div>
          )}

          {/* 10. TC ELECTRONIC 2290 DELAY */}
          {def.id === 'delay2290' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
              <BakeliteKnob label="DELAY L (ms)" value={Number(slot.params.timeL)} min={10} max={1200} onChange={(v) => updateSlotParam(slot.slotId, 'timeL', v)} readout={`${slot.params.timeL}ms`} color="black" />
              <BakeliteKnob label="DELAY R (ms)" value={Number(slot.params.timeR)} min={10} max={1200} onChange={(v) => updateSlotParam(slot.slotId, 'timeR', v)} readout={`${slot.params.timeR}ms`} color="black" />
              <BakeliteKnob label="FEEDBACK (%)" value={Number(slot.params.feedback)} min={0} max={100} onChange={(v) => updateSlotParam(slot.slotId, 'feedback', v)} readout={`${slot.params.feedback}%`} color="black" />
              <BakeliteKnob label="CROSSOVER" value={Number(slot.params.filterCut)} min={1000} max={16000} step={100} onChange={(v) => updateSlotParam(slot.slotId, 'filterCut', v)} readout={`${slot.params.filterCut}Hz`} color="black" />
            </div>
          )}

          {/* 11. ROLAND DIMENSION D CHORUS */}
          {def.id === 'dimension_d' && (
            <div className="flex items-center justify-center gap-4 py-4">
              {['Mode 1', 'Mode 2', 'Mode 3', 'Mode 4', 'All-Buttons'].map((m) => (
                <button
                  key={m}
                  onClick={() => updateSlotParam(slot.slotId, 'mode', m)}
                  className={`px-4 py-3 rounded font-black text-xs border transition-all cursor-pointer ${
                    slot.params.mode === m
                      ? 'bg-amber-400 text-black border-white shadow-lg shadow-amber-400/50 scale-105 ring-2 ring-amber-300'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          )}

          {/* 12. SPL TRANSIENT DESIGNER */}
          {def.id === 'spl_transient' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
              <BakeliteKnob label="ATTACK PUNCH" value={Number(slot.params.attack)} min={-15} max={15} step={0.5} onChange={(v) => updateSlotParam(slot.slotId, 'attack', v)} readout={`${Number(slot.params.attack) > 0 ? '+' : ''}${slot.params.attack} dB`} color="silver" />
              <BakeliteKnob label="SUSTAIN BODY" value={Number(slot.params.sustain)} min={-24} max={24} step={0.5} onChange={(v) => updateSlotParam(slot.slotId, 'sustain', v)} readout={`${Number(slot.params.sustain) > 0 ? '+' : ''}${slot.params.sustain} dB`} color="silver" />
              <BakeliteKnob label="OUTPUT MAKEUP" value={Number(slot.params.output)} min={-12} max={12} step={0.5} onChange={(v) => updateSlotParam(slot.slotId, 'output', v)} readout={`${slot.params.output} dB`} color="silver" />
            </div>
          )}

          {/* 13. BBE SONIC MAXIMIZER */}
          {def.id === 'bbe_maximizer' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center bg-[#0d0e12] p-4 rounded-xs border border-zinc-800">
              <BakeliteKnob label="LO-CONTOUR" value={Number(slot.params.loContour)} min={0} max={10} step={0.5} onChange={(v) => updateSlotParam(slot.slotId, 'loContour', v)} readout={`${slot.params.loContour}`} color="black" />
              <BakeliteKnob label="PROCESS DEFINITION" value={Number(slot.params.process)} min={0} max={10} step={0.5} onChange={(v) => updateSlotParam(slot.slotId, 'process', v)} readout={`${slot.params.process}`} color="black" />
              <BakeliteKnob label="OUTPUT GAIN" value={Number(slot.params.output)} min={-10} max={10} step={0.5} onChange={(v) => updateSlotParam(slot.slotId, 'output', v)} readout={`${slot.params.output} dB`} color="black" />
            </div>
          )}

          {/* 14. SUB OCTAVER / BASS ENHANCER */}
          {def.id === 'sub_octaver' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center bg-[#11131a] p-4 rounded-xs border border-zinc-800">
              <BakeliteKnob label="SUB OCT 1 (-12st)" value={Number(slot.params.subOct1)} min={0} max={100} onChange={(v) => updateSlotParam(slot.slotId, 'subOct1', v)} readout={`${slot.params.subOct1}%`} color="blue" />
              <BakeliteKnob label="SUB OCT 2 (-24st)" value={Number(slot.params.subOct2)} min={0} max={100} onChange={(v) => updateSlotParam(slot.slotId, 'subOct2', v)} readout={`${slot.params.subOct2}%`} color="blue" />
              <BakeliteKnob label="DRY SIGNAL" value={Number(slot.params.dryMix)} min={0} max={100} onChange={(v) => updateSlotParam(slot.slotId, 'dryMix', v)} readout={`${slot.params.dryMix}%`} color="black" />
              <BakeliteKnob label="RANGE LOWPASS" value={Number(slot.params.rangeHz)} min={40} max={250} onChange={(v) => updateSlotParam(slot.slotId, 'rangeHz', v)} readout={`${slot.params.rangeHz}Hz`} color="black" />
            </div>
          )}

          {/* 15. PRECISION DE-ESSER */}
          {def.id === 'deesser' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center bg-[#12141c] p-4 rounded-xs border border-zinc-800">
              <BakeliteKnob label="SIBILANCE FREQ" value={Number(slot.params.freq)} min={2000} max={12000} step={100} onChange={(v) => updateSlotParam(slot.slotId, 'freq', v)} readout={`${slot.params.freq}Hz`} color="black" />
              <BakeliteKnob label="THRESHOLD" value={Number(slot.params.threshold)} min={-60} max={0} onChange={(v) => updateSlotParam(slot.slotId, 'threshold', v)} readout={`${slot.params.threshold} dB`} color="black" />
              <BakeliteKnob label="ATTENUATION" value={Number(slot.params.reduction)} min={0} max={20} step={0.5} onChange={(v) => updateSlotParam(slot.slotId, 'reduction', v)} readout={`-${slot.params.reduction} dB`} color="black" />
            </div>
          )}

          {/* 16. QUANTUM LEAP / REVERSAL REVERB */}
          {def.id === 'quantum_reverb' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center bg-[#181a24] p-4 rounded-xs border border-zinc-700">
              <BakeliteKnob label="GATE TIME (ms)" value={Number(slot.params.gateTime)} min={50} max={600} step={10} onChange={(v) => updateSlotParam(slot.slotId, 'gateTime', v)} readout={`${slot.params.gateTime}ms`} color="black" />
              <BakeliteKnob label="DIFFUSION DENSITY" value={Number(slot.params.density)} min={0} max={100} onChange={(v) => updateSlotParam(slot.slotId, 'density', v)} readout={`${slot.params.density}%`} color="black" />
              <BakeliteKnob label="NON-LINEAR SLOPE" value={Number(slot.params.slope)} min={-30} max={30} onChange={(v) => updateSlotParam(slot.slotId, 'slope', v)} readout={`${slot.params.slope} dB`} color="black" />
              <BakeliteKnob label="HIGH CUT FILTER" value={Number(slot.params.hiCut)} min={2000} max={16000} step={100} onChange={(v) => updateSlotParam(slot.slotId, 'hiCut', v)} readout={`${slot.params.hiCut}Hz`} color="black" />
            </div>
          )}

          {/* 17. KLARK TEKNIK / BEHRINGER FBQ2496 PRO FEEDBACK DESTROYER */}
          {def.id === 'feedback_destroyer' && (
            <div className="space-y-3">
              {/* Top Banner & Status LCD */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 bg-[#0d0f14] p-3 rounded-xs border-2 border-[#202736] shadow-inner">
                {/* Dual VFD/LCD Screens */}
                <div className="lg:col-span-7 bg-[#07090d] border border-cyan-900/60 p-2.5 rounded-xs flex flex-col justify-between shadow-inner relative overflow-hidden">
                  <div className="flex items-center justify-between text-[10px] font-mono border-b border-cyan-950 pb-1">
                    <div className="flex items-center gap-1.5 text-cyan-400 font-black">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                      <span>FBQ2496 AUTO-FEEDBACK NOTCH SCANNER</span>
                    </div>
                    <span className="text-emerald-400 font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded-xs border border-emerald-600/40 text-[9px]">
                      ARMED &amp; ACTIVE
                    </span>
                  </div>

                  {/* Active Frequency Info */}
                  <div className="py-2 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-[9px] text-zinc-500 font-bold">PRIMARY HOWL FREQ TARGET</div>
                      <div className="text-xl sm:text-2xl font-black font-mono text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
                        {slot.params.caughtFreq1 || 2450} <span className="text-xs text-cyan-500">Hz</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[9px] text-zinc-500 font-bold">NOTCH SURGICAL CUT</div>
                      <div className="text-xl sm:text-2xl font-black font-mono text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.4)]">
                        {slot.params.caughtDepth1 || -28} <span className="text-xs text-rose-500">dB</span>
                      </div>
                    </div>

                    <div className="bg-[#0b121a] border border-cyan-900/80 px-2 py-1 rounded-xs text-[9px] text-zinc-300 font-mono space-y-0.5">
                      <div>Q-WIDTH: <b className="text-amber-400">1/60 OCT</b></div>
                      <div>DETECT: <b className="text-emerald-400">&lt; 0.20s</b></div>
                      <div>MODE: <b className="text-cyan-400">{String(slot.params.mode).toUpperCase()}</b></div>
                    </div>
                  </div>

                  {/* FFT Spectrum Bar visualization with Notch Indicator */}
                  <div className="mt-1 pt-1 border-t border-cyan-950/80">
                    <div className="flex items-center justify-between text-[8px] text-zinc-500 font-mono pb-0.5">
                      <span>20Hz</span>
                      <span>250Hz</span>
                      <span>1kHz</span>
                      <span className="text-rose-400 font-bold">▼ 2.45kHz (NOTCH)</span>
                      <span>4kHz</span>
                      <span className="text-rose-400 font-bold">▼ 3.82kHz (NOTCH)</span>
                      <span>8kHz</span>
                      <span>20kHz</span>
                    </div>
                    <div className="h-4 bg-[#05070a] rounded-xs flex items-end gap-0.5 px-1 py-0.5 border border-zinc-800">
                      {[15, 20, 25, 30, 28, 45, 60, 50, 40, 35, 12, 10, 8, 40, 55, 14, 12, 10, 48, 62, 16, 12, 9, 32, 24, 18, 12].map((h, i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-xs transition-all ${
                            i === 11 || i === 16 || i === 21
                              ? 'bg-rose-500 shadow-xs shadow-rose-500/80'
                              : 'bg-cyan-600/70'
                          }`}
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right controls inside unit */}
                <div className="lg:col-span-5 flex flex-col justify-between gap-2 bg-[#12151e] p-2.5 rounded-xs border border-zinc-800">
                  <div className="text-[10px] font-bold text-amber-400 flex items-center justify-between">
                    <span>QUICK ACTION &amp; EMERGENCY KILL</span>
                    <span className="text-[8px] text-zinc-500">PRO LEVEL DSP</span>
                  </div>

                  {/* Big Hazard Emergency Panic Button */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        audioEngine.panicKillFeedback();
                        updateSlotParam(slot.slotId, 'panicKill', 1);
                        setTimeout(() => updateSlotParam(slot.slotId, 'panicKill', 0), 1200);
                      }}
                      className="px-3 py-2 bg-gradient-to-r from-red-600 via-rose-700 to-red-800 hover:from-red-500 hover:to-rose-600 text-white rounded-xs border-2 border-red-400 font-black text-xs flex flex-col items-center justify-center gap-0.5 cursor-pointer shadow-lg shadow-red-950 animate-pulse active:scale-95"
                    >
                      <VolumeX className="w-4 h-4 text-white" />
                      <span>KILL HOWL NOW!</span>
                      <span className="text-[8px] font-mono text-red-200">PANIC NOTCH (-40dB)</span>
                    </button>

                    <button
                      onClick={() => {
                        const res = audioEngine.triggerSimulatedFeedback();
                        updateSlotParam(slot.slotId, 'caughtFreq1', res.freq);
                        updateSlotParam(slot.slotId, 'caughtDepth1', -36);
                      }}
                      className="px-3 py-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black rounded-xs border-2 border-amber-300 font-black text-xs flex flex-col items-center justify-center gap-0.5 cursor-pointer shadow-md active:scale-95"
                    >
                      <Zap className="w-4 h-4 text-black" />
                      <span>TEST FEEDBACK</span>
                      <span className="text-[8px] font-mono text-amber-950">INJECT &amp; AUTO-KILL</span>
                    </button>
                  </div>

                  {/* Mode & Learn Room buttons */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      onClick={() => {
                        audioEngine.ringOutRoom();
                        updateSlotParam(slot.slotId, 'ringOutRoom', 1);
                        setTimeout(() => updateSlotParam(slot.slotId, 'ringOutRoom', 0), 1500);
                      }}
                      className="flex-1 py-1 px-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xs border border-zinc-700 text-[9px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3 text-cyan-400" />
                      <span>LEARN ROOM (RING-OUT)</span>
                    </button>

                    <button
                      onClick={() => {
                        audioEngine.clearDynamicNotches();
                        updateSlotParam(slot.slotId, 'activeNotches', 8);
                      }}
                      className="py-1 px-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xs border border-zinc-700 text-[9px] font-bold cursor-pointer"
                    >
                      RESET DYN
                    </button>
                  </div>
                </div>
              </div>

              {/* 24-FILTER ACTIVITY MATRIX (THE SIGNATURE HARDWARE LOOK) */}
              <div className="bg-[#0b0d13] p-3 rounded-xs border border-zinc-800 shadow-inner">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-zinc-200">24 INDEPENDENT SURGICAL NOTCH FILTERS (PER CHANNEL)</span>
                    <span className="text-[8px] bg-cyan-950 text-cyan-300 px-1.5 py-0.2 rounded-xs border border-cyan-800">
                      BANDWIDTH: 1/60th OCTAVE
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[9px] text-zinc-400">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> FIXED ROOM
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" /> LIVE CAUGHT HOWL
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-cyan-700 inline-block" /> SEARCHING
                    </span>
                  </div>
                </div>

                {/* 24 Notch Filter Grid */}
                <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 text-center">
                  {[
                    { id: 1, freq: '2.45k', depth: '-28dB', state: 'fixed' },
                    { id: 2, freq: '3.82k', depth: '-34dB', state: 'fixed' },
                    { id: 3, freq: '6.18k', depth: '-24dB', state: 'live' },
                    { id: 4, freq: '1.15k', depth: '-18dB', state: 'live' },
                    { id: 5, freq: '4.75k', depth: '-30dB', state: 'live' },
                    { id: 6, freq: '8.20k', depth: '-26dB', state: 'live' },
                    { id: 7, freq: '540Hz', depth: '-20dB', state: 'fixed' },
                    { id: 8, freq: '890Hz', depth: '-22dB', state: 'fixed' },
                    { id: 9, freq: '--', depth: '0dB', state: 'free' },
                    { id: 10, freq: '--', depth: '0dB', state: 'free' },
                    { id: 11, freq: '--', depth: '0dB', state: 'free' },
                    { id: 12, freq: '--', depth: '0dB', state: 'free' },
                    { id: 13, freq: '--', depth: '0dB', state: 'free' },
                    { id: 14, freq: '--', depth: '0dB', state: 'free' },
                    { id: 15, freq: '--', depth: '0dB', state: 'free' },
                    { id: 16, freq: '--', depth: '0dB', state: 'free' },
                    { id: 17, freq: '--', depth: '0dB', state: 'free' },
                    { id: 18, freq: '--', depth: '0dB', state: 'free' },
                    { id: 19, freq: '--', depth: '0dB', state: 'free' },
                    { id: 20, freq: '--', depth: '0dB', state: 'free' },
                    { id: 21, freq: '--', depth: '0dB', state: 'free' },
                    { id: 22, freq: '--', depth: '0dB', state: 'free' },
                    { id: 23, freq: '--', depth: '0dB', state: 'free' },
                    { id: 24, freq: '--', depth: '0dB', state: 'free' },
                  ].map((flt) => (
                    <div
                      key={flt.id}
                      onClick={() => {
                        if (flt.state !== 'free') {
                          audioEngine.panicKillFeedback();
                        }
                      }}
                      className={`p-1 rounded-xs border transition-all cursor-pointer ${
                        flt.state === 'live'
                          ? 'bg-rose-950/70 border-rose-500 shadow-xs shadow-rose-600/50'
                          : flt.state === 'fixed'
                          ? 'bg-amber-950/70 border-amber-500'
                          : 'bg-[#10131a] border-zinc-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[7px] text-zinc-400 font-mono">
                        <span>#{String(flt.id).padStart(2, '0')}</span>
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            flt.state === 'live'
                              ? 'bg-rose-500 animate-ping'
                              : flt.state === 'fixed'
                              ? 'bg-amber-400'
                              : 'bg-zinc-700'
                          }`}
                        />
                      </div>
                      <div
                        className={`text-[9px] font-black font-mono truncate mt-0.5 ${
                          flt.state === 'live'
                            ? 'text-rose-300'
                            : flt.state === 'fixed'
                            ? 'text-amber-300'
                            : 'text-zinc-600'
                        }`}
                      >
                        {flt.freq}
                      </div>
                      <div className="text-[7px] font-mono text-zinc-500">{flt.depth}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hardware Knobs & Algorithm Selectors */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center bg-[#10131c] p-3 rounded-xs border border-zinc-800">
                <BakeliteKnob
                  label="SENSITIVITY"
                  value={Number(slot.params.sensitivity) || 75}
                  min={10}
                  max={100}
                  onChange={(v) => updateSlotParam(slot.slotId, 'sensitivity', v)}
                  readout={`${slot.params.sensitivity || 75}%`}
                  color="black"
                />
                <BakeliteKnob
                  label="MAX NOTCH DEPTH"
                  value={Math.abs(Number(slot.params.notchDepth)) || 36}
                  min={6}
                  max={40}
                  step={1}
                  onChange={(v) => updateSlotParam(slot.slotId, 'notchDepth', -v)}
                  readout={`-${Math.abs(Number(slot.params.notchDepth)) || 36} dB`}
                  color="black"
                />

                <div className="flex flex-col items-center space-y-1">
                  <span className="text-[9px] font-mono font-bold text-zinc-300 tracking-wider">
                    OPERATING MODE
                  </span>
                  <div className="flex flex-col gap-1 w-full max-w-[120px]">
                    {['Auto', 'Single-Shot', 'Manual'].map((m) => (
                      <button
                        key={m}
                        onClick={() => updateSlotParam(slot.slotId, 'mode', m)}
                        className={`px-2 py-1 rounded-xs text-[9px] font-black border transition-all cursor-pointer ${
                          slot.params.mode === m
                            ? 'bg-cyan-500 text-black border-cyan-300 shadow-xs'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-white'
                        }`}
                      >
                        {m.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-center space-y-1">
                  <span className="text-[9px] font-mono font-bold text-zinc-300 tracking-wider">
                    ALGORITHM DISC
                  </span>
                  <div className="flex flex-col gap-1 w-full max-w-[120px]">
                    {[
                      { id: 'Speech/Live', label: 'SPEECH / PODIUM' },
                      { id: 'Music/Band', label: 'MUSIC / HARMONIC' },
                    ].map((alg) => (
                      <button
                        key={alg.id}
                        onClick={() => updateSlotParam(slot.slotId, 'algorithm', alg.id)}
                        className={`px-2 py-1 rounded-xs text-[9px] font-black border transition-all cursor-pointer ${
                          slot.params.algorithm === alg.id
                            ? 'bg-amber-400 text-black border-amber-200 shadow-xs'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-white'
                        }`}
                      >
                        {alg.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 bg-[#0a0c10] p-2 sm:p-4 flex flex-col gap-3 overflow-y-auto select-none font-mono">
      {/* 1. TOP HEADER TOOLBAR */}
      <div className="bg-[#141720] border-2 border-[#242938] rounded-xs p-3 flex flex-wrap items-center justify-between gap-2 shadow-xl">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/10 border border-amber-500/40 rounded text-amber-400 shadow-inner">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-display font-black text-zinc-100 tracking-wider">
                PHYSICAL MODELING FX &amp; FBQ2496 ANTI-FEEDBACK
              </span>
              <span className="text-[9px] bg-amber-950 text-amber-300 border border-amber-600/70 px-1.5 py-0.5 rounded-xs font-black">
                MIDAS PRO DSP
              </span>
              <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-600/70 px-1.5 py-0.5 rounded-xs font-black">
                FEEDBACK KILLER ARMED
              </span>
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5">
              Vintage component modeling: Lexicon 480L, EMT 250, LA-2A, 1176LN, Fairchild 670, Pultec EQP-1A, EMT 140, Klark Teknik DN360 &amp; FBQ2496 Feedback Destroyer
            </div>
          </div>
        </div>

        {/* View Switcher: Stack vs Zoom Focus vs All Catalog */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewMode('focused')}
            className={`px-2.5 py-1.5 rounded-xs text-xs font-black border transition-all cursor-pointer ${
              viewMode === 'focused' ? 'bg-amber-500 text-black border-amber-300' : 'bg-[#181c26] text-zinc-400 border-zinc-700'
            }`}
          >
            FOCUS ZOOM
          </button>
          <button
            onClick={() => setViewMode('stack')}
            className={`px-2.5 py-1.5 rounded-xs text-xs font-black border transition-all cursor-pointer ${
              viewMode === 'stack' ? 'bg-amber-500 text-black border-amber-300' : 'bg-[#181c26] text-zinc-400 border-zinc-700'
            }`}
          >
            19" RACK STACK
          </button>
          <button
            onClick={() => setViewMode('catalog')}
            className={`px-2.5 py-1.5 rounded-xs text-xs font-black border transition-all cursor-pointer ${
              viewMode === 'catalog' ? 'bg-cyan-500 text-black border-cyan-300' : 'bg-[#181c26] text-zinc-400 border-zinc-700'
            }`}
          >
            GEAR &amp; HOWL VAULT
          </button>
        </div>
      </div>

      {/* 2. 8 RACK SLOTS TABS */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 bg-[#0e1016] p-1.5 rounded-xs border border-[#202534]">
        {rackSlots.map((slot) => {
          const isSel = slot.slotId === selectedSlotId;
          const pDef = ALL_16_FX_PLUGINS.find((p) => p.id === slot.pluginId) || ALL_16_FX_PLUGINS[0];
          return (
            <div
              key={slot.slotId}
              onClick={() => {
                setSelectedSlotId(slot.slotId);
                if (viewMode === 'catalog') setViewMode('focused');
              }}
              className={`p-1.5 rounded-xs border cursor-pointer transition-all flex flex-col justify-between ${
                isSel
                  ? 'bg-[#1b202c] border-amber-400 shadow-md ring-1 ring-amber-400/60'
                  : 'bg-[#12151d] border-[#222736] hover:bg-[#161a24]'
              }`}
            >
              <div className="flex items-center justify-between text-[9px]">
                <span className={`font-black ${isSel ? 'text-amber-400' : 'text-zinc-400'}`}>
                  SLOT {slot.slotId}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSlotBypass(slot.slotId);
                  }}
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-black cursor-pointer ${
                    slot.bypassed
                      ? 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                      : 'bg-emerald-500 text-black shadow-xs shadow-emerald-500 border border-emerald-300'
                  }`}
                >
                  <Power className="w-2.5 h-2.5" />
                </button>
              </div>

              <span className="text-[10px] font-black text-zinc-200 truncate mt-1">
                {pDef.name}
              </span>

              <span className="text-[8px] text-zinc-500 font-mono truncate">
                {pDef.category} · {pDef.rackUnits}
              </span>
            </div>
          );
        })}
      </div>

      {/* 3. HARDWARE CATALOG MODAL / DRAWER (CHOOSE FROM ALL 16 PLUG-INS) */}
      {isChangingPlugin && (
        <div className="bg-[#141722] border-2 border-amber-500 rounded-xs p-4 shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-700 pb-2">
            <div>
              <span className="text-sm font-black text-amber-400">
                SELECT FX PLUG-IN FOR RACK SLOT {selectedSlotId}
              </span>
              <span className="text-xs text-zinc-400 block">
                Choose any of the 16 Physical Modeling Vintage Hardware Processors
              </span>
            </div>
            <button
              onClick={() => setIsChangingPlugin(false)}
              className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded text-xs font-bold hover:text-white"
            >
              CANCEL
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {ALL_16_FX_PLUGINS.map((plug) => (
              <div
                key={plug.id}
                onClick={() => changeSlotPlugin(selectedSlotId, plug.id)}
                className={`p-2 rounded border cursor-pointer transition-all hover:scale-105 ${
                  activeSlot.pluginId === plug.id
                    ? 'bg-amber-500 text-black border-amber-300 font-bold'
                    : 'bg-[#0f1118] text-zinc-200 border-zinc-700 hover:border-amber-400'
                }`}
              >
                <span className="text-[10px] font-black block truncate">{plug.name}</span>
                <span className="text-[8px] opacity-75 block">{plug.category} · {plug.rackUnits}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. MAIN VIEW WORKSPACE */}
      {viewMode === 'catalog' ? (
        /* VAULT CATALOG VIEW: INSPECT ALL 16 PROCESSORS */
        <div className="space-y-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {(['ALL', 'Reverb', 'Dynamics', 'EQ', 'Modulation', 'Special'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCatalogFilter(cat)}
                className={`px-3 py-1 rounded text-xs font-black cursor-pointer border ${
                  catalogFilter === cat
                    ? 'bg-cyan-500 text-black border-cyan-300'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                }`}
              >
                {cat === 'ALL' ? 'ALL PROCESSORS & ANTI-HOWL' : cat.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredCatalog.map((plugDef) => (
              <div key={plugDef.id} className="relative">
                {renderHardwareUnitFaceplate(
                  {
                    slotId: selectedSlotId,
                    pluginId: plugDef.id,
                    bypassed: false,
                    insertChannel: `Loaded in Vault Inspector`,
                    params: { ...plugDef.defaultParams },
                  },
                  false
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* RACK STACK & ZOOM FOCUS VIEWS (19" CHASSIS WITH RAILS) */
        <div className="bg-rack-chassis border-4 border-[#1e222c] rounded-xs p-1 sm:p-2 shadow-2xl relative">
          <div className="absolute left-0 top-0 bottom-0 w-5 bg-rack-rail z-20 flex flex-col justify-between py-2 items-center">
            <RackScrew />
            <RackScrew />
            <RackScrew />
            <RackScrew />
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-5 bg-rack-rail z-20 flex flex-col justify-between py-2 items-center">
            <RackScrew />
            <RackScrew />
            <RackScrew />
            <RackScrew />
          </div>

          <div className="px-5 sm:px-6 py-2 space-y-4">
            {viewMode === 'stack' ? (
              /* FULL 19" RACK STACK (ALL 8 SLOTS MOUNTED) */
              rackSlots.map((slot) => renderHardwareUnitFaceplate(slot, false))
            ) : (
              /* FOCUSED UNIT */
              renderHardwareUnitFaceplate(activeSlot, true)
            )}
          </div>
        </div>
      )}
    </div>
  );
};
