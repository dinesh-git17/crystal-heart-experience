// src/utils/audioManager.ts
// Audio manager for crack sounds using Web Audio API with policy-compliant initialization

import { CRACK_SOUND_VOLUME } from '@/constants/crackLevels';
import type { CrackLevel } from '@/types/diamond';

class AudioManager {
  private context: AudioContext | null = null;
  private initialized = false;
  private muted = false;
  private volume = CRACK_SOUND_VOLUME;
  private gainNode: GainNode | null = null;

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
  }

  unmute(): void {
    this.muted = false;
    if (this.gainNode) {
      this.gainNode.gain.value = this.volume;
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
}

export const audioManager = new AudioManager();
