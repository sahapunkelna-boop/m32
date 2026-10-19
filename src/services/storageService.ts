import { ChannelStripData, PresetProfile, UserEngineerProfile } from '../types/mixer';

const CHANNELS_KEY = 'm32_console_channels_v1';
const PRESETS_KEY = 'm32_console_presets_v1';
const PROFILES_KEY = 'm32_console_profiles_v1';
const ACTIVE_PROFILE_KEY = 'm32_active_profile_v1';
const CLOUD_SYNC_TIME_KEY = 'm32_last_cloud_sync_v1';

export function createDefaultChannels(): ChannelStripData[] {
  const channels: ChannelStripData[] = [];

  // Default Channel Names & Types
  const defaultNames = [
    { name: 'Kick In', color: 'red', icon: 'kick' },
    { name: 'Snare Top', color: 'red', icon: 'snare' },
    { name: 'Hi-Hat', color: 'yellow', icon: 'hihat' },
    { name: 'Rack Tom', color: 'yellow', icon: 'toms' },
    { name: 'Floor Tom', color: 'yellow', icon: 'toms' },
    { name: 'Overhead L', color: 'cyan', icon: 'mic' },
    { name: 'Overhead R', color: 'cyan', icon: 'mic' },
    { name: 'Bass DI', color: 'green', icon: 'bass' },
    { name: 'E-Guitar L', color: 'blue', icon: 'guitar-el' },
    { name: 'E-Guitar R', color: 'blue', icon: 'guitar-el' },
    { name: 'Acoustic Gtr', color: 'yellow', icon: 'guitar-ac' },
    { name: 'Keyboards L', color: 'magenta', icon: 'keys' },
    { name: 'Keyboards R', color: 'magenta', icon: 'keys' },
    { name: 'Lead Vocal', color: 'red', icon: 'mic-lead' },
    { name: 'Vocal 2 / Harm', color: 'white', icon: 'mic' },
    { name: 'Vocal 3 / Guest', color: 'white', icon: 'mic' },
    { name: 'Brass / Sax', color: 'yellow', icon: 'brass' },
    { name: 'Strings', color: 'cyan', icon: 'strings' },
    { name: 'DJ Playback L', color: 'magenta', icon: 'dj' },
    { name: 'DJ Playback R', color: 'magenta', icon: 'dj' },
    { name: 'Wireless 1', color: 'green', icon: 'mic' },
    { name: 'Wireless 2', color: 'green', icon: 'mic' },
    { name: 'Video Audio L', color: 'blue', icon: 'laptop' },
    { name: 'Video Audio R', color: 'blue', icon: 'laptop' },
    { name: 'Talkback Mic', color: 'red', icon: 'talkback' },
    { name: 'Audience Mic L', color: 'black', icon: 'mic' },
    { name: 'Audience Mic R', color: 'black', icon: 'mic' },
    { name: 'Spare Line 1', color: 'black', icon: 'mic' },
    { name: 'Spare Line 2', color: 'black', icon: 'mic' },
    { name: 'Stage In 29', color: 'black', icon: 'mic' },
    { name: 'Stage In 30', color: 'black', icon: 'mic' },
    { name: 'Click Track', color: 'yellow', icon: 'monitor' },
  ];

  for (let i = 0; i < 32; i++) {
    const meta = defaultNames[i] || { name: `Ch ${String(i + 1).padStart(2, '0')}`, color: 'black', icon: 'mic' };
    channels.push({
      id: i + 1,
      type: 'ch',
      index: i,
      name: meta.name,
      color: meta.color as ChannelStripData['color'],
      icon: meta.icon as ChannelStripData['icon'],
      invertColor: false,
      gain: 24,
      phantom48v: i < 7 || i === 13,
      polarityInvert: false,
      lowCutEnabled: i !== 0 && i !== 7, // Kick & Bass keep sub by default
      lowCutFreq: i === 13 ? 100 : 80,
      delayMs: 0,
      gate: {
        enabled: i < 5,
        threshold: -45,
        range: 30,
        attack: 2,
        hold: 25,
        release: 150,
        reduction: 0,
      },
      compressor: {
        enabled: i === 7 || i === 13 || i === 0,
        threshold: -18,
        ratio: i === 13 ? 3.0 : 4.0,
        knee: 2,
        attack: 15,
        hold: 0,
        release: 120,
        makeupGain: 3,
        mix: 100,
        reduction: 0,
      },
      eqEnabled: true,
      eqBands: [
        { id: 1, name: 'Low', enabled: true, type: 'lowshelf', frequency: 100, gain: i === 0 ? 3.5 : 0, q: 1.0 },
        { id: 2, name: 'Low-Mid', enabled: true, type: 'peq', frequency: 400, gain: i === 0 ? -4.0 : 0, q: 2.0 },
        { id: 3, name: 'High-Mid', enabled: true, type: 'peq', frequency: 2500, gain: i === 13 ? 2.5 : 0, q: 1.5 },
        { id: 4, name: 'High', enabled: true, type: 'highshelf', frequency: 10000, gain: i === 13 ? 3.0 : 0, q: 1.0 },
      ],
      fader: i < 16 ? -5 : -90,
      faderLinear: i < 16 ? 0.72 : 0,
      pan: i === 5 ? -60 : i === 6 ? 60 : i === 11 ? -50 : i === 12 ? 50 : 0,
      muted: false,
      solo: false,
      mainLR: true,
      monoCenter: false,
      sends: Array.from({ length: 16 }, (_, sIdx) => ({
        busId: sIdx + 1,
        level: sIdx === 0 && i === 13 ? 0 : -90,
        pan: 0,
        on: true,
        tap: 'post_fader',
      })),
      dcaAssign: [1],
      muteGroupAssign: [1],
      meterLevel: -60,
      peakLevel: -60,
      hasClipped: false,
    });
  }

  // 2. Aux Inputs & USB Playback (IDs 33-40)
  const auxNames = [
    { name: 'Aux In 1', icon: 'aux', color: 'cyan' },
    { name: 'Aux In 2', icon: 'aux', color: 'cyan' },
    { name: 'Aux In 3', icon: 'aux', color: 'cyan' },
    { name: 'Aux In 4', icon: 'aux', color: 'cyan' },
    { name: 'Aux In 5', icon: 'aux', color: 'cyan' },
    { name: 'Aux In 6', icon: 'aux', color: 'cyan' },
    { name: 'USB Play L', icon: 'laptop', color: 'blue' },
    { name: 'USB Play R', icon: 'laptop', color: 'blue' },
  ];
  for (let a = 0; a < 8; a++) {
    channels.push({
      id: 33 + a,
      type: 'aux',
      index: a,
      name: auxNames[a].name,
      color: auxNames[a].color as ChannelStripData['color'],
      icon: auxNames[a].icon as ChannelStripData['icon'],
      invertColor: false,
      gain: 0,
      phantom48v: false,
      polarityInvert: false,
      lowCutEnabled: false,
      lowCutFreq: 80,
      delayMs: 0,
      gate: { enabled: false, threshold: -60, range: 20, attack: 5, hold: 20, release: 100, reduction: 0 },
      compressor: { enabled: false, threshold: -20, ratio: 2.0, knee: 1, attack: 20, hold: 0, release: 150, makeupGain: 0, mix: 100, reduction: 0 },
      eqEnabled: true,
      eqBands: [
        { id: 1, name: 'Low', enabled: true, type: 'lowshelf', frequency: 100, gain: 0, q: 1.0 },
        { id: 2, name: 'Low-Mid', enabled: true, type: 'peq', frequency: 400, gain: 0, q: 1.0 },
        { id: 3, name: 'High-Mid', enabled: true, type: 'peq', frequency: 2500, gain: 0, q: 1.0 },
        { id: 4, name: 'High', enabled: true, type: 'highshelf', frequency: 10000, gain: 0, q: 1.0 },
      ],
      fader: 0,
      faderLinear: 0.75,
      pan: a === 6 ? -50 : a === 7 ? 50 : 0,
      muted: false,
      solo: false,
      mainLR: true,
      monoCenter: false,
      sends: Array.from({ length: 16 }, (_, sIdx) => ({
        busId: sIdx + 1,
        level: -90,
        pan: 0,
        on: true,
        tap: 'post_fader',
      })),
      dcaAssign: [],
      muteGroupAssign: [],
      meterLevel: -60,
      peakLevel: -60,
      hasClipped: false,
    });
  }

  // 3. Mix Buses 1-16 (IDs 41-56)
  const busNames = [
    { name: 'Lead Vox IEM', color: 'yellow', icon: 'monitor' },
    { name: 'Drummer IEM', color: 'yellow', icon: 'monitor' },
    { name: 'Bass IEM', color: 'yellow', icon: 'monitor' },
    { name: 'Guitar IEM', color: 'yellow', icon: 'monitor' },
    { name: 'Keys IEM', color: 'yellow', icon: 'monitor' },
    { name: 'Stage Wedge L', color: 'green', icon: 'monitor' },
    { name: 'Stage Wedge R', color: 'green', icon: 'monitor' },
    { name: 'Sidefill', color: 'green', icon: 'monitor' },
    { name: 'Plate Reverb', color: 'magenta', icon: 'fx' },
    { name: 'Hall Reverb', color: 'magenta', icon: 'fx' },
    { name: 'Stereo Delay', color: 'magenta', icon: 'fx' },
    { name: 'Chorus FX', color: 'magenta', icon: 'fx' },
    { name: 'Drum Sub', color: 'red', icon: 'kick' },
    { name: 'Vocal Sub', color: 'red', icon: 'mic-lead' },
    { name: 'Broadcast Out', color: 'blue', icon: 'dj' },
    { name: 'Lobby Feed', color: 'blue', icon: 'dj' },
  ];
  for (let b = 0; b < 16; b++) {
    channels.push({
      id: 41 + b,
      type: 'bus',
      index: b,
      name: busNames[b].name,
      color: busNames[b].color as ChannelStripData['color'],
      icon: busNames[b].icon as ChannelStripData['icon'],
      invertColor: false,
      gain: 0,
      phantom48v: false,
      polarityInvert: false,
      lowCutEnabled: false,
      lowCutFreq: 80,
      delayMs: 0,
      gate: { enabled: false, threshold: -60, range: 20, attack: 5, hold: 20, release: 100, reduction: 0 },
      compressor: { enabled: b >= 12, threshold: -16, ratio: 3.5, knee: 2, attack: 25, hold: 0, release: 200, makeupGain: 2, mix: 100, reduction: 0 },
      eqEnabled: true,
      eqBands: [
        { id: 1, name: 'Low', enabled: true, type: 'lowshelf', frequency: 80, gain: 0, q: 1.0 },
        { id: 2, name: 'Low-Mid', enabled: true, type: 'peq', frequency: 350, gain: 0, q: 1.5 },
        { id: 3, name: 'High-Mid', enabled: true, type: 'peq', frequency: 2800, gain: 0, q: 1.5 },
        { id: 4, name: 'High', enabled: true, type: 'highshelf', frequency: 10000, gain: 0, q: 1.0 },
      ],
      fader: 0,
      faderLinear: 0.75,
      pan: 0,
      muted: false,
      solo: false,
      mainLR: b < 14,
      monoCenter: false,
      sends: [],
      dcaAssign: [],
      muteGroupAssign: [],
      meterLevel: -60,
      peakLevel: -60,
      hasClipped: false,
    });
  }

  // 4. Matrix 1-6 & Main Mono/Center & Main LR (IDs 57-64)
  const mtxNames = [
    { name: 'Matrix 1 (FOH)', color: 'white', icon: 'monitor' },
    { name: 'Matrix 2 (Sub)', color: 'white', icon: 'monitor' },
    { name: 'Matrix 3 (Delay)', color: 'white', icon: 'monitor' },
    { name: 'Matrix 4 (Front)', color: 'white', icon: 'monitor' },
    { name: 'Matrix 5 (Rec)', color: 'white', icon: 'monitor' },
    { name: 'Matrix 6 (Stream)', color: 'white', icon: 'monitor' },
    { name: 'Mono / Center', color: 'red', icon: 'monitor' },
    { name: 'Master L/R', color: 'red', icon: 'monitor' },
  ];
  for (let m = 0; m < 8; m++) {
    channels.push({
      id: 57 + m,
      type: m === 7 ? 'main' : 'matrix',
      index: m,
      name: mtxNames[m].name,
      color: mtxNames[m].color as ChannelStripData['color'],
      icon: mtxNames[m].icon as ChannelStripData['icon'],
      invertColor: false,
      gain: 0,
      phantom48v: false,
      polarityInvert: false,
      lowCutEnabled: false,
      lowCutFreq: 80,
      delayMs: 0,
      gate: { enabled: false, threshold: -60, range: 20, attack: 5, hold: 20, release: 100, reduction: 0 },
      compressor: { enabled: true, threshold: -12, ratio: 2.5, knee: 3, attack: 30, hold: 0, release: 250, makeupGain: 1, mix: 100, reduction: 0 },
      eqEnabled: true,
      eqBands: [
        { id: 1, name: 'Low', enabled: true, type: 'peq', frequency: 80, gain: 0, q: 1.0 },
        { id: 2, name: 'Low-Mid', enabled: true, type: 'peq', frequency: 300, gain: 0, q: 1.2 },
        { id: 3, name: 'High-Mid', enabled: true, type: 'peq', frequency: 3000, gain: 0, q: 1.2 },
        { id: 4, name: 'High', enabled: true, type: 'peq', frequency: 10000, gain: 0, q: 1.0 },
      ],
      fader: 0,
      faderLinear: 0.75,
      pan: 0,
      muted: false,
      solo: false,
      mainLR: true,
      monoCenter: false,
      sends: [],
      dcaAssign: [],
      muteGroupAssign: [],
      meterLevel: -60,
      peakLevel: -60,
      hasClipped: false,
    });
  }

  // 5. DCA Groups 1-8 (IDs 65-72)
  const dcaNames = [
    { name: 'DCA 1 Drums', color: 'red', icon: 'kick' },
    { name: 'DCA 2 Bass', color: 'green', icon: 'bass' },
    { name: 'DCA 3 Guitars', color: 'blue', icon: 'guitar-el' },
    { name: 'DCA 4 Keys', color: 'magenta', icon: 'keys' },
    { name: 'DCA 5 Brass', color: 'yellow', icon: 'brass' },
    { name: 'DCA 6 Lead Vox', color: 'red', icon: 'mic-lead' },
    { name: 'DCA 7 B-Vox', color: 'white', icon: 'mic' },
    { name: 'DCA 8 FX Ret', color: 'magenta', icon: 'fx' },
  ];
  for (let d = 0; d < 8; d++) {
    channels.push({
      id: 65 + d,
      type: 'dca',
      index: d,
      name: dcaNames[d].name,
      color: dcaNames[d].color as ChannelStripData['color'],
      icon: dcaNames[d].icon as ChannelStripData['icon'],
      invertColor: false,
      gain: 0,
      phantom48v: false,
      polarityInvert: false,
      lowCutEnabled: false,
      lowCutFreq: 80,
      delayMs: 0,
      gate: { enabled: false, threshold: -60, range: 20, attack: 5, hold: 20, release: 100, reduction: 0 },
      compressor: { enabled: false, threshold: -20, ratio: 2.0, knee: 1, attack: 20, hold: 0, release: 150, makeupGain: 0, mix: 100, reduction: 0 },
      eqEnabled: false,
      eqBands: [
        { id: 1, name: 'Low', enabled: false, type: 'peq', frequency: 100, gain: 0, q: 1.0 },
        { id: 2, name: 'Low-Mid', enabled: false, type: 'peq', frequency: 400, gain: 0, q: 1.0 },
        { id: 3, name: 'High-Mid', enabled: false, type: 'peq', frequency: 2500, gain: 0, q: 1.0 },
        { id: 4, name: 'High', enabled: false, type: 'peq', frequency: 10000, gain: 0, q: 1.0 },
      ],
      fader: 0,
      faderLinear: 0.75,
      pan: 0,
      muted: false,
      solo: false,
      mainLR: true,
      monoCenter: false,
      sends: [],
      dcaAssign: [],
      muteGroupAssign: [],
      meterLevel: -60,
      peakLevel: -60,
      hasClipped: false,
    });
  }

  return channels;
}

