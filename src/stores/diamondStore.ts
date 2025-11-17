// src/stores/diamondStore.ts
// Add tap positions tracking

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { CrackLevel } from '@/types/diamond';
import { getCrackConfig, isMaxCrackLevel, getNextCrackLevel } from '@/constants/crackLevels';
import * as THREE from 'three';

interface TapPosition {
  point: THREE.Vector3;
  normal: THREE.Vector3;
  level: CrackLevel;
}

interface DiamondState {
  crackLevel: CrackLevel;
  isInteractive: boolean;
  rotation: number;
  lastTapTimestamp: number;
  tapCount: number;
  tapPositions: TapPosition[]; // NEW
}

interface DiamondActions {
  increaseCrackLevel: () => void;
  resetDiamond: () => void;
  setInteractive: (value: boolean) => void;
  updateRotation: (angle: number) => void;
  registerTap: () => void;
  addTapPosition: (point: THREE.Vector3, normal: THREE.Vector3) => void; // NEW
}

interface DiamondStore extends DiamondState {
  actions: DiamondActions;
}

const initialState: DiamondState = {
  crackLevel: 0,
  isInteractive: true,
  rotation: 0,
  lastTapTimestamp: 0,
  tapCount: 0,
  tapPositions: [], // NEW
};

export const useDiamondStore = create<DiamondStore>()(
  devtools(
    (set) => ({
      ...initialState,

      actions: {
        increaseCrackLevel: () =>
          set((state) => {
            const nextLevel = getNextCrackLevel(state.crackLevel);
            if (nextLevel !== null) {
              return { crackLevel: nextLevel };
            }
            return state;
          }),

        resetDiamond: () =>
          set({
            crackLevel: 0,
            isInteractive: true,
            rotation: 0,
            lastTapTimestamp: 0,
            tapCount: 0,
            tapPositions: [], // NEW
          }),

        setInteractive: (value: boolean) => set({ isInteractive: value }),

        updateRotation: (angle: number) => set({ rotation: angle }),

        registerTap: () =>
          set((state) => ({
            lastTapTimestamp: Date.now(),
            tapCount: state.tapCount + 1,
          })),

        // NEW
        addTapPosition: (point: THREE.Vector3, normal: THREE.Vector3) =>
          set((state) => ({
            tapPositions: [
              ...state.tapPositions,
              { point: point.clone(), normal: normal.clone(), level: state.crackLevel },
            ],
          })),
      },
    }),
    { name: 'DiamondStore' }
  )
);

export const useDiamondCrackLevel = () => useDiamondStore((state) => state.crackLevel);
export const useDiamondIsInteractive = () => useDiamondStore((state) => state.isInteractive);
export const useDiamondRotation = () => useDiamondStore((state) => state.rotation);
export const useDiamondActions = () => useDiamondStore((state) => state.actions);
export const useDiamondTapPositions = () => useDiamondStore((state) => state.tapPositions); // NEW

export const useIsReadyToShatter = () =>
  useDiamondStore((state) => isMaxCrackLevel(state.crackLevel));

export const useCurrentCrackConfig = () =>
  useDiamondStore((state) => getCrackConfig(state.crackLevel));
