import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Sliders,
  Volume2,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  Zap,
  Activity,
  Disc,
  Mic,
  Bookmark,
  Check,
} from 'lucide-react';
import {
  ChannelStripData,
  ChannelColor,
  ChannelIcon,
  EqBand,
  FilterType,
} from '../types/mixer';
import { audioEngine } from '../services/audioEngine';

export type ProcessingTab = 'home' | 'config' | 'gate' | 'eq' | 'comp' | 'sends' | 'main';

interface ChannelProcessingDeckProps {
  channel: ChannelStripData;
  onUpdateChannel: (updated: ChannelStripData) => void;
  onOpenEqModal: () => void;
  onOpenDetailModal: () => void;
  onToggleCollapse: () => void;
  isCollapsed: boolean;
}

const colorBadges: Record<
  ChannelColor,
  { bg: string; text: string; border: string; glow: string }
> = {
  black: { bg: 'bg-[#15181e]', text: 'text-zinc-200', border: 'border-zinc-700', glow: '' },
  red: { bg: 'bg-[#3b0d11]', text: 'text-red-100', border: 'border-red-600', glow: 'shadow-red-950/60' },
  green: { bg: 'bg-[#0b2913]', text: 'text-emerald-100', border: 'border-emerald-600', glow: 'shadow-emerald-950/60' },
  yellow: { bg: 'bg-[#332604]', text: 'text-amber-100', border: 'border-amber-500', glow: 'shadow-amber-950/60' },
  blue: { bg: 'bg-[#0d223f]', text: 'text-blue-100', border: 'border-blue-600', glow: 'shadow-blue-950/60' },
  magenta: { bg: 'bg-[#360d32]', text: 'text-fuchsia-100', border: 'border-fuchsia-600', glow: 'shadow-fuchsia-950/60' },
  cyan: { bg: 'bg-[#092a30]', text: 'text-cyan-100', border: 'border-cyan-500', glow: 'shadow-cyan-950/60' },
  white: { bg: 'bg-[#e2e8f0]', text: 'text-zinc-950', border: 'border-white', glow: '' },
};

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

const presetQuickList = [
  {
    name: 'Lead Vox Air',
    bands: [
      { id: 1, name: 'LOW', enabled: true, type: 'lowcut' as FilterType, frequency: 110, gain: 0, q: 1.0 },
      { id: 2, name: 'LO MID', enabled: true, type: 'peq' as FilterType, frequency: 350, gain: -2.5, q: 2.0 },
      { id: 3, name: 'HI MID', enabled: true, type: 'peq' as FilterType, frequency: 3200, gain: 2.5, q: 1.8 },
      { id: 4, name: 'HIGH', enabled: true, type: 'highshelf' as FilterType, frequency: 10000, gain: 4.0, q: 0.7 },
    ],
  },
  {
    name: 'Punchy Kick',
    bands: [
      { id: 1, name: 'LOW', enabled: true, type: 'peq' as FilterType, frequency: 60, gain: 4.5, q: 1.4 },
      { id: 2, name: 'LO MID', enabled: true, type: 'peq' as FilterType, frequency: 380, gain: -6.0, q: 2.5 },
      { id: 3, name: 'HI MID', enabled: true, type: 'peq' as FilterType, frequency: 2800, gain: 0.0, q: 1.5 },
      { id: 4, name: 'HIGH', enabled: true, type: 'peq' as FilterType, frequency: 4500, gain: 4.5, q: 1.8 },
    ],
  },
  {
    name: 'Snare Crack',
    bands: [
      { id: 1, name: 'LOW', enabled: true, type: 'lowcut' as FilterType, frequency: 95, gain: 0, q: 1.0 },
      { id: 2, name: 'LO MID', enabled: true, type: 'peq' as FilterType, frequency: 220, gain: 3.0, q: 1.5 },
      { id: 3, name: 'HI MID', enabled: true, type: 'peq' as FilterType, frequency: 900, gain: -3.5, q: 2.2 },
      { id: 4, name: 'HIGH', enabled: true, type: 'peq' as FilterType, frequency: 5000, gain: 3.5, q: 1.4 },
    ],
  },
  {
    name: 'Deep Bass',
    bands: [
      { id: 1, name: 'LOW', enabled: true, type: 'peq' as FilterType, frequency: 85, gain: 3.0, q: 1.2 },
      { id: 2, name: 'LO MID', enabled: true, type: 'peq' as FilterType, frequency: 250, gain: -2.0, q: 2.0 },
      { id: 3, name: 'HI MID', enabled: true, type: 'peq' as FilterType, frequency: 750, gain: 2.0, q: 2.0 },
      { id: 4, name: 'HIGH', enabled: true, type: 'highcut' as FilterType, frequency: 6500, gain: -5.0, q: 1.0 },
    ],
  },
  {
    name: 'Acoustic Guitar',
    bands: [
      { id: 1, name: 'LOW', enabled: true, type: 'lowcut' as FilterType, frequency: 120, gain: 0, q: 1.0 },
      { id: 2, name: 'LO MID', enabled: true, type: 'peq' as FilterType, frequency: 260, gain: -3.0, q: 2.0 },
      { id: 3, name: 'HI MID', enabled: true, type: 'peq' as FilterType, frequency: 2500, gain: 1.5, q: 1.5 },
      { id: 4, name: 'HIGH', enabled: true, type: 'highshelf' as FilterType, frequency: 8500, gain: 3.5, q: 0.8 },
    ],
  },
  {
    name: 'Reset Flat',
    bands: [
      { id: 1, name: 'LOW', enabled: true, type: 'peq' as FilterType, frequency: 80, gain: 0, q: 1.0 },
      { id: 2, name: 'LO MID', enabled: true, type: 'peq' as FilterType, frequency: 400, gain: 0, q: 1.0 },
      { id: 3, name: 'HI MID', enabled: true, type: 'peq' as FilterType, frequency: 2000, gain: 0, q: 1.0 },
      { id: 4, name: 'HIGH', enabled: true, type: 'peq' as FilterType, frequency: 8000, gain: 0, q: 1.0 },
    ],
  },
];

