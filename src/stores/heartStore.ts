// src/stores/heartStore.ts
// Zustand store for heart state management during reveal, idle, and pulse phases with Phase 4 enhancements

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { DEFAULT_HEART_STATE } from '@/types/heart';
import type { HeartState } from '@/types/heart';

interface HeartStore extends HeartState {
  isAnimating: boolean;
  hasRevealed: boolean;
  isPulsing: boolean;
  pulseScale: number;
  pulseEmissive: number;
  bpm: number;
  showInteractionHint: boolean;
  letterVisible: boolean;
  actions: {
    startReveal: () => void;
    updateScale: (scale: number) => void;
    updateRotation: (rotation: number) => void;
    updateGlow: (intensity: number) => void;
    setVisible: (visible: boolean) => void;
    completeReveal: () => void;
    resetHeart: () => void;
    updatePulsePhase: (phase: number) => void;
    startPulse: (bpm: number) => void;
    stopPulse: () => void;
    updatePulseScale: (scale: number) => void;
    updatePulseEmissive: (intensity: number) => void;
    setBPM: (bpm: number) => void;
    showHint: () => void;
    hideHint: () => void;
    setLetterVisible: (visible: boolean) => void;
  };
}

const initialState: HeartState = {
  ...DEFAULT_HEART_STATE,
};

export const useHeartStore = create<HeartStore>()(
  devtools(
    (set) => ({
      ...initialState,
      isAnimating: false,
      hasRevealed: false,
      isPulsing: false,
      pulseScale: 1.0,
      pulseEmissive: 0.8,
      bpm: 140,
      showInteractionHint: false,
      letterVisible: false,

      actions: {
        startReveal: () =>
          set({
            isVisible: true,
            isAnimating: true,
            scale: 0,
            rotation: 0,
          }),

        updateScale: (scale: number) =>
          set({
            scale,
          }),

        updateRotation: (rotation: number) =>
          set({
            rotation,
          }),

        updateGlow: (intensity: number) =>
          set({
            glowIntensity: intensity,
          }),

        setVisible: (visible: boolean) =>
          set({
            isVisible: visible,
          }),

        completeReveal: () =>
          set({
            isAnimating: false,
            hasRevealed: true,
            scale: 1.0,
            rotation: 0,
          }),

        resetHeart: () =>
          set({
            ...initialState,
            isAnimating: false,
            hasRevealed: false,
            isPulsing: false,
            pulseScale: 1.0,
            pulseEmissive: 0.8,
            bpm: 140,
            showInteractionHint: false,
            letterVisible: false,
          }),

        updatePulsePhase: (phase: number) =>
          set({
            pulsePhase: phase,
          }),

        startPulse: (bpm: number) =>
          set({
            isPulsing: true,
            bpm,
            pulseScale: 1.0,
            pulseEmissive: 0.8,
          }),

        stopPulse: () =>
          set({
            isPulsing: false,
            pulseScale: 1.0,
            pulseEmissive: 0.8,
          }),

        updatePulseScale: (scale: number) =>
          set({
            pulseScale: scale,
          }),

        updatePulseEmissive: (intensity: number) =>
          set({
            pulseEmissive: intensity,
          }),

        setBPM: (bpm: number) =>
          set({
            bpm,
          }),

        showHint: () =>
          set({
            showInteractionHint: true,
          }),

        hideHint: () =>
          set({
            showInteractionHint: false,
          }),

        setLetterVisible: (visible: boolean) =>
          set({
            letterVisible: visible,
          }),
      },
    }),
    { name: 'HeartStore' }
  )
);

export const useHeartIsVisible = () => useHeartStore((state) => state.isVisible);
export const useHeartScale = () => useHeartStore((state) => state.scale);
export const useHeartRotation = () => useHeartStore((state) => state.rotation);
export const useHeartGlowIntensity = () => useHeartStore((state) => state.glowIntensity);
export const useHeartIsAnimating = () => useHeartStore((state) => state.isAnimating);
export const useHeartHasRevealed = () => useHeartStore((state) => state.hasRevealed);
export const useHeartPulsePhase = () => useHeartStore((state) => state.pulsePhase);
export const useHeartActions = () => useHeartStore((state) => state.actions);

export const useHeartIsPulsing = () => useHeartStore((state) => state.isPulsing);
export const useHeartPulseScale = () => useHeartStore((state) => state.pulseScale);
export const useHeartPulseEmissive = () => useHeartStore((state) => state.pulseEmissive);
export const useHeartBPM = () => useHeartStore((state) => state.bpm);
export const useShowInteractionHint = () => useHeartStore((state) => state.showInteractionHint);
export const useLetterVisible = () => useHeartStore((state) => state.letterVisible);

export const useIsFullyRevealed = () =>
  useHeartStore((state) => state.scale === 1.0 && !state.isAnimating && state.hasRevealed);

export const useCurrentPulseConfig = () =>
  useHeartStore((state) => ({
    pulseScale: state.pulseScale,
    pulseEmissive: state.pulseEmissive,
    isPulsing: state.isPulsing,
    bpm: state.bpm,
  }));

export const useIsReadyForInteraction = () =>
  useHeartStore((state) => state.isPulsing && state.letterVisible && state.hasRevealed);

export const useHeartCurrentState = () =>
  useHeartStore((state) => ({
    isVisible: state.isVisible,
    scale: state.scale,
    rotation: state.rotation,
    pulsePhase: state.pulsePhase,
    glowIntensity: state.glowIntensity,
    isAnimating: state.isAnimating,
    hasRevealed: state.hasRevealed,
    isPulsing: state.isPulsing,
    pulseScale: state.pulseScale,
    pulseEmissive: state.pulseEmissive,
    letterVisible: state.letterVisible,
    showInteractionHint: state.showInteractionHint,
  }));
