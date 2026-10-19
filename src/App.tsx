import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { HeaderBar, M32ViewMode } from './components/HeaderBar';
import { ChannelProcessingDeck } from './components/ChannelProcessingDeck';
import { BankSelector, BankType } from './components/BankSelector';
import { FaderChannelStrip, linearToDb, dbToLinear } from './components/FaderChannelStrip';
import { MasterSection } from './components/MasterSection';
import { EqEditorModal } from './components/EqEditorModal';
import { ChannelDetailModal } from './components/ChannelDetailModal';
import { PresetManagerModal } from './components/PresetManagerModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import { NetworkOscModal } from './components/NetworkOscModal';
import { ClipAlertDrawer } from './components/ClipAlertDrawer';
import { MeterBridgeView } from './components/MeterBridgeView';
import { RoutingMatrixView } from './components/RoutingMatrixView';
import { ChannelOverviewTab } from './components/ChannelOverviewTab';
import { EffectsRackView } from './components/EffectsRackView';
import { RecorderLiveView } from './components/RecorderLiveView';
import { ConsoleSpecsModal } from './components/ConsoleSpecsModal';
import { IpadInstallGuideModal } from './components/IpadInstallGuideModal';
import {
  ChannelStripData,
  PresetProfile,
  UserEngineerProfile,
  NetworkConnectionState,
  ClipAlertEvent,
} from './types/mixer';
import { storageService } from './services/storageService';
import { audioEngine } from './services/audioEngine';
import { oscBridge } from './services/oscBridge';

