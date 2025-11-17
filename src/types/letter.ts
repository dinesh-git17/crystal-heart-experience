// src/types/letter.ts
// Type definitions for letter component with enhanced visibility

export interface LetterState {
  isVisible: boolean;
  position: [number, number, number];
  rotation: [number, number, number];
  floatPhase: number;
  scale: number;
  opacity: number;
}

export interface LetterGeometryConfig {
  foldCount: number;
  paperSize: [number, number];
  thickness: number;
}

export interface LetterMaterialConfig {
  color: string;
  emissive: string;
  emissiveIntensity: number;
  roughness: number;
  metalness: number;
  opacity: number;
}

export interface LetterAnimationConfig {
  floatAmplitude: number;
  floatSpeed: number;
  shimmerIntensity: number;
}

export interface HeartPulseConfig {
  bpm: number;
  scaleRange: [number, number];
  emissiveRange: [number, number];
  duration: number;
  easing: (t: number) => number;
}

export interface InteractionHintConfig {
  activationDelay: number;
  intensityMultiplier: number;
  duration: number;
}

export const DEFAULT_LETTER_STATE: LetterState = {
  isVisible: false,
  position: [0, 0, 0.5],
  rotation: [0, 0, 0],
  floatPhase: 0,
  scale: 0.5,
  opacity: 0.85,
};

export const DEFAULT_LETTER_GEOMETRY: LetterGeometryConfig = {
  foldCount: 2,
  paperSize: [0.25, 0.35],
  thickness: 0.02,
};

export const DEFAULT_LETTER_MATERIAL: LetterMaterialConfig = {
  color: '#ffffff',
  emissive: '#ffe5b4',
  emissiveIntensity: 1.5,
  roughness: 0.6,
  metalness: 0,
  opacity: 0.85,
};

export const DEFAULT_LETTER_ANIMATION: LetterAnimationConfig = {
  floatAmplitude: 0.05,
  floatSpeed: 0.3,
  shimmerIntensity: 0.4,
};

export const DEFAULT_HEART_PULSE: HeartPulseConfig = {
  bpm: 140,
  scaleRange: [1.0, 1.08],
  emissiveRange: [0.8, 1.2],
  duration: 0.4286,
  easing: (t: number) => Math.sin(t * Math.PI * 2) * 0.5 + 0.5,
};

export const DEFAULT_INTERACTION_HINT: InteractionHintConfig = {
  activationDelay: 5000,
  intensityMultiplier: 1.5,
  duration: -1,
};
