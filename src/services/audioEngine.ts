/**
 * Web Audio Engine for M32 Mixer
 * Provides real-time virtual multitrack playback, live acoustic microphone RTA,
 * signal generator (Pink noise / 1kHz), FFT spectrum analysis, and feedback detection.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;

  // Virtual Band instruments
  private intervalId: number | null = null;
  private beatCount: number = 0;
  private isVirtualBandPlaying: boolean = false;
  private testToneOsc: OscillatorNode | null = null;
  private testToneGain: GainNode | null = null;

  // Live dynamic level cache for channels (dBFS)
  private channelLevels: number[] = new Array(72).fill(-60);
  private channelClips: boolean[] = new Array(72).fill(false);

  // Callbacks
  private onLevelsUpdate?: (levels: number[]) => void;
  private onClipAlert?: (chIndex: number, level: number) => void;
  private onFeedbackWarning?: (frequencyHz: number, levelDb: number) => void;

  public init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.5;

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 1024;
      this.analyser.smoothingTimeConstant = 0.85;

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }
  }

  public async resumeContext() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    this.isRunning = true;
  }

  public setMasterVolume(levelDb: number, isMuted: boolean) {
    if (!this.masterGain || !this.ctx) return;
    if (isMuted) {
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      return;
    }
    // Convert -90..+10 dB to linear
    const linear = levelDb <= -85 ? 0 : Math.pow(10, levelDb / 20);
    this.masterGain.gain.setValueAtTime(Math.min(1.5, Math.max(0, linear * 0.2)), this.ctx.currentTime);
  }

  public async startMicrophoneRta(): Promise<boolean> {
    try {
      await this.resumeContext();
      if (!this.ctx || !this.analyser) return false;

      if (this.micStream) {
        this.stopMicrophone();
      }

      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      this.micSource = this.ctx.createMediaStreamSource(this.micStream);
      // Connect to analyser without sending to master output to avoid acoustic feedback in room
      this.micSource.connect(this.analyser);
      return true;
    } catch {
      return false;
    }
  }

  public stopMicrophone() {
    if (this.micSource) {
      try {
        this.micSource.disconnect();
      } catch {
        // ignore
      }
      this.micSource = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }
  }

  public isMicActive(): boolean {
    return this.micStream !== null;
  }

  public startTestTone(type: '1khz' | '100hz' | 'pink') {
    this.resumeContext();
    if (!this.ctx || !this.masterGain) return;
    this.stopTestTone();

    if (type === 'pink') {
      // Pink noise buffer
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
      const noiseNode = this.ctx.createBufferSource();
      noiseNode.buffer = noiseBuffer;
      noiseNode.loop = true;
      this.testToneGain = this.ctx.createGain();
      this.testToneGain.gain.value = 0.15;
      noiseNode.connect(this.testToneGain);
      this.testToneGain.connect(this.masterGain);
      noiseNode.start();
      (this.testToneOsc as unknown as { stopNode: () => void }) = { stopNode: () => noiseNode.stop() };
    } else {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = type === '1khz' ? 1000 : 100;
      this.testToneGain = this.ctx.createGain();
      this.testToneGain.gain.value = 0.15;
      osc.connect(this.testToneGain);
      this.testToneGain.connect(this.masterGain);
      osc.start();
      this.testToneOsc = osc;
    }
  }

  public stopTestTone() {
    if (this.testToneOsc) {
      try {
        if ('stop' in this.testToneOsc) {
          this.testToneOsc.stop();
        } else if ((this.testToneOsc as unknown as { stopNode?: () => void }).stopNode) {
          (this.testToneOsc as unknown as { stopNode: () => void }).stopNode();
        }
      } catch {
        // ignore
      }
      this.testToneOsc = null;
    }
    if (this.testToneGain) {
      try {
        this.testToneGain.disconnect();
      } catch {
        // ignore
      }
      this.testToneGain = null;
    }
  }

  public startVirtualBand() {
    this.resumeContext();
    if (this.isVirtualBandPlaying) return;
    this.isVirtualBandPlaying = true;

    // Schedule 120 BPM 16th notes sequencer
    const intervalMs = 125; // 120 bpm eighth notes
    this.intervalId = window.setInterval(() => {
      this.stepVirtualBand();
    }, intervalMs);
  }

  public stopVirtualBand() {
    this.isVirtualBandPlaying = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public toggleVirtualBand(): boolean {
    if (this.isVirtualBandPlaying) {
      this.stopVirtualBand();
      return false;
    } else {
      this.startVirtualBand();
      return true;
    }
  }

  public isBandPlaying(): boolean {
    return this.isVirtualBandPlaying;
  }

  private stepVirtualBand() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const step = this.beatCount % 16;
    this.beatCount++;

    // 1. Kick Drum (Ch 1)
    if (step === 0 || step === 4 || step === 8 || step === 12 || step === 14) {
      this.triggerKick(now);
      this.setSimulatedLevel(0, -6 + Math.random() * 4);
    }

    // 2. Snare Drum (Ch 2)
    if (step === 4 || step === 12) {
      this.triggerSnare(now);
      this.setSimulatedLevel(1, -5 + Math.random() * 3);
    }

    // 3. Hi-Hat (Ch 3)
    if (step % 2 === 0 || step === 7 || step === 15) {
      this.triggerHiHat(now, step % 4 === 0);
      this.setSimulatedLevel(2, -14 + Math.random() * 5);
    }

    // 4. Toms (Ch 4)
    if (step === 10 || step === 11 || step === 15) {
      this.triggerTom(now, step === 10 ? 180 : 120);
      this.setSimulatedLevel(3, -10 + Math.random() * 4);
    }

    // 5. Bass Guitar (Ch 5)
    if (step % 2 === 0) {
      const bassNotes = [55, 55, 65.41, 73.42, 55, 82.41, 73.42, 65.41];
      const freq = bassNotes[Math.floor(step / 2) % bassNotes.length];
      this.triggerBass(now, freq);
      this.setSimulatedLevel(4, -8 + Math.random() * 3);
    }

    // 6. Lead Vocal (Ch 6)
    if (step >= 2 && step <= 14 && step % 3 === 0) {
      const vocalFreqs = [440, 523.25, 587.33, 659.25, 392];
      const freq = vocalFreqs[step % vocalFreqs.length];
      this.triggerVocal(now, freq);
      const isLoud = Math.random() > 0.85;
      const level = isLoud ? 0.8 : -7 + Math.random() * 5; // occasional clip
      this.setSimulatedLevel(5, level);
      if (level > 0 && this.onClipAlert) {
        this.onClipAlert(5, level);
      }
    }

    // 7. Electric Guitar (Ch 7)
    if (step === 1 || step === 5 || step === 9 || step === 13) {
      this.triggerGuitarChord(now);
      this.setSimulatedLevel(6, -11 + Math.random() * 4);
    }

    // Decay simulated channel levels
    for (let i = 0; i < 32; i++) {
      if (i > 6) {
        // ambient low noise for other channels
        const ambient = -45 + Math.random() * 8;
        this.channelLevels[i] = Math.max(-60, this.channelLevels[i] * 0.85 + ambient * 0.15);
      } else {
        this.channelLevels[i] = Math.max(-60, this.channelLevels[i] - 3.5);
      }
    }

    // Aux Inputs (IDs 33-40 -> idx 32-39)
    for (let a = 32; a < 40; a++) {
      this.channelLevels[a] = -50 + Math.random() * 6;
    }

    // Mix Buses (IDs 41-56 -> idx 40-55)
    // Bus 1 (Lead Vox IEM): follows Vocal
    this.channelLevels[40] = Math.max(-60, this.channelLevels[5] - 1);
    // Bus 2 (Drum IEM): follows Kick & Snare
    this.channelLevels[41] = Math.max(-60, Math.max(this.channelLevels[0], this.channelLevels[1]) - 1.5);
    // Bus 3 (Bass IEM): follows Bass
    this.channelLevels[42] = Math.max(-60, this.channelLevels[4] - 2);
    // Bus 4 (Guitar IEM): follows Guitar
    this.channelLevels[43] = Math.max(-60, this.channelLevels[6] - 2);
    // Bus 9 (Reverb FX): follows Vocal/Snare
    this.channelLevels[48] = Math.max(-60, Math.max(this.channelLevels[5], this.channelLevels[1]) - 4);
    // Bus 13 (Drum Subgroup): follows drum kit
    this.channelLevels[52] = Math.max(-60, Math.max(this.channelLevels[0], this.channelLevels[1], this.channelLevels[2]));
    // Other buses
    for (let b = 44; b < 56; b++) {
      if (b !== 48 && b !== 52) {
        this.channelLevels[b] = Math.max(-60, this.channelLevels[b] * 0.9 - 2);
      }
    }

    // Matrix 1-6 & Main (idx 56-63)
    const activeMax = Math.max(-60, ...this.channelLevels.slice(0, 32));
    for (let m = 56; m < 64; m++) {
      this.channelLevels[m] = Math.max(-60, activeMax - 2 + Math.random());
    }

    // DCAs (idx 64-71)
    this.channelLevels[64] = this.channelLevels[52]; // DCA 1 Drums
    this.channelLevels[65] = this.channelLevels[4];  // DCA 2 Bass
    this.channelLevels[66] = this.channelLevels[6];  // DCA 3 Guitars
    this.channelLevels[69] = this.channelLevels[5];  // DCA 6 Lead Vox
    for (let d = 67; d < 72; d++) {
      if (d !== 69) {
        this.channelLevels[d] = Math.max(-60, this.channelLevels[d] * 0.9 - 2);
      }
    }

    if (this.onLevelsUpdate) {
      this.onLevelsUpdate([...this.channelLevels]);
    }
  }

  private setSimulatedLevel(chIdx: number, db: number) {
    this.channelLevels[chIdx] = db;
    if (db >= 0) {
      this.channelClips[chIdx] = true;
      if (this.onClipAlert) {
        this.onClipAlert(chIdx, db);
      }
    }
  }

  private triggerKick(time: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(45, time + 0.08);
    gain.gain.setValueAtTime(0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.25);
  }

  private triggerSnare(time: number) {
    if (!this.ctx || !this.masterGain) return;
    // Tone
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, time);
    oscGain.gain.setValueAtTime(0.3, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.15);

    // Snap noise
    const bufferSize = this.ctx.sampleRate * 0.2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(time);
    noise.stop(time + 0.2);
  }

  private triggerHiHat(time: number, accent: boolean) {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 0.06;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7500;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(accent ? 0.35 : 0.18, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + (accent ? 0.08 : 0.04));
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(time);
    noise.stop(time + 0.08);
  }

  private triggerTom(time: number, freq: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.6, time + 0.2);
    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.25);
  }

  private triggerBass(time: number, freq: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, time);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.2);
  }

  private triggerVocal(time: number, freq: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    const vibrato = this.ctx.createOscillator();
    vibrato.frequency.value = 5.5;
    const vibGain = this.ctx.createGain();
    vibGain.gain.value = 6;
    vibrato.connect(vibGain);
    vibGain.connect(osc.frequency);
    vibrato.start(time);
    vibrato.stop(time + 0.3);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.28, time + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.3);
  }

  private triggerGuitarChord(time: number) {
    if (!this.ctx || !this.masterGain) return;
    const freqs = [196, 246.94, 293.66, 392];
    freqs.forEach((f) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = f;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(time);
      osc.stop(time + 0.35);
    });
  }

  public getRtaFrequencyData(): Uint8Array {
    if (!this.analyser) {
      return new Uint8Array(64).fill(10);
    }
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);

    // Simple feedback detection algorithm: check for anomalous spikes in mid-high spectrum
    if (this.onFeedbackWarning && Math.random() < 0.05) {
      for (let i = 20; i < data.length - 10; i++) {
        const val = data[i];
        const left = data[i - 1];
        const right = data[i + 1];
        if (val > 235 && val - left > 40 && val - right > 40) {
          const nyquist = (this.ctx?.sampleRate || 48000) / 2;
          const freq = Math.round((i / data.length) * nyquist);
          this.onFeedbackWarning(freq, ((val - 255) / 255) * 60);

          // If anti-feedback is armed, automatically engage notch filter
          if (this.isAntiFeedbackActive) {
            this.handleAutoFeedbackSuppress(freq);
          }
          break;
        }
      }
    }

    return data;
  }

  // --- ANTI-FEEDBACK DSP & FBQ2496 ENGINE ---
  private isAntiFeedbackActive: boolean = true;
  private activeFeedbackHowlOsc: OscillatorNode | null = null;
  private activeFeedbackHowlGain: GainNode | null = null;
  private onFeedbackNotchTriggered?: (info: { id: number; freq: number; depth: number; totalActive: number }) => void;

  private feedbackNotches: {
    id: number;
    freq: number;
    depth: number;
    active: boolean;
    type: 'live' | 'fixed';
  }[] = [
    { id: 1, freq: 2450, depth: -28, active: true, type: 'fixed' },
    { id: 2, freq: 3820, depth: -34, active: true, type: 'fixed' },
    { id: 3, freq: 6180, depth: -24, active: true, type: 'live' },
    { id: 4, freq: 1150, depth: -18, active: true, type: 'live' },
    { id: 5, freq: 4750, depth: -30, active: true, type: 'live' },
    { id: 6, freq: 8200, depth: -26, active: true, type: 'live' },
  ];

  public setAntiFeedbackActive(active: boolean) {
    this.isAntiFeedbackActive = active;
    if (!active && this.activeFeedbackHowlGain && this.ctx) {
      // If disabled during howl, allow to resonate
    }
  }

  public getAntiFeedbackActive(): boolean {
    return this.isAntiFeedbackActive;
  }

  public getFeedbackNotches() {
    return [...this.feedbackNotches];
  }

  public handleAutoFeedbackSuppress(freq: number) {
    // Find free slot or update existing
    const existingIdx = this.feedbackNotches.findIndex((n) => Math.abs(n.freq - freq) < 80);
    if (existingIdx >= 0) {
      this.feedbackNotches[existingIdx].depth = Math.min(-36, this.feedbackNotches[existingIdx].depth - 6);
      this.feedbackNotches[existingIdx].active = true;
    } else if (this.feedbackNotches.length < 24) {
      const newId = this.feedbackNotches.length + 1;
      this.feedbackNotches.push({
        id: newId,
        freq: Math.round(freq),
        depth: -32,
        active: true,
        type: 'live',
      });
      if (this.onFeedbackNotchTriggered) {
        this.onFeedbackNotchTriggered({
          id: newId,
          freq: Math.round(freq),
          depth: -32,
          totalActive: this.feedbackNotches.filter((n) => n.active).length,
        });
      }
    }
  }

  public triggerSimulatedFeedback(targetFreq?: number): { freq: number; killed: boolean } {
    this.resumeContext();
    if (!this.ctx || !this.masterGain) return { freq: targetFreq || 3150, killed: false };

    const commonHowlFreqs = [2450, 3150, 3820, 4200, 5000, 6180, 7800];
    const freq = targetFreq || commonHowlFreqs[Math.floor(Math.random() * commonHowlFreqs.length)];

    // Stop existing howl if any
    this.panicKillFeedback();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Sudden acoustic runaway build up
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.exponentialRampToValueAtTime(0.22, now + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);

    this.activeFeedbackHowlOsc = osc;
    this.activeFeedbackHowlGain = gain;

    // Trigger feedback warning callback
    if (this.onFeedbackWarning) {
      this.onFeedbackWarning(freq, 2.5);
    }

    if (this.isAntiFeedbackActive) {
      // High-speed notch suppression in < 0.20s (180ms)
      const suppressTime = now + 0.18;
      gain.gain.setValueAtTime(0.22, suppressTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, suppressTime + 0.08);

      setTimeout(() => {
        this.handleAutoFeedbackSuppress(freq);
      }, 160);

      osc.stop(suppressTime + 0.15);
      setTimeout(() => {
        if (this.activeFeedbackHowlOsc === osc) {
          this.activeFeedbackHowlOsc = null;
          this.activeFeedbackHowlGain = null;
        }
      }, 350);

      return { freq, killed: true };
    } else {
      // Anti-feedback is off: prolonged screech for 1.8 seconds before safety fade
      gain.gain.setValueAtTime(0.25, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
      osc.stop(now + 1.85);

      setTimeout(() => {
        if (this.activeFeedbackHowlOsc === osc) {
          this.activeFeedbackHowlOsc = null;
          this.activeFeedbackHowlGain = null;
        }
      }, 1900);

      return { freq, killed: false };
    }
  }

  public panicKillFeedback() {
    if (this.activeFeedbackHowlGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.activeFeedbackHowlGain.gain.setValueAtTime(this.activeFeedbackHowlGain.gain.value, now);
      this.activeFeedbackHowlGain.gain.exponentialRampToValueAtTime(0.00001, now + 0.04);
    }
    if (this.activeFeedbackHowlOsc) {
      try {
        this.activeFeedbackHowlOsc.stop();
      } catch {
        // ignore
      }
      this.activeFeedbackHowlOsc = null;
      this.activeFeedbackHowlGain = null;
    }
  }

  public clearDynamicNotches() {
    this.feedbackNotches = this.feedbackNotches.filter((n) => n.type === 'fixed');
  }

  public clearAllNotches() {
    this.feedbackNotches = [];
  }

  public ringOutRoom(): number[] {
    // Calibrate 4-8 fixed acoustic room modes
    const calibratedRoomFreqs = [185, 420, 890, 1650, 2450, 3820, 5400, 7200];
    this.feedbackNotches = calibratedRoomFreqs.map((f, idx) => ({
      id: idx + 1,
      freq: f,
      depth: -32,
      active: true,
      type: 'fixed',
    }));
    return calibratedRoomFreqs;
  }

  public setCallbacks(callbacks: {
    onLevelsUpdate?: (levels: number[]) => void;
    onClipAlert?: (chIndex: number, level: number) => void;
    onFeedbackWarning?: (frequencyHz: number, levelDb: number) => void;
    onFeedbackNotchTriggered?: (info: { id: number; freq: number; depth: number; totalActive: number }) => void;
  }) {
    this.onLevelsUpdate = callbacks.onLevelsUpdate;
    this.onClipAlert = callbacks.onClipAlert;
    this.onFeedbackWarning = callbacks.onFeedbackWarning;
    this.onFeedbackNotchTriggered = callbacks.onFeedbackNotchTriggered;
  }
}

export const audioEngine = new AudioEngine();
