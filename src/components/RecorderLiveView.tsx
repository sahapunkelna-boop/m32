import React, { useState, useEffect } from 'react';
import {
  Disc,
  Play,
  Pause,
  Square,
  Circle,
  SkipBack,
  SkipForward,
  Bookmark,
  Volume2,
  HardDrive,
  RefreshCw,
  Clock,
  Layers,
  Sparkles,
  FileAudio,
} from 'lucide-react';
import { audioEngine } from '../services/audioEngine';

interface RecorderLiveViewProps {
  isVirtualBandPlaying: boolean;
  onToggleVirtualBand: () => void;
}

interface RecordedSession {
  id: string;
  title: string;
  date: string;
  duration: string;
  channelsCount: number;
  sampleRate: string;
  sizeMb: number;
}

const mockSessions: RecordedSession[] = [
  {
    id: 'ses-1',
    title: 'M32R LIVE Take 01 - Rock Concert Multitrack',
    date: '2026-10-05 20:30',
    duration: '01:14:22',
    channelsCount: 32,
    sampleRate: '48 kHz / 32-bit Float',
    sizeMb: 14200,
  },
  {
    id: 'ses-2',
    title: 'M32R LIVE Take 02 - Acoustic Rehearsal & Soundcheck',
    date: '2026-10-04 15:45',
    duration: '00:48:10',
    channelsCount: 24,
    sampleRate: '48 kHz / 32-bit Float',
    sizeMb: 8900,
  },
  {
    id: 'ses-3',
    title: 'Virtual Soundcheck - Drum & Vocal Stems Loop',
    date: '2026-10-02 11:20',
    duration: '00:08:45',
    channelsCount: 16,
    sampleRate: '48 kHz / 24-bit WAV',
    sizeMb: 1200,
  },
];