export default function App() {
  // Console state
  const [channels, setChannels] = useState<ChannelStripData[]>(() =>
    storageService.loadChannels()
  );
  const [presets, setPresets] = useState<PresetProfile[]>(() =>
    storageService.loadPresets()
  );
  const [profiles, setProfiles] = useState<UserEngineerProfile[]>(() =>
    storageService.loadProfiles()
  );
  const [activeProfile, setActiveProfile] = useState<UserEngineerProfile>(() =>
    storageService.getActiveProfile()
  );
  const [lastCloudSync, setLastCloudSync] = useState<string>(() =>
    storageService.getLastCloudSync()
  );

  // Bank & Selection
  const [currentBank, setCurrentBank] = useState<BankType>('ch1-8');
  const [selectedChannelId, setSelectedChannelId] = useState<number>(1);
  const [sendsOnFaderBus, setSendsOnFaderBus] = useState<number | null>(null);

  // Modals & Panels
  const [isEqModalOpen, setIsEqModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [isCloudSyncModalOpen, setIsCloudSyncModalOpen] = useState(false);
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);
  const [isClipDrawerOpen, setIsClipDrawerOpen] = useState(false);
  const [isSpecsModalOpen, setIsSpecsModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // UI Modes & Toggles
  const [beginnerMode, setBeginnerMode] = useState(false);
  const [globalMuteAll, setGlobalMuteAll] = useState(false);
  const [activeMuteGroups, setActiveMuteGroups] = useState<number[]>([]);
  const [activeSceneName, setActiveSceneName] = useState('01: Sunday Live Rock');
  const [currentView, setCurrentView] = useState<M32ViewMode>('mixer');
  const [isDeckCollapsed, setIsDeckCollapsed] = useState(false);

  // Master Section State
  const [mainFaderLinear, setMainFaderLinear] = useState(0.75); // ~0 dB
  const [monoFaderLinear, setMonoFaderLinear] = useState(0.75);
  const [isMainMuted, setIsMainMuted] = useState(false);

  // Audio & Alert State
  const [isVirtualBandPlaying, setIsVirtualBandPlaying] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [clipAlerts, setClipAlerts] = useState<ClipAlertEvent[]>([]);

  // Wi-Fi OSC Network state
  const [network, setNetwork] = useState<NetworkConnectionState>({
    connected: true,
    ipAddress: '192.168.1.150',
    port: 10023,
    consoleModel: 'M32',
    firmware: '4.08',
    pingMs: 1.8,
    packetLossPercent: 0.0,
    packetsReceived: 18450,
    packetsSent: 3410,
    activeClientsCount: 4,
    wifiSSID: 'Stage-Sound-5GHz',
    wifiSignalDb: -38,
    isOfflineMode: false,
  });

  // Selected channel object
  const selectedChannel = useMemo(
    () => channels.find((c) => c.id === selectedChannelId) || channels[0],
    [channels, selectedChannelId]
  );

  // Any channel soloed?
  const hasActiveSolos = useMemo(() => channels.some((c) => c.solo), [channels]);

  const channelsRef = useRef(channels);
  channelsRef.current = channels;
  const globalMuteAllRef = useRef(globalMuteAll);
  globalMuteAllRef.current = globalMuteAll;

  // Audio Engine Callbacks for bouncing meters & clips
  useEffect(() => {
    audioEngine.setCallbacks({
      onLevelsUpdate: (levels) => {
        setChannels((prev) =>
          prev.map((ch, idx) => {
            const rawLvl = levels[idx] !== undefined ? levels[idx] : -60;
            const effectiveLvl = ch.muted || globalMuteAllRef.current ? -90 : rawLvl;
            const peak = Math.max(ch.peakLevel * 0.95, effectiveLvl);
            const isClipping = effectiveLvl >= 0;
            if (ch.meterLevel === effectiveLvl && Math.abs(ch.peakLevel - peak) < 0.1 && ch.hasClipped === (ch.hasClipped || isClipping)) {
              return ch;
            }
            return {
              ...ch,
              meterLevel: effectiveLvl,
              peakLevel: peak,
              hasClipped: ch.hasClipped || isClipping,
            };
          })
        );
      },
      onClipAlert: (chIndex, levelDb) => {
        const chName = channelsRef.current[chIndex]?.name || `Ch ${chIndex + 1}`;
        const newAlert: ClipAlertEvent = {
          id: Math.random().toString(36).substring(2, 9),
          channelId: chIndex + 1,
          channelName: chName,
          peakDb: levelDb,
          timestamp: new Date().toLocaleTimeString(),
          type: 'clip',
          acknowledged: false,
        };
        setClipAlerts((prev) => [newAlert, ...prev.slice(0, 20)]);
      },
      onFeedbackWarning: (freqHz, levelDb) => {
        const newAlert: ClipAlertEvent = {
          id: Math.random().toString(36).substring(2, 9),
          channelId: 6,
          channelName: `Room Acoustics Feedback (${freqHz} Hz)`,
          peakDb: levelDb,
          timestamp: new Date().toLocaleTimeString(),
          type: 'feedback_warning',
          acknowledged: false,
        };
        setClipAlerts((prev) => [newAlert, ...prev.slice(0, 20)]);
      },
    });
  }, []);

  // Persist channels to localStorage (debounced to avoid I/O bottlenecks during 60 FPS meter updates)
  useEffect(() => {
    const timer = setTimeout(() => {
      storageService.saveChannels(channels);
    }, 1200);
    return () => clearTimeout(timer);
  }, [channels]);

  // Master Volume Sync
  useEffect(() => {
    const mainDb = linearToDb(mainFaderLinear);
    audioEngine.setMasterVolume(mainDb, isMainMuted || globalMuteAll);
  }, [mainFaderLinear, isMainMuted, globalMuteAll]);

  // Network Ping & Packet Simulator Loop
  useEffect(() => {
    if (!network.connected) return;
    const interval = setInterval(() => {
      setNetwork((prev) => ({
        ...prev,
        pingMs: 1.2 + Math.random() * 1.5,
        packetsReceived: prev.packetsReceived + Math.floor(Math.random() * 5) + 1,
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, [network.connected]);

  // Screen WakeLock & Auto-Reactivate on Foreground Return (Prevent iPad sleep during live shows)
  useEffect(() => {
    let wakeLockSentinel: any = null;
    const requestWakeLock = async () => {
      try {
        if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
          wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
        }
      } catch {
        // ignore if battery saver prevents lock
      }
    };
    requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
        audioEngine.resumeContext();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockSentinel) {
        wakeLockSentinel.release().catch(() => {});
      }
    };
  }, []);

  // Channel Updates
  const updateChannel = useCallback((updated: ChannelStripData) => {
    setChannels((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }, []);

  const handleUpdateFader = useCallback(
    (chId: number, linearVal: number) => {
      const db = linearToDb(linearVal);
      setChannels((prev) =>
        prev.map((c) =>
          c.id === chId ? { ...c, faderLinear: linearVal, fader: db } : c
        )
      );
      oscBridge.sendChannelFader(chId - 1, linearVal);
    },
    []
  );

  const handleUpdateSendLevel = useCallback(
    (chId: number, busId: number, linearVal: number) => {
      const db = linearToDb(linearVal);
      setChannels((prev) =>
        prev.map((c) => {
          if (c.id !== chId) return c;
          const updatedSends = c.sends.map((s) =>
            s.busId === busId ? { ...s, level: db } : s
          );
          return { ...c, sends: updatedSends };
        })
      );
    },
    []
  );

  const handleToggleMute = useCallback((chId: number) => {
    setChannels((prev) =>
      prev.map((c) => {
        if (c.id === chId) {
          const nextMuted = !c.muted;
          oscBridge.sendChannelMute(chId - 1, nextMuted);
          return { ...c, muted: nextMuted };
        }
        return c;
      })
    );
  }, []);

  const handleToggleSolo = useCallback((chId: number) => {
    setChannels((prev) =>
      prev.map((c) => (c.id === chId ? { ...c, solo: !c.solo } : c))
    );
  }, []);

  const handleUpdatePan = useCallback((chId: number, pan: number) => {
    setChannels((prev) =>
      prev.map((c) => (c.id === chId ? { ...c, pan } : c))
    );
    oscBridge.sendChannelPan(chId - 1, pan);
  }, []);

  const handleClearClip = useCallback((chId: number) => {
    setChannels((prev) =>
      prev.map((c) => (c.id === chId ? { ...c, hasClipped: false } : c))
    );
  }, []);

  // Filter channels according to active bank
  const displayedChannels = useMemo(() => {
    switch (currentBank) {
      case 'ch1-8':
        return channels.slice(0, 8);
      case 'ch9-16':
        return channels.slice(8, 16);
      case 'ch17-24':
        return channels.slice(16, 24);
      case 'ch25-32':
        return channels.slice(24, 32);
      case 'aux-fx':
        return channels.slice(32, 40);
      case 'bus1-8':
        return channels.slice(40, 48);
      case 'bus9-16':
        return channels.slice(48, 56);
      case 'mtx-main':
        return channels.slice(56, 64);
      case 'dca':
        return channels.slice(64, 72);
      default:
        return channels.slice(0, 8);
    }
  }, [channels, currentBank]);

  // Master Meter Calculation
  const masterLeftDb = useMemo(() => {
    if (isMainMuted || globalMuteAll) return -90;
    const activeLevels = channels.filter((c) => !c.muted).map((c) => c.meterLevel);
    const maxLvl = Math.max(-60, ...activeLevels);
    const masterGainOffset = linearToDb(mainFaderLinear);
    return Math.min(6, maxLvl + masterGainOffset * 0.4);
  }, [channels, isMainMuted, globalMuteAll, mainFaderLinear]);

  const masterRightDb = useMemo(() => {
    return Math.max(-60, masterLeftDb - Math.random() * 1.5);
  }, [masterLeftDb]);

  // Toggle Virtual Band audio playback
  const handleToggleVirtualBand = () => {
    const isPlaying = audioEngine.toggleVirtualBand();
    setIsVirtualBandPlaying(isPlaying);
  };

  // Toggle Live Room Microphone
  const handleToggleMic = async () => {
    if (isMicActive) {
      audioEngine.stopMicrophone();
      setIsMicActive(false);
    } else {
      const ok = await audioEngine.startMicrophoneRta();
      setIsMicActive(ok);
    }
  };

  // Toggle Mute Group
  const handleToggleMuteGroup = (grpNum: number) => {
    setActiveMuteGroups((prev) => {
      const isAlreadyActive = prev.includes(grpNum);
      const next = isAlreadyActive ? prev.filter((g) => g !== grpNum) : [...prev, grpNum];

      // Mute/unmute assigned channels
      setChannels((channelsPrev) =>
        channelsPrev.map((c) => {
          if ((c.muteGroupAssign || []).includes(grpNum)) {
            return { ...c, muted: !isAlreadyActive };
          }
          return c;
        })
      );

      return next;
    });
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans select-none">
      {/* 1. TOP HEADER TOOLBAR & M32-EDIT MAIN TABS */}
      <HeaderBar
        network={network}
        onOpenNetwork={() => setIsNetworkModalOpen(true)}
        clipAlerts={clipAlerts}
        onOpenClipAlerts={() => setIsClipDrawerOpen(true)}
        isVirtualBandPlaying={isVirtualBandPlaying}
        onToggleVirtualBand={handleToggleVirtualBand}
        isMicActive={isMicActive}
        onToggleMic={handleToggleMic}
        onOpenCloudSync={() => setIsCloudSyncModalOpen(true)}
        onOpenPresets={() => setIsPresetModalOpen(true)}
        activeProfile={activeProfile}
        sendsOnFaderBus={sendsOnFaderBus}
        onToggleSendsOnFader={(busId) => setSendsOnFaderBus(busId)}
        beginnerMode={beginnerMode}
        onToggleBeginnerMode={() => setBeginnerMode(!beginnerMode)}
        globalMuteAll={globalMuteAll}
        onToggleGlobalMuteAll={() => setGlobalMuteAll(!globalMuteAll)}
        activeSceneName={activeSceneName}
        currentView={currentView}
        onSelectView={(v) => setCurrentView(v)}
        isDeckCollapsed={isDeckCollapsed}
        onToggleDeckCollapse={() => setIsDeckCollapsed((prev) => !prev)}
        onOpenSpecs={() => setIsSpecsModalOpen(true)}
        onOpenInstall={() => setIsInstallModalOpen(true)}
      />

      {/* 2. CONDITIONAL VIEW: MIXER (Faders) vs CHANNEL vs METERS vs ROUTING */}
      {currentView === 'mixer' && (
        <>
          {/* Authentic M32-Mix Selected Channel Processing Deck (EQ, Gate, Comp, Sends, Config, Home) */}
          <ChannelProcessingDeck
            channel={selectedChannel}
            onUpdateChannel={updateChannel}
            onOpenEqModal={() => setIsEqModalOpen(true)}
            onOpenDetailModal={() => setIsDetailModalOpen(true)}
            isCollapsed={isDeckCollapsed}
            onToggleCollapse={() => setIsDeckCollapsed((prev) => !prev)}
          />

          {/* Bank Selector & Sends on Fader Tray */}
          <BankSelector
            currentBank={currentBank}
            onSelectBank={(b) => {
              setCurrentBank(b);
              const bankStartMap: Record<BankType, number> = {
                'ch1-8': 1,
                'ch9-16': 9,
                'ch17-24': 17,
                'ch25-32': 25,
                'aux-fx': 33,
                'bus1-8': 41,
                'bus9-16': 49,
                'mtx-main': 57,
                'dca': 65,
              };
              if (bankStartMap[b]) {
                setSelectedChannelId(bankStartMap[b]);
              }
            }}
            sendsOnFaderBus={sendsOnFaderBus}
            onToggleSendsOnFader={(busId) => setSendsOnFaderBus(busId)}
          />

          {/* Main Console Surface (Channel Strips + Master Section) */}
          <main className="flex-1 flex overflow-hidden bg-carbon relative">
            {/* Scrollable Channel Strips Container */}
            <div className="flex-1 flex overflow-x-auto overflow-y-hidden items-stretch scrollbar-thin">
              {displayedChannels.map((ch) => (
                <FaderChannelStrip
                  key={ch.id}
                  channel={ch}
                  isSelected={ch.id === selectedChannelId}
                  onSelect={(id) => {
                    setSelectedChannelId(id);
                  }}
                  onUpdateFader={handleUpdateFader}
                  onToggleMute={handleToggleMute}
                  onToggleSolo={handleToggleSolo}
                  onOpenEq={(id) => {
                    setSelectedChannelId(id);
                    setIsEqModalOpen(true);
                  }}
                  onClearClip={handleClearClip}
                  onUpdatePan={handleUpdatePan}
                  sendsOnFaderBus={sendsOnFaderBus}
                  onUpdateSendLevel={handleUpdateSendLevel}
                />
              ))}
            </div>

            {/* Console Master Stereo Section */}
            <MasterSection
              mainFaderLinear={mainFaderLinear}
              onUpdateMainFader={(val) => {
                setMainFaderLinear(val);
                oscBridge.sendMainFader(val);
              }}
              monoFaderLinear={monoFaderLinear}
              onUpdateMonoFader={(val) => setMonoFaderLinear(val)}
              isMainMuted={isMainMuted}
              onToggleMainMute={() => setIsMainMuted(!isMainMuted)}
              hasActiveSolos={hasActiveSolos}
              onClearAllSolos={() =>
                setChannels((prev) => prev.map((c) => ({ ...c, solo: false })))
              }
              leftMeterDb={masterLeftDb}
              rightMeterDb={masterRightDb}
              activeMuteGroups={activeMuteGroups}
              onToggleMuteGroup={handleToggleMuteGroup}
            />
          </main>
        </>
      )}

      {/* VIEW: CHANNEL PROCESSING WORKSPACE (M32-EDIT CHANNEL VIEW) */}
      {currentView === 'channel' && (
        <ChannelOverviewTab
          channels={channels}
          selectedChannelId={selectedChannelId}
          onSelectChannel={(id) => setSelectedChannelId(id)}
          onUpdateChannel={updateChannel}
          onOpenEqModal={() => setIsEqModalOpen(true)}
        />
      )}

      {/* VIEW: FULL METERS BRIDGE */}
      {currentView === 'meters' && (
        <MeterBridgeView
          channels={channels}
          leftMeterDb={masterLeftDb}
          rightMeterDb={masterRightDb}
          selectedChannelId={selectedChannelId}
          onSelectChannel={(id) => setSelectedChannelId(id)}
        />
      )}

      {/* VIEW: ROUTING & PATCH MATRIX */}
      {currentView === 'routing' && <RoutingMatrixView />}

      {/* VIEW: VIRTUAL EFFECTS RACK (TRUE PHYSICAL MODELING) */}
      {currentView === 'fx' && <EffectsRackView />}

      {/* VIEW: DN32-LIVE DUAL SD MULTITRACK RECORDER & VIRTUAL SOUNDCHECK */}
      {currentView === 'recorder' && (
        <RecorderLiveView
          isVirtualBandPlaying={isVirtualBandPlaying}
          onToggleVirtualBand={handleToggleVirtualBand}
        />
      )}

      {/* 4. MODALS & DRAWERS */}
      {/* Parametric EQ & Live RTA Modal */}
      {isEqModalOpen && (
        <EqEditorModal
          channel={selectedChannel}
          onClose={() => setIsEqModalOpen(false)}
          onUpdateChannel={updateChannel}
          onSavePersonalPreset={(name, cat, eqData) => {
            const newPre: PresetProfile = {
              id: `pre-${Date.now()}`,
              name,
              category: cat as PresetProfile['category'],
              author: activeProfile.name,
              updatedAt: new Date().toISOString(),
              isCloudSynced: true,
              data: eqData as Partial<ChannelStripData>,
            };
            const updated = [newPre, ...presets];
            setPresets(updated);
            storageService.savePresets(updated);
          }}
          beginnerMode={beginnerMode}
          onToggleBeginnerMode={() => setBeginnerMode(!beginnerMode)}
        />
      )}

      {/* Channel Detail Inspector Modal */}
      {isDetailModalOpen && (
        <ChannelDetailModal
          channel={selectedChannel}
          onClose={() => setIsDetailModalOpen(false)}
          onUpdateChannel={updateChannel}
          onOpenEq={() => {
            setIsDetailModalOpen(false);
            setIsEqModalOpen(true);
          }}
        />
      )}

      {/* Presets, Scenes & Profiles Modal */}
      {isPresetModalOpen && (
        <PresetManagerModal
          presets={presets}
          onLoadPreset={(pre) => {
            if ('eqBands' in pre.data) {
              setChannels((prev) =>
                prev.map((c) =>
                  c.id === selectedChannelId ? { ...c, ...pre.data } : c
                )
              );
            }
          }}
          onSaveNewScene={(name) => {
            setActiveSceneName(name);
            const newScene: PresetProfile = {
              id: `scn-${Date.now()}`,
              name,
              category: 'Full Scene',
              author: activeProfile.name,
              updatedAt: new Date().toISOString(),
              isCloudSynced: true,
              data: { channels },
            };
            const updated = [newScene, ...presets];
            setPresets(updated);
            storageService.savePresets(updated);
          }}
          onDeletePreset={(id) => {
            const updated = presets.filter((p) => p.id !== id);
            setPresets(updated);
            storageService.savePresets(updated);
          }}
          profiles={profiles}
          activeProfile={activeProfile}
          onSelectProfile={(p) => {
            setActiveProfile(p);
            storageService.setActiveProfile(p);
          }}
          onClose={() => setIsPresetModalOpen(false)}
        />
      )}

      {/* End-to-End Encrypted Cloud Sync & Vault Modal */}
      {isCloudSyncModalOpen && (
        <CloudSyncModal
          channels={channels}
          presets={presets}
          onRestoreChannels={(restored) => {
            setChannels(restored);
            storageService.saveChannels(restored);
          }}
          lastCloudSync={lastCloudSync}
          onUpdateLastSync={(time) => {
            setLastCloudSync(time);
            storageService.setLastCloudSync(time);
          }}
          onClose={() => setIsCloudSyncModalOpen(false)}
        />
      )}

      {/* Wi-Fi & OSC Engine Network Modal */}
      {isNetworkModalOpen && (
        <NetworkOscModal
          network={network}
          onUpdateNetwork={(upd) => setNetwork((prev) => ({ ...prev, ...upd }))}
          onClose={() => setIsNetworkModalOpen(false)}
        />
      )}

      {/* Real-time Clip and Feedback Alert Drawer */}
      {isClipDrawerOpen && (
        <ClipAlertDrawer
          alerts={clipAlerts}
          onClose={() => setIsClipDrawerOpen(false)}
          onClearAlerts={() => setClipAlerts([])}
          onSelectChannel={(chId) => {
            setSelectedChannelId(chId);
            setIsDetailModalOpen(true);
          }}
          onOpenFxRack={() => setCurrentView('fx')}
        />
      )}

      {/* M32 Console Hardware Architecture, 16 Core Specs & Bentley Design Modal */}
      {isSpecsModalOpen && (
        <ConsoleSpecsModal
          onClose={() => setIsSpecsModalOpen(false)}
          onOpenNetwork={() => {
            setIsSpecsModalOpen(false);
            setIsNetworkModalOpen(true);
          }}
        />
      )}

      {/* iPad Installation Guide & MobileConfig Modal */}
      {isInstallModalOpen && (
        <IpadInstallGuideModal onClose={() => setIsInstallModalOpen(false)} />
      )}
    </div>
  );
}
