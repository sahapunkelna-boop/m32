import React from 'react';
import {
  Wifi,
  WifiOff,
  AlertTriangle,
  Volume2,
  VolumeX,
  Mic,
  Music,
  Cloud,
  ShieldCheck,
  FolderOpen,
  Sliders,
  Maximize2,
  Minimize2,
  HelpCircle,
  Activity,
  Layers,
  Sparkles,
  Tablet,
} from 'lucide-react';
import { NetworkConnectionState, ClipAlertEvent, UserEngineerProfile } from '../types/mixer';

export type M32ViewMode = 'mixer' | 'channel' | 'meters' | 'routing' | 'fx' | 'recorder';

interface HeaderBarProps {
  network: NetworkConnectionState;
  onOpenNetwork: () => void;
  clipAlerts: ClipAlertEvent[];
  onOpenClipAlerts: () => void;
  isVirtualBandPlaying: boolean;
  onToggleVirtualBand: () => void;
  isMicActive: boolean;
  onToggleMic: () => void;
  onOpenCloudSync: () => void;
  onOpenPresets: () => void;
  activeProfile: UserEngineerProfile;
  sendsOnFaderBus: number | null; // null if off, busId if on
  onToggleSendsOnFader: (busId: number | null) => void;
  beginnerMode: boolean;
  onToggleBeginnerMode: () => void;
  globalMuteAll: boolean;
  onToggleGlobalMuteAll: () => void;
  activeSceneName: string;
  currentView: M32ViewMode;
  onSelectView: (view: M32ViewMode) => void;
  isDeckCollapsed?: boolean;
  onToggleDeckCollapse?: () => void;
  onOpenSpecs?: () => void;
  onOpenInstall?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  network,
  onOpenNetwork,
  clipAlerts,
  onOpenClipAlerts,
  isVirtualBandPlaying,
  onToggleVirtualBand,
  isMicActive,
  onToggleMic,
  onOpenCloudSync,
  onOpenPresets,
  activeProfile,
  sendsOnFaderBus,
  onToggleSendsOnFader,
  beginnerMode,
  onToggleBeginnerMode,
  globalMuteAll,
  onToggleGlobalMuteAll,
  activeSceneName,
  currentView,
  onSelectView,
  isDeckCollapsed = false,
  onToggleDeckCollapse,
  onOpenSpecs,
  onOpenInstall,
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const unacknowledgedClips = clipAlerts.filter((a) => !a.acknowledged);

