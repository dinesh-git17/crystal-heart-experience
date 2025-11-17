// src/hooks/useHeartInteraction.ts
// Custom hook for heart tap interaction detection, hint system, and Phase 5 transition preparation

import { useCallback, useRef, useEffect } from 'react';
import { useHeartStore } from '@/stores/heartStore';
import { DEFAULT_INTERACTION_HINT } from '@/types/letter';
import type { ThreeEvent } from '@react-three/fiber';

interface HeartInteractionReturn {
  handleHeartTap: (event: ThreeEvent<MouseEvent>) => void;
  isInteractive: boolean;
  canTap: boolean;
  showHint: boolean;
  handlePointerOver: () => void;
  handlePointerOut: () => void;
}

/**
 * Heart interaction hook for tap detection and hint system
 * Manages user interaction with pulsing heart to trigger letter reveal
 * @returns Interaction handlers and state
 */
export function useHeartInteraction(): HeartInteractionReturn {
  const lastTapTimeRef = useRef(0);
  const inactivityTimerRef = useRef<number | null>(null);
  const isHoveringRef = useRef(false);

  const hasRevealed = useHeartStore((state) => state.hasRevealed);
  const isPulsing = useHeartStore((state) => state.isPulsing);
  const letterVisible = useHeartStore((state) => state.letterVisible);
  const showInteractionHint = useHeartStore((state) => state.showInteractionHint);

  const { stopPulse, hideHint, showHint } = useHeartStore((state) => state.actions);

  const isInteractive = hasRevealed && isPulsing && letterVisible;
  const canTap = isInteractive && Date.now() - lastTapTimeRef.current > 100;

  const startInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current !== null) {
      window.clearTimeout(inactivityTimerRef.current);
    }

    inactivityTimerRef.current = window.setTimeout(() => {
      if (isInteractive && !showInteractionHint) {
        showHint();

        if (import.meta.env.DEV) {
          console.log('Interaction hint activated after inactivity');
        }
      }
    }, DEFAULT_INTERACTION_HINT.activationDelay);
  }, [isInteractive, showInteractionHint, showHint]);

  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current !== null) {
      window.clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isInteractive) {
      startInactivityTimer();
    }

    return () => {
      clearInactivityTimer();
    };
  }, [isInteractive, startInactivityTimer, clearInactivityTimer]);

  const handleHeartTap = useCallback(
    (event: ThreeEvent<MouseEvent>) => {
      event.stopPropagation();

      if (!canTap) {
        return;
      }

      lastTapTimeRef.current = Date.now();

      clearInactivityTimer();

      if (showInteractionHint) {
        hideHint();
      }

      stopPulse();

      if (import.meta.env.DEV) {
        console.log('Heart tapped - preparing for letter transition (Phase 5)');
      }
    },
    [canTap, showInteractionHint, stopPulse, hideHint, clearInactivityTimer]
  );

  const handlePointerOver = useCallback(() => {
    if (!isInteractive) {
      return;
    }

    isHoveringRef.current = true;

    if (typeof document !== 'undefined') {
      document.body.style.cursor = 'pointer';
    }
  }, [isInteractive]);

  const handlePointerOut = useCallback(() => {
    isHoveringRef.current = false;

    if (typeof document !== 'undefined') {
      document.body.style.cursor = 'default';
    }
  }, []);

  useEffect(() => {
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.cursor = 'default';
      }
    };
  }, []);

  return {
    handleHeartTap,
    isInteractive,
    canTap,
    showHint: showInteractionHint,
    handlePointerOver,
    handlePointerOut,
  };
}