export const RecorderLiveView: React.FC<RecorderLiveViewProps> = ({
  isVirtualBandPlaying,
  onToggleVirtualBand,
}) => {
  const [isPlaying, setIsPlaying] = useState(isVirtualBandPlaying);
  const [isRecording, setIsRecording] = useState(false);
  const [activeSlot, setActiveSlot] = useState<'sd1' | 'sd2'>('sd1');
  const [activeSession, setActiveSession] = useState<RecordedSession>(mockSessions[0]);
  const [markers, setMarkers] = useState<string[]>(['00:00:00 (Intro)', '00:03:15 (Verse 1)', '00:08:40 (Chorus)', '00:15:20 (Guitar Solo)']);
  const [timecodeSeconds, setTimecodeSeconds] = useState(222); // 00:03:42

  // Sync isPlaying with virtual band engine
  useEffect(() => {
    setIsPlaying(isVirtualBandPlaying);
  }, [isVirtualBandPlaying]);

  useEffect(() => {
    let timer: number;
    if (isPlaying || isRecording) {
      timer = window.setInterval(() => {
        setTimecodeSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, isRecording]);

  const handlePlayPause = () => {
    const playing = audioEngine.toggleVirtualBand();
    setIsPlaying(playing);
    setIsRecording(false);
  };

  const handleStop = () => {
    audioEngine.stopVirtualBand();
    setIsPlaying(false);
    setIsRecording(false);
    setTimecodeSeconds(0);
  };

  const handleRecord = () => {
    if (!isRecording) {
      audioEngine.startVirtualBand();
      setIsPlaying(true);
      setIsRecording(true);
    } else {
      setIsRecording(false);
    }
  };

  const handleAddMarker = () => {
    const tc = formatTimecode(timecodeSeconds);
    setMarkers([...markers, `${tc} (Marker ${markers.length + 1})`]);
  };

  const formatTimecode = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 bg-zinc-950 p-3 sm:p-4 flex flex-col gap-3 sm:gap-4 overflow-y-auto select-none font-mono text-xs">
      {/* Top Hardware Banner */}
      <div className="bg-[#12141a] border border-[#232936] rounded-lg p-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400">
            <Disc className={`w-5 h-5 ${isPlaying || isRecording ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-zinc-100">
                KLARK TEKNIK DN32-LIVE EXPANSION MODULE
              </span>
              <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800/80 px-2 py-0.5 rounded font-bold">
                DUAL SD/SDHC 32-TRACK MULTITRACK
              </span>
            </div>
            <div className="text-[10px] text-zinc-400">
              32-Channel 48kHz Direct WAV Live Recording & Playback · Virtual Soundcheck Engine (M32R LIVE)
            </div>
          </div>
        </div>

        {/* 1-Click Virtual Soundcheck Mode Toggle */}
        <div className="flex items-center gap-2 bg-[#0e1015] p-1.5 rounded-lg border border-zinc-800">
          <span className="text-[10px] text-zinc-400 font-bold">ROUTING MODE:</span>
          <button
            onClick={() => {
              if (isPlaying) handleStop();
            }}
            className={`px-3 py-1 rounded text-xs font-bold cursor-pointer border ${
              !isPlaying
                ? 'bg-zinc-800 text-zinc-100 border-zinc-600'
                : 'bg-zinc-900 text-zinc-500 border-zinc-800'
            }`}
          >
            STAGE MIC INPUTS
          </button>

          <button
            onClick={() => {
              if (!isPlaying) handlePlayPause();
            }}
            className={`px-3 py-1 rounded text-xs font-bold cursor-pointer border flex items-center gap-1.5 ${
              isPlaying
                ? 'bg-amber-500 text-black border-amber-300 shadow-md shadow-amber-950'
                : 'bg-zinc-900 text-amber-400/70 border-zinc-800 hover:text-amber-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>VIRTUAL SOUNDCHECK (VSC)</span>
          </button>
        </div>
      </div>

      {/* Main Transport & Timecode Deck (As reviewed in ProPlugin M32R Live video) */}
      <div className="bg-[#12151d] border-2 border-[#2b3346] rounded-xl p-4 sm:p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Timecode LED Readout */}
        <div className="flex items-center gap-4">
          <div className="bg-[#090b0f] border border-[#232936] px-5 py-3 rounded-lg shadow-inner flex flex-col items-center">
            <span className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase mb-0.5">
              TIMECODE (SMPTE / ELAPSED)
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono tracking-wider">
              {formatTimecode(timecodeSeconds)}
              <span className="text-xs text-amber-600 ml-1">.18</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-200">{activeSession.title}</span>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.5 rounded">
                {activeSession.sampleRate}
              </span>
            </div>
            <div className="text-[10px] text-zinc-400">
              Session Length: {activeSession.duration} · {activeSession.channelsCount} Uncompressed Audio Stems
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="text-zinc-500">STATUS:</span>
              <span
                className={`font-bold ${
                  isRecording
                    ? 'text-rose-400 animate-pulse'
                    : isPlaying
                    ? 'text-emerald-400'
                    : 'text-zinc-400'
                }`}
              >
                {isRecording ? '● RECORDING LIVE TO SD1' : isPlaying ? '▶ PLAYING (VIRTUAL SOUNDCHECK)' : '■ STOPPED (READY)'}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Tactile Transport Buttons */}
        <div className="flex items-center gap-2">
          {/* Record Button */}
          <button
            onClick={handleRecord}
            className={`w-11 h-11 rounded-lg border flex items-center justify-center transition-all cursor-pointer shadow-md ${
              isRecording
                ? 'bg-rose-600 text-white border-rose-400 shadow-rose-950 animate-pulse'
                : 'bg-[#1b1f2b] text-rose-500 border-zinc-700 hover:bg-rose-950'
            }`}
            title="Record 32-Track Session"
          >
            <Circle className="w-5 h-5 fill-current" />
          </button>

          {/* Play / Pause Button */}
          <button
            onClick={handlePlayPause}
            className={`w-12 h-12 rounded-lg border flex items-center justify-center transition-all cursor-pointer shadow-md ${
              isPlaying && !isRecording
                ? 'bg-emerald-500 text-black border-emerald-300 shadow-emerald-950'
                : 'bg-[#1b1f2b] text-emerald-400 border-zinc-700 hover:bg-[#252b3c]'
            }`}
            title={isPlaying ? 'Pause Playback' : 'Play Multitrack Virtual Soundcheck'}
          >
            {isPlaying && !isRecording ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          {/* Stop Button */}
          <button
            onClick={handleStop}
            className="w-11 h-11 rounded-lg bg-[#1b1f2b] hover:bg-[#252b3c] text-zinc-300 border border-zinc-700 flex items-center justify-center cursor-pointer transition-all shadow-md"
            title="Stop & Rewind"
          >
            <Square className="w-5 h-5 fill-current" />
          </button>

          {/* Add Marker Button */}
          <button
            onClick={handleAddMarker}
            className="px-3 py-2.5 rounded-lg bg-[#1b1f2b] hover:bg-[#252b3c] text-amber-300 border border-zinc-700 flex items-center gap-1.5 cursor-pointer transition-all shadow-md ml-2"
            title="Set Marker at current timecode"
          >
            <Bookmark className="w-4 h-4" />
            <span className="text-[11px] font-bold">SET MARKER</span>
          </button>
        </div>
      </div>

      {/* Dual SD Card Slot Hardware Deck & Session Browser */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dual SD Card Status */}
        <div className="bg-[#12141a] border border-[#232936] rounded-lg p-3.5 space-y-3">
          <div className="text-amber-400 font-bold border-b border-[#232936] pb-2 flex items-center justify-between">
            <span>SD/SDHC HARDWARE SLOTS (M32R LIVE)</span>
            <span className="text-zinc-500 text-[10px]">High-Speed UHS-I Class 10</span>
          </div>

          {/* Slot 1 */}
          <div
            onClick={() => setActiveSlot('sd1')}
            className={`p-3 rounded-lg border cursor-pointer transition-all space-y-1.5 ${
              activeSlot === 'sd1'
                ? 'bg-[#181d28] border-cyan-400 shadow-md ring-1 ring-cyan-400/40'
                : 'bg-[#0e1015] border-zinc-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-zinc-200">SD CARD 1 (PRIMARY RECORDER)</span>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 font-bold">
                READY · 64 GB
              </span>
            </div>
            <div className="text-[11px] text-zinc-400">
              Media: Kingston Canvas React Plus · 32-Ch 48kHz WAV
            </div>
            <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
              <div className="bg-cyan-500 h-full w-[24%]" />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-500">
              <span>Used: 14.2 GB (24%)</span>
              <span className="text-zinc-400 font-bold">Remaining: 4h 18m of 32-Track Live Audio</span>
            </div>
          </div>

          {/* Slot 2 */}
          <div
            onClick={() => setActiveSlot('sd2')}
            className={`p-3 rounded-lg border cursor-pointer transition-all space-y-1.5 ${
              activeSlot === 'sd2'
                ? 'bg-[#181d28] border-cyan-400 shadow-md ring-1 ring-cyan-400/40'
                : 'bg-[#0e1015] border-zinc-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-zinc-400" />
                <span className="font-bold text-zinc-200">SD CARD 2 (BACKUP / EXTEND)</span>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 font-bold">
                MIRROR / REDUNDANT
              </span>
            </div>
            <div className="text-[11px] text-zinc-400">
              Media: SanDisk Extreme Pro 64 GB · Seamless Overflow Backup
            </div>
            <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-500 h-full w-[12%]" />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-500">
              <span>Used: 8.9 GB (12%)</span>
              <span className="text-zinc-400">Remaining: 5h 45m</span>
            </div>
          </div>
        </div>

        {/* Multitrack Session Browser & Cue Markers */}
        <div className="bg-[#12141a] border border-[#232936] rounded-lg p-3.5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="text-amber-400 font-bold border-b border-[#232936] pb-2 flex items-center justify-between">
              <span>SD SESSIONS & CUE MARKERS</span>
              <span className="text-zinc-500 text-[10px]">{mockSessions.length} Recorded Takes</span>
            </div>

            <div className="space-y-2 mt-2">
              {mockSessions.map((ses) => (
                <div
                  key={ses.id}
                  onClick={() => setActiveSession(ses)}
                  className={`p-2 rounded border cursor-pointer flex items-center justify-between transition-all ${
                    activeSession.id === ses.id
                      ? 'bg-[#171b25] border-amber-500 text-zinc-100'
                      : 'bg-[#0e1015] border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-xs flex items-center gap-1.5">
                      <FileAudio className="w-3.5 h-3.5 text-amber-400" />
                      <span>{ses.title}</span>
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      {ses.date} · {ses.duration} · {ses.channelsCount} Stems
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-cyan-400">
                    {(ses.sizeMb / 1024).toFixed(1)} GB
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cue Markers List */}
          <div className="pt-2 border-t border-[#232936]">
            <span className="text-[10px] text-zinc-400 font-bold block mb-1">
              CURRENT SESSION CUE MARKERS:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {markers.map((mk, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-[#0e1015] rounded border border-zinc-800 text-[10px] text-amber-300"
                >
                  {mk}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
