// src/types/heart.ts
// Type definitions for heart component, animations, materials, and transition orchestration

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

export interface HeartAnimationConfig {
  fadeInDuration: number;
  scaleUpDuration: number;
  entranceRotations: number;
  targetScale: number;
  overshootScale: number;
  rotationDuration: number;
}

export enum TransitionPhase {
  IDLE = 'IDLE',
  SHATTER_START = 'SHATTER_START',
  SHATTER_ACTIVE = 'SHATTER_ACTIVE',
  SHATTER_COMPLETE = 'SHATTER_COMPLETE',
  PAUSE = 'PAUSE',
  HEART_FADE_IN = 'HEART_FADE_IN',
  HEART_ENTRANCE = 'HEART_ENTRANCE',
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
  thickness: 0.3,
  clearcoat: 0.5,
  clearcoatRoughness: 0.2,
};

export const DEFAULT_HEART_ANIMATION: HeartAnimationConfig = {
  fadeInDuration: 0.5,
  scaleUpDuration: 1.2,
  entranceRotations: 2,
  targetScale: 1.0,
  overshootScale: 1.1,
  rotationDuration: 1.2,
};

export const DEFAULT_SHATTER_CONFIG: ShatterConfig = {
  fragmentCount: 10,
  minFragmentSize: 0.8,
  maxFragmentSize: 1.2,
  initialVelocity: 2.5,
  velocityVariation: 0.4,
  rotationSpeed: 3.0,
  gravity: 0.3,
  duration: 1.8,
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
  totalDuration: 3.3,
};
