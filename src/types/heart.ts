// src/types/heart.ts
// Type definitions for heart component, animations, materials, and transition orchestration with cinematic polish

import type * as THREE from 'three';

export interface HeartState {
  isVisible: boolean;
  scale: number;
  rotation: number;
  pulsePhase: number;
  glowIntensity: number;
}

export interface HeartMaterialConfig {
  color: string;
  emissive: string;
  emissiveIntensity: number;
  roughness: number;
  metalness: number;
  transmission: number;
  ior: number;
  thickness: number;
  clearcoat: number;
  clearcoatRoughness: number;
}

export interface SubsurfaceScatterConfig {
  enabled: boolean;
  color: string;
  intensity: number;
  distortion: number;
  power: number;
  scale: number;
}

export interface InternalPulseConfig {
  enabled: boolean;
  frequency: number;
  amplitude: number;
  baseIntensity: number;
  peakIntensity: number;
}

export interface HeartbeatIdleConfig {
  enabled: boolean;
  beatInterval: number;
  scaleAmplitude: number;
  glowAmplitude: number;
  rotationDrift: number;
}

export interface AmbientGlowConfig {
  enabled: boolean;
  color: string;
  intensity: number;
  distance: number;
  decay: number;
}

export interface MicroHighlightsConfig {
  enabled: boolean;
  intensity: number;
  sharpness: number;
  color: string;
}

export interface HeartAnimationConfig {
  fadeInDuration: number;
  scaleUpDuration: number;
  entranceRotations: number;
  targetScale: number;
  overshootScale: number;
  rotationDuration: number;
  breathInDelay: number;
  breathInDuration: number;
  breathInScale: number;
}

export interface CinematicCameraConfig {
  enabled: boolean;
  dollyDistance: number;
  dollyDuration: number;
  dollyDelay: number;
  focusTransitionDuration: number;
}

export interface HeartLightingConfig {
  spotlight: {
    enabled: boolean;
    intensity: number;
    angle: number;
    penumbra: number;
    fadeInDuration: number;
    color: string;
  };
  backgroundDim: {
    enabled: boolean;
    dimAmount: number;
    transitionDuration: number;
  };
  pinkShockwave: {
    enabled: boolean;
    intensity: number;
    duration: number;
    radius: number;
    color: string;
  };
}

export interface LightFlareConfig {
  enabled: boolean;
  count: number;
  duration: number;
  intensity: number;
  spread: number;
}

export enum TransitionPhase {
  IDLE = 'IDLE',
  SHATTER_START = 'SHATTER_START',
  SHATTER_ACTIVE = 'SHATTER_ACTIVE',
  SHATTER_COMPLETE = 'SHATTER_COMPLETE',
  PAUSE = 'PAUSE',
  HEART_FADE_IN = 'HEART_FADE_IN',
  HEART_ENTRANCE = 'HEART_ENTRANCE',
  HEART_BREATH_IN = 'HEART_BREATH_IN',
  TRANSITION_COMPLETE = 'TRANSITION_COMPLETE',
}

export interface FragmentData {
  id: string;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  rotationVelocity: THREE.Vector3;
  scale: number;
  opacity: number;
  lifeProgress: number;
  maxLife: number;
  active: boolean;
}

export interface TransitionTimeline {
  shatterStart: number;
  shatterDuration: number;
  pauseStart: number;
  pauseDuration: number;
  heartFadeStart: number;
  heartFadeDuration: number;
  heartEntranceStart: number;
  heartEntranceDuration: number;
  heartBreathStart: number;
  heartBreathDuration: number;
  totalDuration: number;
}

export interface ShatterConfig {
  fragmentCount: number;
  minFragmentSize: number;
  maxFragmentSize: number;
  initialVelocity: number;
  velocityVariation: number;
  rotationSpeed: number;
  gravity: number;
  duration: number;
  staggerDelay: number;
  trailIntensity: number;
  glowBurstEnabled: boolean;
}