  return (
    <header className="h-13 bg-[#111319] border-b border-[#232734] px-2.5 flex items-center justify-between gap-1.5 shrink-0 select-none font-mono">
      {/* 1. BRANDING & CONSOLE HEADER (AUTHENTIC MIDAS M32-MIX IPAD STYLE) */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          {/* Midas Signature Logo */}
          <div className="h-8 px-2 rounded-xs bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center font-display font-extrabold text-black text-sm tracking-wider shadow-md border border-amber-400">
            MIDAS
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-display font-black text-zinc-100 tracking-wider text-sm">
                M32-MIX
              </span>
              <span className="text-[9px] uppercase font-bold text-amber-300 bg-amber-950/90 px-1 py-0.5 rounded-xs border border-amber-600/70">
                iPad PRO
              </span>
            </div>
            <div className="flex items-center gap-1 mt-0.5 text-[9px] text-zinc-400">
              <span className="text-emerald-400 font-bold">{network.connected ? 'ONLINE' : 'OFFLINE'}</span>
              <span className="text-zinc-600">·</span>
              <span className="text-zinc-400">{network.ipAddress}</span>
            </div>
          </div>
        </div>

        {/* SETUP Button (Opens Wi-Fi OSC & Sync Config) */}
        <button
          onClick={onOpenNetwork}
          className="ml-1 px-2.5 py-1 rounded-xs bg-[#181c26] text-zinc-300 border border-[#272e3e] hover:bg-[#1f2533] hover:text-white text-[11px] font-bold cursor-pointer transition-all m32-btn"
          title="Console Setup & Wi-Fi OSC Connection"
        >
          SETUP
        </button>

        {/* M32 16 CORE SPECS & BENTLEY DESIGN BUTTON */}
        <button
          onClick={onOpenSpecs}
          className="px-2.5 py-1 rounded-xs bg-amber-500/15 text-amber-300 border border-amber-500/60 hover:bg-amber-500/30 text-[11px] font-black cursor-pointer transition-all m32-btn flex items-center gap-1 shadow-sm"
          title="M32 16 Core Features, Bentley Motors Design & Hardware Architecture"
        >
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>SPECS</span>
        </button>

        {/* INSTALL ON IPAD BUTTON */}
        <button
          onClick={onOpenInstall}
          className="px-2.5 py-1 rounded-xs bg-cyan-500/15 text-cyan-300 border border-cyan-500/60 hover:bg-cyan-500/30 text-[11px] font-black cursor-pointer transition-all m32-btn flex items-center gap-1 shadow-sm"
          title="วิธีติดตั้ง M32-Mix ลงบน iPad เป็นแอปเต็มหน้าจอ 100%"
        >
          <Tablet className="w-3 h-3 text-cyan-400" />
          <span className="hidden sm:inline">INSTALL IPAD</span>
        </button>

        {/* SCENES Button with Current Scene Name */}
        <button
          onClick={onOpenPresets}
          className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xs bg-[#181c26] text-amber-400 border border-amber-600/50 hover:bg-[#1f2533] text-[11px] font-bold cursor-pointer transition-all m32-btn truncate max-w-[170px]"
          title="Console Scenes & Shows Cue Manager"
        >
          <FolderOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">{activeSceneName}</span>
        </button>

        {/* M32 MAIN VIEW NAVIGATION TABS */}
        <div className="hidden lg:flex items-center gap-1 pl-1.5 border-l border-[#242938]">
          {(
            [
              { id: 'mixer', label: 'MIXER' },
              { id: 'channel', label: 'CHANNEL' },
              { id: 'meters', label: 'METERS' },
              { id: 'routing', label: 'ROUTING' },
              { id: 'fx', label: 'FX RACK' },
              { id: 'recorder', label: 'DN32-LIVE' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => onSelectView(tab.id)}
              className={`px-2 py-1 rounded-xs text-[11px] font-black tracking-tight cursor-pointer transition-all border m32-btn ${
                currentView === tab.id
                  ? 'bg-amber-500 text-black border-amber-300 shadow-md ring-1 ring-amber-400/50'
                  : 'bg-[#161a23] text-zinc-400 border-[#252b39] hover:bg-[#1c222e] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sends on Fader Active Badge */}
        {sendsOnFaderBus !== null && (
          <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 border border-amber-500/70 rounded-xs animate-pulse">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] font-black text-amber-300">
              SOF: BUS {String(sendsOnFaderBus).padStart(2, '0')}
            </span>
            <button
              onClick={() => onToggleSendsOnFader(null)}
              className="text-[9px] bg-amber-500 text-black px-1 rounded-xs font-black ml-0.5 cursor-pointer"
            >
              EXIT
            </button>
          </div>
        )}
      </div>

      {/* 2. CENTER: AUDIO ENGINE TOOLS (VIRTUAL BAND, LIVE MIC RTA, CLIP WARNINGS) */}
      <div className="flex items-center gap-1">
        {/* Toggle Split Deck / Full Faders View */}
        {currentView === 'mixer' && onToggleDeckCollapse && (
          <button
            onClick={onToggleDeckCollapse}
            className={`px-2 py-1 rounded-xs text-[10px] font-bold border transition-all cursor-pointer m32-btn ${
              !isDeckCollapsed
                ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                : 'bg-[#181c25] text-zinc-400 border-[#282e3e] hover:text-white'
            }`}
            title="Toggle Split Processing Rack vs Tall 100mm Faders"
          >
            {!isDeckCollapsed ? 'SPLIT RACK' : 'TALL FADERS'}
          </button>
        )}

        {/* Virtual Multitrack Band Soundcheck */}
        <button
          onClick={onToggleVirtualBand}
          title="Virtual Multitrack Soundcheck Playback"
          className={`flex items-center gap-1 px-2 py-1 rounded-xs text-[10px] font-bold transition-all cursor-pointer border m32-btn ${
            isVirtualBandPlaying
              ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-950 led-glow-green'
              : 'bg-[#161a23] text-zinc-400 border-[#252b39] hover:text-white'
          }`}
        >
          <Music className={`w-3 h-3 ${isVirtualBandPlaying ? 'animate-bounce' : ''}`} />
          <span className="hidden sm:inline">
            {isVirtualBandPlaying ? 'BAND LIVE' : 'SOUNDCHECK'}
          </span>
        </button>

        {/* Live Mic Acoustic RTA */}
        <button
          onClick={onToggleMic}
          title="Live Room Mic RTA Spectrum"
          className={`flex items-center gap-1 px-2 py-1 rounded-xs text-[10px] font-bold transition-all cursor-pointer border m32-btn ${
            isMicActive
              ? 'bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-950 led-glow-red animate-pulse'
              : 'bg-[#161a23] text-zinc-400 border-[#252b39] hover:text-white'
          }`}
        >
          <Mic className="w-3 h-3" />
          <span className="hidden sm:inline">{isMicActive ? 'MIC RTA' : 'ROOM MIC'}</span>
        </button>

        {/* Clip Alert Badge */}
        <button
          onClick={onOpenClipAlerts}
          className={`flex items-center gap-1 px-2 py-1 rounded-xs text-[10px] font-black transition-all cursor-pointer border m32-btn ${
            unacknowledgedClips.length > 0
              ? 'bg-red-600 text-white border-red-400 animate-pulse led-glow-red'
              : 'bg-[#161a23] text-zinc-400 border-[#252b39] hover:text-zinc-200'
          }`}
          title="Clip and Distortion Warning System"
        >
          <AlertTriangle className="w-3 h-3 text-current" />
          <span>
            {unacknowledgedClips.length > 0
              ? `${unacknowledgedClips.length} CLIP`
              : 'CLIPS: 0'}
          </span>
        </button>

        {/* Anti-Feedback / FBQ2496 Howl Suppressor Badge */}
        <button
          onClick={() => onSelectView('fx')}
          className="flex items-center gap-1 px-2 py-1 rounded-xs text-[10px] font-black transition-all cursor-pointer border m32-btn bg-emerald-950/80 text-emerald-400 border-emerald-700/80 hover:bg-emerald-900/90 shadow-sm"
          title="FBQ2496 Anti-Feedback & Howl Killer System"
        >
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span className="hidden md:inline">ANTI-HOWL</span>
        </button>
      </div>

      {/* 3. RIGHT: PRESETS, CLOUD VAULT, WI-FI LATENCY & FULLSCREEN */}
      <div className="flex items-center gap-1">
        {/* Global Mute Emergency Switch */}
        <button
          onClick={onToggleGlobalMuteAll}
          className={`flex items-center gap-1 px-2 py-1 rounded-xs text-[10px] font-black transition-all cursor-pointer border m32-btn ${
            globalMuteAll
              ? 'bg-red-700 text-white border-red-500 animate-pulse led-glow-red'
              : 'bg-[#161a23] text-zinc-400 border-[#252b39] hover:text-white'
          }`}
          title="Emergency Master Mute All Channels"
        >
          {globalMuteAll ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3 text-zinc-400" />}
          <span className="hidden xl:inline">{globalMuteAll ? 'MUTED' : 'MUTE ALL'}</span>
        </button>

        {/* E2EE Cloud Sync & Vault */}
        <button
          onClick={onOpenCloudSync}
          className="flex items-center gap-1 px-2 py-1 rounded-xs bg-[#161a23] hover:bg-[#1f2533] text-zinc-300 border border-[#252b39] text-[10px] font-bold transition-all cursor-pointer m32-btn"
          title="End-to-End Encrypted Cloud Presets & Backup"
        >
          <Cloud className="w-3 h-3 text-cyan-400" />
          <ShieldCheck className="w-2.5 h-2.5 text-emerald-400 -ml-0.5" />
          <span className="hidden xl:inline">CLOUD</span>
        </button>

        {/* Wi-Fi & OSC Status */}
        <button
          onClick={onOpenNetwork}
          className={`flex items-center gap-1 px-2 py-1 rounded-xs text-[10px] font-bold transition-all cursor-pointer border m32-btn ${
            network.connected
              ? 'bg-[#161a23] text-emerald-400 border-[#223328]'
              : 'bg-[#161a23] text-rose-400 border-[#382228]'
          }`}
          title="Wi-Fi Connection & OSC Network Settings"
        >
          {network.connected ? (
            <Wifi className="w-3 h-3 text-emerald-400 animate-pulse" />
          ) : (
            <WifiOff className="w-3 h-3 text-rose-400" />
          )}
          <span className="hidden md:inline">
            {network.connected ? `${network.pingMs.toFixed(1)}ms` : 'Offline'}
          </span>
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded-xs bg-[#161a23] hover:bg-[#1f2533] text-zinc-400 hover:text-zinc-100 border border-[#252b39] transition-all cursor-pointer m32-btn"
          title="Toggle Fullscreen iPad Mode"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </header>
  );
};
