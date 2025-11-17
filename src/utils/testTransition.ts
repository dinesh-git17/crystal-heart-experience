// src/utils/testTransition.ts
// Development-only utilities for testing Phase 3 transition without manual tapping

import { useDiamondStore } from '@/stores/diamondStore';
import { useHeartStore } from '@/stores/heartStore';
import { audioManager } from '@/utils/audioManager';

export function autoShatter(): void {
  if (!import.meta.env.DEV) {
    console.warn('autoShatter is only available in development mode');
    return;
  }

  const diamondState = useDiamondStore.getState();

  while (diamondState.crackLevel < 6) {
    diamondState.actions.increaseCrackLevel();
  }

  diamondState.actions.setInteractive(false);

  console.log('Diamond set to crack level 6 (ready to shatter)');
}

export function skipToHeart(): void {
  if (!import.meta.env.DEV) {
    console.warn('skipToHeart is only available in development mode');
    return;
  }

  const diamondState = useDiamondStore.getState();
  const heartState = useHeartStore.getState();

  while (diamondState.crackLevel < 6) {
    diamondState.actions.increaseCrackLevel();
  }

  diamondState.actions.setInteractive(false);

  heartState.actions.startReveal();
  heartState.actions.completeReveal();

  console.log('Skipped to heart idle state (bypass shatter animation)');
}

export function resetTransition(): void {
  if (!import.meta.env.DEV) {
    console.warn('resetTransition is only available in development mode');
    return;
  }

  const diamondState = useDiamondStore.getState();
  const heartState = useHeartStore.getState();

  diamondState.actions.resetDiamond();
  heartState.actions.resetHeart();

  console.log('Full reset: diamond pristine, heart hidden');
}

export function logTransitionState(): void {
  if (!import.meta.env.DEV) {
    console.warn('logTransitionState is only available in development mode');
    return;
  }

  const diamondState = useDiamondStore.getState();
  const heartState = useHeartStore.getState();

  console.group('Phase 3 Transition State');
  console.log('Diamond:');
  console.log('  Crack Level:', diamondState.crackLevel);
  console.log('  Interactive:', diamondState.isInteractive);
  console.log('  Tap Count:', diamondState.tapCount);
  console.log('  Tap Positions:', diamondState.tapPositions.length);
  console.log('');
  console.log('Heart:');
  console.log('  Visible:', heartState.isVisible);
  console.log('  Scale:', heartState.scale.toFixed(3));
  console.log('  Rotation:', heartState.rotation.toFixed(3));
  console.log('  Animating:', heartState.isAnimating);
  console.log('  Has Revealed:', heartState.hasRevealed);
  console.log('  Glow Intensity:', heartState.glowIntensity.toFixed(3));
  console.log('');
  console.log('Audio:');
  console.log('  Initialized:', audioManager.isInitialized());
  console.log('  Muted:', audioManager.isMuted());
  console.log('  Music Playing:', audioManager.isMusicPlaying());
  console.groupEnd();
}

export function testShatterSound(): void {
  if (!import.meta.env.DEV) {
    console.warn('testShatterSound is only available in development mode');
    return;
  }

  console.log('Testing shatter sound...');
  audioManager.playShatterSound();
}

export function testBackgroundMusic(): void {
  if (!import.meta.env.DEV) {
    console.warn('testBackgroundMusic is only available in development mode');
    return;
  }

  console.log('Testing background music (with fade-in)...');
  audioManager.startBackgroundMusic();
}

export function stopBackgroundMusic(): void {
  if (!import.meta.env.DEV) {
    console.warn('stopBackgroundMusic is only available in development mode');
    return;
  }

  console.log('Fading out background music...');
  audioManager.fadeOutMusic(1.0);
}

export function measureTransitionTiming(): void {
  if (!import.meta.env.DEV) {
    console.warn('measureTransitionTiming is only available in development mode');
    return;
  }

  console.group('Phase 3 Transition Timeline');
  console.log('Expected Timeline:');
  console.log('  0.0s - Shatter starts (diamond disappears)');
  console.log('  0.0-1.8s - Fragments animate and fade');
  console.log('  1.8-2.1s - Pause (dramatic beat)');
  console.log('  2.1s - Heart starts fading in');
  console.log('  2.1-3.3s - Heart scales up and rotates');
  console.log('  2.5s - Background music starts');
  console.log('  3.3s - Transition complete, state → HEART_IDLE');
  console.log('');
  console.log('Use autoShatter() to trigger and time with performance.now()');
  console.groupEnd();
}

export const transitionTestUtils = {
  autoShatter,
  skipToHeart,
  resetTransition,
  logTransitionState,
  testShatterSound,
  testBackgroundMusic,
  stopBackgroundMusic,
  measureTransitionTiming,
};

if (import.meta.env.DEV) {
  (window as unknown as { transitionTestUtils: typeof transitionTestUtils }).transitionTestUtils =
    transitionTestUtils;
  console.log('Phase 3 test utilities available: window.transitionTestUtils');
  console.log('Available commands:');
  console.log('  - transitionTestUtils.autoShatter()');
  console.log('  - transitionTestUtils.skipToHeart()');
  console.log('  - transitionTestUtils.resetTransition()');
  console.log('  - transitionTestUtils.logTransitionState()');
  console.log('  - transitionTestUtils.testShatterSound()');
  console.log('  - transitionTestUtils.testBackgroundMusic()');
  console.log('  - transitionTestUtils.stopBackgroundMusic()');
  console.log('  - transitionTestUtils.measureTransitionTiming()');
}
