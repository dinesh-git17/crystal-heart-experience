// src/components/3d/ShatterEffect.tsx
// Orchestrates complete diamond shatter sequence including fragments, particles, audio, and timeline

import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DiamondFragments } from './DiamondFragments';
import { ShardParticles } from './ShardParticles';
import { audioManager } from '@/utils/audioManager';
import { TRANSITION_TIMELINE, TransitionPhase } from '@/types/heart';
import { getCurrentPhase } from '@/utils/animationTiming';
import type { TapEvent } from '@/types/diamond';

interface ShatterEffectProps {
  trigger: boolean;
  diamondPosition?: [number, number, number];
  onComplete?: () => void;
}

export function ShatterEffect({
  trigger,
  diamondPosition = [0, 0, 0],
  onComplete,
}: ShatterEffectProps) {
  const [isShattered, setIsShattered] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<TransitionPhase>(TransitionPhase.IDLE);
  const hasTriggeredRef = useRef(false);
  const startTimeRef = useRef<number | null>(null);
  const fragmentsCompleteRef = useRef(false);

  const [burstParticleEvent, setBurstParticleEvent] = useState<TapEvent | null>(null);

  useEffect(() => {
    if (!trigger || hasTriggeredRef.current) {
      return;
    }

    hasTriggeredRef.current = true;
    setIsShattered(true);
    setCurrentPhase(TransitionPhase.SHATTER_START);

    audioManager.playShatterSound();

    const centerPoint: TapEvent = {
      point: new THREE.Vector3(diamondPosition[0], diamondPosition[1], diamondPosition[2]),
      normal: new THREE.Vector3(0, 1, 0),
      timestamp: Date.now(),
      crackLevel: 6,
    };

    setBurstParticleEvent(centerPoint);

    setTimeout(() => {
      setBurstParticleEvent(null);
    }, 100);
  }, [trigger, diamondPosition]);

  useFrame((state) => {
    if (!isShattered || !hasTriggeredRef.current) {
      return;
    }

    if (startTimeRef.current === null) {
      startTimeRef.current = state.clock.elapsedTime;
    }

    const elapsed = state.clock.elapsedTime - startTimeRef.current;
    const phase = getCurrentPhase(TRANSITION_TIMELINE, elapsed);

    if (phase !== currentPhase) {
      setCurrentPhase(phase);

      if (phase === TransitionPhase.PAUSE && fragmentsCompleteRef.current) {
        if (onComplete) {
          setTimeout(() => {
            onComplete();
          }, TRANSITION_TIMELINE.pauseDuration * 1000);
        }
      }
    }
  });

  const handleFragmentsComplete = () => {
    fragmentsCompleteRef.current = true;
    setCurrentPhase(TransitionPhase.SHATTER_COMPLETE);
  };

  if (!trigger) {
    return null;
  }

  return (
    <>
      <DiamondFragments
        triggerShatter={isShattered}
        diamondPosition={diamondPosition}
        onComplete={handleFragmentsComplete}
      />

      {burstParticleEvent && <ShardParticles tapEvent={burstParticleEvent} count={30} />}
    </>
  );
}
