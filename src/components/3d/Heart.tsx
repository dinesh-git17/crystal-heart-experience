// src/components/3d/Heart.tsx
// Heart component with Phase 3 entrance animation, Phase 4 pulse synchronization, letter integration, and tap interaction

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useHeartStore, useHeartActions } from '@/stores/heartStore';
import { DEFAULT_HEART_ANIMATION, HEARTBEAT_IDLE } from '@/types/heart';
import {
  easeOutElastic,
  easeOutCubic,
  easeInOutCubic,
  heartbeatPulse,
} from '@/utils/easingFunctions';
import { useHeartMaterial, HeartMaterialComponent } from './materials/HeartMaterial';
import { useHeartPulse } from '@/hooks/useHeartPulse';
import { useHeartInteraction } from '@/hooks/useHeartInteraction';
import { Letter } from './Letter';
import { LetterShimmer } from './LetterShimmer';
import { InteractionHint, applyHintIntensity, applyHintEmissiveIntensity } from './InteractionHint';

interface HeartProps {
  startReveal: boolean;
  position?: [number, number, number];
  onRevealComplete?: () => void;
}

export function Heart({ startReveal, position = [0, 0, 0], onRevealComplete }: HeartProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const isAnimatingRef = useRef(false);
  const idlePhaseRef = useRef(0);
  const breathPhaseRef = useRef(0);

  const isVisible = useHeartStore((state) => state.isVisible);
  const isPulsing = useHeartStore((state) => state.isPulsing);
  const bpm = useHeartStore((state) => state.bpm);
  const letterVisible = useHeartStore((state) => state.letterVisible);
  const showInteractionHint = useHeartStore((state) => state.showInteractionHint);

  const {
    startReveal: startRevealAction,
    updateScale,
    updateRotation,
    completeReveal,
    updatePulsePhase,
  } = useHeartActions();

  const [animationStartTime, setAnimationStartTime] = useState<number | null>(null);
  const [isIdle, setIsIdle] = useState(false);
  const [materialOpacity, setMaterialOpacity] = useState(0);

  const { scene } = useGLTF('/models/heart.glb');

  const { pulseScale, pulseEmissive } = useHeartPulse(bpm, isPulsing);

  const { handleHeartTap, isInteractive, showHint, handlePointerOver, handlePointerOut } =
    useHeartInteraction();

  const fallbackGeometry = useMemo(() => {
    return new THREE.OctahedronGeometry(1, 2);
  }, []);

  const heartGeometry = useMemo((): THREE.BufferGeometry => {
    let foundGeometry: THREE.BufferGeometry | null = null;

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && !foundGeometry) {
        foundGeometry = child.geometry.clone();

        if (import.meta.env.DEV) {
          console.log('Found heart geometry in model');
        }
      }
    });

    if (!foundGeometry) {
      if (import.meta.env.DEV) {
        console.warn('No geometry found in heart model, using fallback octahedron');
      }
      return fallbackGeometry;
    }

    const geometry: THREE.BufferGeometry = foundGeometry;

    if (import.meta.env.DEV && geometry.boundingBox) {
      console.log('Heart geometry bounds:', geometry.boundingBox);
    }

    geometry.center();
    geometry.rotateZ(-Math.PI / 2);
    geometry.rotateY(Math.PI / 2);

    if (!geometry.boundingBox) {
      geometry.computeBoundingBox();
    }

    if (geometry.boundingBox) {
      const size = new THREE.Vector3();
      geometry.boundingBox.getSize(size);

      if (import.meta.env.DEV) {
        console.log('Heart model size:', size);
      }

      const maxDim = Math.max(size.x, size.y, size.z);

      if (maxDim > 0) {
        const targetSize = 2.0;
        const scaleAmount = targetSize / maxDim;
        geometry.scale(scaleAmount, scaleAmount, scaleAmount);

        if (import.meta.env.DEV) {
          console.log('Scaled heart geometry by:', scaleAmount);
        }
      }
    }

    return geometry;
  }, [scene, fallbackGeometry]);

  const { material } = useHeartMaterial({
    meshRef,
    isIdle,
    opacity: materialOpacity,
  });

  useEffect(() => {
    if (startReveal && !isAnimatingRef.current) {
      startRevealAction();
      isAnimatingRef.current = true;
      setAnimationStartTime(null);
    }
  }, [startReveal, startRevealAction]);

  useFrame((state) => {
    if (!groupRef.current || !meshRef.current || !isVisible) {
      return;
    }

    if (isIdle && HEARTBEAT_IDLE.enabled) {
      const deltaTime = state.clock.getDelta();
      idlePhaseRef.current += deltaTime / HEARTBEAT_IDLE.beatInterval;
      const beatProgress = idlePhaseRef.current % 1.0;
      const beatValue = heartbeatPulse(beatProgress);

      const idleScale =
        DEFAULT_HEART_ANIMATION.targetScale + beatValue * HEARTBEAT_IDLE.scaleAmplitude;

      let finalScale = idleScale;

      if (isPulsing) {
        const adjustedPulseScale = applyHintIntensity(pulseScale, showHint);
        finalScale = idleScale * adjustedPulseScale;
      }

      groupRef.current.scale.setScalar(finalScale);
      updatePulsePhase(beatProgress);
      updateScale(finalScale);

      groupRef.current.rotation.y = 0;

      breathPhaseRef.current += deltaTime * 0.3;
      const breathValue = Math.sin(breathPhaseRef.current) * 0.005;
      groupRef.current.position.y = position[1] + breathValue;

      if (isPulsing && meshRef.current.material instanceof THREE.MeshPhysicalMaterial) {
        const adjustedEmissive = applyHintEmissiveIntensity(pulseEmissive, showHint);
        meshRef.current.material.emissiveIntensity = adjustedEmissive;
      }

      return;
    }

    if (!isAnimatingRef.current) {
      return;
    }

    if (animationStartTime === null) {
      setAnimationStartTime(state.clock.elapsedTime);
      return;
    }

    const elapsed = state.clock.elapsedTime - animationStartTime;

    const fadeInEnd = DEFAULT_HEART_ANIMATION.fadeInDuration;
    const scaleUpEnd = DEFAULT_HEART_ANIMATION.scaleUpDuration;
    const rotationEnd = DEFAULT_HEART_ANIMATION.rotationDuration;
    const breathInStart =
      Math.max(fadeInEnd, scaleUpEnd, rotationEnd) + DEFAULT_HEART_ANIMATION.breathInDelay;
    const breathInEnd = breathInStart + DEFAULT_HEART_ANIMATION.breathInDuration;
    const totalDuration = breathInEnd;

    if (elapsed < fadeInEnd) {
      const fadeProgress = elapsed / fadeInEnd;
      const opacity = easeInOutCubic(fadeProgress);
      setMaterialOpacity(opacity);
    } else {
      setMaterialOpacity(1.0);
    }

    if (elapsed < scaleUpEnd) {
      const scaleProgress = elapsed / scaleUpEnd;

      const scale =
        easeOutElastic(scaleProgress, 1.0, 0.4) * DEFAULT_HEART_ANIMATION.overshootScale;

      groupRef.current.scale.setScalar(scale);
      updateScale(scale);
    }

    if (elapsed < rotationEnd) {
      const rotationProgress = elapsed / rotationEnd;
      const rotation =
        easeOutCubic(rotationProgress) * DEFAULT_HEART_ANIMATION.entranceRotations * Math.PI * 2;
      groupRef.current.rotation.y = rotation;
      updateRotation(rotation);
    } else {
      groupRef.current.rotation.y = 0;
      updateRotation(0);
    }

    if (elapsed >= breathInStart && elapsed < breathInEnd) {
      const breathProgress = (elapsed - breathInStart) / DEFAULT_HEART_ANIMATION.breathInDuration;
      const breathScale = 1.0 + easeInOutCubic(breathProgress) * 0.02;
      groupRef.current.scale.setScalar(DEFAULT_HEART_ANIMATION.targetScale * breathScale);
    }

    if (elapsed >= totalDuration && isAnimatingRef.current) {
      isAnimatingRef.current = false;
      setIsIdle(true);
      completeReveal();
      groupRef.current.scale.setScalar(DEFAULT_HEART_ANIMATION.targetScale);
      groupRef.current.rotation.y = 0;
      updateScale(DEFAULT_HEART_ANIMATION.targetScale);

      if (onRevealComplete) {
        onRevealComplete();
      }

      if (import.meta.env.DEV) {
        console.log('Heart entrance animation complete, entering idle state');
      }
    }
  });

  if (!isVisible) {
    return null;
  }

  return (
    <group ref={groupRef} position={position}>
      <mesh
        ref={meshRef}
        geometry={heartGeometry}
        material={material}
        castShadow
        receiveShadow
        onClick={isInteractive ? handleHeartTap : undefined}
        onPointerOver={isInteractive ? handlePointerOver : undefined}
        onPointerOut={isInteractive ? handlePointerOut : undefined}
      />

      <HeartMaterialComponent
        meshRef={meshRef}
        isIdle={isIdle}
        opacity={materialOpacity}
        position={position}
      />

      {letterVisible && (
        <>
          <Letter position={[0, 0, 1.0]} scale={0.8} />
          <LetterShimmer letterPosition={[0, 0, 1.0]} particleCount={8} orbitRadius={0.3} />
        </>
      )}

      {showInteractionHint && <InteractionHint enabled={showInteractionHint} />}
    </group>
  );
}
