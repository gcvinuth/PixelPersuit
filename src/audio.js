// Web Audio API Procedural Retro Sound & Music Synthesizer
// Zero external audio files, 100% offline, crystal clear retro 8/16-bit soundscapes!

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.sfxGain = null;
    this.bgmGain = null;
    this.masterGain = null;
    this.isMuted = false;
    this.currentTrack = null;
    this.timerId = null;
    this.stepIndex = 0;
    this.currentZone = 1;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.7;

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.8;
      this.sfxGain.connect(this.masterGain);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.value = 0.35;
      this.bgmGain.connect(this.masterGain);

      this.masterGain.connect(this.ctx.destination);
      this.initialized = true;

      // Resume context if suspended by browser autoplay policy
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch (e) {
      console.warn('AudioContext failed to initialize:', e);
    }
  }

  ensureContext() {
    if (!this.initialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMasterVolume(val) {
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, val)), this.ctx ? this.ctx.currentTime : 0);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  // SFX: Footstep
  playStep() {
    if (!this.initialized || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110 + Math.random() * 20, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.05);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  // SFX: Blip / Dialogue click
  playBlip() {
    if (!this.initialized || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(420 + Math.random() * 80, t);
    osc.frequency.exponentialRampToValueAtTime(280, t + 0.04);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.045);
  }

  // SFX: Item Pickup / Inspect
  playPickup() {
    if (!this.initialized || this.isMuted) return;
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    notes.forEach((freq, idx) => {
      const t = this.ctx.currentTime + idx * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.2);
    });
  }

  // SFX: Mechanical Gear Click / Dial tick
  playGearClick() {
    if (!this.initialized || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.035);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.035);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.04);
  }

  // SFX: Mirror Rotate / Optical hum
  playRotate() {
    if (!this.initialized || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(480, t + 0.08);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.11);
  }

  // SFX: Error buzz
  playError() {
    if (!this.initialized || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, t);
    osc.frequency.setValueAtTime(110, t + 0.08);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.linearRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.23);
  }

  // SFX: Puzzle Solved / Triumphant Fanfare
  playSolve() {
    if (!this.initialized || this.isMuted) return;
    const arpeggio = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
    arpeggio.forEach((f, i) => {
      const t = this.ctx.currentTime + i * 0.09;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.4);
    });
  }

  // SFX: Heavy Door Slide / Vault opening
  playDoorUnlock() {
    if (!this.initialized || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(65, t);
    osc.frequency.linearRampToValueAtTime(45, t + 0.6);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, t);
    filter.frequency.exponentialRampToValueAtTime(80, t + 0.6);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.75);
  }

  // Adaptive Procedural Music Sequencer
  startBGM(zone = 1) {
    this.ensureContext();
    this.currentZone = zone;
    if (this.timerId) clearInterval(this.timerId);

    this.stepIndex = 0;
    const tempo = zone === 1 ? 160 : zone === 2 ? 140 : 125; // ms per 16th note

    this.timerId = setInterval(() => {
      if (!this.initialized || this.isMuted) return;
      this.playMusicStep(this.currentZone, this.stepIndex);
      this.stepIndex = (this.stepIndex + 1) % 32;
    }, tempo);
  }

  stopBGM() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  playMusicStep(zone, step) {
    const t = this.ctx.currentTime;
    
    // Zone 1: The Private Study — Baroque Mystery (D minor, harpsichord/arpeggio feel)
    if (zone === 1) {
      const bassNotes = [146.83, 146.83, 130.81, 130.81, 116.54, 116.54, 110.00, 123.47]; // D3, C3, Bb2, A2
      const melodyNotes = [293.66, 349.23, 440.0, 523.25, 440.0, 349.23, 293.66, 261.63, 293.66, 329.63, 349.23, 392.0];

      // Bass drone on downbeats
      if (step % 4 === 0) {
        const bassIdx = Math.floor(step / 4) % bassNotes.length;
        this.playSynthNote(bassNotes[bassIdx], t, 0.2, 'sawtooth', 0.12, 280);
      }

      // Arpeggiated melody line
      if (step % 2 === 0) {
        const melIdx = (step / 2) % melodyNotes.length;
        this.playSynthNote(melodyNotes[melIdx], t, 0.15, 'triangle', 0.08, 900);
      }
    }

    // Zone 2: The Art Gallery — Ethereal Spatial Waltz (A minor, glass bells & rhythmic pulse)
    else if (zone === 2) {
      const chords = [
        [220.0, 261.63, 329.63], // Am
        [196.0, 246.94, 293.66], // G
        [174.61, 220.0, 261.63], // F
        [164.81, 207.65, 246.94]  // E
      ];
      const chordIdx = Math.floor(step / 8) % chords.length;
      const currentChord = chords[chordIdx];

      // Arp ping
      if (step % 2 === 0) {
        const note = currentChord[(step / 2) % currentChord.length] * 2;
        this.playSynthNote(note, t, 0.18, 'sine', 0.12, 1400);
      }
      // Sub pulse
      if (step % 8 === 0) {
        this.playSynthNote(currentChord[0] / 2, t, 0.4, 'triangle', 0.15, 220);
      }
    }

    // Zone 3: The Vault — High-tech Cyber Decryption (C minor driving bass + syncopated pulses)
    else if (zone === 3) {
      const cMinorBass = [65.41, 65.41, 77.78, 65.41, 87.31, 77.78, 98.0, 87.31];
      const bIdx = Math.floor(step / 2) % cMinorBass.length;

      // Driving 16th bass
      this.playSynthNote(cMinorBass[bIdx], t, 0.1, 'sawtooth', 0.18, 450);

      // Hi-tech beep arpeggio
      if (step % 4 === 1 || step % 4 === 3) {
        const highBeeps = [523.25, 622.25, 698.46, 783.99, 932.33];
        const hFreq = highBeeps[(step * 3) % highBeeps.length];
        this.playSynthNote(hFreq, t, 0.08, 'square', 0.05, 1800);
      }
    }
  }

  playSynthNote(freq, startTime, duration, type = 'sine', volume = 0.1, cutoff = 1000) {
    if (!this.initialized || this.isMuted) return;
    try {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(cutoff, startTime);

      gain.gain.setValueAtTime(volume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmGain);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    } catch (e) {
      // Audio node scheduling guard
    }
  }
}

export const sounds = new SoundSystem();
