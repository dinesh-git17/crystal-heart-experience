// src/utils/audioManager.ts
// Audio manager with custom crack, shatter, looping background music, and optional heartbeat sound using Web Audio API

import { CRACK_SOUND_VOLUME } from '@/constants/crackLevels';
import type { CrackLevel } from '@/types/diamond';
import { BACKGROUND_MUSIC_BPM } from '@/utils/bpmSync';

interface MusicLoopConfig {
  loopStart: number;
  loopEnd: number;
  fadeInDuration: number;
  fadeOutDuration: number;
}

const DEFAULT_MUSIC_CONFIG: MusicLoopConfig = {
  loopStart: 0,
  loopEnd: 0,
  fadeInDuration: 2.0,
  fadeOutDuration: 2.0,
};

class AudioManager {
  private context: AudioContext | null = null;
  private initialized = false;
  private muted = false;
  private volume = CRACK_SOUND_VOLUME;
  private gainNode: GainNode | null = null;
  private musicGainNode: GainNode | null = null;
  private heartbeatGainNode: GainNode | null = null;
  private currentMusicSource: AudioBufferSourceNode | null = null;
  private musicPlaying = false;
  private musicFadeInterval: number | null = null;
  private crackSoundBuffer: AudioBuffer | null = null;
  private crackSoundLoaded = false;
  private shatterSoundBuffer: AudioBuffer | null = null;
  private shatterSoundLoaded = false;
  private backgroundMusicBuffer: AudioBuffer | null = null;
  private backgroundMusicLoaded = false;
  private musicConfig: MusicLoopConfig = DEFAULT_MUSIC_CONFIG;
  private heartbeatEnabled = false;
  private heartbeatVolume = 0.08;
  private lastHeartbeatPhase = -1;

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

      this.heartbeatGainNode = this.context.createGain();
      this.heartbeatGainNode.connect(this.context.destination);
      this.heartbeatGainNode.gain.value = 0;

      this.initialized = true;

      await this.loadCrackSound();
      await this.loadShatterSound();
      await this.loadBackgroundMusic();