export function createDefaultPresets(): PresetProfile[] {
  return [
    {
      id: 'pre-lead-vox',
      name: 'Lead Vocal Air & Clarity',
      category: 'Vocal',
      author: 'M32 Pro Master',
      updatedAt: '2026-03-28T14:30:00Z',
      isCloudSynced: true,
      data: {
        name: 'Lead Vox Pro',
        lowCutEnabled: true,
        lowCutFreq: 105,
        eqBands: [
          { id: 1, name: 'Low Shelf', enabled: true, type: 'lowshelf', frequency: 120, gain: -1.5, q: 1.0 },
          { id: 2, name: 'Body / De-Mud', enabled: true, type: 'peq', frequency: 320, gain: -3.0, q: 2.2 },
          { id: 3, name: 'Intelligibility', enabled: true, type: 'peq', frequency: 3200, gain: 2.8, q: 1.8 },
          { id: 4, name: 'Air Sheen', enabled: true, type: 'highshelf', frequency: 11500, gain: 3.5, q: 0.9 },
        ],
        compressor: {
          enabled: true,
          threshold: -19,
          ratio: 3.5,
          knee: 3,
          attack: 10,
          hold: 5,
          release: 140,
          makeupGain: 3.5,
          mix: 100,
          reduction: 0,
        },
      },
    },
    {
      id: 'pre-kick-thump',
      name: 'Modern Punchy Kick',
      category: 'Drums',
      author: 'Live Sound Lab',
      updatedAt: '2026-03-29T10:15:00Z',
      isCloudSynced: true,
      data: {
        name: 'Punchy Kick',
        lowCutEnabled: true,
        lowCutFreq: 35,
        eqBands: [
          { id: 1, name: 'Sub Thump', enabled: true, type: 'peq', frequency: 58, gain: 4.5, q: 1.8 },
          { id: 2, name: 'Boxiness Scoop', enabled: true, type: 'peq', frequency: 380, gain: -6.5, q: 2.5 },
          { id: 3, name: 'Beater Click', enabled: true, type: 'peq', frequency: 3800, gain: 4.0, q: 2.0 },
          { id: 4, name: 'High Cut', enabled: true, type: 'highcut', frequency: 12000, gain: 0, q: 1.0 },
        ],
      },
    },
    {
      id: 'pre-bass-solid',
      name: 'Fat Tight Bass DI',
      category: 'Bass',
      author: 'Audio Engineering Dept',
      updatedAt: '2026-03-27T08:00:00Z',
      isCloudSynced: true,
      data: {
        name: 'Bass Tight DI',
        lowCutEnabled: true,
        lowCutFreq: 40,
        eqBands: [
          { id: 1, name: 'Deep Lows', enabled: true, type: 'lowshelf', frequency: 95, gain: 3.0, q: 1.0 },
          { id: 2, name: 'Fret Clack Cut', enabled: true, type: 'peq', frequency: 750, gain: -3.5, q: 2.0 },
          { id: 3, name: 'Finger Def', enabled: true, type: 'peq', frequency: 1800, gain: 2.0, q: 1.4 },
          { id: 4, name: 'Smooth Top', enabled: true, type: 'highcut', frequency: 8000, gain: 0, q: 1.0 },
        ],
      },
    },
    {
      id: 'pre-acoustic-gtr',
      name: 'Sparkle Acoustic Guitar',
      category: 'Guitar',
      author: 'Studio Tech',
      updatedAt: '2026-03-30T11:20:00Z',
      isCloudSynced: true,
      data: {
        name: 'Acoustic Sparkle',
        lowCutEnabled: true,
        lowCutFreq: 110,
        eqBands: [
          { id: 1, name: 'Soundhole Scoop', enabled: true, type: 'peq', frequency: 220, gain: -4.0, q: 2.4 },
          { id: 2, name: 'Wood Res', enabled: true, type: 'peq', frequency: 900, gain: -1.5, q: 1.5 },
          { id: 3, name: 'Pick Attack', enabled: true, type: 'peq', frequency: 3500, gain: 2.0, q: 1.8 },
          { id: 4, name: 'Silk Top', enabled: true, type: 'highshelf', frequency: 12000, gain: 3.8, q: 0.8 },
        ],
      },
    },
  ];
}