export const DEFAULT_HEART_STATE: HeartState = {
  isVisible: false,
  scale: 0,
  rotation: 0,
  pulsePhase: 0,
  glowIntensity: 0.8,
};

export const DEFAULT_HEART_MATERIAL: HeartMaterialConfig = {
  color: '#ff69b4',
  emissive: '#ff1493',
  emissiveIntensity: 0.8,
  roughness: 0.4,
  metalness: 0.3,
  transmission: 0.2,
  ior: 1.5,
  thickness: 0.5,
  clearcoat: 0.6,
  clearcoatRoughness: 0.15,
};

export const SUBSURFACE_SCATTER: SubsurfaceScatterConfig = {
  enabled: true,
  color: '#ff85c1',
  intensity: 0.6,
  distortion: 0.4,
  power: 2.0,
  scale: 1.0,
};

export const INTERNAL_PULSE: InternalPulseConfig = {
  enabled: true,
  frequency: 0.4,
  amplitude: 0.015,
  baseIntensity: 0.8,
  peakIntensity: 0.85,
};

export const HEARTBEAT_IDLE: HeartbeatIdleConfig = {
  enabled: true,
  beatInterval: 2.5,
  scaleAmplitude: 0.01,
  glowAmplitude: 0.08,
  rotationDrift: 0.0003,
};

export const AMBIENT_GLOW: AmbientGlowConfig = {
  enabled: true,
  color: '#ff69b4',
  intensity: 0.6,
  distance: 3.5,
  decay: 2.0,
};

export const MICRO_HIGHLIGHTS: MicroHighlightsConfig = {
  enabled: true,
  intensity: 0.4,
  sharpness: 0.9,
  color: '#ffffff',
};

export const DEFAULT_HEART_ANIMATION: HeartAnimationConfig = {
  fadeInDuration: 0.5,
  scaleUpDuration: 1.2,
  entranceRotations: 2,
  targetScale: 1.0,
  overshootScale: 1.08,
  rotationDuration: 1.2,
  breathInDelay: 0.3,
  breathInDuration: 0.6,
  breathInScale: 1.02,
};

export const CINEMATIC_CAMERA: CinematicCameraConfig = {
  enabled: true,
  dollyDistance: 0.3,
  dollyDuration: 1.5,
  dollyDelay: 0.5,
  focusTransitionDuration: 0.8,
};

export const HEART_LIGHTING: HeartLightingConfig = {
  spotlight: {
    enabled: true,
    intensity: 1.2,
    angle: Math.PI / 6,
    penumbra: 0.4,
    fadeInDuration: 0.8,
    color: '#ffb3d9',
  },
  backgroundDim: {
    enabled: true,
    dimAmount: 0.4,
    transitionDuration: 0.6,
  },
  pinkShockwave: {
    enabled: true,
    intensity: 0.8,
    duration: 0.4,
    radius: 5.0,
    color: '#ff69b4',
  },
};

export const LIGHT_FLARES: LightFlareConfig = {
  enabled: true,
  count: 4,
  duration: 0.3,
  intensity: 0.9,
  spread: 0.5,
};

export const DEFAULT_SHATTER_CONFIG: ShatterConfig = {
  fragmentCount: 12,
  minFragmentSize: 0.25,
  maxFragmentSize: 0.45,
  initialVelocity: 2.8,
  velocityVariation: 0.5,
  rotationSpeed: 3.5,
  gravity: 0.35,
  duration: 1.8,
  staggerDelay: 0.015,
  trailIntensity: 0.25,
  glowBurstEnabled: true,
};

export const TRANSITION_TIMELINE: TransitionTimeline = {
  shatterStart: 0,
  shatterDuration: 1.8,
  pauseStart: 1.8,
  pauseDuration: 0.3,
  heartFadeStart: 2.1,
  heartFadeDuration: 0.5,
  heartEntranceStart: 2.1,
  heartEntranceDuration: 1.2,
  heartBreathStart: 3.3,
  heartBreathDuration: 0.6,
  totalDuration: 3.9,
};
