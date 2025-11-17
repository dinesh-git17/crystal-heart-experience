// src/utils/testInteraction.ts
// Development-only utilities for testing diamond crack system without manual tapping

import { useDiamondStore } from '@/stores/diamondStore';
import { audioManager } from '@/utils/audioManager';
import { triggerHaptic } from '@/utils/haptics';
import { getCrackConfig } from '@/constants/crackLevels';
import type { CrackLevel } from '@/types/diamond';

export function simulateTap(count: number = 1): void {
  if (!import.meta.env.DEV) {
    console.warn('simulateTap is only available in development mode');
    return;
  }

  const { actions, crackLevel, isInteractive } = useDiamondStore.getState();

  if (!isInteractive) {
    console.warn('Diamond is not interactive');
    return;
  }

  let currentLevel = crackLevel;

  for (let i = 0; i < count; i++) {
    if (currentLevel >= 6) {
      console.log('Max crack level reached');
      break;
    }

    setTimeout(async () => {
      actions.registerTap();
      actions.increaseCrackLevel();

      const newLevel = useDiamondStore.getState().crackLevel;
      const config = getCrackConfig(newLevel);

      await audioManager.playCrackSound(newLevel);
      triggerHaptic(config.hapticIntensity);

      console.log(`Simulated tap ${i + 1}/${count}: Crack level ${newLevel}`);

      if (newLevel >= 6) {
        actions.setInteractive(false);
        console.log('Diamond ready to shatter - interaction disabled');
      }
    }, i * 300);

    currentLevel++;
  }
}

export function resetDiamond(): void {
  if (!import.meta.env.DEV) {
    console.warn('resetDiamond is only available in development mode');
    return;
  }

  const { actions } = useDiamondStore.getState();
  actions.resetDiamond();
  console.log('Diamond reset to pristine state');
}

export function setCrackLevel(level: CrackLevel): void {
  if (!import.meta.env.DEV) {
    console.warn('setCrackLevel is only available in development mode');
    return;
  }

  const state = useDiamondStore.getState();

  for (let i = state.crackLevel; i < level; i++) {
    state.actions.increaseCrackLevel();
  }

  console.log(`Crack level set to ${level}`);
}

export function logInteractionState(): void {
  if (!import.meta.env.DEV) {
    console.warn('logInteractionState is only available in development mode');
    return;
  }

  const state = useDiamondStore.getState();
  const config = getCrackConfig(state.crackLevel);

  console.group('Diamond Interaction State');
  console.log('Crack Level:', state.crackLevel);
  console.log('Tap Count:', state.tapCount);
  console.log('Is Interactive:', state.isInteractive);
  console.log('Last Tap:', new Date(state.lastTapTimestamp).toLocaleTimeString());
  console.log('Crack Config:', {
    opacity: config.opacity,
    intensity: config.intensity,
    particleCount: config.particleCount,
    hapticIntensity: config.hapticIntensity,
    audioPitch: config.audioPitch,
  });
  console.log('Audio Initialized:', audioManager.isInitialized());
  console.log('Audio Muted:', audioManager.isMuted());
  console.log('Audio Volume:', audioManager.getVolume());
  console.groupEnd();
}

export function testAudioSequence(): void {
  if (!import.meta.env.DEV) {
    console.warn('testAudioSequence is only available in development mode');
    return;
  }

  console.log('Testing audio sequence (all 7 crack levels)...');

  for (let i = 0; i <= 6; i++) {
    setTimeout(async () => {
      await audioManager.playCrackSound(i as CrackLevel);
      console.log(`Played crack sound for level ${i}`);
    }, i * 500);
  }
}

export function testHapticSequence(): void {
  if (!import.meta.env.DEV) {
    console.warn('testHapticSequence is only available in development mode');
    return;
  }

  console.log('Testing haptic sequence (light → medium → heavy)...');

  setTimeout(() => {
    triggerHaptic('light');
    console.log('Triggered light haptic');
  }, 0);

  setTimeout(() => {
    triggerHaptic('medium');
    console.log('Triggered medium haptic');
  }, 500);

  setTimeout(() => {
    triggerHaptic('heavy');
    console.log('Triggered heavy haptic');
  }, 1000);
}

export const testUtils = {
  simulateTap,
  resetDiamond,
  setCrackLevel,
  logInteractionState,
  testAudioSequence,
  testHapticSequence,
};

if (import.meta.env.DEV) {
  (window as unknown as { testUtils: typeof testUtils }).testUtils = testUtils;
  console.log('Test utilities available: window.testUtils');
  console.log('Available commands:');
  console.log('  - testUtils.simulateTap(count)');
  console.log('  - testUtils.resetDiamond()');
  console.log('  - testUtils.setCrackLevel(0-6)');
  console.log('  - testUtils.logInteractionState()');
  console.log('  - testUtils.testAudioSequence()');
  console.log('  - testUtils.testHapticSequence()');
}