export function createDefaultProfiles(): UserEngineerProfile[] {
  return [
    {
      id: 'prof-foh-1',
      name: 'FOH Head Engineer',
      role: 'FOH Head Engineer',
      canModifyPreamp: true,
      canModifyRouting: true,
      lastActive: new Date().toISOString(),
    },
    {
      id: 'prof-mon-1',
      name: 'Stage Monitor Tech',
      role: 'Monitor Engineer',
      allowedBusses: [1, 2, 3, 4, 5, 6, 7, 8],
      canModifyPreamp: true,
      canModifyRouting: false,
      lastActive: new Date().toISOString(),
    },
    {
      id: 'prof-iem-band',
      name: 'Lead Singer IEM (Bus 1 Only)',
      role: 'Musician IEM',
      allowedBusses: [1],
      canModifyPreamp: false,
      canModifyRouting: false,
      lastActive: new Date().toISOString(),
    },
  ];
}

class StorageService {
  public loadChannels(): ChannelStripData[] {
    try {
      const raw = localStorage.getItem(CHANNELS_KEY);
      if (raw) {
        const loaded: ChannelStripData[] = JSON.parse(raw);
        if (Array.isArray(loaded) && loaded.length >= 72) {
          return loaded;
        } else if (Array.isArray(loaded) && loaded.length > 0) {
          const defaults = createDefaultChannels();
          const merged = [...loaded, ...defaults.slice(loaded.length)];
          this.saveChannels(merged);
          return merged;
        }
      }
    } catch {
      // ignore
    }
    const defaultChannels = createDefaultChannels();
    this.saveChannels(defaultChannels);
    return defaultChannels;
  }

