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
}

export const sound = new SoundEngine();
