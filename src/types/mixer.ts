export type ChannelColor = 'black' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white';

export type ChannelIcon =
  | 'mic'
  | 'mic-lead'
  | 'kick'
  | 'snare'
  | 'toms'
  | 'hihat'
  | 'guitar-ac'
  | 'guitar-el'
  | 'bass'
  | 'keys'
  | 'organ'
  | 'brass'
  | 'strings'
  | 'dj'
  | 'laptop'
  | 'fx'
  | 'talkback'
  | 'monitor';

export type FilterType = 'lowcut' | 'lowshelf' | 'peq' | 'veq' | 'highshelf' | 'highcut';

export interface EqBand {
  id: number;
  name: string;
  enabled: boolean;
  type: FilterType;
  frequency: number; // 20 - 20000 Hz
  gain: number; // -15 to +15 dB
  q: number; // 0.3 to 10.0
}

export interface GateSettings {
  enabled: boolean;
  threshold: number; // -80 to 0 dB
  range: number; // 0 to 60 dB
  attack: number; // 0 to 120 ms
  hold: number; // 0.02 to 2000 ms
  release: number; // 5 to 4000 ms
  reduction: number; // dynamic meter 0 to 40 dB
}

export interface CompressorSettings {
  enabled: boolean;
  threshold: number; // -60 to 0 dB
  ratio: number; // 1.1 to 20.0 (or inf)
  knee: number; // 0 to 5
  attack: number; // 0 to 120 ms
  hold: number; // 0 to 1000 ms
  release: number; // 5 to 4000 ms
  makeupGain: number; // 0 to +24 dB
  mix: number; // 0 to 100%
  reduction: number; // dynamic meter 0 to 30 dB
}

export interface ChannelSend {
  busId: number;
  level: number; // -90 to +10 dB
  pan: number; // -100 to +100
  on: boolean;
  tap: 'in_lc' | 'pre_eq' | 'post_eq' | 'pre_fader' | 'post_fader';
}

export interface ChannelStripData {
  id: number;
  type: 'ch' | 'aux' | 'fx' | 'bus' | 'matrix' | 'main' | 'dca';
  index: number;
  name: string;
  color: ChannelColor;
  icon: ChannelIcon;
  invertColor: boolean;

  // Preamp / Config
  gain: number; // -12 to +60 dB
  phantom48v: boolean;
  polarityInvert: boolean;
  lowCutEnabled: boolean;
  lowCutFreq: number; // 20 to 400 Hz
  delayMs: number; // 0 to 500 ms

  // Dynamics
  gate: GateSettings;
  compressor: CompressorSettings;

  // EQ
  eqEnabled: boolean;
  eqBands: EqBand[];

  // Fader & Mix
  fader: number; // -90 (off) to +10 dB, with 0 as unity
  faderLinear: number; // 0.0 to 1.0 (for fader travel)
  pan: number; // -100 (L) to +100 (R)
  muted: boolean;
  solo: boolean;
  mainLR: boolean;
  monoCenter: boolean;

  // Sends
  sends: ChannelSend[];

  // Routing
  dcaAssign: number[]; // 1 to 8
  muteGroupAssign: number[]; // 1 to 6

  // Live Metering
  meterLevel: number; // -60 to +10 dBFS
  peakLevel: number;
  hasClipped: boolean;
  lastClipTime?: number;
}

export interface ClipAlertEvent {
  id: string;
  channelId: number;
  channelName: string;
  peakDb: number;
  timestamp: string;
  type: 'clip' | 'feedback_warning' | 'dsp_overload';
  acknowledged: boolean;
}

export interface PresetProfile {
  id: string;
  name: string;
  category: 'Vocal' | 'Drums' | 'Bass' | 'Guitar' | 'Keys' | 'Master' | 'Full Scene';
  author: string;
  updatedAt: string;
  isCloudSynced: boolean;
  data: Partial<ChannelStripData> | { channels: ChannelStripData[] };
}

export interface UserEngineerProfile {
  id: string;
  name: string;
  role: 'FOH Head Engineer' | 'Monitor Engineer' | 'Musician IEM' | 'Guest Tech';
  allowedBusses?: number[];
  canModifyPreamp: boolean;
  canModifyRouting: boolean;
  lastActive: string;
}

export interface NetworkConnectionState {
  connected: boolean;
  ipAddress: string;
  port: number;
  consoleModel: 'M32' | 'M32R' | 'M32C' | 'X32' | 'X32 Compact';
  firmware: string;
  pingMs: number;
  packetLossPercent: number;
  packetsReceived: number;
  packetsSent: number;
  activeClientsCount: number;
  wifiSSID: string;
  wifiSignalDb: number;
  isOfflineMode: boolean;
}

export interface OscMessageLog {
  id: string;
  timestamp: string;
  direction: 'in' | 'out';
  address: string;
  args: (string | number)[];
}
