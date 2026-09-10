// Web Audio API Synthesizer for FALTALITY
// Creates snappy, paper, piano, geese, car alarms, aircraft and Mac Keynote effects without external sound assets.

class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  constructor() {}

  public initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play generative Debussy/Satie-style tranquil piano tone when folding
  public playPianoNote(foldStep: number) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    // Pentatonic scale in Db Major (warm, dreamy, impressionist vibe)
    const scale = [
      138.59, // Db3
      155.56, // Eb3
      185.00, // Gb3
      207.65, // Ab3
      233.08, // Bb3
      277.18, // Db4
      311.13, // Eb4
      369.99, // Gb4
      415.30, // Ab4
      466.16, // Bb4
      554.37, // Db5
      622.25, // Eb5
      739.99, // Gb5
    ];

    const freq = scale[foldStep % scale.length];
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    // Dynamic envelope imitating soft grand piano hammer
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.22, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

    // Warm lowpass filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.frequency.exponentialRampToValueAtTime(400, t + 1.0);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 1.3);

    // Accompanying crisp paper creasing noise
    this.playPaperNoise(0.08, 0.25);
  }

  // Soft procedural white noise burst imitating paper creasing/swish
  public playPaperNoise(duration: number = 0.1, volume: number = 0.2) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
  }

  // Crisp launch whoosh with power factor
  public playLaunch(powerFactor: number = 0.8) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(540, t + 0.18);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.4 * powerFactor, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.32);

    this.playPaperNoise(0.25, 0.45 * powerFactor);
  }

  // Procedural Paper Fold / Crease sound
  public playFold(_pitchFactor: number = 1) {
    this.playPaperNoise(0.12, 0.35);
  }

  // Launch whoosh sound wrapper
  public playWhoosh(folds: number = 0) {
    this.playLaunch(Math.min(1.5, 0.8 + folds * 0.08));
  }

  // Crash impact sound wrapper
  public playCrash(folds: number = 0) {
    if (folds >= 5) {
      this.playGroundImpact();
    } else {
      this.playPaperNoise(0.2, 0.4);
    }
  }

  // Goose Honk when hit
  public playHonk(pitch: number = 1.0) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240 * pitch, t);
    osc.frequency.linearRampToValueAtTime(320 * pitch, t + 0.08);
    osc.frequency.linearRampToValueAtTime(190 * pitch, t + 0.35);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(750, t);
    filter.Q.setValueAtTime(2.0, t);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.45, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.4);
  }

  // Cute Pigeon gentle cooing
  public playPigeonCoo() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.linearRampToValueAtTime(360, t + 0.08);
    osc.frequency.exponentialRampToValueAtTime(290, t + 0.24);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.26);
  }

  // Hilarious Sheep Baa / Fainting Sheep "Määääh?!" sound
  public playSheepBaa(fainting: boolean = false) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    const baseFreq = fainting ? 290 : 250;
    osc.frequency.setValueAtTime(baseFreq, t);
    if (fainting) {
      // Questioning comedic upward slide at end: "Määääh?!"
      osc.frequency.linearRampToValueAtTime(baseFreq + 40, t + 0.35);
      osc.frequency.linearRampToValueAtTime(baseFreq + 100, t + 0.7);
    } else {
      osc.frequency.linearRampToValueAtTime(baseFreq - 25, t + 0.45);
    }

    // Vibrato LFO for realistic wobbly baa
    lfo.frequency.setValueAtTime(6.0, t);
    lfoGain.gain.setValueAtTime(22, t);
    lfo.connect(osc.frequency);

    // Formant filter (nasal sheep throat)
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(920, t);
    filter.Q.setValueAtTime(3.2, t);

    const dur = fainting ? 0.85 : 0.5;
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    lfo.start(t);
    osc.start(t);
    lfo.stop(t + dur);
    osc.stop(t + dur);
  }

  // Hit / Impact sound when bird is struck
  public playHit() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.2);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.25);

    this.playPaperNoise(0.2, 0.4);
  }

  // Massive crater ground impact for heavy overfolded projectiles
  public playGroundImpact() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(25, t + 0.5);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, t);

    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.6);

    this.playPaperNoise(0.4, 0.8);
  }

  // Neighbor frantic car alarm when lawn/fence is crushed
  public playCarAlarm() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const startT = this.ctx.currentTime + 0.1;
    const beeps = 14; // Longer sustained car alarm!
    for (let i = 0; i < beeps; i++) {
      const t = startT + i * 0.18;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(i % 2 === 0 ? 880 : 660, t);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.14, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.18);
    }
  }

  // Passenger Airplane hit cartoon crash horn
  public playPlaneCrash() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.linearRampToValueAtTime(180, t + 0.6);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(850, t);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.4, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.7);

    this.playPaperNoise(0.5, 0.7);
  }

  // Apple Keynote Celestial Chime & Cash Register "Cha-Ching"
  public playSatelliteHit() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    // 1. Iconic Apple Mac Boot / Keynote Chime chord (F# Major)
    const chord = [369.99, 466.16, 554.37, 739.99];
    chord.forEach((freq) => {
      const t = this.ctx!.currentTime;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.25, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 2.4);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t);
      osc.stop(t + 2.5);
    });

    // 2. Playful Cash Register Ding ($19 polishing cloth sold!)
    const dingT = this.ctx.currentTime + 0.25;
    const dingOsc = this.ctx.createOscillator();
    const dingGain = this.ctx.createGain();
    dingOsc.type = 'sine';
    dingOsc.frequency.setValueAtTime(1760, dingT); // A6 bright bell
    dingGain.gain.setValueAtTime(0.3, dingT);
    dingGain.gain.exponentialRampToValueAtTime(0.001, dingT + 0.8);
    dingOsc.connect(dingGain);
    dingGain.connect(this.ctx.destination);
    dingOsc.start(dingT);
    dingOsc.stop(dingT + 0.85);
  }

  // Alias for Keynote chime
  public playMacStartupChime() {
    this.playSatelliteHit();
  }

  // 80s/90s Brutal Retro Synthwave Intro Power Chord + Sub Bass
  public playRetroStart() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Power chord: D2, A2, D3, F3, A3, D4 (D Minor synth brass stab)
    const freqs = [73.42, 110.0, 146.83, 174.61, 220.0, 293.66];
    freqs.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const filter = this.ctx!.createBiquadFilter();

      osc.type = i % 2 === 0 ? 'sawtooth' : 'square';
      osc.frequency.setValueAtTime(freq, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3200, t);
      filter.frequency.exponentialRampToValueAtTime(450, t + 1.2);
      filter.Q.setValueAtTime(4.0, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.25 / (freqs.length * 0.5), t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t);
      osc.stop(t + 1.9);
    });

    // Sub bass hit
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(120, t);
    subOsc.frequency.exponentialRampToValueAtTime(35, t + 0.5);
    subGain.gain.setValueAtTime(0.5, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(t);
    subOsc.stop(t + 0.6);
  }

  // Big FALTALITY fanfare (Mortal Kombat vibe meets jaunty garden piano)
  public playFaltality() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    // Dramatic brassy stabs: C4, G4, C5!
    const notes = [261.63, 392.0, 523.25, 659.25];
    notes.forEach((freq, idx) => {
      const t = this.ctx!.currentTime + idx * 0.12;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1500, t);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.35, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t);
      osc.stop(t + 0.5);
    });
  }

  // Fresh paper slaps onto the table
  public playNewPaper() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(250, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.08);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.1);

    this.playPaperNoise(0.06, 0.3);
  }
  // Crunchy procedural aluminium foil crinkle sound
  public playFoilCrinkle(foldStep: number = 0) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // 1. High metallic chime/ding
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = "sine";
    const pitch = 1200 + (foldStep % 6) * 220;
    osc.frequency.setValueAtTime(pitch, t);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.7, t + 0.18);

    oscGain.gain.setValueAtTime(0.01, t);
    oscGain.gain.linearRampToValueAtTime(0.18, t + 0.01);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.25);

    // 2. High-pass textured foil crackles / crunches (multiple tiny micro-bursts)
    const bursts = 4;
    for (let b = 0; b < bursts; b++) {
      const burstOffset = b * 0.035 + Math.random() * 0.015;
      const burstLen = 0.04;
      const bufferSize = Math.floor(this.ctx.sampleRate * burstLen);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const hp = this.ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.setValueAtTime(2800 + Math.random() * 1200, t + burstOffset);

      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.28, t + burstOffset);
      nGain.gain.exponentialRampToValueAtTime(0.001, t + burstOffset + burstLen);

      noise.connect(hp);
      hp.connect(nGain);
      nGain.connect(this.ctx.destination);

      noise.start(t + burstOffset);
      noise.stop(t + burstOffset + burstLen + 0.01);
    }
  }

  // Metallic impact ping/clang when the foil ball strikes
  public playFoilClang() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1480, t);
    osc.frequency.exponentialRampToValueAtTime(840, t + 0.35);

    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(2960, t);
    osc2.frequency.exponentialRampToValueAtTime(1200, t + 0.35);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc2.start(t);
    osc.stop(t + 0.4);
    osc2.stop(t + 0.4);
  }

  // 1. Cinematic "One More Thing" Keynote Boss Entrance
  public playOneMoreThingIntro() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Deep cinematic sub-bass rumble
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(55, t); // A1
    subOsc.frequency.exponentialRampToValueAtTime(32.7, t + 2.5); // C1

    const subFilter = this.ctx.createBiquadFilter();
    subFilter.type = 'lowpass';
    subFilter.frequency.setValueAtTime(120, t);

    subGain.gain.setValueAtTime(0.01, t);
    subGain.gain.linearRampToValueAtTime(0.45, t + 0.2);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 2.8);

    subOsc.connect(subFilter);
    subFilter.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(t);
    subOsc.stop(t + 3.0);

    // Ethereal Apple Keynote shimmering major triad
    const chord = [523.25, 659.25, 783.99, 1046.50]; // C Major
    chord.forEach((freq, idx) => {
      const chimeT = t + 0.35 + idx * 0.08;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, chimeT);

      gain.gain.setValueAtTime(0.01, chimeT);
      gain.gain.linearRampToValueAtTime(0.2, chimeT + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, chimeT + 2.4);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(chimeT);
      osc.stop(chimeT + 2.5);
    });
  }

  // 2. Mechanical servo creak and click when the iPhone Duo unfolds
  public playHingeMechanical() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Crisp mechanical ratchet click sequence
    for (let i = 0; i < 6; i++) {
      const clickT = t + i * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800 + i * 180, clickT);

      gain.gain.setValueAtTime(0.25, clickT);
      gain.gain.exponentialRampToValueAtTime(0.001, clickT + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(clickT);
      osc.stop(clickT + 0.04);
    }

    // Accompanying paper-crease friction
    this.playPaperNoise(0.4, 0.5);
  }

  // 3. High-pitched ricochet ping when Ceramic Shield deflects weak paper (<5 folds)
  public playCeramicShieldDeflect() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2400, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.15);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  // 4. Apple dialog error chime when iPhone Duo takes damage
  public playAppleErrorAlert() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Classic Apple "Sosumi / Funk" alert imitation
    const freq1 = 440;
    const freq2 = 587.33;

    [freq1, freq2].forEach((freq, idx) => {
      const noteT = t + idx * 0.09;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteT);

      gain.gain.setValueAtTime(0.3, noteT);
      gain.gain.exponentialRampToValueAtTime(0.001, noteT + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(noteT);
      osc.stop(noteT + 0.35);
    });
  }

  // 5. Boss Defeat Fanfare with celebratory chord & cash register
  public playBossVictoryFanfare() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Victorious chord progression: C -> F -> G -> C
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];
    notes.forEach((f) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, t);

      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, t);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 2.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(t);
      osc.stop(t + 2.6);
    });

    // Double Cash Register Chime
    this.playSatelliteHit();
  }

  // 6. Active Crease: Perfect Crease Chime (Crisp snap + shimmering celestial chord)
  public playPerfectCrease() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Crisp high-velocity paper snap
    this.playPaperNoise(0.02, 0.35);

    // Ethereal chime chord (E Major: E5, G#5, B5, E6)
    const chord = [659.25, 830.61, 987.77, 1318.51];
    chord.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const noteT = t + idx * 0.025;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteT);

      gain.gain.setValueAtTime(0.001, noteT);
      gain.gain.linearRampToValueAtTime(0.24, noteT + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, noteT + 0.9);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(noteT);
      osc.stop(noteT + 0.95);
    });
  }

  // 7. Active Crease: Imperfect Crumpled Crease (Muffled crinkle)
  public playCrumpleCrease() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    this.playPaperNoise(0.12, 0.4);

    // Dissonant descending wobble
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(75, t + 0.25);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  // 8. Archetype Shift Audio Fanfare
  public playArchetypeShift(archetype: 'glider' | 'dart' | 'comet') {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    if (archetype === 'glider') {
      // Gentle wind flute
      const notes = [440, 554.37, 659.25];
      notes.forEach((f, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t + i * 0.06);
        gain.gain.setValueAtTime(0.15, t + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(t + i * 0.06);
        osc.stop(t + i * 0.06 + 0.45);
      });
    } else if (archetype === 'dart') {
      // Rapid supersonic zip
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.exponentialRampToValueAtTime(1200, t + 0.18);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.25);
    } else {
      // Heavy monolithic bass drop
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.5);
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.65);
    }
  }

  // Campaign: Star pop sound (rising triumphant chime per star)
  public playStarEarned(starIndex: number = 0) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const baseFreqs = [
      [523.25, 783.99],          // Star 1: C5, G5
      [659.25, 1046.5],          // Star 2: E5, C6
      [783.99, 1318.51, 1567.98] // Star 3: G5, E6, G6 (Grand chime)
    ];

    const freqs = baseFreqs[Math.min(2, Math.max(0, starIndex))] || baseFreqs[0];
    freqs.forEach((freq, idx) => {
      const noteTime = t + idx * 0.07;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.01, noteTime);
      gain.gain.linearRampToValueAtTime(0.22, noteTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.5);
    });
  }

  // Campaign: Level Complete fanfare
  public playLevelVictoryFanfare() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const melody = [
      { f: 523.25, d: 0.12 }, // C5
      { f: 659.25, d: 0.12 }, // E5
      { f: 783.99, d: 0.14 }, // G5
      { f: 1046.5, d: 0.35 }  // C6 (Triumph)
    ];

    let offset = 0;
    melody.forEach((note) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.f, t + offset);

      gain.gain.setValueAtTime(0.01, t + offset);
      gain.gain.linearRampToValueAtTime(0.25, t + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + offset + note.d);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t + offset);
      osc.stop(t + offset + note.d + 0.05);

      offset += note.d * 0.85;
    });
  }

  // Campaign: Level Failed cue
  public playLevelFailed() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [440, 415.3, 392, 369.99]; // A4 -> G#4 -> G4 -> F#4
    notes.forEach((f, i) => {
      const noteTime = t + i * 0.16;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, noteTime);

      gain.gain.setValueAtTime(0.18, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.25);
    });
  }

  // Slingshot: Rubber band stretching creak
  private lastSlingStretchTime: number = 0;
  public playSlingStretch(tension: number) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    if (t - this.lastSlingStretchTime < 0.09) return;
    this.lastSlingStretchTime = t;

    const clampedTension = Math.max(0, Math.min(1, tension));
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    const baseFreq = 160 + clampedTension * 320;
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.linearRampToValueAtTime(baseFreq + 40, t + 0.06);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(baseFreq * 1.5, t);
    filter.Q.setValueAtTime(4.0, t);

    const vol = 0.04 + clampedTension * 0.08;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  // Slingshot: Crisp rubber band release twang & snap
  public playSlingRelease() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // 1. Resonant rubber snap (falling tone)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(640, t);
    osc.frequency.exponentialRampToValueAtTime(75, t + 0.08);

    gain.gain.setValueAtTime(0.38, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.14);

    // 2. Whip noise snap
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.04);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const hp = this.ctx.createBiquadFilter();
    hp.type = 'bandpass';
    hp.frequency.setValueAtTime(1400, t);
    hp.Q.setValueAtTime(1.5, t);

    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.28, t);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    noise.connect(hp);
    hp.connect(nGain);
    nGain.connect(this.ctx.destination);

    noise.start(t);
    noise.stop(t + 0.05);
  }

  // Sneaky Neighbor Cat startled meow sound ("Meoooww!")
  public playCatMeow() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    // Classic meow pitch inflection: starts mid-high, scoops higher, then falls off
    osc.frequency.setValueAtTime(540, t);
    osc.frequency.linearRampToValueAtTime(780, t + 0.14);
    osc.frequency.linearRampToValueAtTime(840, t + 0.28);
    osc.frequency.exponentialRampToValueAtTime(420, t + 0.65);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(950, t);
    filter.frequency.linearRampToValueAtTime(1400, t + 0.22);
    filter.frequency.linearRampToValueAtTime(800, t + 0.65);
    filter.Q.setValueAtTime(3.0, t);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.36, t + 0.08);
    gain.gain.linearRampToValueAtTime(0.32, t + 0.35);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.68);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.7);
  }

  // Heavy fold table impact: Sub-bass thud and metallic ring when creasing dense bricks/titanium
  public playHeavyFoldImpact(folds: number = 7) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Sub-bass thud
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    const baseFreq = Math.max(38, 75 - (folds - 6) * 8);
    subOsc.frequency.setValueAtTime(baseFreq * 1.8, t);
    subOsc.frequency.exponentialRampToValueAtTime(baseFreq, t + 0.08);

    subGain.gain.setValueAtTime(0.55, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(t);
    subOsc.stop(t + 0.48);

    // Metallic ring / Hydraulic crunch
    const clankOsc = this.ctx.createOscillator();
    const clankGain = this.ctx.createGain();
    clankOsc.type = folds >= 9 ? 'square' : 'triangle';
    clankOsc.frequency.setValueAtTime(folds >= 9 ? 440 : 280, t);
    clankOsc.frequency.exponentialRampToValueAtTime(120, t + 0.18);

    clankGain.gain.setValueAtTime(folds >= 9 ? 0.32 : 0.18, t);
    clankGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(folds >= 9 ? 1200 : 600, t);
    bp.Q.setValueAtTime(3.5, t);

    clankOsc.connect(bp);
    bp.connect(clankGain);
    clankGain.connect(this.ctx.destination);

    clankOsc.start(t);
    clankOsc.stop(t + 0.28);
  }

  // Neighbor BBQ Grill sizzle and flare burst
  public playGrillSizzle() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const dur = 0.85;
    const bufferSize = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // Sizzling bacon / charcoal fire crackle
      const crackle = Math.random() > 0.94 ? (Math.random() * 2 - 1) * 1.8 : 0;
      data[i] = ((Math.random() * 2 - 1) * 0.4 + crackle) * Math.exp(-i / (bufferSize * 0.7));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2600, t);
    filter.Q.setValueAtTime(1.8, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.42, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
  }

  // 90s Arcade Lock-On Chirp (Crisp dual-tone target acquisition beep)
  public playLockOn() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    // Frequency step from 880Hz to 1320Hz (A5 to E6)
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.setValueAtTime(1320, t + 0.045);

    // Bandpass to give it punchy CRT arcade cabinet flavor
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(1200, t);
    bp.Q.setValueAtTime(2.2, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.01);
    gain.gain.setValueAtTime(0.18, t + 0.045);
    gain.gain.linearRampToValueAtTime(0.22, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(bp);
    bp.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  // Deep resonant nautical foghorn for Krabbenkutter
  public playBoatHorn() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const dur = 1.4;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(110.0, t); // A2 fundamental
    osc2.frequency.setValueAtTime(164.8, t); // E3 fifth interval

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(420, t);
    filter.frequency.linearRampToValueAtTime(580, t + 0.4);
    filter.frequency.linearRampToValueAtTime(320, t + dur);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.12);
    gain.gain.setValueAtTime(0.32, t + dur - 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + dur);
    osc2.stop(t + dur);
  }

  // Coastal seagull screech / cry
  public playSeagull() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const dur = 0.45;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1350, t);
    osc.frequency.linearRampToValueAtTime(2150, t + 0.12);
    osc.frequency.exponentialRampToValueAtTime(1550, t + dur);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.20, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + dur);
  }

  // Victorious fanfare arpeggio when reaching 3,000 points & completing Level 1
  public playLevelUp() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [
      { f: 523.25, t: 0.00 }, // C5
      { f: 659.25, t: 0.10 }, // E5
      { f: 783.99, t: 0.20 }, // G5
      { f: 1046.50, t: 0.32 }, // C6
      { f: 1318.51, t: 0.48 }  // E6 sustain
    ];

    const startTime = this.ctx.currentTime;
    notes.forEach((n, idx) => {
      const t = startTime + n.t;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = idx === notes.length - 1 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(n.f, t);

      const noteDur = idx === notes.length - 1 ? 1.2 : 0.22;
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.26, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + noteDur);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t);
      osc.stop(t + noteDur + 0.05);
    });
  }
}

export const sound = new SoundEngine();

