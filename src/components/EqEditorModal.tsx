import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  X,
  RotateCcw,
  Sliders,
  Sparkles,
  Volume2,
  Copy,
  Check,
  Bookmark,
  Share2,
  Activity,
  Layers,
} from 'lucide-react';
import { ChannelStripData, EqBand, FilterType } from '../types/mixer';
import { audioEngine } from '../services/audioEngine';

interface EqEditorModalProps {
  channel: ChannelStripData;
  onClose: () => void;
  onUpdateChannel: (updated: ChannelStripData) => void;
  onSavePersonalPreset: (name: string, category: string, eqData: unknown) => void;
  beginnerMode: boolean;
  onToggleBeginnerMode: () => void;
}

const MIN_FREQ = 20;
const MAX_FREQ = 20000;
const MIN_GAIN = -15;
const MAX_GAIN = 15;

function freqToX(freq: number, width: number): number {
  const minLog = Math.log10(MIN_FREQ);
  const maxLog = Math.log10(MAX_FREQ);
  const freqLog = Math.log10(Math.max(MIN_FREQ, Math.min(MAX_FREQ, freq)));
  return ((freqLog - minLog) / (maxLog - minLog)) * width;
}

function xToFreq(x: number, width: number): number {
  const minLog = Math.log10(MIN_FREQ);
  const maxLog = Math.log10(MAX_FREQ);
  const fraction = Math.max(0, Math.min(1, x / width));
  return Math.pow(10, minLog + fraction * (maxLog - minLog));
}

function gainToY(gain: number, height: number): number {
  const fraction = (gain - MIN_GAIN) / (MAX_GAIN - MIN_GAIN);
  return height - fraction * height;
}

function yToGain(y: number, height: number): number {
  const fraction = 1 - Math.max(0, Math.min(1, y / height));
  return MIN_GAIN + fraction * (MAX_GAIN - MIN_GAIN);
}

