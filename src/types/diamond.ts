// src/types/diamond.ts
// Type definitions for diamond object, crack system, material properties, and interaction events

import type * as THREE from 'three';

export type CrackLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface DiamondState {
  crackLevel: CrackLevel;
  isInteractive: boolean;
  rotation: [number, number, number];
  position: [number, number, number];
}

export interface DiamondMaterialConfig {
  color: string;
  transmission: number;
  roughness: number;
  metalness: number;
  ior: number;
  thickness: number;
  emissive: string;
  emissiveIntensity: number;
  envMapIntensity: number;
  clearcoat: number;
  clearcoatRoughness: number;
}

export interface CrackConfig {
  level: CrackLevel;
  opacity: number;
  intensity: number;
  textureScale: number;
  roughnessModifier: number;
  transmissionModifier: number;
  particleCount: number;
  audioPitch: number;
  hapticIntensity: 'light' | 'medium' | 'heavy';
  description: string;
}

export interface ShardConfig {
  count: number;
  size: number;
  velocity: number;
  lifespan: number;
  spread: number;
  gravity: number;
}

export interface TapEvent {
  point: THREE.Vector3;
  timestamp: number;
  crackLevel: CrackLevel;
  normal: THREE.Vector3;
}

export interface DiamondGeometryConfig {
  detail: number;
  radius: number;
  scale: [number, number, number];
}

export interface ParticleShardData {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  rotationVelocity: THREE.Vector3;
  size: number;
  opacity: number;
  lifeProgress: number;
  maxLife: number;
  active: boolean;
}

export const DEFAULT_DIAMOND_MATERIAL: DiamondMaterialConfig = {
  color: '#ff69b4',
  transmission: 1.0,
  roughness: 0.1,
  metalness: 0,
  ior: 2.417,
  thickness: 0.5,
  emissive: '#ff1f8f',
  emissiveIntensity: 0.1,
  envMapIntensity: 1.5,
  clearcoat: 1.0,
  clearcoatRoughness: 0.1,
};

export const DEFAULT_DIAMOND_GEOMETRY: DiamondGeometryConfig = {
  detail: 1,
  radius: 1,
  scale: [1, 1.2, 1],
};

export const DEFAULT_SHARD_CONFIG: ShardConfig = {
  count: 20,
  size: 0.03,
  velocity: 0.5,
  lifespan: 2000,
  spread: 1.0,
  gravity: 0.3,
};
