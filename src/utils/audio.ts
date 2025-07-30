// Audio Manager for Red Hacker Games
export class AudioManager {
  private static instance: AudioManager;
  private audioContext: AudioContext | null = null;
  private masterVolume: number = 0.5;
  private musicVolume: number = 0.3;
  private sfxVolume: number = 0.7;
  private isMuted: boolean = false;
  private backgroundMusic: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
    }
  }

  // Start cyberpunk background music
  startBackgroundMusic() {
    this.initAudioContext();
    if (!this.audioContext || this.backgroundMusic) return;

    // Create a simple cyberpunk-style ambient loop
    this.backgroundMusic = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filterNode = this.audioContext.createBiquadFilter();

    this.backgroundMusic.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(this.gainNode!);

    // Cyberpunk ambient settings
    this.backgroundMusic.type = 'sawtooth';
    this.backgroundMusic.frequency.setValueAtTime(55, this.audioContext.currentTime); // Low A
    
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(200, this.audioContext.currentTime);
    filterNode.Q.setValueAtTime(10, this.audioContext.currentTime);

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.musicVolume * this.masterVolume, this.audioContext.currentTime + 1);

    // Add subtle frequency modulation for cyberpunk feel
    const lfo = this.audioContext.createOscillator();
    const lfoGain = this.audioContext.createGain();
    
    lfo.connect(lfoGain);
    lfoGain.connect(this.backgroundMusic.frequency);
    
    lfo.frequency.setValueAtTime(0.1, this.audioContext.currentTime);
    lfoGain.gain.setValueAtTime(5, this.audioContext.currentTime);
    
    this.backgroundMusic.start();
    lfo.start();
  }

  stopBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
      this.backgroundMusic = null;
    }
  }

  // Sound effects
  playClickSound() {
    this.playTone(800, 0.1, 'square', 0.3);
  }

  playSuccessSound() {
    this.initAudioContext();
    if (!this.audioContext) return;

    // Ascending chord
    const frequencies = [262, 330, 392, 523]; // C major chord
    frequencies.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.2, 'sine', 0.4);
      }, i * 100);
    });
  }

  playErrorSound() {
    this.playTone(150, 0.3, 'sawtooth', 0.5);
  }

  playPowerUpSound() {
    this.initAudioContext();
    if (!this.audioContext) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(this.gainNode!);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.5);
    
    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(this.sfxVolume * this.masterVolume, this.audioContext.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
    
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.5);
  }

  playGameOverSound() {
    this.initAudioContext();
    if (!this.audioContext) return;

    // Descending minor chord
    const frequencies = [523, 415, 330, 262]; // C minor chord descending
    frequencies.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.4, 'triangle', 0.4);
      }, i * 150);
    });
  }

  playCollectSound() {
    this.playTone(1047, 0.1, 'sine', 0.3); // High C
  }

  playJumpSound() {
    this.initAudioContext();
    if (!this.audioContext) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(this.gainNode!);
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(400, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(this.sfxVolume * this.masterVolume * 0.3, this.audioContext.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
    
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.1);
  }

  playHitSound() {
    this.playTone(200, 0.15, 'sawtooth', 0.4);
  }

  playBounceSound() {
    this.playTone(300, 0.05, 'triangle', 0.2);
  }

  playExplosionSound() {
    this.initAudioContext();
    if (!this.audioContext) return;

    // White noise explosion
    const bufferSize = this.audioContext.sampleRate * 0.3;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const source = this.audioContext.createBufferSource();
    const gain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.gainNode!);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.3);
    
    gain.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.5, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
    
    source.start();
  }

  playMenuSound() {
    this.playTone(523, 0.1, 'sine', 0.2); // High C
  }

  playLevelUpSound() {
    this.initAudioContext();
    if (!this.audioContext) return;

    // Major scale up
    const scale = [262, 294, 330, 349, 392, 440, 494, 523]; // C major scale
    scale.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.15, 'sine', 0.3);
      }, i * 80);
    });
  }

  playComboSound(comboCount: number) {
    const baseFreq = 440;
    const freq = baseFreq + (comboCount * 50);
    this.playTone(freq, 0.1, 'sine', Math.min(0.5, 0.2 + comboCount * 0.1));
  }

  // Private helper method
  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
    this.initAudioContext();
    if (!this.audioContext || this.isMuted) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(this.gainNode!);
    
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    
    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(volume * this.sfxVolume * this.masterVolume, this.audioContext.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
    
    osc.start();
    osc.stop(this.audioContext.currentTime + duration);
  }

  // Volume controls
  setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(this.masterVolume, this.audioContext!.currentTime);
    }
  }

  setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
  }

  setSfxVolume(volume: number) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.audioContext!.currentTime);
    }
  }

  getMasterVolume() { return this.masterVolume; }
  getMusicVolume() { return this.musicVolume; }
  getSfxVolume() { return this.sfxVolume; }
  getIsMuted() { return this.isMuted; }
}

export const audioManager = AudioManager.getInstance();