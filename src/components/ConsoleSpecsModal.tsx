import React, { useState } from 'react';
import {
  X,
  Cpu,
  Radio,
  Sliders,
  Layers,
  Sparkles,
  Zap,
  Volume2,
  Tv,
  HardDrive,
  Laptop,
  Smartphone,
  Shield,
  Activity,
  CheckCircle2,
  ExternalLink,
  Car,
  Flame,
} from 'lucide-react';

interface ConsoleSpecsModalProps {
  onClose: () => void;
  onOpenNetwork?: () => void;
}

interface M32FeatureItem {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  category: 'Audio Architecture' | 'Physical Design' | 'Processing & FX' | 'Connectivity & Control';
  badge: string;
  icon: React.ReactNode;
  specs: { label: string; value: string }[];
  description: string;
  technicalDetails: string[];
}

export const M32_OFFICIAL_16_FEATURES: M32FeatureItem[] = [
  {
    id: 'inputs-40',
    number: 1,
    title: 'Up to 40 Simultaneous Input Channels',
    subtitle: 'Live performance and studio recording digital console',
    category: 'Audio Architecture',
    badge: '40 CHANNELS',
    icon: <Volume2 className="w-5 h-5 text-amber-400" />,
    specs: [
      { label: 'Mic Preamps', value: '32 XLR Inputs' },
      { label: 'Aux Inputs', value: '6 Balanced 1/4" TRS' },
      { label: 'USB Digital In', value: '2 Track Stereo Playback' },
      { label: 'Talkback Mic', value: '1 Front XLR' },
    ],
    description:
      'Engineered for both high-stakes live concert touring and precision studio tracking. Processes 40 discrete inputs simultaneously with independent channel strip EQ, dynamics, delay, and routing.',
    technicalDetails: [
      '32 primary channel strips with dedicated Class-A preamps',
      '6 auxiliary input channels with digital gain trim & 4-band parametric EQ',
      'Dual-track USB recorder/player stereo inputs directly assignable to fader surface',
      'Dedicated talkback circuit with internal/external mic assign and dim control',
    ],
  },
  {
    id: 'midas-preamps-32',
    number: 2,
    title: '32 Award-Winning Midas Microphone Preamplifiers',
    subtitle: 'The legendary warm, organic Midas British sound',
    category: 'Audio Architecture',
    badge: 'MIDAS PRO PRE',
    icon: <Zap className="w-5 h-5 text-amber-400" />,
    specs: [
      { label: 'Topology', value: 'Discrete True Class-A' },
      { label: 'Gain Range', value: '-2.5 dB to +65 dB' },
      { label: 'THD+N', value: '< 0.006% (at 0 dBu)' },
      { label: 'EIN (150Ω)', value: '-128 dBu' },
    ],
    description:
      'Derived directly from the world-renowned Midas Heritage, XL4, and PRO Series touring consoles. Delivers ultra-low noise, high common-mode rejection, and that iconic warm analog saturation when driven.',
    technicalDetails: [
      'Independently switchable +48V phantom power per channel',
      'Digitally controlled analog gain steps (0.5 dB precision)',
      'High-pass / Low-cut filter sweepable from 20 Hz to 400 Hz (12 dB/oct)',
      'Polarity / Phase reverse switch on each preamp',
    ],
  },
  {
    id: 'mix-buses-25',
    number: 3,
    title: '25 Time-Aligned and Phase-Coherent Mix Buses',
    subtitle: 'Zero comb filtering across in-ear monitors & matrices',
    category: 'Audio Architecture',
    badge: 'SAMPLE ALIGNED',
    icon: <Layers className="w-5 h-5 text-cyan-400" />,
    specs: [
      { label: 'Mix Buses', value: '16 Aux/Subgroup/IEM' },
      { label: 'Matrix Buses', value: '6 User Matrices' },
      { label: 'Main Buses', value: 'LCR (L, R, Mono/Center)' },
      { label: 'Latency Align', value: 'Sample-Accurate Phase Coherence' },
    ],
    description:
      'All 25 buses are automatically delay-compensated so that all signals arriving at IEMs, stage wedges, or PA speaker zones remain perfectly phase-aligned with zero acoustic comb filtering.',
    technicalDetails: [
      '16 flexible mix buses switchable between pre-fader (monitor) or post-fader (FX send/subgroup)',
      '6 matrix outputs with dedicated 6-band parametric EQ and dynamics',
      'Main Left, Right, and Center/Mono buses with independent master faders',
      'Comprehensive bus-to-bus and channel-to-bus insert routing',
    ],
  },
  {
    id: 'aes50-96',
    number: 4,
    title: 'AES50 Networking: Up to 96 Inputs & 96 Outputs',
    subtitle: 'Klark Teknik SuperMAC digital audio transmission',
    category: 'Connectivity & Control',
    badge: 'SUPERMAC AES50',
    icon: <Radio className="w-5 h-5 text-emerald-400" />,
    specs: [
      { label: 'Ports', value: 'AES50-A & AES50-B' },
      { label: 'Capacity', value: '48 In / 48 Out per port' },
      { label: 'Cable', value: 'Standard Cat5e Shielded STP' },
      { label: 'Distance', value: 'Up to 100 meters (330 ft)' },
    ],
    description:
      'Industry-standard Klark Teknik SuperMAC technology transmits uncompressed 24-bit audio with ultra-low deterministic latency across standard shielded Ethernet cables.',
    technicalDetails: [
      'Total network capacity: 96 bi-directional channels at 48 kHz',
      'Sub-millisecond transmission latency (approx. 62.5 microseconds per hop)',
      'Instant plug-and-play synchronization with Midas DL16, DL32, DL251 stage boxes',
      'Redundant cable fallback linking between Port A and Port B',
    ],
  },
  {
    id: 'converters-192khz',
    number: 5,
    title: '192 kHz ADC and DAC Converters',
    subtitle: 'Audiophile conversion for outstanding dynamic range',
    category: 'Audio Architecture',
    badge: '192 kHz / 24-BIT',
    icon: <Activity className="w-5 h-5 text-amber-400" />,
    specs: [
      { label: 'Resolution', value: '24-Bit / 192 kHz Capable' },
      { label: 'Dynamic Range', value: '114 dB (A-Weighted)' },
      { label: 'Internal Clock', value: 'Ultra-Low Jitter Word Clock' },
      { label: 'Frequency Resp.', value: '10 Hz - 22 kHz (±0.5 dB)' },
    ],
    description:
      'High-end audiophile-grade Cirrus Logic/AKM multi-bit delta-sigma converters ensure pure, uncolored analog-to-digital and digital-to-analog reproduction with pristine transient detail.',
    technicalDetails: [
      '114 dB A-weighted dynamic range preserves whisper-quiet room decays and massive drum hits',
      'Negligible inter-channel crosstalk (> 100 dB rejection at 1 kHz)',
      'Synchronous phase-locked loop clock distribution throughout all I/O cards',
      'Transparent high-frequency extension beyond the audible audio spectrum',
    ],
  },
  {
    id: 'bentley-design',
    number: 6,
    title: 'Industry-Leading Design by Bentley Motors Designer',
    subtitle: 'Rajesh Kutty styling: Where luxury automotive meets pro audio',
    category: 'Physical Design',
    badge: 'BENTLEY MOTORS STYLING',
    icon: <Car className="w-5 h-5 text-amber-300" />,
    specs: [
      { label: 'Designer', value: 'Rajesh Kutty (Bentley Motors)' },
      { label: 'Ergonomics', value: 'Raked Tactile Console Angle' },
      { label: 'Aesthetics', value: 'Aerodynamic Automotive Sculpting' },
      { label: 'Illumination', value: 'Stealth Backlit Controls' },
    ],
    description:
      'World-famous luxury automobile designer Rajesh Kutty crafted the M32’s exterior form factor. The console combines automotive ergonomics, fluid curves, and fighter-jet cockpit visibility.',
    technicalDetails: [
      'Sweeping aerodynamic profile with natural wrist rest contour',
      'Tactile rotary knobs engineered with automotive-grade torque resistance',
      'Color-contrast backlit buttons for optimal readability under bright stage lighting and dark FOH booths',
      'Prestige gold-and-black branding badge inspired by British motorsport heritage',
    ],
  },
  {
    id: 'chassis-carbon',
    number: 7,
    title: 'Carbon Fibre, Aluminium & High-Impact Steel Structure',
    subtitle: 'Tour-proven lightweight rigid composite chassis',
    category: 'Physical Design',
    badge: 'AEROSPACE CHASSIS',
    icon: <Shield className="w-5 h-5 text-zinc-300" />,
    specs: [
      { label: 'Top Plate', value: 'Carbon Fibre Sub-Chassis' },
      { label: 'Frame', value: 'Extruded Aircraft Aluminium' },
      { label: 'Base Plate', value: 'Cold-Rolled High-Impact Steel' },
      { label: 'Weight', value: 'Lightweight Tour Mobility (25 kg)' },
    ],
    description:
      'Built like a high-performance supercar. Space-age materials provide extraordinary torsional rigidity, shielding delicate audio circuitry from RF interference while keeping overall weight manageable.',
    technicalDetails: [
      'Genuine woven carbon-fibre top plates reduce weight while adding extreme impact resistance',
      'Extruded aluminium exoskeleton dissipates heat silently without noisy internal chassis fans',
      'Reinforced steel base plate protects internal ribbon cables from road bumps and vibration',
      'Touring-grade flight-case ready dimensions and drop-tested ruggedness',
    ],
  },
  {
    id: 'dsp-40bit',
    number: 8,
    title: '40-Bit Floating Point Digital Signal Processing',
    subtitle: 'Virtually unlimited dynamic range with zero internal clipping',
    category: 'Processing & FX',
    badge: '40-BIT FLOAT DSP',
    icon: <Cpu className="w-5 h-5 text-cyan-400" />,
    specs: [
      { label: 'DSP Word Length', value: '40-Bit Floating Point' },
      { label: 'Internal Headroom', value: '> 1500 dB Headroom' },
      { label: 'Latency (In to Out)', value: '0.8 ms (Analog In to Out)' },
      { label: 'Accumulator', value: 'Infinite Non-Clipped Summing' },
    ],
    description:
      'Dual SHARC DSP engines process audio in 40-bit floating point arithmetic. Summing buses never distort internally, maintaining pristine acoustic definition even under heavy multi-channel load.',
    technicalDetails: [
      'Zero inter-stage clipping between EQ, Gate, Compressor, and Insert FX modules',
      'Ultra-low deterministic latency (0.8 ms from stage mic input to front-of-house PA output)',
      'Sub-sample phase coherence across all 40 input channels and 25 mix buses',
      'Massive DSP throughput capable of running 8 stereo multi-FX racks alongside full channel processing',
    ],
  },
  {
    id: 'dca-mute-groups',
    number: 9,
    title: '8 DCA Groups and 6 Mute Groups',
    subtitle: 'Effortless master sub-mixing & instant silence control',
    category: 'Processing & FX',
    badge: '8 DCA / 6 MUTE',
    icon: <Sliders className="w-5 h-5 text-amber-400" />,
    specs: [
      { label: 'DCA Groups', value: '8 Digitally Controlled Amps' },
      { label: 'Mute Groups', value: '6 Fast Hardware Mutes' },
      { label: 'DCA Spill', value: 'One-Touch Channel Recall' },
      { label: 'Scribble Strips', value: 'Color & Icon Coded' },
    ],
    description:
      'Control complex 40-channel bands with 8 motorized DCA faders (VCA style) without altering bus send balances. 6 Mute Groups mute entire instrument groups or FX returns with a single tap.',
    technicalDetails: [
      'DCA 1-8 control overall levels of Drums, Bass, Guitars, Horns, Vocals, and FX Returns',
      'VCA-style operation maintains relative send ratios to monitor buses',
      '6 Mute Groups mute all stage mics, drums, or FX reverbs during between-song chatter',
      'Instant DCA Spill mode brings assigned channels directly to center faders',
    ],
  },
  {
    id: 'fx-engines-8',
    number: 10,
    title: '8 Stereo Signal Processing Effects Engines',
    subtitle: '16 True Physical Modeling vintage hardware plugins',
    category: 'Processing & FX',
    badge: '8 STEREO RACKS',
    icon: <Sparkles className="w-5 h-5 text-amber-300" />,
    specs: [
      { label: 'Rack Slots', value: '8 True Stereo (or 16 Mono)' },
      { label: 'Physical Models', value: '16 Legendary Studio Processors' },
      { label: 'Sidechain', value: 'Full Frequency Key Filter' },
      { label: 'Routing', value: 'Insert or Send/Return' },
    ],
    description:
      'No outboard hardware racks required. 8 stereo DSP engines accurately recreate the circuit behaviors, tube non-linearities, and optical cells of the world’s most expensive studio gear.',
    technicalDetails: [
      'Includes Klark Teknik DN360 31-band GEQ, Lexicon 480L, EMT 250, Teletronix LA-2A, Urei 1176LN',
      'Fairchild 670 Variable-Mu, Pultec EQP-1A, EMT 140 plate, TC 2290 delay, Roland Dimension D',
      'Wave Designer (SPL Transient), BBE Sonic Maximizer, Sub Octaver, Precision De-Esser, and FBQ2496 Feedback Destroyer PRO',
      'Assignable as auxiliary send/return effects or inserted directly onto any channel or bus (e.g., vocal mic anti-howl insert)',
    ],
  },
  {
    id: 'faders-motorised-25',
    number: 11,
    title: '25 Midas PRO Motorised 100 mm Faders',
    subtitle: '1,000,000 cycle lifespan (3x standard commercial faders)',
    category: 'Physical Design',
    badge: '1,000,000 CYCLES',
    icon: <Flame className="w-5 h-5 text-amber-400" />,
    specs: [
      { label: 'Fader Count', value: '25 Motorised 100 mm' },
      { label: 'Life Rating', value: '1,000,000 Operations' },
      { label: 'Track Material', value: 'Conductive Polymer Plastic' },
      { label: 'Cap Texture', value: 'Anodized Textured Aluminium' },
    ],
    description:
      'Engineered by Midas specifically for the PRO Series consoles. Rated for up to 1 million movements, these precision 100 mm faders glide silently with pinpoint servo tracking and zero jitter.',
    technicalDetails: [
      'Ultra-smooth high-grade conductive plastic tracks prevent dust build-up and crackle',
      'Precision servo-motor control tracks scene snapshots, DCA adjustments, and Sends on Fader',
      'Fader banking: 16 input faders on left + 8 bus/DCA faders on right + 1 dedicated Main Master',
      'Anodized aluminium fader caps contoured for multi-finger touch and fast tactile sweeps',
    ],
  },
  {
    id: 'tft-display-7',
    number: 12,
    title: 'Daylight Viewable 7" Full Colour TFT Display',
    subtitle: 'High-contrast wide-angle LCD optimized for outdoor festivals',
    category: 'Physical Design',
    badge: '7" DAYLIGHT TFT',
    icon: <Tv className="w-5 h-5 text-blue-400" />,
    specs: [
      { label: 'Screen Size', value: '7-inch Diagonal TFT' },
      { label: 'Resolution', value: '800 x 480 High Definition' },
      { label: 'Visibility', value: 'Direct Sunlight Viewable' },
      { label: 'Rotary Encoders', value: '6 Context-Sensitive Encoders' },
    ],
    description:
      'Crisp, high-luminance color TFT display designed for bright daylight festivals and pitch-black indoor arenas. Shows channel EQ curves, RTA spectrum, routing, and console telemetry with zero glare.',
    technicalDetails: [
      'Anti-reflective, scratch-resistant optical coating for direct sun readability',
      '6 high-precision optical rotary encoders beneath the screen for rapid parameter tweaking',
      'Real-time 100-band RTA overlay on channel EQ graphs',
      'Fast dedicated navigation buttons: HOME, CONFIG, GATE, DYNAMICS, EQ, SENDS, MAIN, SETUP',
    ],
  },
  {
    id: 'usb-audio-32',
    number: 13,
    title: '32 x 32 Channel USB 2.0 Audio Interface',
    subtitle: 'Bi-directional multi-track recording & virtual soundcheck',
    category: 'Connectivity & Control',
    badge: '32x32 USB 2.0',
    icon: <HardDrive className="w-5 h-5 text-emerald-400" />,
    specs: [
      { label: 'Channels', value: '32 In / 32 Out Simultaneously' },
      { label: 'Resolution', value: '24-Bit / 48 kHz' },
      { label: 'Drivers', value: 'ASIO (Windows) & Core Audio (Mac)' },
      { label: 'Expansion Slot', value: 'DN32-LIVE / DN32-DANTE / USB' },
    ],
    description:
      'Connect a single USB cable to your Mac or PC laptop for 32-channel multi-track recording in Pro Tools, Logic, Reaper, or Studio One. Perform realistic Virtual Soundchecks before the band arrives.',
    technicalDetails: [
      'Zero-latency Core Audio class compliance for instant Mac and iPad compatibility',
      'High-performance multi-client ASIO driver with ultra-low buffer sizes for Windows',
      'Direct channel tap points (Pre-EQ, Post-EQ, Pre-Fader, or Direct Out)',
      'Compatible with DN32-LIVE dual SD card expansion module for 32-track recording without a computer',
    ],
  },
  {
    id: 'daw-remote-mackie',
    number: 14,
    title: 'DAW Remote Control Emulation: Mackie Control & HUI',
    subtitle: 'Hardware mixing surface for Pro Tools, Logic, Cubase & Ableton',
    category: 'Connectivity & Control',
    badge: 'MACKIE / HUI',
    icon: <Laptop className="w-5 h-5 text-amber-300" />,
    specs: [
      { label: 'Protocols', value: 'Mackie Control & Mackie HUI' },
      { label: 'DAW Support', value: 'Pro Tools, Logic, Cubase, Reaper' },
      { label: 'Surface Mode', value: 'Dedicated DAW Layer' },
      { label: 'Transport', value: 'Play, Stop, Rec, Rewind, Scrub' },
    ],
    description:
      'Transform the M32 into an industry-grade hardware DAW controller. The 100 mm motorized faders, rotary encoders, and backlit buttons control track volume, pan, mute, solo, and transport in your DAW.',
    technicalDetails: [
      'Mackie Control mode for seamless plug-and-play operation in Logic Pro, Cubase, Studio One, and Ableton',
      'HUI emulation protocol support for Avid Pro Tools integration',
      'Console scribble strip displays receive track names and volume readings from the computer',
      'Fast layer-switching between live console mixing and DAW playback control',
    ],
  },
  {
    id: 'wireless-remote-apps',
    number: 15,
    title: 'Wireless Remote Control: Midas Apps for iPad & iPhone',
    subtitle: 'M32-Mix for iPad & M32-Q for musician in-ear monitoring',
    category: 'Connectivity & Control',
    badge: 'WIRELESS OSC',
    icon: <Smartphone className="w-5 h-5 text-emerald-300" />,
    specs: [
      { label: 'iPad App', value: 'M32-Mix (Complete FOH & Mon Control)' },
      { label: 'iPhone App', value: 'M32-Q (Personal IEM Mix)' },
      { label: 'Protocol', value: 'High-Speed UDP / OSC' },
      { label: 'Concurrent Users', value: 'Up to 10 Tablets & Phones' },
    ],
    description:
      'Untether from the mixing position. Adjust FOH acoustics from anywhere in the auditorium using an iPad, or give band members individual control over their own in-ear monitor mixes on iPhones.',
    technicalDetails: [
      'M32-Mix on iPad replicates the complete console surface, faders, EQ curves, and FX racks',
      'M32-Q gives performers protected, pin-coded access strictly to their assigned in-ear mix bus',
      'Real-time bidirectional OSC synchronization with instantaneous meter updates',
      'Offline show preparation and scene saving directly on mobile devices',
    ],
  },
  {
    id: 'power-supply-universal',
    number: 16,
    title: 'Auto-Ranging Universal Switch-Mode Power Supply',
    subtitle: 'Worldwide 100-240V tour operation with whisper-quiet cooling',
    category: 'Physical Design',
    badge: '100-240V AC',
    icon: <Zap className="w-5 h-5 text-amber-400" />,
    specs: [
      { label: 'Voltage Range', value: '100 - 240 VAC (50/60 Hz)' },
      { label: 'Power Draw', value: '120 W Maximum Consumption' },
      { label: 'Protection', value: 'Over-Voltage & Surge Protected' },
      { label: 'Cooling', value: 'Ultra-Low Noise Convection' },
    ],
    description:
      'Tour anywhere around the world without transformer converters. The internal switch-mode power supply automatically senses local mains voltage (100V–240V) with zero hum and minimal power consumption.',
    technicalDetails: [
      'Universal voltage sensing automatically adapts from 120V in the US to 230V in Europe and Asia',
      'High electrical efficiency reduces thermal buildup inside the extruded aluminium chassis',
      'Filtered audio-grade power rails eliminate mains hum, ground loops, and radio interference',
      'Eco-friendly low-power standby mode meets international energy compliance standards',
    ],
  },
];

