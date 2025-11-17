// src/stores/heartStore.ts
// Zustand store for heart state management during reveal and idle phases

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { DEFAULT_HEART_STATE } from '@/types/heart';
import type { HeartState } from '@/types/heart';

interface HeartStore extends HeartState {
  isAnimating: boolean;
  hasRevealed: boolean;
  actions: {
    startReveal: () => void;
    updateScale: (scale: number) => void;
    updateRotation: (rotation: number) => void;
    updateGlow: (intensity: number) => void;
    setVisible: (visible: boolean) => void;
    completeReveal: () => void;
    resetHeart: () => void;
    updatePulsePhase: (phase: number) => void;
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
          }),

        updatePulsePhase: (phase: number) =>
          set({
            pulsePhase: phase,
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

export const useIsFullyRevealed = () =>
  useHeartStore((state) => state.scale === 1.0 && !state.isAnimating && state.hasRevealed);

export const useHeartCurrentState = () =>
  useHeartStore((state) => ({
    isVisible: state.isVisible,
    scale: state.scale,
    rotation: state.rotation,
    pulsePhase: state.pulsePhase,
    glowIntensity: state.glowIntensity,
    isAnimating: state.isAnimating,
    hasRevealed: state.hasRevealed,
  }));
