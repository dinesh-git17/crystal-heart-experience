// src/components/3d/TransitionOrchestrator.tsx
// High-level coordinator for diamond shatter to heart reveal transition with state management

import { useEffect, useState, useCallback } from 'react';
import { useIsReadyToShatter } from '@/stores/diamondStore';
import { useShatterAnimation } from '@/hooks/useShatterAnimation';
import { audioManager } from '@/utils/audioManager';
import { TransitionPhase } from '@/types/heart';
import { ShatterEffect } from './ShatterEffect';
import { Heart } from './Heart';

interface TransitionOrchestratorProps {
  diamondPosition?: [number, number, number];
  onTransitionComplete?: () => void;
  onShatterStart?: () => void;
}

export function TransitionOrchestrator({
  diamondPosition = [0, 0, 0],
  onTransitionComplete,
  onShatterStart,
}: TransitionOrchestratorProps) {
  const readyToShatter = useIsReadyToShatter();
  const { isShattered, currentPhase } = useShatterAnimation(readyToShatter);

  const [showHeart, setShowHeart] = useState(false);
  const [heartRevealTriggered, setHeartRevealTriggered] = useState(false);
  const [musicStarted, setMusicStarted] = useState(false);
  const [transitionComplete, setTransitionComplete] = useState(false);

  useEffect(() => {
    if (isShattered && onShatterStart && currentPhase === TransitionPhase.SHATTER_START) {
      onShatterStart();
    }
  }, [isShattered, currentPhase, onShatterStart]);

  useEffect(() => {
    if (currentPhase === TransitionPhase.HEART_FADE_IN && !heartRevealTriggered) {
      setShowHeart(true);
      setHeartRevealTriggered(true);
    }
  }, [currentPhase, heartRevealTriggered]);

  useEffect(() => {
    if (currentPhase === TransitionPhase.HEART_ENTRANCE && !musicStarted) {
      const startMusic = async () => {
        await audioManager.startBackgroundMusic();
        setMusicStarted(true);
      };

      startMusic();
    }
  }, [currentPhase, musicStarted]);

  const handleShatterComplete = useCallback(() => {
    if (import.meta.env.DEV) {
      console.log('Shatter animation complete, entering pause phase');
    }
  }, []);

  const handleHeartRevealComplete = useCallback(() => {
    if (!transitionComplete) {
      setTransitionComplete(true);

      if (onTransitionComplete) {
        onTransitionComplete();
      }

      if (import.meta.env.DEV) {
        console.log('Heart reveal complete, transition to HEART_IDLE');
      }
    }
  }, [transitionComplete, onTransitionComplete]);

  return (
    <>
      {isShattered && (
        <ShatterEffect
          trigger={isShattered}
          diamondPosition={diamondPosition}
          onComplete={handleShatterComplete}
        />
      )}

      {showHeart && (
        <Heart
          startReveal={heartRevealTriggered}
          position={diamondPosition}
          onRevealComplete={handleHeartRevealComplete}
        />
      )}
    </>
  );
}