export const ConsoleSpecsModal: React.FC<ConsoleSpecsModalProps> = ({
  onClose,
  onOpenNetwork,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [selectedFeatureId, setSelectedFeatureId] = useState<string>('bentley-design');
  const [simulatedDspLoad, setSimulatedDspLoad] = useState<number>(38);
  const [faderCycleCount, setFaderCycleCount] = useState<number>(48219);
  const [isSimulatingFaderTest, setIsSimulatingFaderTest] = useState<boolean>(false);
  const [dawProtocol, setDawProtocol] = useState<'Mackie Control' | 'HUI'>('Mackie Control');

  const categories = [
    'ALL',
    'Audio Architecture',
    'Physical Design',
    'Processing & FX',
    'Connectivity & Control',
  ] as const;

  const filteredFeatures =
    activeCategory === 'ALL'
      ? M32_OFFICIAL_16_FEATURES
      : M32_OFFICIAL_16_FEATURES.filter((f) => f.category === activeCategory);

  const activeFeature =
    M32_OFFICIAL_16_FEATURES.find((f) => f.id === selectedFeatureId) ||
    M32_OFFICIAL_16_FEATURES[0];

  const handleRunFaderTest = () => {
    setIsSimulatingFaderTest(true);
    let count = faderCycleCount;
    const interval = setInterval(() => {
      count += 12;
      setFaderCycleCount(count);
    }, 50);
    setTimeout(() => {
      clearInterval(interval);
      setIsSimulatingFaderTest(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none font-mono">
      <div className="w-full max-w-5xl bg-[#0f1218] border-2 border-[#2b3345] rounded-xs shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
        {/* 1. MODAL TOP HEADER */}
        <div className="bg-[#141722] border-b border-[#242b3a] px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 px-3 rounded-xs bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center font-display font-extrabold text-black text-sm tracking-wider shadow-md border border-amber-300">
              MIDAS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-display font-black text-zinc-100 tracking-wider">
                  M32 DIGITAL CONSOLE SYSTEM & HARDWARE SPECIFICATIONS
                </span>
                <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-600/70 px-1.5 py-0.5 rounded-xs font-black">
                  16 CORE FEATURES
                </span>
              </div>
              <div className="text-[10px] text-zinc-400 mt-0.5">
                Authentic Engineering Architecture · Styled by Bentley Motors Designer · 40-Bit Floating Point DSP Core
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenNetwork && (
              <button
                onClick={() => {
                  onClose();
                  onOpenNetwork();
                }}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xs text-xs font-bold bg-[#1b212f] text-cyan-300 border border-cyan-700/80 hover:bg-[#232b3d] transition-all cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>OSC SETUP</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xs bg-[#1a1f2b] text-zinc-400 hover:text-white border border-[#2d364a] hover:bg-[#252c3d] cursor-pointer transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. REAL-TIME HARDWARE TELEMETRY BANNER (BENTLEY STYLING & SPECS) */}
        <div className="bg-[#0b0d12] border-b border-[#212736] px-4 py-2 flex flex-wrap items-center justify-between gap-3 shrink-0 text-[11px]">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-zinc-300">
              <span className="text-zinc-500">CONTOUR:</span>
              <span className="font-bold text-amber-400 flex items-center gap-1">
                <Car className="w-3.5 h-3.5 text-amber-400" />
                Bentley Motors Design (Rajesh Kutty)
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-300">
              <span className="text-zinc-500">CHASSIS:</span>
              <span className="font-bold text-zinc-200">Carbon Fibre & Aluminium Exoskeleton</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-300">
              <span className="text-zinc-500">DSP CORE:</span>
              <span className="font-bold text-cyan-400">40-Bit Float (Load: {simulatedDspLoad}%)</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-300">
              <span className="text-zinc-500">FADER TEST:</span>
              <span className="font-bold text-amber-300">{faderCycleCount.toLocaleString()} / 1,000,000 Cycles</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunFaderTest}
              disabled={isSimulatingFaderTest}
              className={`px-2 py-1 rounded-xs text-[10px] font-black border transition-all cursor-pointer ${
                isSimulatingFaderTest
                  ? 'bg-amber-500 text-black border-amber-300 animate-pulse'
                  : 'bg-[#181d29] text-amber-300 border-amber-600/60 hover:bg-[#202738]'
              }`}
            >
              {isSimulatingFaderTest ? 'MOTOR TEST IN PROGRESS...' : 'TEST MOTORIZED FADER'}
            </button>
          </div>
        </div>

        {/* 3. CATEGORY FILTER TABS */}
        <div className="bg-[#12151e] border-b border-[#222837] px-4 py-2 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-xs text-xs font-black tracking-wider transition-all cursor-pointer border ${
                activeCategory === cat
                  ? 'bg-amber-500 text-black border-amber-300 shadow-md ring-1 ring-amber-400/50'
                  : 'bg-[#171b26] text-zinc-400 border-[#262c3e] hover:bg-[#1d2331] hover:text-white'
              }`}
            >
              {cat === 'ALL' ? 'ALL 16 CORE FEATURES' : cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* 4. MAIN SPLIT CONTENT: FEATURE LIST (LEFT) & DETAIL INSPECTOR (RIGHT) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left: 16 Feature Grid / Scrollable List */}
          <div className="w-full md:w-5/12 border-b md:border-b-0 md:border-r border-[#222837] overflow-y-auto p-2.5 space-y-2 bg-[#0c0e14]">
            {filteredFeatures.map((feat) => {
              const isSelected = feat.id === selectedFeatureId;
              return (
                <div
                  key={feat.id}
                  onClick={() => setSelectedFeatureId(feat.id)}
                  className={`p-2.5 rounded-xs border cursor-pointer transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-[#191f2c] border-amber-400 ring-1 ring-amber-400/60 shadow-lg'
                      : 'bg-[#131620] border-[#202636] hover:bg-[#171b27] hover:border-zinc-600'
                  }`}
                >
                  <div
                    className={`p-2 rounded-xs border shrink-0 ${
                      isSelected
                        ? 'bg-amber-500 text-black border-amber-300'
                        : 'bg-[#1a1f2b] text-zinc-300 border-[#2b3346]'
                    }`}
                  >
                    {feat.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-black text-amber-400">
                        FEATURE #{String(feat.number).padStart(2, '0')}
                      </span>
                      <span className="text-[8px] font-mono px-1 py-0.5 rounded-xs bg-black/60 text-zinc-400 border border-zinc-800">
                        {feat.badge}
                      </span>
                    </div>

                    <h4
                      className={`text-xs font-bold tracking-tight truncate mt-0.5 ${
                        isSelected ? 'text-white' : 'text-zinc-200'
                      }`}
                    >
                      {feat.title}
                    </h4>

                    <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                      {feat.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Detailed Deep Dive Inspector */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#10131b]">
            {/* Active Feature Header Banner */}
            <div className="bg-[#161a25] border-2 border-amber-500/60 rounded-xs p-3.5 shadow-xl space-y-2 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black text-amber-400 tracking-wider">
                  OFFICIAL SPECIFICATION #{String(activeFeature.number).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-bold bg-amber-500 text-black px-2 py-0.5 rounded-xs shadow-sm">
                  {activeFeature.category.toUpperCase()}
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-display font-black text-zinc-100 tracking-wide">
                {activeFeature.title}
              </h2>

              <p className="text-xs text-amber-200/90 font-mono">
                {activeFeature.subtitle}
              </p>

              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                {activeFeature.description}
              </p>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {activeFeature.specs.map((s, idx) => (
                <div
                  key={idx}
                  className="bg-[#141824] border border-[#242b3b] p-2.5 rounded-xs flex flex-col justify-between"
                >
                  <span className="text-[9px] text-zinc-400 uppercase font-bold tracking-wider">
                    {s.label}
                  </span>
                  <span className="text-xs sm:text-sm font-black text-amber-300 mt-1 truncate">
                    {s.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Technical Engineering Highlights */}
            <div className="bg-[#141722] border border-[#232939] rounded-xs p-3.5 space-y-2.5">
              <span className="text-xs font-black text-zinc-200 tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                TECHNICAL ARCHITECTURE & CONSOLE INTEGRATION
              </span>

              <div className="space-y-2">
                {activeFeature.technicalDetails.map((detail, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300 font-sans">
                    <span className="text-amber-400 font-mono font-bold mt-0.5">▸</span>
                    <span className="leading-snug">{detail}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Feature Emulators depending on active feature */}
            {activeFeature.id === 'bentley-design' && (
              <div className="bg-carbon border-2 border-amber-500/50 p-4 rounded-xs text-zinc-200 space-y-2 shadow-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                    <Car className="w-4 h-4" /> BENTLEY MOTORS LUXURY AUTOMOTIVE DNA
                  </span>
                  <span className="text-[10px] text-zinc-400">Lead Stylist: Rajesh Kutty</span>
                </div>
                <p className="text-xs text-zinc-300 font-sans">
                  The M32’s sculptural curved chassis was conceived to blend the tactile precision of luxury grand touring cockpits with the harsh requirements of touring sound. The aerodynamic form channels air naturally across the heatsinks without requiring loud internal cooling fans that pollute silent acoustic rooms.
                </p>
                <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-amber-300">
                  <span className="px-2 py-0.5 bg-black/70 rounded border border-amber-500/40">✓ Carbon Fibre Sub-Chassis</span>
                  <span className="px-2 py-0.5 bg-black/70 rounded border border-amber-500/40">✓ Aircraft Aluminium Exoskeleton</span>
                  <span className="px-2 py-0.5 bg-black/70 rounded border border-amber-500/40">✓ High-Impact Steel Base</span>
                </div>
              </div>
            )}

            {activeFeature.id === 'daw-remote-mackie' && (
              <div className="bg-[#141824] border border-amber-500/40 p-3 rounded-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-400">DAW PROTOCOL EMULATION SELECTOR</span>
                  <div className="flex items-center gap-1">
                    {(['Mackie Control', 'HUI'] as const).map((proto) => (
                      <button
                        key={proto}
                        onClick={() => setDawProtocol(proto)}
                        className={`px-2 py-0.5 rounded-xs text-xs font-bold border cursor-pointer ${
                          dawProtocol === proto
                            ? 'bg-amber-500 text-black border-amber-300'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-700'
                        }`}
                      >
                        {proto}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="text-[11px] text-zinc-300 font-sans">
                  Active DAW Mode: <b>{dawProtocol}</b>. All 25 Midas PRO motorized faders and LCD scribble strips are ready to receive bi-directional volume automation, pan coordinates, and transport commands from Pro Tools, Logic Pro, Cubase, and Studio One.
                </div>
              </div>
            )}

            {activeFeature.id === 'faders-motorised-25' && (
              <div className="bg-[#141824] border border-[#262c3e] p-3 rounded-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-400">1,000,000 CYCLE LIFE CALIBRATION</span>
                  <span className="text-xs font-mono text-emerald-400 font-black">CALIBRATED & ACCURATE (±0.05 dB)</span>
                </div>
                <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-700">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300"
                    style={{ width: `${Math.min(100, (faderCycleCount / 1000000) * 100 * 10)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-zinc-400">
                  <span>Cycle Count: {faderCycleCount.toLocaleString()}</span>
                  <span>Rated Lifespan: 1,000,000 Operations</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 5. FOOTER SUMMARY */}
        <div className="bg-[#141722] border-t border-[#232938] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs">
          <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>M32 Console Core: 40-Bit Floating Point · 96x96 AES50 Ready · 25 Time-Aligned Buses</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xs bg-amber-500 hover:bg-amber-400 text-black font-black text-xs cursor-pointer transition-all shadow-md"
            >
              DONE / CLOSE SPECS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
