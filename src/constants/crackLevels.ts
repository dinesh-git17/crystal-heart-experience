// src/constants/crackLevels.ts
// Configuration for 7 crack progression levels with visual, audio, and haptic properties

import type { CrackConfig } from '@/types/diamond';

export const CRACK_LEVELS: CrackConfig[] = [
  {
    level: 0,
    opacity: 0,
    intensity: 0,
    textureScale: 1.0,
    roughnessModifier: 0,
    transmissionModifier: 0,
    particleCount: 0,
    audioPitch: 1.0,
    hapticIntensity: 'light',
    description: 'Pristine - No damage',
  },
  {
    level: 1,
    opacity: 0.15,
    intensity: 0.2,
    textureScale: 1.0,
    roughnessModifier: 0.05,
    transmissionModifier: -0.05,
    particleCount: 15,
    audioPitch: 1.0,
    hapticIntensity: 'light',
    description: 'First crack - Light surface damage',
  },
  {
    level: 2,
    opacity: 0.3,
    intensity: 0.35,
    textureScale: 1.1,
    roughnessModifier: 0.1,
    transmissionModifier: -0.1,
    particleCount: 18,
    audioPitch: 1.1,
    hapticIntensity: 'light',
    description: 'Minor cracks - Visible damage spreading',
  },
  {
    level: 3,
    opacity: 0.5,
    intensity: 0.5,
    textureScale: 1.2,
    roughnessModifier: 0.15,
    transmissionModifier: -0.15,
    particleCount: 20,
    audioPitch: 1.2,
    hapticIntensity: 'medium',
    description: 'Moderate damage - Structural integrity compromised',
  },
  {
    level: 4,
    opacity: 0.65,
    intensity: 0.65,
    textureScale: 1.3,
    roughnessModifier: 0.2,
    transmissionModifier: -0.25,
    particleCount: 22,
    audioPitch: 1.3,
    hapticIntensity: 'medium',
    description: 'Heavy damage - Major structural weakness',
  },
  {
    level: 5,
    opacity: 0.8,
    intensity: 0.8,
    textureScale: 1.4,
    roughnessModifier: 0.25,
    transmissionModifier: -0.35,
    particleCount: 25,
    audioPitch: 1.4,
    hapticIntensity: 'heavy',
    description: 'Severe damage - Near breaking point',
  },
  {
    level: 6,
    opacity: 1.0,
    intensity: 1.0,
    textureScale: 1.5,
    roughnessModifier: 0.3,
    transmissionModifier: -0.5,
    particleCount: 25,
    audioPitch: 1.5,
    hapticIntensity: 'heavy',
    description: 'Critical - Ready to shatter',
  },
];

export const MIN_CRACK_LEVEL: CrackConfig['level'] = 0;
export const MAX_CRACK_LEVEL: CrackConfig['level'] = 6;
export const TOTAL_CRACK_LEVELS = CRACK_LEVELS.length;

export const CRACK_ANIMATION_DURATION = 300;
export const PARTICLE_EMISSION_DELAY = 50;
export const CRACK_SOUND_VOLUME = 0.7;

export function getCrackConfig(level: CrackConfig['level']): CrackConfig {
  return CRACK_LEVELS[level] ?? CRACK_LEVELS[0]!;
}

export function isMaxCrackLevel(level: CrackConfig['level']): boolean {
  return level >= MAX_CRACK_LEVEL;
}

export function getNextCrackLevel(currentLevel: CrackConfig['level']): CrackConfig['level'] | null {
  if (currentLevel >= MAX_CRACK_LEVEL) {
    return null;
  }
  return (currentLevel + 1) as CrackConfig['level'];
}
