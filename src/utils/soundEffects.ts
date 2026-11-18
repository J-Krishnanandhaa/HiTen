import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

// Hybrid High-Fidelity Audio Engine: Studio WAV Audio Files + Native Android TTS + Web Audio Fallback
const STORAGE_KEY = 'bandfit_sound_enabled';

class SoundPlayer {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private voiceEnabled: boolean = true;
  private isUnlocked: boolean = false;
  private audioCache: Map<string, HTMLAudioElement> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
          this.soundEnabled = stored === 'true';
        }
      } catch (e) {
        console.warn('Could not read sound preference:', e);
      }

      // Pre-warm audio cache with bundled studio-quality files
      this.preloadFiles([
        'voice_ready.wav',
        'voice_3.wav',
        'voice_2.wav',
        'voice_1.wav',
        'voice_start.wav',
        'voice_rest.wav',
        'voice_halfway.wav',
        'voice_complete.wav',
        'voice_sound_on.wav',
        'sfx_tick.wav',
        'sfx_whistle.wav',
        'sfx_bell.wav',
        'sfx_rest_chime.wav',
        'sfx_fanfare.wav',
      ]);

      // Auto-unlock Web Audio & Audio Elements on first user interaction anywhere in the app
      const autoUnlock = () => {
        this.unlockAudio();
      };

      ['touchstart', 'touchend', 'pointerdown', 'click', 'keydown'].forEach(evt => {
        window.addEventListener(evt, autoUnlock, { once: true, passive: true });
        document.addEventListener(evt, autoUnlock, { once: true, passive: true });
      });
    }
  }

  private preloadFiles(filenames: string[]) {
    if (typeof window === 'undefined') return;
    filenames.forEach(fn => {
      try {
        const audio = new Audio(`./audio/${fn}`);
        audio.preload = 'auto';
        this.audioCache.set(fn, audio);
      } catch (e) {}
    });
  }

  public unlockAudio() {
    if (typeof window === 'undefined') return;
    try {
      this.initCtx();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      if (!this.isUnlocked && this.ctx) {
        // Play an instantaneous silent buffer to unlock the mobile hardware audio pipeline
        const buffer = this.ctx.createBuffer(1, 1, 22050);
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(this.ctx.destination);
        source.start(0);
        this.isUnlocked = true;
      }
    } catch (e) {
      console.warn('Audio unlock warning:', e);
    }
  }

  private initCtx() {
    if (!this.soundEnabled) return;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  private playSoundFile(filename: string): boolean {
    if (!this.soundEnabled || typeof window === 'undefined') return false;
    try {
      this.unlockAudio();
      let audio = this.audioCache.get(filename);
      if (!audio) {
        audio = new Audio(`./audio/${filename}`);
        audio.preload = 'auto';
        this.audioCache.set(filename, audio);
      }

      audio.currentTime = 0;
      audio.volume = 1.0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.warn(`HTML Audio play failed for ${filename}:`, e);
        });
      }
      return true;
    } catch (e) {
      console.warn(`Error playing sound file ${filename}:`, e);
      return false;
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
        
        if (!enabled) {
          this.stopAll();
        } else {
          this.unlockAudio();
        }

        window.dispatchEvent(new CustomEvent('bandfit_sound_change', { detail: enabled }));
      }
    } catch (e) {
      console.warn('Error updating sound setting:', e);
    }
  }

  public toggleSound(): boolean {
    const next = !this.soundEnabled;
    this.setSoundEnabled(next);
    return next;
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public stopAll() {
    try {
      this.audioCache.forEach(audio => {
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch (e) {}
      });
      if (Capacitor.isNativePlatform()) {
        TextToSpeech.stop().catch(() => {});
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch (e) {
      console.warn('Stop speech error:', e);
    }
  }

  public async speak(text: string) {
    if (!this.soundEnabled || !this.voiceEnabled) {
      this.stopAll();
      return;
    }

    const trimmed = text.trim();
    const lower = trimmed.toLowerCase();

    // 1. Instant studio voice clip matching (zero latency, 100% offline & reliable)
    if (trimmed === '3') {
      this.playSoundFile('voice_3.wav');
      return;
    }
    if (trimmed === '2') {
      this.playSoundFile('voice_2.wav');
      return;
    }
    if (trimmed === '1') {
      this.playSoundFile('voice_1.wav');
      return;
    }
    if (lower.startsWith('ready to go')) {
      this.playSoundFile('voice_ready.wav');
      return;
    }
    if (lower === 'start!') {
      this.playSoundFile('voice_start.wav');
      return;
    }
    if (lower.includes('take a rest')) {
      this.playSoundFile('voice_rest.wav');
      return;
    }
    if (lower.includes('halfway')) {
      this.playSoundFile('voice_halfway.wav');
      return;
    }
    if (lower.includes('sound on')) {
      this.playSoundFile('voice_sound_on.wav');
      return;
    }
    if (lower.includes('workout complete') || lower.includes('great job')) {
      this.playSoundFile('voice_complete.wav');
      return;
    }

    // 2. Dynamic exercise name readout (e.g. "Set 1. Resistance Band Bicep Curl")
    if (Capacitor.isNativePlatform()) {
      try {
        await TextToSpeech.stop().catch(() => {});
        await TextToSpeech.speak({
          text,
          lang: 'en-US',
          rate: 1.0,
          pitch: 1.0,
          volume: 1.0,
          category: 'ambient',
        });
        return;
      } catch (e) {
        console.warn('Native TTS failed, falling back:', e);
      }
    }

    this.speakWeb(text);
  }

  private speakWeb(text: string) {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
    }
  }

  /** High-impact countdown tick beep */
  public playTick() {
    if (!this.soundEnabled) return;
    this.playSoundFile('sfx_tick.wav');
    this.playOscillatorTickFallback();
  }

  /** Professional Referee Start Whistle */
  public playStartWhistle() {
    if (!this.soundEnabled) return;
    this.playSoundFile('sfx_whistle.wav');
  }

  /** Authentic Boxing Gym Round Bell */
  public playBoxingBell() {
    if (!this.soundEnabled) return;
    this.playSoundFile('sfx_bell.wav');
  }

  /** Rest interval start chime */
  public playRestChime() {
    if (!this.soundEnabled) return;
    this.playSoundFile('sfx_rest_chime.wav');
  }

  /** Set completion - rings the boxing bell! */
  public playSetComplete() {
    this.playBoxingBell();
  }

  /** Full workout complete - plays victory fanfare! */
  public playWorkoutComplete() {
    if (!this.soundEnabled) return;
    this.playSoundFile('sfx_fanfare.wav');
  }

  // Pure Web Audio fallback for ticks if files are delayed
  private playOscillatorTickFallback() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {}
  }
}

export const sound = new SoundPlayer();