export const EqEditorModal: React.FC<EqEditorModalProps> = ({
  channel,
  onClose,
  onUpdateChannel,
  onSavePersonalPreset,
  beginnerMode,
  onToggleBeginnerMode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedBandId, setSelectedBandId] = useState<number>(1);
  const [draggedBandId, setDraggedBandId] = useState<number | null>(null);
  const [draggedLowCut, setDraggedLowCut] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [rtaSource, setRtaSource] = useState<'post' | 'pre'>('post');
  const [abMemory, setAbMemory] = useState<EqBand[] | null>(null);
  const [activeAbState, setActiveAbState] = useState<'A' | 'B'>('A');
  const [presetNameInput, setPresetNameInput] = useState('');
  const [showSavePresetInput, setShowSavePresetInput] = useState(false);

  // Beginner Macro state values
  const [warmthVal, setWarmthVal] = useState(0);
  const [clarityVal, setClarityVal] = useState(0);
  const [presenceVal, setPresenceVal] = useState(0);
  const [airVal, setAirVal] = useState(0);

  const bands = channel.eqBands;
  const currentBand = bands.find((b) => b.id === selectedBandId) || bands[0];

  // Calculate composite curve gain at frequency f
  const calculateCurveGain = useCallback(
    (f: number): number => {
      let totalGain = 0;

      // Low Cut (HPF)
      if (channel.lowCutEnabled && channel.lowCutFreq > 0) {
        if (f < channel.lowCutFreq) {
          const octavesBelow = Math.log2(channel.lowCutFreq / f);
          totalGain -= octavesBelow * 18; // 18dB/octave slope
        }
      }

      if (!channel.eqEnabled) return totalGain;

      for (const band of bands) {
        if (!band.enabled || band.gain === 0) continue;

        const f0 = band.frequency;
        const G = band.gain;
        const Q = band.q;

        if (band.type === 'peq' || band.type === 'veq') {
          // Bell curve
          const diffOct = Math.log2(f / f0);
          const bandwidth = 1 / Q;
          const attenuation = Math.exp(-0.5 * Math.pow(diffOct / (bandwidth * 0.5), 2));
          totalGain += G * attenuation;
        } else if (band.type === 'lowshelf') {
          if (f <= f0) {
            totalGain += G;
          } else {
            const diffOct = Math.log2(f / f0);
            totalGain += G * Math.max(0, 1 - diffOct * 1.2);
          }
        } else if (band.type === 'highshelf') {
          if (f >= f0) {
            totalGain += G;
          } else {
            const diffOct = Math.log2(f0 / f);
            totalGain += G * Math.max(0, 1 - diffOct * 1.2);
          }
        } else if (band.type === 'lowcut') {
          if (f < f0) {
            const octs = Math.log2(f0 / f);
            totalGain -= octs * 18;
          }
        } else if (band.type === 'highcut') {
          if (f > f0) {
            const octs = Math.log2(f / f0);
            totalGain -= octs * 18;
          }
        }
      }

      return Math.max(-30, Math.min(25, totalGain));
    },
    [channel.lowCutEnabled, channel.lowCutFreq, channel.eqEnabled, bands]
  );

  // Canvas RTA & Interactive Curve Rendering loop
  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Clear dark background
      ctx.fillStyle = '#090b0e';
      ctx.fillRect(0, 0, width, height);

      // 1. Draw Grid Lines
      ctx.strokeStyle = '#1e242f';
      ctx.lineWidth = 1;

      // Frequency vertical grid lines
      const gridFreqs = [50, 100, 200, 500, 1000, 2000, 5000, 10000];
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = '#475569';

      gridFreqs.forEach((freq) => {
        const x = freqToX(freq, width);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();

        const label = freq >= 1000 ? `${freq / 1000}k` : `${freq}`;
        ctx.fillText(label, x + 3, height - 6);
      });

      // dB horizontal grid lines
      const gridGains = [-12, -6, 0, 6, 12];
      gridGains.forEach((g) => {
        const y = gainToY(g, height);
        ctx.beginPath();
        ctx.setLineDash(g === 0 ? [] : [3, 4]);
        ctx.strokeStyle = g === 0 ? '#334155' : '#1e242f';
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillText(`${g > 0 ? '+' : ''}${g}dB`, 5, y - 3);
      });

      // 2. Draw Live RTA Spectrum Bars from AudioEngine
      const rtaData = audioEngine.getRtaFrequencyData();
      if (rtaData && rtaData.length > 0) {
        const numBars = 64;
        const barWidth = width / numBars;

        for (let i = 0; i < numBars; i++) {
          const dataIdx = Math.floor((i / numBars) * (rtaData.length * 0.75));
          const val = rtaData[dataIdx] || 0;
          const barHeight = (val / 255) * (height * 0.65);
          const x = i * barWidth;
          const y = height - barHeight;

          // Gradient spectrum bar
          const grad = ctx.createLinearGradient(0, y, 0, height);
          grad.addColorStop(0, val > 200 ? 'rgba(239, 68, 68, 0.45)' : 'rgba(245, 158, 11, 0.35)');
          grad.addColorStop(1, 'rgba(16, 185, 129, 0.08)');

          ctx.fillStyle = grad;
          ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
        }
      }

      // 3. Draw Composite EQ Filter Curve
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = channel.eqEnabled ? '#f59e0b' : '#64748b';

      const pointsCount = 200;
      for (let i = 0; i <= pointsCount; i++) {
        const x = (i / pointsCount) * width;
        const freq = xToFreq(x, width);
        const gain = calculateCurveGain(freq);
        const y = gainToY(gain, height);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Filled area under EQ curve
      ctx.lineTo(width, gainToY(0, height));
      ctx.lineTo(0, gainToY(0, height));
      ctx.fillStyle = channel.eqEnabled ? 'rgba(245, 158, 11, 0.08)' : 'transparent';
      ctx.fill();

      // 4. Draw Low Cut (HPF) Node
      if (channel.lowCutEnabled) {
        const lcx = freqToX(channel.lowCutFreq, width);
        const lcy = gainToY(0, height);

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(lcx, lcy, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 9px "JetBrains Mono"';
        ctx.fillText(`HPF ${Math.round(channel.lowCutFreq)}Hz`, lcx - 20, lcy - 12);
      }

      // 5. Draw Band Nodes (1 to 4)
      bands.forEach((b) => {
        const bx = freqToX(b.frequency, width);
        const by = gainToY(b.gain, height);
        const isSelected = b.id === selectedBandId;

        // Band color
        const bandColors = ['#38bdf8', '#34d399', '#facc15', '#f472b6'];
        const color = bandColors[b.id - 1] || '#f59e0b';

        // Outer glow when selected
        if (isSelected) {
          ctx.fillStyle = color;
          ctx.globalAlpha = 0.25;
          ctx.beginPath();
          ctx.arc(bx, by, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }

        // Center dot
        ctx.fillStyle = b.enabled ? color : '#64748b';
        ctx.beginPath();
        ctx.arc(bx, by, isSelected ? 8 : 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Band number label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px "JetBrains Mono"';
        ctx.fillText(String(b.id), bx - 3, by + 3.5);
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [bands, selectedBandId, channel.eqEnabled, channel.lowCutEnabled, channel.lowCutFreq, calculateCurveGain]);

  // Handle Canvas Pointer interactions (Drag Nodes, Adjust Q with pinch/wheel)
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    // Check if clicked near Low Cut node
    if (channel.lowCutEnabled) {
      const lcx = freqToX(channel.lowCutFreq, canvas.width);
      const lcy = gainToY(0, canvas.height);
      if (Math.hypot(x - lcx, y - lcy) < 22) {
        setDraggedLowCut(true);
        canvas.setPointerCapture(e.pointerId);
        return;
      }
    }

    // Check if clicked near any band node
    for (const b of bands) {
      const bx = freqToX(b.frequency, canvas.width);
      const by = gainToY(b.gain, canvas.height);
      if (Math.hypot(x - bx, y - by) < 24) {
        setSelectedBandId(b.id);
        setDraggedBandId(b.id);
        canvas.setPointerCapture(e.pointerId);
        return;
      }
    }

    // Or tap anywhere on canvas to move current band
    updateBandPosition(x, y, selectedBandId);
    setDraggedBandId(selectedBandId);
    canvas.setPointerCapture(e.pointerId);
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    if (draggedLowCut) {
      const newFreq = Math.round(Math.min(400, Math.max(20, xToFreq(x, canvas.width))));
      onUpdateChannel({ ...channel, lowCutFreq: newFreq });
      return;
    }

    if (draggedBandId !== null) {
      updateBandPosition(x, y, draggedBandId);
    }
  };

  const handleCanvasPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    setDraggedBandId(null);
    setDraggedLowCut(false);
  };

  // Adjust Q with mouse wheel over canvas
  const handleCanvasWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.2 : -0.2;
    updateBandQ(selectedBandId, currentBand.q + delta);
  };

  const updateBandPosition = (x: number, y: number, bandId: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const newFreq = Math.round(xToFreq(x, canvas.width));
    const newGain = Math.round(yToGain(y, canvas.height) * 2) / 2; // snap to 0.5dB

    const updatedBands = bands.map((b) =>
      b.id === bandId ? { ...b, frequency: newFreq, gain: newGain } : b
    );
    onUpdateChannel({ ...channel, eqBands: updatedBands });
  };

  const updateBandQ = (bandId: number, newQ: number) => {
    const clampedQ = Math.round(Math.min(10.0, Math.max(0.3, newQ)) * 10) / 10;
    const updatedBands = bands.map((b) => (b.id === bandId ? { ...b, q: clampedQ } : b));
    onUpdateChannel({ ...channel, eqBands: updatedBands });
  };

  const updateBandType = (bandId: number, type: FilterType) => {
    const updatedBands = bands.map((b) => (b.id === bandId ? { ...b, type } : b));
    onUpdateChannel({ ...channel, eqBands: updatedBands });
  };

  const toggleBandEnabled = (bandId: number) => {
    const updatedBands = bands.map((b) => (b.id === bandId ? { ...b, enabled: !b.enabled } : b));
    onUpdateChannel({ ...channel, eqBands: updatedBands });
  };

  // A/B Compare Toggle
  const handleAbToggle = () => {
    if (!abMemory) {
      // Save current as Memory A, now in B
      setAbMemory(JSON.parse(JSON.stringify(bands)));
      setActiveAbState('B');
    } else {
      // Swap current and memory
      const current = JSON.parse(JSON.stringify(bands));
      onUpdateChannel({ ...channel, eqBands: abMemory });
      setAbMemory(current);
      setActiveAbState(activeAbState === 'A' ? 'B' : 'A');
    }
  };

  // Reset to flat curve
  const resetFlat = () => {
    const flatBands: EqBand[] = [
      { id: 1, name: 'Low', enabled: true, type: 'lowshelf', frequency: 100, gain: 0, q: 1.0 },
      { id: 2, name: 'Low-Mid', enabled: true, type: 'peq', frequency: 400, gain: 0, q: 2.0 },
      { id: 3, name: 'High-Mid', enabled: true, type: 'peq', frequency: 2500, gain: 0, q: 1.5 },
      { id: 4, name: 'High', enabled: true, type: 'highshelf', frequency: 10000, gain: 0, q: 1.0 },
    ];
    onUpdateChannel({ ...channel, eqBands: flatBands });
  };

  // Beginner Mode Macro Adjustments
  const applyBeginnerMacros = (w: number, c: number, p: number, a: number) => {
    setWarmthVal(w);
    setClarityVal(c);
    setPresenceVal(p);
    setAirVal(a);

    const macroBands: EqBand[] = [
      { id: 1, name: 'Warmth', enabled: true, type: 'peq', frequency: 160, gain: w * 4, q: 1.2 },
      { id: 2, name: 'De-Mud', enabled: true, type: 'peq', frequency: 380, gain: -c * 5, q: 2.0 },
      { id: 3, name: 'Presence', enabled: true, type: 'peq', frequency: 3200, gain: p * 4.5, q: 1.6 },
      { id: 4, name: 'Air Sheen', enabled: true, type: 'highshelf', frequency: 11000, gain: a * 4, q: 0.9 },
    ];
    onUpdateChannel({ ...channel, eqBands: macroBands });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 select-none">
      <div className="w-full max-w-5xl bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl flex flex-col max-h-[96vh] overflow-hidden">
        {/* Top Header */}
        <div className="h-14 bg-zinc-950 border-b border-zinc-800 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-amber-500/20 border border-amber-500/60 flex items-center justify-center text-amber-400 font-bold font-mono text-xs">
              {String(channel.id).padStart(2, '0')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-zinc-100">{channel.name}</span>
                <span className="text-xs font-mono text-amber-400">PARAMETRIC EQ & RTA</span>
              </div>
              <div className="text-[11px] text-zinc-400 font-mono">
                Midas Heritage 4-Band PEQ + Low Cut Filter
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* EQ Bypass Switch */}
            <button
              onClick={() => onUpdateChannel({ ...channel, eqEnabled: !channel.eqEnabled })}
              className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all cursor-pointer border ${
                channel.eqEnabled
                  ? 'bg-amber-500 text-black border-amber-300'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}
            >
              EQ {channel.eqEnabled ? 'ACTIVE' : 'BYPASS'}
            </button>

            {/* Beginner / Pro Mode Toggle */}
            <button
              onClick={onToggleBeginnerMode}
              className="px-2.5 py-1.5 rounded text-xs bg-zinc-800 hover:bg-zinc-750 text-cyan-300 border border-zinc-700 cursor-pointer flex items-center gap-1"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{beginnerMode ? 'Pro Mode' : 'Easy Mode'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* EQ Interactive Canvas Graph */}
        <div className="relative bg-zinc-950 p-2 border-b border-zinc-800">
          <canvas
            ref={canvasRef}
            width={960}
            height={320}
            onPointerDown={handleCanvasPointerDown}
            onPointerMove={handleCanvasPointerMove}
            onPointerUp={handleCanvasPointerUp}
            onWheel={handleCanvasWheel}
            className="w-full h-56 sm:h-72 rounded bg-zinc-950 touch-none cursor-crosshair border border-zinc-850"
          />

          {/* Quick RTA & A/B Overlay Controls */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800 p-1 rounded-lg backdrop-blur-sm">
            <button
              onClick={handleAbToggle}
              className={`px-2 py-1 rounded text-[11px] font-mono font-bold cursor-pointer border ${
                activeAbState === 'B'
                  ? 'bg-amber-500 text-black border-amber-300'
                  : 'bg-zinc-800 text-zinc-300 border-zinc-700'
              }`}
              title="A/B Quick Comparison"
            >
              A/B: [{activeAbState}]
            </button>

            <button
              onClick={resetFlat}
              className="px-2 py-1 rounded text-[11px] font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 cursor-pointer flex items-center gap-1"
              title="Reset EQ Flat"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Flat</span>
            </button>
          </div>
        </div>

        {/* Controls Section: Beginner Easy Controls OR Pro Surgical Controls */}
        <div className="flex-1 overflow-y-auto p-4 bg-zinc-900">
          {beginnerMode ? (
            /* BEGINNER EASY SOUND MACROS */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-sm text-zinc-200">
                    Easy Tone Controls for Beginners
                  </span>
                </div>
                <span className="text-xs text-zinc-400">
                  Macro algorithms automatically calculate ideal Q width & filter curves
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* 1. Warmth Macro */}
                <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 flex flex-col gap-2">
                  <span className="text-xs font-bold text-amber-400">1. WARMTH & BODY</span>
                  <p className="text-[10px] text-zinc-400">
                    Adds low-end richness without boominess
                  </p>
                  <input
                    type="range"
                    min="-1"
                    max="1"
                    step="0.05"
                    value={warmthVal}
                    onChange={(e) =>
                      applyBeginnerMacros(
                        parseFloat(e.target.value),
                        clarityVal,
                        presenceVal,
                        airVal
                      )
                    }
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="text-right text-[11px] font-mono text-zinc-300">
                    {warmthVal > 0 ? `+${(warmthVal * 100).toFixed(0)}%` : `${(warmthVal * 100).toFixed(0)}%`}
                  </div>
                </div>

                {/* 2. De-Mud Macro */}
                <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 flex flex-col gap-2">
                  <span className="text-xs font-bold text-emerald-400">2. CLARITY & DE-MUD</span>
                  <p className="text-[10px] text-zinc-400">
                    Removes hollow boxiness in the mid-range
                  </p>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={clarityVal}
                    onChange={(e) =>
                      applyBeginnerMacros(
                        warmthVal,
                        parseFloat(e.target.value),
                        presenceVal,
                        airVal
                      )
                    }
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="text-right text-[11px] font-mono text-zinc-300">
                    {(clarityVal * 100).toFixed(0)}% Clean
                  </div>
                </div>

                {/* 3. Presence Macro */}
                <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 flex flex-col gap-2">
                  <span className="text-xs font-bold text-cyan-400">3. VOCAL PRESENCE</span>
                  <p className="text-[10px] text-zinc-400">
                    Boosts speech clarity to cut through mix
                  </p>
                  <input
                    type="range"
                    min="-1"
                    max="1"
                    step="0.05"
                    value={presenceVal}
                    onChange={(e) =>
                      applyBeginnerMacros(
                        warmthVal,
                        clarityVal,
                        parseFloat(e.target.value),
                        airVal
                      )
                    }
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  <div className="text-right text-[11px] font-mono text-zinc-300">
                    {presenceVal > 0 ? `+${(presenceVal * 100).toFixed(0)}%` : `${(presenceVal * 100).toFixed(0)}%`}
                  </div>
                </div>

                {/* 4. Air Sheen Macro */}
                <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 flex flex-col gap-2">
                  <span className="text-xs font-bold text-fuchsia-400">4. AIR & SPARKLE</span>
                  <p className="text-[10px] text-zinc-400">
                    Silky top-end shine for modern studio polish
                  </p>
                  <input
                    type="range"
                    min="-1"
                    max="1"
                    step="0.05"
                    value={airVal}
                    onChange={(e) =>
                      applyBeginnerMacros(
                        warmthVal,
                        clarityVal,
                        presenceVal,
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full accent-fuchsia-500 cursor-pointer"
                  />
                  <div className="text-right text-[11px] font-mono text-zinc-300">
                    {airVal > 0 ? `+${(airVal * 100).toFixed(0)}%` : `${(airVal * 100).toFixed(0)}%`}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* PRO MODE SURGICAL BAND CONTROLS */
            <div className="space-y-4">
              {/* Band Selection Tabs */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-2">
                  {bands.map((b) => {
                    const isSel = b.id === selectedBandId;
                    return (
                      <button
                        key={b.id}
                        onClick={() => setSelectedBandId(b.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
                          isSel
                            ? 'bg-amber-500 text-black border-amber-300 shadow-md'
                            : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:bg-zinc-850'
                        }`}
                      >
                        <span>BAND {b.id}</span>
                        <span className="text-[10px] opacity-75">
                          ({b.frequency >= 1000 ? `${(b.frequency / 1000).toFixed(1)}k` : b.frequency}Hz)
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Low Cut (HPF) Section */}
                <div className="flex items-center gap-2 bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800">
                  <button
                    onClick={() =>
                      onUpdateChannel({ ...channel, lowCutEnabled: !channel.lowCutEnabled })
                    }
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold cursor-pointer border ${
                      channel.lowCutEnabled
                        ? 'bg-rose-600 text-white border-rose-400'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    HPF
                  </button>
                  <span className="text-xs font-mono text-zinc-300">
                    {Math.round(channel.lowCutFreq)} Hz
                  </span>
                  <input
                    type="range"
                    min="20"
                    max="400"
                    value={channel.lowCutFreq}
                    onChange={(e) =>
                      onUpdateChannel({
                        ...channel,
                        lowCutFreq: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-20 accent-rose-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Active Band Detail Inspector */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                {/* 1. Filter Type Selector */}
                <div className="space-y-1.5">
                  <span className="text-xs font-mono text-zinc-400">FILTER SHAPE</span>
                  <div className="grid grid-cols-2 gap-1 text-[11px] font-mono">
                    {(['peq', 'veq', 'lowshelf', 'highshelf', 'lowcut', 'highcut'] as FilterType[]).map(
                      (type) => (
                        <button
                          key={type}
                          onClick={() => updateBandType(currentBand.id, type)}
                          className={`py-1 px-1.5 rounded uppercase font-bold cursor-pointer border ${
                            currentBand.type === type
                              ? 'bg-amber-500 text-black border-amber-300'
                              : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-850'
                          }`}
                        >
                          {type}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* 2. Frequency Control */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-zinc-400">FREQUENCY</span>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {currentBand.frequency >= 1000
                        ? `${(currentBand.frequency / 1000).toFixed(2)} kHz`
                        : `${currentBand.frequency} Hz`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="20000"
                    value={currentBand.frequency}
                    onChange={(e) => {
                      const updatedBands = bands.map((b) =>
                        b.id === currentBand.id ? { ...b, frequency: parseInt(e.target.value, 10) } : b
                      );
                      onUpdateChannel({ ...channel, eqBands: updatedBands });
                    }}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-zinc-600">
                    <span>20 Hz</span>
                    <span>1 kHz</span>
                    <span>20 kHz</span>
                  </div>
                </div>

                {/* 3. Gain Control */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-zinc-400">GAIN</span>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {currentBand.gain > 0 ? `+${currentBand.gain.toFixed(1)}` : currentBand.gain.toFixed(1)} dB
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-15"
                    max="15"
                    step="0.5"
                    value={currentBand.gain}
                    onChange={(e) => {
                      const updatedBands = bands.map((b) =>
                        b.id === currentBand.id ? { ...b, gain: parseFloat(e.target.value) } : b
                      );
                      onUpdateChannel({ ...channel, eqBands: updatedBands });
                    }}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-zinc-600">
                    <span>-15 dB</span>
                    <button
                      onClick={() => {
                        const updatedBands = bands.map((b) =>
                          b.id === currentBand.id ? { ...b, gain: 0 } : b
                        );
                        onUpdateChannel({ ...channel, eqBands: updatedBands });
                      }}
                      className="text-amber-400 hover:underline cursor-pointer"
                    >
                      0 dB
                    </button>
                    <span>+15 dB</span>
                  </div>
                </div>

                {/* 4. Q Factor (Bandwidth) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-zinc-400">Q FACTOR (WIDTH)</span>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {currentBand.q.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.3"
                    max="10.0"
                    step="0.1"
                    value={currentBand.q}
                    onChange={(e) => updateBandQ(currentBand.id, parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-zinc-600">
                    <span>Wide (0.3)</span>
                    <span>Sharp Notch (10.0)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Preset & Save Strip */}
          <div className="mt-4 pt-3 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-400">PRESETS:</span>
              <button
                onClick={() => {
                  const vocalBands: EqBand[] = [
                    { id: 1, name: 'Low Shelf', enabled: true, type: 'lowshelf', frequency: 120, gain: -2.0, q: 1.0 },
                    { id: 2, name: 'De-Mud', enabled: true, type: 'peq', frequency: 320, gain: -3.5, q: 2.2 },
                    { id: 3, name: 'Presence', enabled: true, type: 'peq', frequency: 3200, gain: 3.0, q: 1.8 },
                    { id: 4, name: 'Air', enabled: true, type: 'highshelf', frequency: 11500, gain: 4.0, q: 0.9 },
                  ];
                  onUpdateChannel({ ...channel, lowCutEnabled: true, lowCutFreq: 105, eqBands: vocalBands });
                }}
                className="px-2 py-1 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 rounded text-xs font-mono border border-zinc-800 cursor-pointer"
              >
                Lead Vox Air
              </button>

              <button
                onClick={() => {
                  const kickBands: EqBand[] = [
                    { id: 1, name: 'Sub', enabled: true, type: 'peq', frequency: 58, gain: 4.5, q: 1.8 },
                    { id: 2, name: 'Scoop', enabled: true, type: 'peq', frequency: 380, gain: -6.5, q: 2.5 },
                    { id: 3, name: 'Click', enabled: true, type: 'peq', frequency: 3800, gain: 4.0, q: 2.0 },
                    { id: 4, name: 'High Cut', enabled: true, type: 'highcut', frequency: 12000, gain: 0, q: 1.0 },
                  ];
                  onUpdateChannel({ ...channel, lowCutEnabled: true, lowCutFreq: 35, eqBands: kickBands });
                }}
                className="px-2 py-1 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 rounded text-xs font-mono border border-zinc-800 cursor-pointer"
              >
                Punchy Kick
              </button>

              <button
                onClick={() => {
                  const gtrBands: EqBand[] = [
                    { id: 1, name: 'Body', enabled: true, type: 'peq', frequency: 220, gain: -4.0, q: 2.4 },
                    { id: 2, name: 'Wood', enabled: true, type: 'peq', frequency: 900, gain: -1.5, q: 1.5 },
                    { id: 3, name: 'Attack', enabled: true, type: 'peq', frequency: 3500, gain: 2.0, q: 1.8 },
                    { id: 4, name: 'Sparkle', enabled: true, type: 'highshelf', frequency: 12000, gain: 3.5, q: 0.8 },
                  ];
                  onUpdateChannel({ ...channel, lowCutEnabled: true, lowCutFreq: 110, eqBands: gtrBands });
                }}
                className="px-2 py-1 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 rounded text-xs font-mono border border-zinc-800 cursor-pointer"
              >
                Acoustic Sparkle
              </button>
            </div>

            {/* Save as Personal Preset Button */}
            <div className="flex items-center gap-2">
              {showSavePresetInput ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    placeholder="Preset Name..."
                    value={presetNameInput}
                    onChange={(e) => setPresetNameInput(e.target.value)}
                    className="bg-zinc-950 border border-zinc-700 px-2 py-1 rounded text-xs font-mono text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={() => {
                      if (presetNameInput.trim()) {
                        onSavePersonalPreset(presetNameInput.trim(), 'Custom EQ', {
                          eqBands: channel.eqBands,
                          lowCutEnabled: channel.lowCutEnabled,
                          lowCutFreq: channel.lowCutFreq,
                        });
                        setShowSavePresetInput(false);
                        setPresetNameInput('');
                      }
                    }}
                    className="px-2.5 py-1 bg-amber-500 text-black font-bold text-xs rounded cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setShowSavePresetInput(false)}
                    className="px-2 py-1 bg-zinc-800 text-zinc-400 text-xs rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSavePresetInput(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-xs font-mono font-bold cursor-pointer transition-colors"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Save Personal Preset</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
