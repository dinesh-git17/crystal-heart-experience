// src/components/3d/CinematicCamera.tsx
// Camera dolly controller for cinematic heart reveal with smooth approach transition using camera control hook

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CINEMATIC_CAMERA } from '@/types/heart';
import { cameraDolly } from '@/utils/easingFunctions';

interface CinematicCameraProps {
  targetPosition: [number, number, number];
  triggerDolly: boolean;
  onDollyComplete?: () => void;
}

export function CinematicCamera({
  targetPosition,
  triggerDolly,
  onDollyComplete,
}: CinematicCameraProps) {
  const { camera } = useThree();
  const startPositionRef = useRef<THREE.Vector3 | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const isDollyingRef = useRef(false);
  const hasCompletedRef = useRef(false);
  const delayStartRef = useRef<number | null>(null);
  const targetVectorRef = useRef(new THREE.Vector3(...targetPosition));

  useEffect(() => {
    targetVectorRef.current.set(...targetPosition);
  }, [targetPosition]);

  useEffect(() => {
    if (triggerDolly && !isDollyingRef.current && !hasCompletedRef.current) {
      if (CINEMATIC_CAMERA.dollyDelay > 0) {
        delayStartRef.current = null;
      } else {
        startPositionRef.current = camera.position.clone();
        startTimeRef.current = null;
        isDollyingRef.current = true;
      }

      if (import.meta.env.DEV) {
        console.log('Cinematic dolly triggered, delay:', CINEMATIC_CAMERA.dollyDelay);
      }
    }
  }, [triggerDolly, camera]);

  useFrame((state) => {
    if (!CINEMATIC_CAMERA.enabled || !triggerDolly) {
      return;
    }

    if (
      delayStartRef.current === null &&
      CINEMATIC_CAMERA.dollyDelay > 0 &&
      !isDollyingRef.current
    ) {
      delayStartRef.current = state.clock.elapsedTime;
      return;
    }

    if (delayStartRef.current !== null && !isDollyingRef.current) {
      const delayElapsed = state.clock.elapsedTime - delayStartRef.current;

      if (delayElapsed >= CINEMATIC_CAMERA.dollyDelay) {
        startPositionRef.current = camera.position.clone();
        startTimeRef.current = null;
        isDollyingRef.current = true;
        delayStartRef.current = null;

        if (import.meta.env.DEV) {
          console.log('Cinematic dolly delay complete, starting dolly');
        }
      }
      return;
    }

    if (!isDollyingRef.current || hasCompletedRef.current) {
      return;
    }

    if (startTimeRef.current === null) {
      startTimeRef.current = state.clock.elapsedTime;
      return;
    }

    const elapsed = state.clock.elapsedTime - startTimeRef.current;
    const progress = Math.min(elapsed / CINEMATIC_CAMERA.dollyDuration, 1);

    if (!startPositionRef.current) {
      return;
    }

    const easedProgress = cameraDolly(progress);

    const direction = new THREE.Vector3(
      targetVectorRef.current.x - startPositionRef.current.x,
      targetVectorRef.current.y - startPositionRef.current.y,
      targetVectorRef.current.z - startPositionRef.current.z
    );

    const moveDistance = CINEMATIC_CAMERA.dollyDistance * easedProgress;
    direction.normalize().multiplyScalar(moveDistance);

    camera.position.set(
      startPositionRef.current.x + direction.x,
      startPositionRef.current.y + direction.y,
      startPositionRef.current.z + direction.z
    );

    camera.lookAt(targetVectorRef.current);

    if (progress >= 1) {
      isDollyingRef.current = false;
      hasCompletedRef.current = true;

      if (onDollyComplete) {
        onDollyComplete();
      }

      if (import.meta.env.DEV) {
        console.log('Cinematic dolly complete');
      }
    }
  });

  return null;
}

interface FocusTransitionProps {
  targetFocusDistance: number;
  triggerTransition: boolean;
  onTransitionComplete?: () => void;
}

export function FocusTransition({
  targetFocusDistance,
  triggerTransition,
  onTransitionComplete,
}: FocusTransitionProps) {
  const startFocusRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const isTransitioningRef = useRef(false);
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    if (triggerTransition && !isTransitioningRef.current && !hasCompletedRef.current) {
      startFocusRef.current = null;
      startTimeRef.current = null;
      isTransitioningRef.current = true;

      if (import.meta.env.DEV) {
        console.log('Focus transition triggered to distance:', targetFocusDistance);
      }
    }
  }, [triggerTransition, targetFocusDistance]);

  useFrame((state) => {
    if (!CINEMATIC_CAMERA.enabled || !triggerTransition || !isTransitioningRef.current) {
      return;
    }

    if (hasCompletedRef.current) {
      return;
    }

    if (startTimeRef.current === null) {
      startTimeRef.current = state.clock.elapsedTime;
      startFocusRef.current = 5.0;
      return;
    }

    const elapsed = state.clock.elapsedTime - startTimeRef.current;
    const progress = Math.min(elapsed / CINEMATIC_CAMERA.focusTransitionDuration, 1);

    if (progress >= 1) {
      isTransitioningRef.current = false;
      hasCompletedRef.current = true;

      if (onTransitionComplete) {
        onTransitionComplete();
      }

      if (import.meta.env.DEV) {
        console.log('Focus transition complete');
      }
    }
  });

  return null;
}
