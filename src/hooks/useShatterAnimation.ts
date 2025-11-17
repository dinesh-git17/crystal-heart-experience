// src/hooks/useShatterAnimation.ts
// Custom hook for orchestrating shatter transition with state management and timeline tracking

import { useState, useEffect, useRef, useCallback } from 'react';
import { TransitionPhase, TRANSITION_TIMELINE } from '@/types/heart';

interface UseShatterAnimationReturn {
  isShattered: boolean;
  shatterProgress: number;
  currentPhase: TransitionPhase;
  startShatter: () => void;
  resetShatter: () => void;
}

export function useShatterAnimation(readyToShatter: boolean): UseShatterAnimationReturn {
  const [isShattered, setIsShattered] = useState(false);
  const [shatterProgress, setShatterProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<TransitionPhase>(TransitionPhase.IDLE);

  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const hasStartedRef = useRef(false);

  const startShatter = useCallback(() => {
    if (hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;
    setIsShattered(true);
    setCurrentPhase(TransitionPhase.SHATTER_START);
    startTimeRef.current = performance.now();
  }, []);

  const resetShatter = useCallback(() => {
    setIsShattered(false);
    setShatterProgress(0);
    setCurrentPhase(TransitionPhase.IDLE);
    startTimeRef.current = null;
    hasStartedRef.current = false;

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (readyToShatter && !hasStartedRef.current) {
      startShatter();
    }
  }, [readyToShatter, startShatter]);

  useEffect(() => {
    if (!isShattered || startTimeRef.current === null) {
      return;
    }

    const updateProgress = () => {
      if (startTimeRef.current === null) {
        return;
      }

      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      const progress = Math.min(elapsed / TRANSITION_TIMELINE.totalDuration, 1);
      setShatterProgress(progress);

      if (elapsed < TRANSITION_TIMELINE.shatterDuration) {
        setCurrentPhase(TransitionPhase.SHATTER_ACTIVE);
      } else if (elapsed < TRANSITION_TIMELINE.pauseStart + TRANSITION_TIMELINE.pauseDuration) {
        setCurrentPhase(TransitionPhase.PAUSE);
      } else if (
        elapsed <
        TRANSITION_TIMELINE.heartFadeStart + TRANSITION_TIMELINE.heartFadeDuration
      ) {
        setCurrentPhase(TransitionPhase.HEART_FADE_IN);
      } else if (
        elapsed <
        TRANSITION_TIMELINE.heartEntranceStart + TRANSITION_TIMELINE.heartEntranceDuration
      ) {
        setCurrentPhase(TransitionPhase.HEART_ENTRANCE);
      } else if (elapsed >= TRANSITION_TIMELINE.totalDuration) {
        setCurrentPhase(TransitionPhase.TRANSITION_COMPLETE);
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        return;
      }

      animationFrameRef.current = requestAnimationFrame(updateProgress);
    };

    animationFrameRef.current = requestAnimationFrame(updateProgress);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isShattered]);

  return {
    isShattered,
    shatterProgress,
    currentPhase,
    startShatter,
    resetShatter,
  };
}
