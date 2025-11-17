// src/hooks/useDiamondInteraction.ts
// Add missing import at the top

import { useState, useCallback, useRef } from 'react';
import { useDiamondStore, useDiamondActions, useIsReadyToShatter } from '@/stores/diamondStore';
import { audioManager } from '@/utils/audioManager';
import { triggerHaptic } from '@/utils/haptics';
import { getCrackConfig } from '@/constants/crackLevels'; // ADD THIS LINE
import type { TapEvent } from '@/types/diamond';

const MIN_TAP_INTERVAL = 200;

interface UseDiamondInteractionReturn {
  handleTap: (event: TapEvent) => void;
  isInteractive: boolean;
  crackLevel: number;
  canTap: boolean;
  currentTapEvent: TapEvent | null;
}

export function useDiamondInteraction(): UseDiamondInteractionReturn {
  const isInteractive = useDiamondStore((state) => state.isInteractive);
  const crackLevel = useDiamondStore((state) => state.crackLevel);
  const lastTapTimestamp = useDiamondStore((state) => state.lastTapTimestamp);
  const isReadyToShatter = useIsReadyToShatter();
  const { increaseCrackLevel, registerTap, setInteractive, addTapPosition } = useDiamondActions();

  const [currentTapEvent, setCurrentTapEvent] = useState<TapEvent | null>(null);
  const audioInitializedRef = useRef(false);

  const canTap = isInteractive && !isReadyToShatter;

  const handleTap = useCallback(
    async (event: TapEvent) => {
      if (!canTap) {
        return;
      }

      const now = Date.now();
      const timeSinceLastTap = now - lastTapTimestamp;

      if (timeSinceLastTap < MIN_TAP_INTERVAL) {
        return;
      }

      if (!audioInitializedRef.current) {
        await audioManager.initialize();
        audioInitializedRef.current = true;
      }

      registerTap();

      increaseCrackLevel();

      addTapPosition(event.point, event.normal);

      const newCrackLevel = useDiamondStore.getState().crackLevel;
      const crackConfig = getCrackConfig(newCrackLevel);

      setCurrentTapEvent(event);

      await audioManager.playCrackSound(newCrackLevel);

      triggerHaptic(crackConfig.hapticIntensity);

      setTimeout(() => {
        setCurrentTapEvent(null);
      }, 100);

      if (newCrackLevel >= 6) {
        setInteractive(false);
      }
    },
    [canTap, lastTapTimestamp, registerTap, increaseCrackLevel, setInteractive, addTapPosition]
  );

  return {
    handleTap,
    isInteractive,
    crackLevel,
    canTap,
    currentTapEvent,
  };
}