      if (import.meta.env.DEV) {
        console.log('AudioManager initialized successfully');
      }
    } catch (error) {
      console.error('Failed to initialize AudioManager:', error);
      this.initialized = false;
    }
  }

  private async loadCrackSound(): Promise<void> {
    if (!this.context || this.crackSoundLoaded) {
      return;
    }

    try {
      const response = await fetch('/audio/crack.wav');
      const arrayBuffer = await response.arrayBuffer();
      this.crackSoundBuffer = await this.context.decodeAudioData(arrayBuffer);
      this.crackSoundLoaded = true;

      if (import.meta.env.DEV) {
        console.log('Crack sound loaded successfully');
      }
    } catch (error) {
      console.error('Failed to load crack sound, falling back to synthesized:', error);
      this.crackSoundLoaded = false;
    }
  }

  private async loadShatterSound(): Promise<void> {
    if (!this.context || this.shatterSoundLoaded) {
      return;
    }

    try {
      const response = await fetch('/audio/shatter.wav');
      const arrayBuffer = await response.arrayBuffer();
      this.shatterSoundBuffer = await this.context.decodeAudioData(arrayBuffer);
      this.shatterSoundLoaded = true;

      if (import.meta.env.DEV) {
        console.log('Shatter sound loaded successfully');
      }
    } catch (error) {
      console.error('Failed to load shatter sound, falling back to synthesized:', error);
      this.shatterSoundLoaded = false;
    }
  }

  private async loadBackgroundMusic(): Promise<void> {
    if (!this.context || this.backgroundMusicLoaded) {
      return;
    }

    try {
      const response = await fetch('/audio/background-music.mp3');
      const arrayBuffer = await response.arrayBuffer();
      this.backgroundMusicBuffer = await this.context.decodeAudioData(arrayBuffer);
      this.backgroundMusicLoaded = true;

      const duration = this.backgroundMusicBuffer.duration;
      this.musicConfig.loopEnd = duration;

      if (import.meta.env.DEV) {
        console.log('Background music loaded successfully');
        console.log('Duration:', duration.toFixed(2), 'seconds');
        console.log('BPM:', BACKGROUND_MUSIC_BPM);
        console.log('Loop: start =', this.musicConfig.loopStart, 'end =', this.musicConfig.loopEnd);
      }
    } catch (error) {
      console.error('Failed to load background music, falling back to synthesized:', error);
      this.backgroundMusicLoaded = false;
    }
  }

  setMusicLoopPoints(loopStart: number, loopEnd: number): void {
    this.musicConfig.loopStart = loopStart;
    this.musicConfig.loopEnd = loopEnd;

    if (import.meta.env.DEV) {
      console.log('Music loop points updated:', { loopStart, loopEnd });
    }
  }

  getMusicBPM(): number {
    return BACKGROUND_MUSIC_BPM;
  }

  enableHeartbeat(): void {
    this.heartbeatEnabled = true;
    if (import.meta.env.DEV) {
      console.log('Heartbeat sound enabled');
    }
  }

  disableHeartbeat(): void {
    this.heartbeatEnabled = false;
    if (import.meta.env.DEV) {
      console.log('Heartbeat sound disabled');
    }
  }

  setHeartbeatVolume(volume: number): void {
    this.heartbeatVolume = Math.max(0, Math.min(1, volume));
    if (import.meta.env.DEV) {
      console.log('Heartbeat volume set to:', this.heartbeatVolume);
    }
  }

  syncHeartbeatToPulse(pulsePhase: number): void {
    if (!this.heartbeatEnabled || !this.context || !this.heartbeatGainNode) {
      return;
    }

    const peakThreshold = 0.05;
    const isAtPeak = pulsePhase < peakThreshold;

    if (isAtPeak && this.lastHeartbeatPhase >= peakThreshold) {
      this.playHeartbeatSound();
    }

    this.lastHeartbeatPhase = pulsePhase;
  }

  playHeartbeatSound(): void {
    if (!this.context || !this.heartbeatGainNode || this.muted) {
      return;
    }

    const oscillator = this.context.createOscillator();
    const envelope = this.context.createGain();

    oscillator.connect(envelope);
    envelope.connect(this.heartbeatGainNode);

    oscillator.type = 'sine';
    oscillator.frequency.value = 60;

    const now = this.context.currentTime;
    const duration = 0.15;

    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(this.heartbeatVolume, now + 0.02);
    envelope.gain.exponentialRampToValueAtTime(0.001, now + duration);

    this.heartbeatGainNode.gain.value = this.muted ? 0 : 1;

    oscillator.start(now);
    oscillator.stop(now + duration);

    oscillator.onended = () => {
      oscillator.disconnect();
      envelope.disconnect();
    };
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

    if (this.crackSoundBuffer && this.crackSoundLoaded) {
      this.playCustomCrackSound(level);
    } else {
      this.playSynthesizedCrackSound(level);
    }
  }

  private playCustomCrackSound(level: CrackLevel): void {
    if (!this.context || !this.gainNode || !this.crackSoundBuffer) {
      return;
    }

    const source = this.context.createBufferSource();
    source.buffer = this.crackSoundBuffer;

    const crackGain = this.context.createGain();
    const volumeScale = 0.6 + level * 0.06;
    crackGain.gain.value = volumeScale;

    source.connect(crackGain);
    crackGain.connect(this.gainNode);

    const playbackRate = 0.95 + level * 0.02;
    source.playbackRate.value = playbackRate;

    source.start(0);

    source.onended = () => {
      source.disconnect();
      crackGain.disconnect();
    };
  }

  private playSynthesizedCrackSound(level: CrackLevel): void {
    if (!this.context || !this.gainNode) {
      return;
    }

    const oscillator = this.context.createOscillator();
    const envelope = this.context.createGain();

    oscillator.connect(envelope);
    envelope.connect(this.gainNode);

    const baseFrequency = 800 + level * 100;
    oscillator.type = 'square';
    oscillator.frequency.value = baseFrequency;

    const now = this.context.currentTime;
    const duration = 0.15;

    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(0.3, now + 0.01);
    envelope.gain.exponentialRampToValueAtTime(0.01, now + duration);

    oscillator.frequency.exponentialRampToValueAtTime(baseFrequency * 0.5, now + duration);

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

    if (this.shatterSoundBuffer && this.shatterSoundLoaded) {
      this.playCustomShatterSound();
    } else {
      this.playSynthesizedShatterSound();
    }
  }

  private playCustomShatterSound(): void {
    if (!this.context || !this.gainNode || !this.shatterSoundBuffer) {
      return;
    }

    const source = this.context.createBufferSource();
    source.buffer = this.shatterSoundBuffer;

    const shatterGain = this.context.createGain();
    shatterGain.gain.value = 1.0;

    source.connect(shatterGain);
    shatterGain.connect(this.gainNode);

    source.start(0);

    source.onended = () => {
      source.disconnect();
      shatterGain.disconnect();
    };
  }

  private playSynthesizedShatterSound(): void {
    if (!this.context || !this.gainNode) {
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

    if (this.backgroundMusicBuffer && this.backgroundMusicLoaded) {
      this.playCustomBackgroundMusic();
    } else {
      this.playSynthesizedBackgroundMusic();
    }
  }

  private playCustomBackgroundMusic(): void {
    if (!this.context || !this.musicGainNode || !this.backgroundMusicBuffer) {
      return;
    }

    const source = this.context.createBufferSource();
    source.buffer = this.backgroundMusicBuffer;

    source.loop = true;
    source.loopStart = this.musicConfig.loopStart;
    source.loopEnd = this.musicConfig.loopEnd;

    source.connect(this.musicGainNode);

    source.start(0);

    this.currentMusicSource = source;
    this.musicPlaying = true;

    this.fadeInMusic(this.musicConfig.fadeInDuration);

    if (import.meta.env.DEV) {
      console.log('Custom background music started with loop:', {
        loopStart: this.musicConfig.loopStart,
        loopEnd: this.musicConfig.loopEnd,
        bpm: BACKGROUND_MUSIC_BPM,
      });
    }
  }

  private playSynthesizedBackgroundMusic(): void {
    if (!this.context || !this.musicGainNode) {
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

    this.currentMusicSource = oscillator as unknown as AudioBufferSourceNode;
    this.musicPlaying = true;

    this.fadeInMusic(this.musicConfig.fadeInDuration);
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
    const steps = 20;
    const stepDuration = (duration * 1000) / steps;
    const volumeStep = (targetVolume - startVolume) / steps;

    let currentStep = 0;

    this.musicFadeInterval = window.setInterval(() => {
      currentStep++;

      if (currentStep >= steps || !this.musicGainNode) {
        if (this.musicFadeInterval !== null) {
          window.clearInterval(this.musicFadeInterval);
          this.musicFadeInterval = null;
        }
        if (this.musicGainNode) {
          this.musicGainNode.gain.value = targetVolume;
        }
        return;
      }

      if (this.musicGainNode) {
        this.musicGainNode.gain.value = startVolume + volumeStep * currentStep;
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
    const steps = 20;
    const stepDuration = (duration * 1000) / steps;
    const volumeStep = (targetVolume - startVolume) / steps;

    let currentStep = 0;

    this.musicFadeInterval = window.setInterval(() => {
      currentStep++;

      if (currentStep >= steps || !this.musicGainNode) {
        if (this.musicFadeInterval !== null) {
          window.clearInterval(this.musicFadeInterval);
          this.musicFadeInterval = null;
        }
        if (this.musicGainNode) {
          this.musicGainNode.gain.value = 0;
        }
        this.stopMusic();
        return;
      }

      if (this.musicGainNode) {
        this.musicGainNode.gain.value = startVolume + volumeStep * currentStep;
      }
    }, stepDuration);
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
    if (this.heartbeatGainNode) {
      this.heartbeatGainNode.gain.value = 0;
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