  public saveChannels(channels: ChannelStripData[]) {
    try {
      localStorage.setItem(CHANNELS_KEY, JSON.stringify(channels));
    } catch {
      // ignore
    }
  }

  public loadPresets(): PresetProfile[] {
    try {
      const raw = localStorage.getItem(PRESETS_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // ignore
    }
    const defaults = createDefaultPresets();
    this.savePresets(defaults);
    return defaults;
  }

  public savePresets(presets: PresetProfile[]) {
    try {
      localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
    } catch {
      // ignore
    }
  }

  public loadProfiles(): UserEngineerProfile[] {
    try {
      const raw = localStorage.getItem(PROFILES_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // ignore
    }
    const defaults = createDefaultProfiles();
    this.saveProfiles(defaults);
    return defaults;
  }

  public saveProfiles(profiles: UserEngineerProfile[]) {
    try {
      localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    } catch {
      // ignore
    }
  }

  public getActiveProfile(): UserEngineerProfile {
    try {
      const raw = localStorage.getItem(ACTIVE_PROFILE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // ignore
    }
    const defaults = this.loadProfiles();
    return defaults[0];
  }

  public setActiveProfile(profile: UserEngineerProfile) {
    try {
      localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(profile));
    } catch {
      // ignore
    }
  }

  public getLastCloudSync(): string {
    return localStorage.getItem(CLOUD_SYNC_TIME_KEY) || '2026-10-06 00:30 UTC';
  }

  public setLastCloudSync(timeStr: string) {
    localStorage.setItem(CLOUD_SYNC_TIME_KEY, timeStr);
  }
}

export const storageService = new StorageService();
