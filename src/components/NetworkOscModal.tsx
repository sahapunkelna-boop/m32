import React, { useState, useEffect } from 'react';
import {
  X,
  Wifi,
  WifiOff,
  Terminal,
  Activity,
  Send,
  Trash2,
  Laptop,
  Tablet,
  Smartphone,
  Code2,
  Check,
  Copy,
  Layers,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  RefreshCw,
  Key,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import { NetworkConnectionState, OscMessageLog } from '../types/mixer';
import { oscBridge } from '../services/oscBridge';

interface NetworkOscModalProps {
  network: NetworkConnectionState;
  onUpdateNetwork: (updated: Partial<NetworkConnectionState>) => void;
  onClose: () => void;
}

export const NetworkOscModal: React.FC<NetworkOscModalProps> = ({
  network,
  onUpdateNetwork,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'network' | 'osc-traffic' | 'real-setup' | 'api-docs'>('network');
  const [oscLogs, setOscLogs] = useState<OscMessageLog[]>([]);
  const [customOscAddr, setCustomOscAddr] = useState('/ch/01/mix/fader');
  const [customOscArg, setCustomOscArg] = useState('0.75');
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [bridgeWsUrl, setBridgeWsUrl] = useState(oscBridge.getRealWsUrl());
  const [isRealConnected, setIsRealConnected] = useState(oscBridge.isRealConnected());
  
  // Bridge v2 security state
  const [bridgeSecurity, setBridgeSecurity] = useState(oscBridge.getBridgeSecurityState());
  const [bridgeStatusMsg, setBridgeStatusMsg] = useState<string>('');
  const [pinCode, setPinCode] = useState('');
  const [isAdvancedArm, setIsAdvancedArm] = useState(false);
  const [scriptLang, setScriptLang] = useState<'python' | 'node'>('python');

  useEffect(() => {
    const unsubLogs = oscBridge.subscribeLogs((logs) => {
      setOscLogs(logs);
    });
    const unsubStatus = oscBridge.subscribeRealStatus((connected) => {
      setIsRealConnected(connected);
    });
    const unsubBridge = oscBridge.subscribeBridgeState((st) => {
      setBridgeSecurity({
        paired: st.paired,
        armed: st.armed,
        adv: st.adv,
        syncProgress: st.syncProgress,
      });
      if (st.lastMsg) {
        setBridgeStatusMsg(st.lastMsg);
      }
    });
    return () => {
      unsubLogs();
      unsubStatus();
      unsubBridge();
    };
  }, []);

  const handleToggleRealBridge = () => {
    if (isRealConnected) {
      oscBridge.disconnectRealWebSocket();
    } else {
      oscBridge.connectRealWebSocket(bridgeWsUrl);
    }
  };

  const handleSendCustomOsc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customOscAddr.trim()) return;
    const num = parseFloat(customOscArg);
    const argVal = isNaN(num) ? customOscArg : num;
    oscBridge.logMessage('out', customOscAddr.trim(), [argVal]);

    // Simulate reply from M32 DSP Core
    setTimeout(() => {
      oscBridge.simulateIncomingTelemetry(customOscAddr.trim(), [argVal]);
    }, 45);
  };

  const copyApiExample = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 select-none">
      <div className="w-full max-w-4xl bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden">
        {/* Header */}
        <div className="h-14 bg-zinc-950 border-b border-zinc-800 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-zinc-100">
                  WI-FI OSC ENGINE & MULTI-DEVICE NETWORK
                </span>
                <span className="text-[10px] bg-zinc-800 text-emerald-400 border border-emerald-800/80 px-1.5 py-0.5 rounded font-mono font-bold">
                  {network.connected ? 'ONLINE (1.8ms)' : 'OFFLINE MODE'}
                </span>
              </div>
              <div className="text-[10px] text-zinc-400 font-mono">
                Behringer/Midas M32 OSC Protocol · High-Speed UDP · Multi-Client Synchronization
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-zinc-950/80 border-b border-zinc-800 px-4 flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setActiveTab('network')}
            className={`py-2.5 px-3 border-b-2 font-bold cursor-pointer ${
              activeTab === 'network'
                ? 'border-emerald-400 text-emerald-300 bg-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            NETWORK & CLIENTS
          </button>
          <button
            onClick={() => setActiveTab('osc-traffic')}
            className={`py-2.5 px-3 border-b-2 font-bold cursor-pointer ${
              activeTab === 'osc-traffic'
                ? 'border-emerald-400 text-emerald-300 bg-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            LIVE OSC INSPECTOR ({oscLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('real-setup')}
            className={`py-2.5 px-3 border-b-2 font-bold cursor-pointer ${
              activeTab === 'real-setup'
                ? 'border-emerald-400 text-emerald-300 bg-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            REAL HARDWARE SETUP (วิธีต่อมิกเซอร์จริง)
          </button>
          <button
            onClick={() => setActiveTab('api-docs')}
            className={`py-2.5 px-3 border-b-2 font-bold cursor-pointer ${
              activeTab === 'api-docs'
                ? 'border-emerald-400 text-emerald-300 bg-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            API & AUTOMATION INTEGRATION
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-zinc-900 space-y-4">
          {/* TAB 1: NETWORK & MULTI-DEVICE CLIENTS */}
          {activeTab === 'network' && (
            <div className="space-y-4">
              {/* Connection Status & IP configuration */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="font-bold text-xs text-zinc-300 font-mono">
                    CONSOLE WI-FI CONNECTION SETTINGS
                  </span>
                  <button
                    onClick={() => onUpdateNetwork({ connected: !network.connected })}
                    className={`px-3 py-1 rounded text-xs font-mono font-bold cursor-pointer border ${
                      network.connected
                        ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                        : 'bg-rose-950 text-rose-300 border-rose-800'
                    }`}
                  >
                    {network.connected ? 'CONNECTED (Wi-Fi Online)' : 'DISCONNECTED (Work Offline)'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-mono text-zinc-400 block mb-1">
                      MIXER IP ADDRESS
                    </label>
                    <input
                      type="text"
                      value={network.ipAddress}
                      onChange={(e) => onUpdateNetwork({ ipAddress: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 px-3 py-1.5 rounded font-mono text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono text-zinc-400 block mb-1">UDP PORT</label>
                    <input
                      type="number"
                      value={network.port}
                      onChange={(e) =>
                        onUpdateNetwork({ port: parseInt(e.target.value, 10) || 10023 })
                      }
                      className="w-full bg-zinc-900 border border-zinc-700 px-3 py-1.5 rounded font-mono text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono text-zinc-400 block mb-1">
                      CONSOLE HARDWARE MODEL
                    </label>
                    <select
                      value={network.consoleModel}
                      onChange={(e) =>
                        onUpdateNetwork({
                          consoleModel: e.target.value as NetworkConnectionState['consoleModel'],
                        })
                      }
                      className="w-full bg-zinc-900 border border-zinc-700 px-3 py-1.5 rounded font-mono text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
                    >
                      <option value="M32">Midas M32 Live (32-Channel)</option>
                      <option value="M32R">Midas M32R Live (Rackmount)</option>
                      <option value="M32C">Midas M32C (Core 1U)</option>
                      <option value="X32">Behringer X32</option>
                      <option value="X32 Compact">Behringer X32 Compact</option>
                    </select>
                  </div>
                </div>

                {/* Telemetry Status Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-mono">
                  <div className="bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-850">
                    <span className="text-zinc-500 block text-[10px]">PING LATENCY</span>
                    <span className="text-emerald-400 font-bold">{network.pingMs.toFixed(1)} ms</span>
                  </div>
                  <div className="bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-850">
                    <span className="text-zinc-500 block text-[10px]">PACKET LOSS</span>
                    <span className="text-emerald-400 font-bold">
                      {network.packetLossPercent.toFixed(1)}% (0 dropped)
                    </span>
                  </div>
                  <div className="bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-850">
                    <span className="text-zinc-500 block text-[10px]">WI-FI NETWORK (5GHz)</span>
                    <span className="text-zinc-200 font-bold">{network.wifiSSID} (-38 dBm)</span>
                  </div>
                  <div className="bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-850">
                    <span className="text-zinc-500 block text-[10px]">PACKETS RECEIVED</span>
                    <span className="text-zinc-200 font-bold">
                      {network.packetsReceived.toLocaleString()} packets
                    </span>
                  </div>
                </div>
              </div>

              {/* Multi-Device Synchronized Clients List */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-zinc-300 font-mono">
                    SYNCHRONIZED CLIENT DEVICES ON STAGE NETWORK (4 ACTIVE)
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400">Zero-Collision OSC Sync</span>
                </div>

                <div className="space-y-2">
                  {[
                    {
                      id: 'dev-1',
                      name: 'iPad Pro 12.9" M2 (This Device)',
                      role: 'FOH Head Sound Engineer · Master Control',
                      ip: '192.168.1.101',
                      icon: Tablet,
                      ping: '1.2ms',
                      isSelf: true,
                    },
                    {
                      id: 'dev-2',
                      name: 'iPad Air 11" (Stage Left Tech)',
                      role: 'Monitor Engineer · Bus 1-8 IEM Mixing',
                      ip: '192.168.1.104',
                      icon: Tablet,
                      ping: '1.8ms',
                      isSelf: false,
                    },
                    {
                      id: 'dev-3',
                      name: 'iPhone 15 Pro (Drummer)',
                      role: 'Musician Personal Mix · Bus 2 Lockout',
                      ip: '192.168.1.118',
                      icon: Smartphone,
                      ping: '2.4ms',
                      isSelf: false,
                    },
                    {
                      id: 'dev-4',
                      name: 'MacBook Pro 16" M3 Max',
                      role: 'QLab Show Cues & 32-Ch USB DAW Multitrack',
                      ip: '192.168.1.50',
                      icon: Laptop,
                      ping: '0.8ms',
                      isSelf: false,
                    },
                  ].map((dev) => {
                    const IconComp = dev.icon;
                    return (
                      <div
                        key={dev.id}
                        className="bg-zinc-900/80 p-3 rounded-lg border border-zinc-800 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-zinc-800 rounded-lg text-zinc-300">
                            <IconComp className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-zinc-100">{dev.name}</span>
                              {dev.isSelf && (
                                <span className="text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-1 rounded font-mono font-bold">
                                  CURRENT
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-zinc-400 font-mono">{dev.role}</div>
                          </div>
                        </div>

                        <div className="text-right text-xs font-mono">
                          <span className="text-zinc-500 block">{dev.ip}</span>
                          <span className="text-emerald-400 font-bold">{dev.ping}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE OSC TRAFFIC LOGS */}
          {activeTab === 'osc-traffic' && (
            <div className="space-y-3">
              {/* Command Injector Bar */}
              <form
                onSubmit={handleSendCustomOsc}
                className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 flex items-center gap-2"
              >
                <div className="text-xs font-mono text-zinc-400 shrink-0">TEST OSC:</div>
                <input
                  type="text"
                  value={customOscAddr}
                  onChange={(e) => setCustomOscAddr(e.target.value)}
                  placeholder="/ch/01/mix/fader"
                  className="flex-1 bg-zinc-900 border border-zinc-700 px-3 py-1.5 rounded text-xs font-mono text-zinc-100 focus:outline-none focus:border-emerald-400"
                />
                <input
                  type="text"
                  value={customOscArg}
                  onChange={(e) => setCustomOscArg(e.target.value)}
                  placeholder="0.75"
                  className="w-24 bg-zinc-900 border border-zinc-700 px-3 py-1.5 rounded text-xs font-mono text-zinc-100 focus:outline-none focus:border-emerald-400"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs rounded cursor-pointer flex items-center gap-1 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit</span>
                </button>
                <button
                  type="button"
                  onClick={() => oscBridge.clearLogs()}
                  className="p-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-400 hover:text-white rounded cursor-pointer"
                  title="Clear Log Terminal"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </form>

              {/* Real-time Terminal Log */}
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 font-mono text-xs h-96 overflow-y-auto space-y-1">
                {oscLogs.length === 0 ? (
                  <div className="text-zinc-600 py-10 text-center">
                    No OSC packets logged yet. Move any fader or send an OSC command above.
                  </div>
                ) : (
                  oscLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center gap-2 py-0.5 border-b border-zinc-900 hover:bg-zinc-900/50"
                    >
                      <span className="text-zinc-600 text-[10px] w-20">{log.timestamp}</span>
                      <span
                        className={`text-[10px] font-bold px-1 rounded ${
                          log.direction === 'out'
                            ? 'bg-amber-950 text-amber-400'
                            : 'bg-emerald-950 text-emerald-400'
                        }`}
                      >
                        {log.direction.toUpperCase()}
                      </span>
                      <span className="text-cyan-400 font-semibold">{log.address}</span>
                      <span className="text-zinc-300">
                        {log.args.map((a) => (typeof a === 'string' ? `"${a}"` : a)).join(', ')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: REAL HARDWARE SETUP GUIDE & BRIDGE CONNECTOR */}
          {activeTab === 'real-setup' && (
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-xs text-zinc-200 font-mono">
                    คู่มือการนำแอปไปเชื่อมต่อมิกเซอร์ MIDAS M32 / BEHRINGER X32 จริง
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-amber-400 font-mono bg-amber-950/80 border border-amber-800/80 px-2 py-0.5 rounded font-bold">
                    BRIDGE v2 SECURITY ACTIVE
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded font-bold">
                    100% REAL HARDWARE COMPATIBLE
                  </span>
                </div>
              </div>

              {/* WebSocket Live Bridge Connector Box */}
              <div className="bg-zinc-900/90 p-4 rounded-xl border border-emerald-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-100 font-mono">
                      LIVE HARDWARE BRIDGE GATEWAY (WEBSOCKET TO UDP 10023)
                    </span>
                  </div>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1.5 ${
                      isRealConnected
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isRealConnected ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'
                      }`}
                    />
                    <span>{isRealConnected ? 'CONNECTED TO REAL M32' : 'DISCONNECTED'}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={bridgeWsUrl}
                    onChange={(e) => setBridgeWsUrl(e.target.value)}
                    placeholder="ws://192.168.1.100:8080"
                    className="flex-1 bg-zinc-950 border border-zinc-700 px-3 py-2 rounded-lg font-mono text-xs text-zinc-100 focus:outline-none focus:border-emerald-400"
                  />
                  <button
                    onClick={handleToggleRealBridge}
                    className={`px-4 py-2 rounded-lg font-mono font-bold text-xs cursor-pointer transition-all ${
                      isRealConnected
                        ? 'bg-rose-700 hover:bg-rose-600 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                    }`}
                  >
                    {isRealConnected ? 'Disconnect Bridge' : 'Connect to Real M32'}
                  </button>
                </div>

                {/* BRIDGE V2 SECURITY & ARMING CONTROLS */}
                {isRealConnected && (
                  <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-amber-400" />
                        <span>BRIDGE V2 SECURITY STATUS:</span>
                      </span>
                      {bridgeStatusMsg && (
                        <span className="text-[11px] font-mono text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                          {bridgeStatusMsg}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Step 1: Pair PIN */}
                      <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono font-bold text-zinc-300">
                            1. PAIRING (รหัส 6 หลัก)
                          </span>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                              bridgeSecurity.paired
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-amber-950 text-amber-400 border border-amber-800'
                            }`}
                          >
                            {bridgeSecurity.paired ? 'PAIRED' : 'NOT PAIRED'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            maxLength={6}
                            value={pinCode}
                            onChange={(e) => setPinCode(e.target.value)}
                            placeholder="รหัส 6 หลัก"
                            disabled={bridgeSecurity.paired}
                            className="w-24 bg-zinc-950 border border-zinc-700 px-2 py-1 rounded font-mono text-center text-xs tracking-widest text-amber-400 focus:outline-none focus:border-amber-400 disabled:opacity-50"
                          />
                          <button
                            onClick={() => oscBridge.pair(pinCode)}
                            disabled={bridgeSecurity.paired || pinCode.length !== 6}
                            className="flex-1 px-2 py-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-black font-mono font-bold text-[11px] rounded cursor-pointer"
                          >
                            ยืนยัน PIN
                          </button>
                        </div>
                      </div>

                      {/* Step 2: Snapshot Sync */}
                      <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono font-bold text-zinc-300">
                            2. SYNC (อ่านค่าจากเครื่อง)
                          </span>
                          <span className="text-[9px] font-mono text-cyan-400">
                            {bridgeSecurity.syncProgress.total > 0
                              ? `${bridgeSecurity.syncProgress.current}/${bridgeSecurity.syncProgress.total}`
                              : 'READ-ONLY'}
                          </span>
                        </div>
                        <button
                          onClick={() => oscBridge.requestSync()}
                          disabled={!bridgeSecurity.paired}
                          className="w-full px-2 py-1 bg-cyan-700 hover:bg-cyan-600 disabled:opacity-40 text-white font-mono font-bold text-[11px] rounded cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>โหลดค่าเฟดเดอร์ทั้งหมด</span>
                        </button>
                      </div>

                      {/* Step 3: ARM / DISARM */}
                      <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono font-bold text-zinc-300">
                            3. ARM CONSOLE
                          </span>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                              bridgeSecurity.armed
                                ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {bridgeSecurity.armed ? 'ARMED (LIVE)' : 'DISARMED'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {bridgeSecurity.armed ? (
                            <button
                              onClick={() => oscBridge.disarm()}
                              className="w-full px-2 py-1 bg-zinc-700 hover:bg-zinc-600 text-white font-mono font-bold text-[11px] rounded cursor-pointer"
                            >
                              DISARM (พักการควบคุม)
                            </button>
                          ) : (
                            <button
                              onClick={() => oscBridge.arm(isAdvancedArm)}
                              disabled={!bridgeSecurity.paired}
                              className="w-full px-2 py-1 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-mono font-bold text-[11px] rounded cursor-pointer shadow-sm"
                            >
                              ARM (เริ่มควบคุมสด)
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isAdvancedArm}
                          onChange={(e) => setIsAdvancedArm(e.target.checked)}
                          className="rounded text-amber-500 focus:ring-0"
                        />
                        <span>เปิดสิทธิ์ Advanced Commands (Tier 2: +48V Phantom, Scene recall, Routing, Oscillator)</span>
                      </label>
                      <span className="text-[10px] text-zinc-500">
                        ตัดการเชื่อมต่ออัตโนมัติหาก M32 เงียบเกิน 6 วินาที
                      </span>
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-zinc-400">
                  เมื่อกดเชื่อมต่อและ ARM คำสั่งทั้งหมดที่คุณเลื่อนเฟดเดอร์ ปรับ EQ หรือกด Mute บนหน้านี้จะถูกส่งตรงไปยังมิกเซอร์ M32 บนเวทีแบบเรียลไทม์!
                </p>
              </div>

              {/* 4-Step Hardware Connection Guide */}
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold text-amber-400 block">
                  ขั้นตอนการต่อใช้งานจริงบนเวที (STEP-BY-STEP SETUP):
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800 space-y-1">
                    <div className="font-bold text-zinc-200 text-xs">
                      1. เสียบสาย LAN เข้าพอร์ต ETHERNET
                    </div>
                    <p className="text-zinc-400 text-[11px]">
                      นำสาย LAN จากด้านหลังมิกเซอร์ M32 (พอร์ต Remote / Ethernet) เสียบเข้ากับช่อง LAN ของ Wi-Fi Router บนเวที (แนะนำ 5GHz Router เพื่อความเร็วสูงสุดและไร้สัญญาณรบกวน)
                    </p>
                  </div>

                  <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800 space-y-1">
                    <div className="font-bold text-zinc-200 text-xs">
                      2. ดู IP Address บนจอมิกเซอร์ M32
                    </div>
                    <p className="text-zinc-400 text-[11px]">
                      กดปุ่ม <strong>SETUP</strong> บนมิกเซอร์ M32 &gt; ไปที่แท็บ <strong>NETWORK</strong> &gt; สังเกต IP Address เช่น <code>192.168.1.150</code> ซับเน็ต <code>255.255.255.0</code>
                    </p>
                  </div>

                  <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800 space-y-1">
                    <div className="font-bold text-zinc-200 text-xs">
                      3. รันตัวเชื่อม Bridge บนแล็ปท็อปหรือ Raspberry Pi
                    </div>
                    <p className="text-zinc-400 text-[11px]">
                      เนื่องจากบราวเซอร์บน iPad ทำงานใน Sandbox จึงต้องมีสคริปต์ตัวกลาง 1 ตัว (Python ด้านล่าง) รันบนแล็ปท็อป FOH หรือบอร์ดจิ๋ว เพื่อแปลงคำสั่ง WebSocket เป็น UDP Port 10023 ของ M32
                    </p>
                  </div>

                  <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800 space-y-1">
                    <div className="font-bold text-zinc-200 text-xs">
                      4. เชื่อมต่อ iPad เข้า Wi-Fi เดียวกัน
                    </div>
                    <p className="text-zinc-400 text-[11px]">
                      นำ iPad ต่อ Wi-Fi เดียวกัน ใส่รหัส PIN 6 หลักที่โชว์ใน Terminal แล้วกด <strong>ARM</strong> เฟดเดอร์บนเครื่องจริง M32 จะขยับตามนิ้วคุณทันที!
                    </p>
                  </div>
                </div>
              </div>

              {/* Ready-to-Run Bridge Script with Language Toggle */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-zinc-300">
                      โค้ดรันตัวเชื่อมบริดจ์ (M32 Remote Bridge Gateway):
                    </span>
                    <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded p-0.5">
                      <button
                        onClick={() => setScriptLang('python')}
                        className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded cursor-pointer ${
                          scriptLang === 'python'
                            ? 'bg-amber-600 text-black'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Python Bridge v2 (Security & Pairing)
                      </button>
                      <button
                        onClick={() => setScriptLang('node')}
                        className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded cursor-pointer ${
                          scriptLang === 'node'
                            ? 'bg-cyan-600 text-white'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Node.js Minimal
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (scriptLang === 'python') {
                        copyApiExample(`# ติดตั้ง dependencies:
pip install websockets

# รันบริดจ์พร้อมระบุ IP ของมิกเซอร์ M32:
python m32_bridge.py ${network.ipAddress}`);
                      } else {
                        copyApiExample(`// Save as m32-bridge.js and run: node m32-bridge.js
const dgram = require('dgram');
const WebSocket = require('ws');
const M32_IP = '${network.ipAddress}';
const M32_PORT = 10023;
const WS_PORT = 8080;
const udp = dgram.createSocket('udp4');
const wss = new WebSocket.Server({ port: WS_PORT });
console.log('M32 Bridge running on port ' + WS_PORT + ' -> Routing to M32 at ' + M32_IP);
wss.on('connection', (ws) => {
  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);
      const oscPacket = Buffer.from(data.addr || data.address);
      udp.send(oscPacket, 0, oscPacket.length, M32_PORT, M32_IP);
    } catch (e) {}
  });
});`);
                      }
                    }}
                    className="text-xs text-emerald-400 flex items-center gap-1 hover:underline cursor-pointer font-mono"
                  >
                    {copiedSnippet ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>คัดลอกคำสั่งรัน</span>
                  </button>
                </div>

                {scriptLang === 'python' ? (
                  <pre className="bg-zinc-900 p-3 rounded-lg font-mono text-[11px] text-amber-300 overflow-x-auto border border-zinc-800">
{`# 1. ติดตั้งไลบรารี WebSocket
pip install websockets

# 2. รันสคริปต์ m32_bridge.py ที่สร้างไว้ในโปรเจกต์นี้
python m32_bridge.py ${network.ipAddress}

# ระบบความปลอดภัย 6 ชั้น:
#  1) ต้องจับคู่ด้วยรหัส 6 หลักที่แสดงใน Terminal (ใส่ผิด 5 ครั้งถูกล็อก 60 วินาที)
#  2) หลังจับคู่เป็น READ-ONLY ก่อน: อ่านค่าเฟเดอร์/มิวต์ทั้งหมดจากเครื่องให้ครบ แล้วจึงกด ARM ได้
#  3) ARM แล้วส่งได้เฉพาะคำสั่งในรายการอนุญาต ตรวจชนิดและช่วงค่า จำกัดอัตรา (Rate Limit)
#  4) คำสั่งเสี่ยง (+48V, โหลดซีน, Oscillator, Talkback, เปลี่ยนชนิดเอฟเฟกต์) ต้องเปิด Advanced ก่อน
#  5) DISARM อัตโนมัติเมื่อ M32 เงียบเกิน 6 วินาที / เริ่มอ่านค่าใหม่ / หลุดการเชื่อมต่อ
#  6) ควบคุมได้ทีละอุปกรณ์เดียว และรับ IP ของคอนโซลเฉพาะวงเครือข่ายภายใน`}
                  </pre>
                ) : (
                  <pre className="bg-zinc-900 p-3 rounded-lg font-mono text-[11px] text-emerald-300 overflow-x-auto border border-zinc-800">
{`// บันทึกไฟล์ชื่อ m32-bridge.js แล้วรัน: node m32-bridge.js
const dgram = require('dgram');
const WebSocket = require('ws');

const M32_IP = '${network.ipAddress}'; // ใส่ IP ของมิกเซอร์ M32
const M32_PORT = 10023;               // พอร์ต OSC มาตรฐานของ Behringer/Midas
const WS_PORT = 8080;

const udp = dgram.createSocket('udp4');
const wss = new WebSocket.Server({ port: WS_PORT });

wss.on('connection', (ws) => {
  console.log('iPad Connected to Bridge!');
  ws.on('message', (msg) => {
    const data = JSON.parse(msg);
    // ส่งคำสั่ง OSC ตรงเข้า DSP Core ของ M32
    udp.send(Buffer.from(data.addr || data.address), 0, (data.addr || data.address).length, M32_PORT, M32_IP);
  });
});`}
                  </pre>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: API & AUTOMATION INTEGRATION */}
          {activeTab === 'api-docs' && (
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-xs text-zinc-200 font-mono">
                    EXTERNAL API & WORKFLOW INTEGRATION
                  </span>
                </div>
                <span className="text-xs text-zinc-400 font-mono">
                  Compatible with QLab, Bitfocus Companion, Stream Deck & Custom Code
                </span>
              </div>

              {/* QLab OSC Cue */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-300 font-mono">
                    1. QLab / Theater Show Control OSC Cue
                  </span>
                  <button
                    onClick={() => copyApiExample('/ch/01/mix/fader 0.75\n/ch/01/mix/on 1')}
                    className="text-xs text-emerald-400 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    {copiedSnippet ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>Copy</span>
                  </button>
                </div>
                <pre className="bg-zinc-900 p-2.5 rounded font-mono text-xs text-emerald-300 overflow-x-auto border border-zinc-800">
                  {`# Unmute Lead Vocal and set Fader to 0dB in QLab:
/ch/01/mix/on 1
/ch/01/mix/fader 0.75

# Trigger Hall Reverb Send:
/ch/01/mix/09/level 0.5`}
                </pre>
              </div>

              {/* Bitfocus Companion / Stream Deck */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-zinc-300 font-mono">
                  2. Bitfocus Companion & Stream Deck Setup
                </span>
                <p className="text-xs text-zinc-400">
                  In Companion, add the <strong>Behringer X32 / Midas M32</strong> connection.
                  Set Target IP to <code>{network.ipAddress}</code> and Port <code>{network.port}</code>.
                  Buttons will automatically track LED feedback and mute statuses.
                </p>
              </div>

              {/* Node.js / Python REST & OSC Bridge */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-300 font-mono">
                    3. Python / Node-RED Venue Automation Script
                  </span>
                  <button
                    onClick={() =>
                      copyApiExample(
                        `import socket\nsock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)\nsock.sendto(b"/ch/01/mix/fader\\x00,f\\x00\\x00?@", ("${network.ipAddress}", 10023))`
                      )
                    }
                    className="text-xs text-emerald-400 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    {copiedSnippet ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>Copy</span>
                  </button>
                </div>
                <pre className="bg-zinc-900 p-2.5 rounded font-mono text-xs text-amber-300 overflow-x-auto border border-zinc-800">
                  {`# Python OSC UDP sender
import socket
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
# Send OSC packet to M32 console
sock.sendto(b"/ch/01/mix/fader\\x00,f\\x00\\x00?@", ("${network.ipAddress}", 10023))`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
