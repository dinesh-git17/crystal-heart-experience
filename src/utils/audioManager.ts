// src/utils/audioManager.ts
// Audio manager with crack sounds, shatter effect, and background music support using Web Audio API

import { CRACK_SOUND_VOLUME } from '@/constants/crackLevels';
import type { CrackLevel } from '@/types/diamond';

class AudioManager {
  private context: AudioContext | null = null;
  private initialized = false;
  private muted = false;
  private volume = CRACK_SOUND_VOLUME;
  private gainNode: GainNode | null = null;
  private musicGainNode: GainNode | null = null;
  private currentMusicSource: OscillatorNode | null = null;
  private musicPlaying = false;
  private musicFadeInterval: number | null = null;

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      this.context = new (window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();

      this.gainNode = this.context.createGain();
      this.gainNode.connect(this.context.destination);
      this.gainNode.gain.value = this.muted ? 0 : this.volume;

      this.musicGainNode = this.context.createGain();
      this.musicGainNode.connect(this.context.destination);
      this.musicGainNode.gain.value = 0;

      this.initialized = true;

      if (this.context.state === 'suspended') {
        await this.context.resume();
      }
    } catch (error) {
      console.error('Failed to initialize AudioContext:', error);
    }
  }

  private async ensureContext(): Promise<boolean> {
    if (!this.context || !this.gainNode) {
      await this.initialize();
    }

    if (this.context?.state === 'suspended') {
      try {
        await this.context.resume();
      } catch (error) {
        console.error('Failed to resume AudioContext:', error);
        return false;
      }
    }

    return this.context !== null && this.gainNode !== null;
  }

  async playCrackSound(level: CrackLevel): Promise<void> {
    const ready = await this.ensureContext();
    if (!ready || !this.context || !this.gainNode) {
      return;
    }

    const baseFrequency = 800;
    const frequency = baseFrequency * (1 + level * 0.15);
    const duration = 0.15 - level * 0.01;

    const oscillator = this.context.createOscillator();
    const envelope = this.context.createGain();

    oscillator.connect(envelope);
    envelope.connect(this.gainNode);

    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;

    const now = this.context.currentTime;
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(0.3, now + 0.01);
    envelope.gain.exponentialRampToValueAtTime(0.01, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);

    oscillator.onended = () => {
      oscillator.disconnect();
      envelope.disconnect();
    };
  }

  async playShatterSound(): Promise<void> {
    const ready = await this.ensureContext();
    if (!ready || !this.context || !this.gainNode) {
      return;
    }

    const duration = 0.8;
    const now = this.context.currentTime;

    for (let i = 0; i < 8; i++) {
      const oscillator = this.context.createOscillator();
      const envelope = this.context.createGain();

      oscillator.connect(envelope);
      envelope.connect(this.gainNode);

      const frequency = 1200 + Math.random() * 800;
      oscillator.type = 'triangle';
      oscillator.frequency.value = frequency;

      const startTime = now + i * 0.05;
      const endTime = startTime + duration * 0.3;

      envelope.gain.setValueAtTime(0, startTime);
      envelope.gain.linearRampToValueAtTime(0.2, startTime + 0.01);
      envelope.gain.exponentialRampToValueAtTime(0.01, endTime);

      oscillator.start(startTime);
      oscillator.stop(endTime);

      oscillator.onended = () => {
        oscillator.disconnect();
        envelope.disconnect();
      };
    }
  }

  async startBackgroundMusic(): Promise<void> {
    const ready = await this.ensureContext();
    if (!ready || !this.context || !this.musicGainNode) {
      return;
    }

    if (this.musicPlaying) {
      return;
    }

    const oscillator = this.context.createOscillator();
    const lfoGain = this.context.createGain();
    const lfo = this.context.createOscillator();

    oscillator.type = 'sine';
    oscillator.frequency.value = 220;

    lfo.type = 'sine';
    lfo.frequency.value = 0.5;
    lfoGain.gain.value = 10;

    lfo.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);

    oscillator.connect(this.musicGainNode);

    oscillator.start();
    lfo.start();

    this.currentMusicSource = oscillator;
    this.musicPlaying = true;

    this.fadeInMusic(2.0);
  }

  fadeInMusic(duration: number): void {
    if (!this.musicGainNode || !this.musicPlaying) {
      return;
    }

    if (this.musicFadeInterval !== null) {
      window.clearInterval(this.musicFadeInterval);
    }

    const startVolume = this.musicGainNode.gain.value;
    const targetVolume = this.muted ? 0 : 0.15;
    const steps = 60;
    const stepDuration = (duration * 1000) / steps;
    const volumeStep = (targetVolume - startVolume) / steps;

    let currentStep = 0;

    this.musicFadeInterval = window.setInterval(() => {
      if (!this.musicGainNode) {
        if (this.musicFadeInterval !== null) {
          window.clearInterval(this.musicFadeInterval);
          this.musicFadeInterval = null;
        }
        return;
      }

      currentStep++;
      const newVolume = startVolume + volumeStep * currentStep;
      this.musicGainNode.gain.value = Math.max(0, Math.min(targetVolume, newVolume));

      if (currentStep >= steps) {
        if (this.musicFadeInterval !== null) {
          window.clearInterval(this.musicFadeInterval);
          this.musicFadeInterval = null;
        }
      }
    }, stepDuration);
  }

  fadeOutMusic(duration: number): void {
    if (!this.musicGainNode || !this.musicPlaying) {
      return;
    }

    if (this.musicFadeInterval !== null) {
      window.clearInterval(this.musicFadeInterval);
    }

    const startVolume = this.musicGainNode.gain.value;
    const targetVolume = 0;
    const steps = 60;
    const stepDuration = (duration * 1000) / steps;
    const volumeStep = (targetVolume - startVolume) / steps;

    let currentStep = 0;

    this.musicFadeInterval = window.setInterval(() => {
      if (!this.musicGainNode) {
        if (this.musicFadeInterval !== null) {
          window.clearInterval(this.musicFadeInterval);
          this.musicFadeInterval = null;
        }
        return;
      }

      currentStep++;
      const newVolume = startVolume + volumeStep * currentStep;
      this.musicGainNode.gain.value = Math.max(0, newVolume);

      if (currentStep >= steps) {
        if (this.musicFadeInterval !== null) {
          window.clearInterval(this.musicFadeInterval);
          this.musicFadeInterval = null;
        }
        this.stopMusic();
      }
    }, stepDuration);
  }

  pauseMusic(): void {
    if (!this.musicGainNode || !this.musicPlaying) {
      return;
    }

    this.musicGainNode.gain.value = 0;
  }

  resumeMusic(): void {
    if (!this.musicGainNode || !this.musicPlaying) {
      return;
    }

    this.musicGainNode.gain.value = this.muted ? 0 : 0.15;
  }

  private stopMusic(): void {
    if (this.currentMusicSource) {
      try {
        this.currentMusicSource.stop();
        this.currentMusicSource.disconnect();
      } catch (error) {
        console.error('Error stopping music:', error);
      }
      this.currentMusicSource = null;
    }
    this.musicPlaying = false;
  }

  setVolume(value: number): void {
    this.volume = Math.max(0, Math.min(1, value));
    if (this.gainNode && !this.muted) {
      this.gainNode.gain.value = this.volume;
    }
  }

  mute(): void {
    this.muted = true;
    if (this.gainNode) {
      this.gainNode.gain.value = 0;
    }
    if (this.musicGainNode) {
      this.musicGainNode.gain.value = 0;
    }
  }

  unmute(): void {
    this.muted = false;
    if (this.gainNode) {
      this.gainNode.gain.value = this.volume;
    }
    if (this.musicGainNode && this.musicPlaying) {
      this.musicGainNode.gain.value = 0.15;
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getVolume(): number {
    return this.volume;
  }

  isMusicPlaying(): boolean {
    return this.musicPlaying;
  }
}

export const audioManager = new AudioManager();
