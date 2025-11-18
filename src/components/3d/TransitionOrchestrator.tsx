// src/components/3d/TransitionOrchestrator.tsx
// High-level coordinator for diamond shatter to heart reveal transition with proper cleanup

import { useEffect, useState, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import { useIsReadyToShatter } from '@/stores/diamondStore';
import { useShatterAnimation } from '@/hooks/useShatterAnimation';
import { audioManager } from '@/utils/audioManager';
import { TransitionPhase } from '@/types/heart';
import { ShatterEffect } from './ShatterEffect';
import { Heart } from './Heart';
import { CinematicCamera } from './CinematicCamera';
import { HeartLighting, BackgroundDimmer, PinkShockwave, LightFlare } from './HeartLighting';
import type { CameraHandle } from './Camera';

interface TransitionOrchestratorProps {
  diamondPosition?: [number, number, number];
  onTransitionComplete?: () => void;
  onShatterStart?: () => void;
  onCinematicStart?: () => void;
  onCinematicComplete?: () => void;
  cameraRef?: React.RefObject<CameraHandle>;
}

export function TransitionOrchestrator({
  diamondPosition = [0, 0, 0],
  onTransitionComplete,
  onShatterStart,
  onCinematicStart,
  onCinematicComplete,
  cameraRef,
}: TransitionOrchestratorProps) {
  const { camera } = useThree();
  const readyToShatter = useIsReadyToShatter();
  const { isShattered, currentPhase } = useShatterAnimation(readyToShatter);

  const [showHeart, setShowHeart] = useState(false);
  const [heartRevealTriggered, setHeartRevealTriggered] = useState(false);
  const [musicStarted, setMusicStarted] = useState(false);
  const [transitionComplete, setTransitionComplete] = useState(false);
  const [showShatterEffect, setShowShatterEffect] = useState(false);
  const [shatterEffectComplete, setShatterEffectComplete] = useState(false);

  const [triggerCameraDolly, setTriggerCameraDolly] = useState(false);
  const [triggerSpotlight, setTriggerSpotlight] = useState(false);
  const [triggerBackgroundDim, setTriggerBackgroundDim] = useState(false);
  const [triggerShockwave, setTriggerShockwave] = useState(false);
  const [triggerLightFlares, setTriggerLightFlares] = useState(false);

  useEffect(() => {
    if (isShattered && !showShatterEffect) {
      setShowShatterEffect(true);

      if (onShatterStart) {
        onShatterStart();
      }

      if (import.meta.env.DEV) {
        console.log('Orchestrator: Shatter started');
      }
    }
  }, [isShattered, showShatterEffect, onShatterStart]);

  useEffect(() => {
    if (currentPhase === TransitionPhase.HEART_FADE_IN && !heartRevealTriggered) {
      setShowHeart(true);
      setHeartRevealTriggered(true);

      setTimeout(() => {
        setTriggerShockwave(true);
        setTriggerLightFlares(true);
      }, 100);

      setTimeout(() => {
        setTriggerBackgroundDim(true);
      }, 200);

      setTimeout(() => {
        setTriggerSpotlight(true);
      }, 300);

      setTimeout(() => {
        if (onCinematicStart) {
          onCinematicStart();
        }
        setTriggerCameraDolly(true);
      }, 500);

      if (import.meta.env.DEV) {
        console.log('Orchestrator: Heart reveal triggered with cinematic sequence');
      }
    }
  }, [currentPhase, heartRevealTriggered, onCinematicStart]);

  useEffect(() => {
    if (currentPhase === TransitionPhase.HEART_ENTRANCE && !musicStarted) {
      const startMusic = async () => {
        await audioManager.startBackgroundMusic();
        setMusicStarted(true);

        if (import.meta.env.DEV) {
          console.log('Orchestrator: Background music started');
        }
      };

      startMusic();
    }
  }, [currentPhase, musicStarted]);

  const handleShatterComplete = useCallback(() => {
    // Mark shatter as complete and unmount ShatterEffect after a delay
    setShatterEffectComplete(true);

    setTimeout(() => {
      setShowShatterEffect(false);

      if (import.meta.env.DEV) {
        console.log('Orchestrator: ShatterEffect unmounted');
      }
    }, 500);

    if (import.meta.env.DEV) {
      console.log('Orchestrator: Shatter animation complete, entering pause phase');
    }
  }, []);

  const handleHeartRevealComplete = useCallback(() => {
    if (!transitionComplete) {
      setTransitionComplete(true);

      if (onTransitionComplete) {
        onTransitionComplete();
      }

      if (import.meta.env.DEV) {
        console.log('Orchestrator: Heart reveal complete, transition to HEART_IDLE');
      }
    }
  }, [transitionComplete, onTransitionComplete]);

  const handleCameraDollyComplete = useCallback(() => {
    if (cameraRef?.current) {
      const currentPosition = camera.position.clone();
      cameraRef.current.updateBasePosition(currentPosition);
    }

    if (onCinematicComplete) {
      onCinematicComplete();
    }

    if (import.meta.env.DEV) {
      console.log('Orchestrator: Camera dolly complete, base position updated');
    }
  }, [camera, cameraRef, onCinematicComplete]);

  const handleLightingComplete = useCallback(() => {
    if (import.meta.env.DEV) {
      console.log('Orchestrator: Lighting transition complete');
    }
  }, []);

  return (
    <>
      {showShatterEffect && !shatterEffectComplete && (
        <ShatterEffect
          trigger={true}
          diamondPosition={diamondPosition}
          onComplete={handleShatterComplete}
        />
      )}

      {showHeart && (
        <>
          <Heart
            startReveal={heartRevealTriggered}
            position={diamondPosition}
            onRevealComplete={handleHeartRevealComplete}
          />

          <CinematicCamera
            targetPosition={diamondPosition}
            triggerDolly={triggerCameraDolly}
            onDollyComplete={handleCameraDollyComplete}
          />

          <HeartLighting
            heartPosition={diamondPosition}
            triggerReveal={triggerSpotlight}
            onLightingComplete={handleLightingComplete}
          />

          <BackgroundDimmer triggerDim={triggerBackgroundDim} />

          <PinkShockwave position={diamondPosition} trigger={triggerShockwave} />

          <LightFlare position={diamondPosition} trigger={triggerLightFlares} />
        </>
      )}
    </>
  );
}