export const ChannelProcessingDeck: React.FC<ChannelProcessingDeckProps> = ({
  channel,
  onUpdateChannel,
  onOpenEqModal,
  onOpenDetailModal,
  onToggleCollapse,
  isCollapsed,
}) => {
  const [activeTab, setActiveTab] = useState<ProcessingTab>('eq');
  const [selectedEqBandId, setSelectedEqBandId] = useState<number>(1);
  const [draggedBandId, setDraggedBandId] = useState<number | null>(null);
  const [rtaEnabled, setRtaEnabled] = useState(true);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const badgeStyle = colorBadges[channel.color] || colorBadges.black;

  // Selected EQ Band
  const activeBand =
    channel.eqBands.find((b) => b.id === selectedEqBandId) || channel.eqBands[0];

  // Helper conversions for Canvas EQ coordinates
  const minFreq = 20;
  const maxFreq = 20000;
  const minGain = -15;
  const maxGain = 15;

  const freqToX = useCallback((freq: number, width: number) => {
    const minLog = Math.log10(minFreq);
    const maxLog = Math.log10(maxFreq);
    const freqLog = Math.log10(Math.max(minFreq, Math.min(maxFreq, freq)));
    return ((freqLog - minLog) / (maxLog - minLog)) * width;
  }, []);

  const xToFreq = useCallback((x: number, width: number) => {
    const minLog = Math.log10(minFreq);
    const maxLog = Math.log10(maxFreq);
    const fraction = Math.max(0, Math.min(1, x / width));
    return Math.pow(10, minLog + fraction * (maxLog - minLog));
  }, []);

  const gainToY = useCallback((gain: number, height: number) => {
    const fraction = (gain - minGain) / (maxGain - minGain);
    return height - fraction * height;
  }, []);

  const yToGain = useCallback((y: number, height: number) => {
    const fraction = 1 - Math.max(0, Math.min(1, y / height));
    return minGain + fraction * (maxGain - minGain);
  }, []);

  // Update specific EQ band
  const handleUpdateBand = (bandId: number, updates: Partial<EqBand>) => {
    const updated = channel.eqBands.map((b) =>
      b.id === bandId ? { ...b, ...updates } : b
    );
    onUpdateChannel({ ...channel, eqBands: updated });
  };

  // Canvas drawing loop: EQ curve + Real-time RTA spectrum
  useEffect(() => {
    if (activeTab !== 'eq' || isCollapsed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      if (canvas.clientWidth && canvas.clientHeight) {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const targetW = Math.floor(canvas.clientWidth * dpr);
        const targetH = Math.floor(canvas.clientHeight * dpr);
        if (canvas.width !== targetW || canvas.height !== targetH) {
          canvas.width = targetW;
          canvas.height = targetH;
        }
      }

      const width = canvas.width;
      const height = canvas.height;

      // Clear background
      ctx.fillStyle = '#0a0d12';
      ctx.fillRect(0, 0, width, height);

      // Grid Lines
      ctx.strokeStyle = '#1a1f2c';
      ctx.lineWidth = 1;

      // Frequency vertical lines (20, 50, 100, 200, 500, 1k, 2k, 5k, 10k, 20k)
      const freqGrid = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
      ctx.font = '8px monospace';
      ctx.fillStyle = '#40495e';

      freqGrid.forEach((f) => {
        const x = freqToX(f, width);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();

        const label = f >= 1000 ? `${f / 1000}k` : `${f}`;
        ctx.fillText(label, x + 2, height - 3);
      });

      // dB horizontal lines (-15, -10, -5, 0, +5, +10, +15)
      const gains = [-12, -6, 0, 6, 12];
      gains.forEach((g) => {
        const y = gainToY(g, height);
        ctx.beginPath();
        if (g === 0) {
          ctx.strokeStyle = '#2d3748';
          ctx.lineWidth = 1.2;
        } else {
          ctx.strokeStyle = '#161a24';
          ctx.lineWidth = 1;
        }
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();

        ctx.fillStyle = g === 0 ? '#64748b' : '#334155';
        ctx.fillText(`${g > 0 ? '+' : ''}${g}dB`, 3, y - 2);
      });

      // Live RTA Spectrum Bars
      if (rtaEnabled) {
        const rtaData = audioEngine.getRtaFrequencyData();
        if (rtaData && rtaData.length > 0) {
          const barCount = 48;
          const barWidth = width / barCount;

          for (let i = 0; i < barCount; i++) {
            const dataIdx = Math.floor((i / barCount) * (rtaData.length * 0.7));
            const val = rtaData[dataIdx] || 0;
            const barHeight = (val / 255) * (height * 0.65);
            const x = i * barWidth;
            const y = height - barHeight;

            const grad = ctx.createLinearGradient(0, y, 0, height);
            grad.addColorStop(0, val > 200 ? 'rgba(239, 68, 68, 0.45)' : 'rgba(245, 158, 11, 0.35)');
            grad.addColorStop(1, 'rgba(6, 182, 212, 0.08)');

            ctx.fillStyle = grad;
            ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
          }
        }
      }

      // Calculate Composite Frequency Response Curve
      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = channel.eqEnabled ? '#38bdf8' : '#64748b';

      const points: { x: number; y: number }[] = [];
      const steps = 180;

      for (let s = 0; s <= steps; s++) {
        const x = (s / steps) * width;
        const f = xToFreq(x, width);

        let totalDb = 0;

        if (channel.lowCutEnabled) {
          const lcFreq = channel.lowCutFreq || 80;
          if (f < lcFreq) {
            const octavesBelow = Math.log2(lcFreq / f);
            totalDb -= octavesBelow * 18; // 18dB/octave Butterworth
          }
        }

        if (channel.eqEnabled) {
          channel.eqBands.forEach((band) => {
            if (!band.enabled) return;
            const f0 = band.frequency;
            const g = band.gain;
            const q = band.q;

            if (band.type === 'peq' || band.type === 'veq') {
              const diffOctaves = Math.log2(f / f0);
              const bell = Math.exp(-Math.pow(diffOctaves * q * 1.5, 2));
              totalDb += g * bell;
            } else if (band.type === 'lowshelf') {
              const ratio = f / f0;
              const shelf = 1 / (1 + Math.pow(ratio, 2 * q));
              totalDb += g * shelf;
            } else if (band.type === 'highshelf') {
              const ratio = f0 / f;
              const shelf = 1 / (1 + Math.pow(ratio, 2 * q));
              totalDb += g * shelf;
            } else if (band.type === 'lowcut') {
              if (f < f0) {
                totalDb -= Math.log2(f0 / f) * 18;
              }
            } else if (band.type === 'highcut') {
              if (f > f0) {
                totalDb -= Math.log2(f / f0) * 18;
              }
            }
          });
        }

        const y = gainToY(Math.max(-20, Math.min(20, totalDb)), height);
        points.push({ x, y });

        if (s === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();

      // Shaded area under the curve
      if (channel.eqEnabled) {
        ctx.lineTo(width, gainToY(0, height));
        ctx.lineTo(0, gainToY(0, height));
        ctx.closePath();
        const fillGrad = ctx.createLinearGradient(0, 0, 0, height);
        fillGrad.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
        fillGrad.addColorStop(1, 'rgba(56, 189, 248, 0.01)');
        ctx.fillStyle = fillGrad;
        ctx.fill();
      }

      // Draw interactive Band Nodes
      const bandColors = ['#f59e0b', '#eab308', '#10b981', '#3b82f6'];

      channel.eqBands.forEach((band, idx) => {
        const x = freqToX(band.frequency, width);
        const y = gainToY(band.gain, height);
        const isSel = band.id === selectedEqBandId;

        // Outer glow circle
        ctx.beginPath();
        ctx.arc(x, y, isSel ? 10 : 7, 0, Math.PI * 2);
        ctx.fillStyle = isSel ? bandColors[idx] : 'rgba(255,255,255,0.15)';
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Band number text
        ctx.fillStyle = isSel ? '#000000' : '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(idx + 1), x, y);
      });

      // Low Cut handle
      if (channel.lowCutEnabled) {
        const lcx = freqToX(channel.lowCutFreq, width);
        const lcy = gainToY(0, height);
        ctx.beginPath();
        ctx.arc(lcx, lcy, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 7px monospace';
        ctx.fillText('LC', lcx, lcy);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [
    activeTab,
    isCollapsed,
    channel,
    selectedEqBandId,
    rtaEnabled,
    freqToX,
    xToFreq,
    gainToY,
    yToGain,
  ]);

  // Pointer drag on EQ graph
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    // Check click near band handles with touch-friendly hit radius
    let foundBandId: number | null = null;
    const hitRadius = Math.max(28, 28 * (canvas.width / rect.width));
    channel.eqBands.forEach((band) => {
      const bx = freqToX(band.frequency, canvas.width);
      const by = gainToY(band.gain, canvas.height);
      const dist = Math.hypot(x - bx, y - by);
      if (dist < hitRadius) {
        foundBandId = band.id;
      }
    });

    if (foundBandId !== null) {
      setSelectedEqBandId(foundBandId);
      setDraggedBandId(foundBandId);
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (draggedBandId === null) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    const newFreq = Math.round(xToFreq(x, canvas.width));
    const newGain = parseFloat(yToGain(y, canvas.height).toFixed(1));

    handleUpdateBand(draggedBandId, {
      frequency: Math.max(20, Math.min(20000, newFreq)),
      gain: Math.max(-15, Math.min(15, newGain)),
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (draggedBandId !== null) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      setDraggedBandId(null);
    }
  };

  return (
    <div className="bg-[#101318] border-b border-[#232733] flex flex-col shrink-0 select-none font-mono">
      {/* 1. M32-MIX CHANNEL PROCESSING TOOLBAR & SCRIBBLE STRIP BANNER */}
      <div className="h-10 bg-[#141720] border-b border-[#222735] px-2.5 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
        {/* Left: Selected Channel Scribble Strip Preview */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            onClick={onOpenDetailModal}
            className={`h-7 px-2 rounded-xs border flex items-center gap-1.5 cursor-pointer hover:brightness-110 transition-all ${badgeStyle.bg} ${badgeStyle.border} ${badgeStyle.glow}`}
            title="Channel Routing & Scribble Strip Settings"
          >
            <span className="text-[9px] font-black opacity-75">CH{String(channel.id).padStart(2, '0')}</span>
            <span className={`text-[11px] font-black ${badgeStyle.text} truncate max-w-[85px]`}>
              {channel.name}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[9px] text-zinc-400">
            <span>FADER: <b className="text-zinc-200">{channel.fader <= -85 ? '-∞' : `${channel.fader.toFixed(1)}dB`}</b></span>
            <span>·</span>
            <span>PAN: <b className="text-zinc-200">{channel.pan === 0 ? 'C' : channel.pan < 0 ? `L${Math.abs(channel.pan)}` : `R${channel.pan}`}</b></span>
          </div>
        </div>

        {/* Center: Authentic M32-Mix Processing Tabs */}
        <div className="flex items-center gap-1 shrink-0">
          {(
            [
              { id: 'home', label: 'HOME' },
              { id: 'config', label: 'CONFIG' },
              { id: 'gate', label: 'GATE' },
              { id: 'eq', label: 'EQ' },
              { id: 'comp', label: 'COMP' },
              { id: 'sends', label: 'SENDS' },
              { id: 'main', label: 'MAIN' },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (isCollapsed) onToggleCollapse(); // expand if collapsed
                }}
                className={`px-2.5 py-1 rounded-xs text-[11px] font-black tracking-wider transition-all cursor-pointer border m32-btn ${
                  isActive
                    ? 'bg-amber-500 text-black border-amber-300 shadow-md ring-1 ring-amber-400/50'
                    : 'bg-[#181c25] text-zinc-400 border-[#262c3c] hover:bg-[#1e2330] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right: Quick Tools (Preset loader, Fullscreen EQ, Collapse) */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Quick Preset Selector */}
          <select
            onChange={(e) => {
              const preset = presetQuickList.find((p) => p.name === e.target.value);
              if (preset) {
                onUpdateChannel({ ...channel, eqBands: preset.bands });
                setCopiedNotification(true);
                setTimeout(() => setCopiedNotification(false), 1500);
              }
            }}
            value=""
            className="h-7 px-1.5 text-[10px] font-bold bg-[#171a23] border border-[#2b3142] text-zinc-200 rounded-xs cursor-pointer hover:border-amber-500 focus:outline-none"
          >
            <option value="" disabled>
              {copiedNotification ? '✓ APPLIED' : '⚡ EQ PRESETS'}
            </option>
            {presetQuickList.map((p) => (
              <option key={p.name} value={p.name} className="bg-zinc-900 text-white">
                {p.name}
              </option>
            ))}
          </select>

          {/* Expand to Full-Screen EQ Modal */}
          <button
            onClick={onOpenEqModal}
            title="Expand Full-Screen Parametric EQ Editor"
            className="h-7 px-2 rounded-xs text-[10px] font-bold bg-[#1a1f2c] text-cyan-300 border border-cyan-800/80 hover:bg-cyan-950 flex items-center gap-1 cursor-pointer"
          >
            <Maximize2 className="w-3 h-3" />
            <span className="hidden md:inline">EXPAND</span>
          </button>

          {/* Toggle Collapse Deck (Switch between Split View and Tall Faders View) */}
          <button
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Show Processing Rack' : 'Collapse Processing Rack (Tall Faders Mode)'}
            className="h-7 w-7 rounded-xs bg-[#171a23] text-zinc-400 hover:text-white border border-[#2b3142] flex items-center justify-center cursor-pointer"
          >
            {isCollapsed ? <Sliders className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. THE CHANNEL PROCESSING RACK BODY (WHEN NOT COLLAPSED) */}
      {!isCollapsed && (
        <div className="h-64 sm:h-72 p-2 bg-[#0c0e13] flex flex-col md:flex-row gap-2 overflow-y-auto">
          {/* TAB: EQ (THE FAMOUS M32 PARAMETRIC EQ GRAPH & RTA) */}
          {activeTab === 'eq' && (
            <div className="flex-1 flex flex-col md:flex-row gap-2 h-full">
              {/* Left/Center: Interactive HTML5 Canvas Graph */}
              <div className="flex-1 relative flex flex-col bg-[#08090d] rounded-xs border border-[#1f2430] overflow-hidden min-h-[160px]">
                <canvas
                  ref={canvasRef}
                  width={680}
                  height={240}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  className="w-full h-full cursor-crosshair touch-none"
                />

                {/* Status Badges Overlay on Graph */}
                <div className="absolute top-1.5 left-2 flex items-center gap-1.5 pointer-events-none">
                  <span className="text-[10px] font-black text-amber-400 bg-black/70 px-1.5 py-0.5 rounded border border-amber-500/40">
                    4-BAND PARAMETRIC EQ
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${channel.eqEnabled ? 'text-cyan-300 bg-cyan-950/80 border border-cyan-700' : 'text-zinc-400 bg-black/60 border border-zinc-700'}`}>
                    {channel.eqEnabled ? 'EQ ACTIVE' : 'EQ BYPASS'}
                  </span>
                </div>

                <div className="absolute top-1.5 right-2 flex items-center gap-1">
                  <button
                    onClick={() => setRtaEnabled(!rtaEnabled)}
                    className={`px-1.5 py-0.5 text-[9px] font-black rounded-xs border cursor-pointer ${
                      rtaEnabled
                        ? 'bg-amber-500 text-black border-amber-300'
                        : 'bg-black/60 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    RTA {rtaEnabled ? 'ON' : 'OFF'}
                  </button>
                  <button
                    onClick={() =>
                      onUpdateChannel({ ...channel, eqEnabled: !channel.eqEnabled })
                    }
                    className={`px-2 py-0.5 text-[9px] font-black rounded-xs border cursor-pointer ${
                      channel.eqEnabled
                        ? 'bg-cyan-500 text-black border-cyan-300 led-glow-cyan'
                        : 'bg-[#181c25] text-zinc-400 border-[#282f40]'
                    }`}
                  >
                    EQ IN
                  </button>
                </div>
              </div>

              {/* Right: Band Controls Rack (Band Select, Type, Freq, Gain, Q) */}
              <div className="w-full md:w-64 bg-[#12151d] border border-[#222736] rounded-xs p-2 flex flex-col justify-between shrink-0 space-y-2">
                {/* Band Selector Buttons */}
                <div>
                  <div className="flex items-center justify-between text-[9px] text-zinc-400 mb-1">
                    <span>SELECT BAND:</span>
                    <button
                      onClick={() => {
                        const resetBands = channel.eqBands.map((b) => ({ ...b, gain: 0 }));
                        onUpdateChannel({ ...channel, eqBands: resetBands });
                      }}
                      className="text-amber-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <RotateCcw className="w-2.5 h-2.5" /> RESET FLAT
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {channel.eqBands.map((band) => {
                      const isSel = band.id === selectedEqBandId;
                      return (
                        <button
                          key={band.id}
                          onClick={() => setSelectedEqBandId(band.id)}
                          className={`py-1 rounded-xs text-[10px] font-black border transition-all cursor-pointer ${
                            isSel
                              ? 'bg-amber-500 text-black border-amber-300 shadow-sm'
                              : 'bg-[#181c26] text-zinc-300 border-[#293042] hover:bg-[#1f2533]'
                          }`}
                        >
                          {band.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Band Parameters: Type, Freq, Gain, Q */}
                <div className="space-y-1.5 bg-[#0e1017] p-2 rounded-xs border border-[#1e2330]">
                  {/* Mode / Type */}
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-zinc-400">TYPE:</span>
                    <select
                      value={activeBand.type}
                      onChange={(e) =>
                        handleUpdateBand(activeBand.id, {
                          type: e.target.value as FilterType,
                        })
                      }
                      className="bg-[#171a24] text-amber-400 font-bold border border-[#2a3040] rounded px-1.5 py-0.5 text-[10px] cursor-pointer"
                    >
                      <option value="lowcut">LOW CUT</option>
                      <option value="lowshelf">LOW SHELF</option>
                      <option value="peq">PEQ (BELL)</option>
                      <option value="highshelf">HI SHELF</option>
                      <option value="highcut">HI CUT</option>
                    </select>
                  </div>

                  {/* Frequency Slider */}
                  <div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-zinc-400">FREQ</span>
                      <span className="font-bold text-cyan-400">
                        {activeBand.frequency >= 1000
                          ? `${(activeBand.frequency / 1000).toFixed(2)} kHz`
                          : `${activeBand.frequency} Hz`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="20000"
                      value={activeBand.frequency}
                      onChange={(e) =>
                        handleUpdateBand(activeBand.id, {
                          frequency: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full accent-cyan-400 cursor-pointer h-1"
                    />
                  </div>

                  {/* Gain Slider */}
                  <div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-zinc-400">GAIN</span>
                      <span
                        className={`font-bold ${
                          activeBand.gain > 0
                            ? 'text-amber-400'
                            : activeBand.gain < 0
                            ? 'text-rose-400'
                            : 'text-zinc-300'
                        }`}
                      >
                        {activeBand.gain > 0 ? `+${activeBand.gain.toFixed(1)}` : activeBand.gain.toFixed(1)} dB
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-15"
                      max="15"
                      step="0.5"
                      value={activeBand.gain}
                      onChange={(e) =>
                        handleUpdateBand(activeBand.id, {
                          gain: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-amber-400 cursor-pointer h-1"
                    />
                  </div>

                  {/* Q Factor Slider */}
                  <div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-zinc-400">Q FACTOR</span>
                      <span className="font-bold text-emerald-400">{activeBand.q.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.3"
                      max="10.0"
                      step="0.1"
                      value={activeBand.q}
                      onChange={(e) =>
                        handleUpdateBand(activeBand.id, {
                          q: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-emerald-400 cursor-pointer h-1"
                    />
                  </div>
                </div>

                {/* Low Cut Section in EQ rack */}
                <div className="flex items-center justify-between bg-[#151922] px-2 py-1.5 rounded-xs border border-[#242b3b]">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        onUpdateChannel({
                          ...channel,
                          lowCutEnabled: !channel.lowCutEnabled,
                        })
                      }
                      className={`px-1.5 py-0.5 rounded-xs text-[9px] font-black border cursor-pointer ${
                        channel.lowCutEnabled
                          ? 'bg-rose-600 text-white border-rose-400 led-glow-red'
                          : 'bg-[#181c25] text-zinc-400 border-[#282f40]'
                      }`}
                    >
                      LOW CUT
                    </button>
                    <span className="text-[10px] text-zinc-300 font-bold">
                      {Math.round(channel.lowCutFreq)} Hz
                    </span>
                  </div>
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
                    className="w-20 accent-rose-500 cursor-pointer h-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: HOME (OVERVIEW SUMMARY OF PREAMP, GATE, EQ, COMP, SENDS, PAN) */}
          {activeTab === 'home' && (
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {/* 1. Preamp Tile */}
              <div
                onClick={() => setActiveTab('config')}
                className="bg-[#12151e] border border-[#232938] rounded-xs p-2.5 flex flex-col justify-between cursor-pointer hover:border-cyan-500"
              >
                <div className="flex justify-between items-center text-[10px] font-bold text-cyan-400 border-b border-[#232938] pb-1">
                  <span>PREAMP</span>
                  <span>+{channel.gain}dB</span>
                </div>
                <div className="space-y-1 text-[9px] text-zinc-300">
                  <div className="flex justify-between">
                    <span>48V:</span>
                    <span className={channel.phantom48v ? 'text-rose-400 font-bold' : 'text-zinc-600'}>
                      {channel.phantom48v ? 'ACTIVE' : 'OFF'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>PHASE:</span>
                    <span className={channel.polarityInvert ? 'text-amber-400 font-bold' : 'text-zinc-600'}>
                      {channel.polarityInvert ? 'INVERT (Ø)' : 'NORMAL'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>LOW CUT:</span>
                    <span className={channel.lowCutEnabled ? 'text-rose-400 font-bold' : 'text-zinc-600'}>
                      {channel.lowCutEnabled ? `${Math.round(channel.lowCutFreq)}Hz` : 'OFF'}
                    </span>
                  </div>
                </div>
                <div className="text-[8px] text-zinc-500 text-center pt-1 border-t border-[#1e2330]">
                  TAP TO EDIT CONFIG
                </div>
              </div>

              {/* 2. Gate Tile */}
              <div
                onClick={() => setActiveTab('gate')}
                className="bg-[#12151e] border border-[#232938] rounded-xs p-2.5 flex flex-col justify-between cursor-pointer hover:border-cyan-500"
              >
                <div className="flex justify-between items-center text-[10px] font-bold text-amber-400 border-b border-[#232938] pb-1">
                  <span>GATE</span>
                  <span className={channel.gate.enabled ? 'text-emerald-400' : 'text-zinc-600'}>
                    {channel.gate.enabled ? 'IN' : 'BYPASS'}
                  </span>
                </div>
                <div className="space-y-1 text-[9px] text-zinc-300">
                  <div className="flex justify-between">
                    <span>THRESH:</span>
                    <span>{channel.gate.threshold} dB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>RANGE:</span>
                    <span>{channel.gate.range} dB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ATTACK:</span>
                    <span>{channel.gate.attack} ms</span>
                  </div>
                </div>
                <div className="text-[8px] text-zinc-500 text-center pt-1 border-t border-[#1e2330]">
                  TAP TO EDIT GATE
                </div>
              </div>

              {/* 3. EQ Tile */}
              <div
                onClick={() => setActiveTab('eq')}
                className="bg-[#12151e] border border-[#232938] rounded-xs p-2.5 flex flex-col justify-between cursor-pointer hover:border-cyan-500"
              >
                <div className="flex justify-between items-center text-[10px] font-bold text-cyan-400 border-b border-[#232938] pb-1">
                  <span>4-BAND EQ</span>
                  <span className={channel.eqEnabled ? 'text-emerald-400' : 'text-zinc-600'}>
                    {channel.eqEnabled ? 'IN' : 'BYPASS'}
                  </span>
                </div>
                <div className="h-12 bg-[#090b0f] rounded-xs border border-[#1a1f2c] flex items-center justify-center p-1">
                  <svg className="w-full h-full" viewBox="0 0 100 32">
                    <path
                      d={`M 0 16 Q 25 ${16 - channel.eqBands[0]?.gain * 0.9} 50 ${16 - channel.eqBands[1]?.gain * 0.9} T 75 ${16 - channel.eqBands[2]?.gain * 0.9} T 100 ${16 - channel.eqBands[3]?.gain * 0.9}`}
                      fill="none"
                      stroke={channel.eqEnabled ? '#38bdf8' : '#64748b'}
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <div className="text-[8px] text-zinc-500 text-center pt-1 border-t border-[#1e2330]">
                  TAP TO EDIT EQ
                </div>
              </div>

              {/* 4. Compressor Tile */}
              <div
                onClick={() => setActiveTab('comp')}
                className="bg-[#12151e] border border-[#232938] rounded-xs p-2.5 flex flex-col justify-between cursor-pointer hover:border-cyan-500"
              >
                <div className="flex justify-between items-center text-[10px] font-bold text-amber-400 border-b border-[#232938] pb-1">
                  <span>COMP</span>
                  <span className={channel.compressor.enabled ? 'text-emerald-400' : 'text-zinc-600'}>
                    {channel.compressor.enabled ? 'IN' : 'BYPASS'}
                  </span>
                </div>
                <div className="space-y-1 text-[9px] text-zinc-300">
                  <div className="flex justify-between">
                    <span>THRESH:</span>
                    <span>{channel.compressor.threshold} dB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>RATIO:</span>
                    <span>{channel.compressor.ratio}:1</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GAIN:</span>
                    <span>+{channel.compressor.makeupGain} dB</span>
                  </div>
                </div>
                <div className="text-[8px] text-zinc-500 text-center pt-1 border-t border-[#1e2330]">
                  TAP TO EDIT COMP
                </div>
              </div>

              {/* 5. Mix Bus Sends Tile */}
              <div
                onClick={() => setActiveTab('sends')}
                className="bg-[#12151e] border border-[#232938] rounded-xs p-2.5 flex flex-col justify-between cursor-pointer hover:border-cyan-500"
              >
                <div className="flex justify-between items-center text-[10px] font-bold text-emerald-400 border-b border-[#232938] pb-1">
                  <span>BUS SENDS</span>
                  <span>16 BUSES</span>
                </div>
                <div className="grid grid-cols-8 gap-0.5 h-12 items-end bg-[#090b0f] p-1 rounded-xs border border-[#1a1f2c]">
                  {channel.sends.slice(0, 8).map((s) => {
                    const frac = Math.max(0, Math.min(1, (s.level + 90) / 100));
                    return (
                      <div key={s.busId} className="w-full bg-[#181d28] h-full flex flex-col justify-end">
                        <div
                          style={{ height: `${frac * 100}%` }}
                          className="bg-emerald-500 w-full"
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="text-[8px] text-zinc-500 text-center pt-1 border-t border-[#1e2330]">
                  TAP TO EDIT SENDS
                </div>
              </div>

              {/* 6. Main LR Tile */}
              <div
                onClick={() => setActiveTab('main')}
                className="bg-[#12151e] border border-[#232938] rounded-xs p-2.5 flex flex-col justify-between cursor-pointer hover:border-cyan-500"
              >
                <div className="flex justify-between items-center text-[10px] font-bold text-rose-400 border-b border-[#232938] pb-1">
                  <span>MAIN OUTPUT</span>
                  <span>{channel.mainLR ? 'ASSIGNED' : 'OFF'}</span>
                </div>
                <div className="space-y-1 text-[9px] text-zinc-300">
                  <div className="flex justify-between">
                    <span>PAN:</span>
                    <span>{channel.pan === 0 ? 'CENTER' : channel.pan < 0 ? `L ${Math.abs(channel.pan)}` : `R ${channel.pan}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>MONO/C:</span>
                    <span>{channel.monoCenter ? 'ACTIVE' : 'OFF'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>MUTE:</span>
                    <span className={channel.muted ? 'text-rose-500 font-bold' : 'text-emerald-400'}>
                      {channel.muted ? 'MUTED' : 'LIVE'}
                    </span>
                  </div>
                </div>
                <div className="text-[8px] text-zinc-500 text-center pt-1 border-t border-[#1e2330]">
                  TAP TO EDIT MAIN
                </div>
              </div>
            </div>
          )}

          {/* TAB: CONFIG (PREAMP GAIN, 48V, POLARITY, LOW CUT, DELAY, NAME, COLOR) */}
          {activeTab === 'config' && (
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Preamp Settings */}
              <div className="bg-[#12151d] border border-[#232838] p-3 rounded-xs space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-amber-400 border-b border-[#232838] pb-1">
                  <span>MIDAS PRO PREAMP</span>
                  <span className="text-cyan-400">+{channel.gain} dB</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block mb-1">ANALOG GAIN (-12 to +60 dB)</span>
                  <input
                    type="range"
                    min="-12"
                    max="60"
                    value={channel.gain}
                    onChange={(e) =>
                      onUpdateChannel({ ...channel, gain: parseInt(e.target.value, 10) })
                    }
                    className="w-full accent-cyan-400 cursor-pointer h-1.5"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() =>
                      onUpdateChannel({ ...channel, phantom48v: !channel.phantom48v })
                    }
                    className={`py-2 rounded-xs text-xs font-black border transition-all cursor-pointer m32-btn ${
                      channel.phantom48v
                        ? 'bg-rose-600 text-white border-rose-400 led-glow-red'
                        : 'bg-[#181c26] text-zinc-400 border-[#2b3242]'
                    }`}
                  >
                    +48V PHANTOM
                  </button>
                  <button
                    onClick={() =>
                      onUpdateChannel({ ...channel, polarityInvert: !channel.polarityInvert })
                    }
                    className={`py-2 rounded-xs text-xs font-black border transition-all cursor-pointer m32-btn ${
                      channel.polarityInvert
                        ? 'bg-amber-500 text-black border-amber-300 led-glow-amber'
                        : 'bg-[#181c26] text-zinc-400 border-[#2b3242]'
                    }`}
                  >
                    Ø POLARITY
                  </button>
                </div>
              </div>

              {/* Low Cut & Input Delay */}
              <div className="bg-[#12151d] border border-[#232838] p-3 rounded-xs space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-rose-400 border-b border-[#232838] pb-1">
                  <span>LOW CUT (HPF) & DELAY</span>
                  <span>{channel.lowCutEnabled ? `${Math.round(channel.lowCutFreq)} Hz` : 'BYPASS'}</span>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                    <span>CUTOFF FREQ (20-400 Hz)</span>
                    <button
                      onClick={() =>
                        onUpdateChannel({ ...channel, lowCutEnabled: !channel.lowCutEnabled })
                      }
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${channel.lowCutEnabled ? 'bg-rose-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}
                    >
                      {channel.lowCutEnabled ? 'HPF ON' : 'HPF OFF'}
                    </button>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="400"
                    value={channel.lowCutFreq}
                    onChange={(e) =>
                      onUpdateChannel({ ...channel, lowCutFreq: parseInt(e.target.value, 10) })
                    }
                    className="w-full accent-rose-500 cursor-pointer h-1.5"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block mb-1">INPUT TIME ALIGN DELAY (ms)</span>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={channel.delayMs}
                    onChange={(e) =>
                      onUpdateChannel({ ...channel, delayMs: parseInt(e.target.value, 10) })
                    }
                    className="w-full accent-amber-400 cursor-pointer h-1.5"
                  />
                  <span className="text-[10px] text-amber-300 font-bold block text-right mt-0.5">
                    {channel.delayMs} ms ({((channel.delayMs * 343) / 1000).toFixed(2)} m)
                  </span>
                </div>
              </div>

              {/* Scribble Strip Name & Color */}
              <div className="bg-[#12151d] border border-[#232838] p-3 rounded-xs space-y-3">
                <div className="text-xs font-bold text-cyan-400 border-b border-[#232838] pb-1">
                  SCRIBBLE STRIP CUSTOMIZATION
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block mb-1">CHANNEL NAME</span>
                  <input
                    type="text"
                    value={channel.name}
                    onChange={(e) => onUpdateChannel({ ...channel, name: e.target.value })}
                    className="w-full bg-[#181c26] text-white px-2 py-1 text-xs border border-[#2b3242] rounded-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block mb-1">LCD BACKLIGHT COLOR</span>
                  <div className="grid grid-cols-4 gap-1">
                    {(
                      ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'] as ChannelColor[]
                    ).map((col) => {
                      const isSel = channel.color === col;
                      return (
                        <button
                          key={col}
                          onClick={() => onUpdateChannel({ ...channel, color: col })}
                          className={`py-1 rounded-xs text-[9px] font-black uppercase border cursor-pointer ${
                            isSel ? 'ring-2 ring-white border-white scale-105' : 'border-zinc-800'
                          } ${colorBadges[col].bg} ${colorBadges[col].text}`}
                        >
                          {col}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: GATE (NOISE GATE & DUCKER) */}
          {activeTab === 'gate' && (
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Gate Controls */}
              <div className="bg-[#12151d] border border-[#232838] p-3 rounded-xs space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-amber-400 border-b border-[#232838] pb-1">
                  <span>NOISE GATE PROCESSOR</span>
                  <button
                    onClick={() =>
                      onUpdateChannel({
                        ...channel,
                        gate: { ...channel.gate, enabled: !channel.gate.enabled },
                      })
                    }
                    className={`px-2 py-0.5 rounded text-[10px] font-black border cursor-pointer ${
                      channel.gate.enabled
                        ? 'bg-amber-500 text-black border-amber-300 led-glow-amber'
                        : 'bg-[#181c25] text-zinc-400 border-[#282f40]'
                    }`}
                  >
                    GATE IN
                  </button>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                    <span>THRESHOLD (-80 to 0 dB)</span>
                    <span className="font-bold text-amber-400">{channel.gate.threshold} dB</span>
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
                    className="w-full accent-amber-400 cursor-pointer h-1.5"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                    <span>RANGE (0 to 60 dB)</span>
                    <span className="font-bold text-amber-400">{channel.gate.range} dB</span>
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
                    className="w-full accent-amber-400 cursor-pointer h-1.5"
                  />
                </div>
              </div>

              {/* Envelope Timings */}
              <div className="bg-[#12151d] border border-[#232838] p-3 rounded-xs space-y-3">
                <div className="text-xs font-bold text-cyan-400 border-b border-[#232838] pb-1">
                  ENVELOPE TIMING
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-zinc-400 block mb-1">ATTACK</span>
                    <input
                      type="range"
                      min="0"
                      max="120"
                      value={channel.gate.attack}
                      onChange={(e) =>
                        onUpdateChannel({
                          ...channel,
                          gate: { ...channel.gate, attack: parseInt(e.target.value, 10) },
                        })
                      }
                      className="w-full accent-cyan-400 cursor-pointer h-1.5"
                    />
                    <span className="text-[10px] font-bold text-cyan-300 block text-right mt-0.5">
                      {channel.gate.attack} ms
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block mb-1">HOLD</span>
                    <input
                      type="range"
                      min="1"
                      max="500"
                      value={channel.gate.hold}
                      onChange={(e) =>
                        onUpdateChannel({
                          ...channel,
                          gate: { ...channel.gate, hold: parseInt(e.target.value, 10) },
                        })
                      }
                      className="w-full accent-cyan-400 cursor-pointer h-1.5"
                    />
                    <span className="text-[10px] font-bold text-cyan-300 block text-right mt-0.5">
                      {channel.gate.hold} ms
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block mb-1">RELEASE</span>
                    <input
                      type="range"
                      min="5"
                      max="2000"
                      value={channel.gate.release}
                      onChange={(e) =>
                        onUpdateChannel({
                          ...channel,
                          gate: { ...channel.gate, release: parseInt(e.target.value, 10) },
                        })
                      }
                      className="w-full accent-cyan-400 cursor-pointer h-1.5"
                    />
                    <span className="text-[10px] font-bold text-cyan-300 block text-right mt-0.5">
                      {channel.gate.release} ms
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: COMP (DYNAMICS / COMPRESSOR) */}
          {activeTab === 'comp' && (
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Threshold & Ratio */}
              <div className="bg-[#12151d] border border-[#232838] p-3 rounded-xs space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-cyan-400 border-b border-[#232838] pb-1">
                  <span>DYNAMICS COMPRESSOR</span>
                  <button
                    onClick={() =>
                      onUpdateChannel({
                        ...channel,
                        compressor: {
                          ...channel.compressor,
                          enabled: !channel.compressor.enabled,
                        },
                      })
                    }
                    className={`px-2 py-0.5 rounded text-[10px] font-black border cursor-pointer ${
                      channel.compressor.enabled
                        ? 'bg-cyan-500 text-black border-cyan-300 led-glow-cyan'
                        : 'bg-[#181c25] text-zinc-400 border-[#282f40]'
                    }`}
                  >
                    COMP IN
                  </button>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                    <span>THRESHOLD (-60 to 0 dB)</span>
                    <span className="font-bold text-cyan-400">{channel.compressor.threshold} dB</span>
                  </div>
                  <input
                    type="range"
                    min="-60"
                    max="0"
                    value={channel.compressor.threshold}
                    onChange={(e) =>
                      onUpdateChannel({
                        ...channel,
                        compressor: {
                          ...channel.compressor,
                          threshold: parseInt(e.target.value, 10),
                        },
                      })
                    }
                    className="w-full accent-cyan-400 cursor-pointer h-1.5"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                    <span>RATIO (1.1:1 to 50:1)</span>
                    <span className="font-bold text-cyan-400">{channel.compressor.ratio}:1</span>
                  </div>
                  <input
                    type="range"
                    min="1.1"
                    max="20"
                    step="0.5"
                    value={channel.compressor.ratio}
                    onChange={(e) =>
                      onUpdateChannel({
                        ...channel,
                        compressor: {
                          ...channel.compressor,
                          ratio: parseFloat(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-cyan-400 cursor-pointer h-1.5"
                  />
                </div>
              </div>

              {/* Makeup Gain & Timing */}
              <div className="bg-[#12151d] border border-[#232838] p-3 rounded-xs space-y-3">
                <div className="text-xs font-bold text-amber-400 border-b border-[#232838] pb-1">
                  MAKEUP GAIN & ENVELOPE
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                    <span>MAKEUP GAIN (0 to +24 dB)</span>
                    <span className="font-bold text-amber-400">+{channel.compressor.makeupGain} dB</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="24"
                    value={channel.compressor.makeupGain}
                    onChange={(e) =>
                      onUpdateChannel({
                        ...channel,
                        compressor: {
                          ...channel.compressor,
                          makeupGain: parseInt(e.target.value, 10),
                        },
                      })
                    }
                    className="w-full accent-amber-400 cursor-pointer h-1.5"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-zinc-400 block mb-1">ATTACK ({channel.compressor.attack}ms)</span>
                    <input
                      type="range"
                      min="1"
                      max="120"
                      value={channel.compressor.attack}
                      onChange={(e) =>
                        onUpdateChannel({
                          ...channel,
                          compressor: {
                            ...channel.compressor,
                            attack: parseInt(e.target.value, 10),
                          },
                        })
                      }
                      className="w-full accent-amber-400 cursor-pointer h-1.5"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block mb-1">RELEASE ({channel.compressor.release}ms)</span>
                    <input
                      type="range"
                      min="50"
                      max="2000"
                      value={channel.compressor.release}
                      onChange={(e) =>
                        onUpdateChannel({
                          ...channel,
                          compressor: {
                            ...channel.compressor,
                            release: parseInt(e.target.value, 10),
                          },
                        })
                      }
                      className="w-full accent-amber-400 cursor-pointer h-1.5"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SENDS (SENDS TO BUS 1-16) */}
          {activeTab === 'sends' && (
            <div className="flex-1 overflow-x-auto">
              <div className="grid grid-cols-8 sm:grid-cols-16 gap-1 min-w-[700px] h-full">
                {channel.sends.map((s) => {
                  const bInfo = busLabels.find((bl) => bl.id === s.busId);
                  return (
                    <div
                      key={s.busId}
                      className="bg-[#12151e] border border-[#232838] rounded-xs p-1.5 flex flex-col justify-between items-center"
                    >
                      <span className="text-[9px] font-bold text-amber-400">BUS{s.busId}</span>
                      <span className="text-[7px] text-zinc-400 truncate max-w-[50px] text-center">
                        {bInfo?.name || `Bus ${s.busId}`}
                      </span>
                      <div className="h-28 flex items-center justify-center py-1">
                        <input
                          type="range"
                          min="-90"
                          max="10"
                          value={s.level}
                          onChange={(e) => {
                            const newLevel = parseFloat(e.target.value);
                            const updated = channel.sends.map((send) =>
                              send.busId === s.busId ? { ...send, level: newLevel } : send
                            );
                            onUpdateChannel({ ...channel, sends: updated });
                          }}
                          className="h-24 w-1.5 accent-amber-500 cursor-pointer"
                          style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                        />
                      </div>
                      <span className="text-[8px] font-mono text-zinc-200">
                        {s.level <= -85 ? '-∞' : `${Math.round(s.level)}dB`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: MAIN (STEREO BUS & MONO CENTER) */}
          {activeTab === 'main' && (
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-[#12151d] border border-[#232838] p-3 rounded-xs space-y-3">
                <div className="text-xs font-bold text-rose-400 border-b border-[#232838] pb-1">
                  MAIN STEREO LR BUS
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-300">ASSIGN TO MAIN STEREO LR</span>
                  <button
                    onClick={() => onUpdateChannel({ ...channel, mainLR: !channel.mainLR })}
                    className={`px-3 py-1.5 rounded-xs text-xs font-black border cursor-pointer ${
                      channel.mainLR
                        ? 'bg-rose-600 text-white border-rose-400 led-glow-red'
                        : 'bg-[#181c25] text-zinc-400 border-[#282f40]'
                    }`}
                  >
                    {channel.mainLR ? 'MAIN LR ON' : 'MAIN LR OFF'}
                  </button>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                    <span>PAN BALANCE</span>
                    <span className="font-bold text-cyan-400">
                      {channel.pan === 0 ? 'CENTER' : channel.pan < 0 ? `L ${Math.abs(channel.pan)}` : `R ${channel.pan}`}
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
                    className="w-full accent-cyan-400 cursor-pointer h-1.5"
                  />
                </div>
              </div>

              <div className="bg-[#12151d] border border-[#232838] p-3 rounded-xs space-y-3">
                <div className="text-xs font-bold text-amber-400 border-b border-[#232838] pb-1">
                  MONO / CENTER BUS
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-300">ASSIGN TO MONO / SUB BUS</span>
                  <button
                    onClick={() =>
                      onUpdateChannel({ ...channel, monoCenter: !channel.monoCenter })
                    }
                    className={`px-3 py-1.5 rounded-xs text-xs font-black border cursor-pointer ${
                      channel.monoCenter
                        ? 'bg-amber-500 text-black border-amber-300 led-glow-amber'
                        : 'bg-[#181c25] text-zinc-400 border-[#282f40]'
                    }`}
                  >
                    {channel.monoCenter ? 'MONO ON' : 'MONO OFF'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
