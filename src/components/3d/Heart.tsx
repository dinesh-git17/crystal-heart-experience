// src/components/3d/Heart.tsx
// Heart component with GLB model loading, proper scale and material override

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useHeartStore, useHeartActions } from '@/stores/heartStore';
import { DEFAULT_HEART_MATERIAL, DEFAULT_HEART_ANIMATION } from '@/types/heart';
import {
  calculateHeartScale,
  calculateHeartRotation,
  calculateHeartOpacity,
} from '@/utils/animationTiming';

interface HeartProps {
  startReveal: boolean;
  position?: [number, number, number];
  onRevealComplete?: () => void;
}

export function Heart({ startReveal, position = [0, 0, 0], onRevealComplete }: HeartProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const isAnimatingRef = useRef(false);

  const isVisible = useHeartStore((state) => state.isVisible);
  const {
    startReveal: startRevealAction,
    updateScale,
    updateRotation,
    completeReveal,
  } = useHeartActions();

  const [animationStartTime, setAnimationStartTime] = useState<number | null>(null);

  const { scene } = useGLTF('/models/heart.glb');

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
    geometry.rotateX(-Math.PI / 2);

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

  const material = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(DEFAULT_HEART_MATERIAL.color),
      transmission: DEFAULT_HEART_MATERIAL.transmission,
      roughness: DEFAULT_HEART_MATERIAL.roughness,
      metalness: DEFAULT_HEART_MATERIAL.metalness,
      ior: DEFAULT_HEART_MATERIAL.ior,
      thickness: DEFAULT_HEART_MATERIAL.thickness,
      envMapIntensity: 1.5,
      clearcoat: DEFAULT_HEART_MATERIAL.clearcoat,
      clearcoatRoughness: DEFAULT_HEART_MATERIAL.clearcoatRoughness,
      emissive: new THREE.Color(DEFAULT_HEART_MATERIAL.emissive),
      emissiveIntensity: DEFAULT_HEART_MATERIAL.emissiveIntensity,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
  }, []);

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

    if (!isAnimatingRef.current) {
      return;
    }

    if (animationStartTime === null) {
      setAnimationStartTime(state.clock.elapsedTime);
      return;
    }

    const elapsed = state.clock.elapsedTime - animationStartTime;
    const totalDuration = Math.max(
      DEFAULT_HEART_ANIMATION.fadeInDuration,
      DEFAULT_HEART_ANIMATION.scaleUpDuration,
      DEFAULT_HEART_ANIMATION.rotationDuration
    );

    if (elapsed >= totalDuration) {
      groupRef.current.scale.setScalar(DEFAULT_HEART_ANIMATION.targetScale);
      groupRef.current.rotation.y = 0;

      if (meshRef.current.material instanceof THREE.MeshPhysicalMaterial) {
        meshRef.current.material.opacity = 1.0;
      }

      updateScale(DEFAULT_HEART_ANIMATION.targetScale);
      updateRotation(0);
      isAnimatingRef.current = false;
      completeReveal();

      if (onRevealComplete) {
        onRevealComplete();
      }
      return;
    }

    const fadeProgress = Math.min(elapsed / DEFAULT_HEART_ANIMATION.fadeInDuration, 1);
    const opacity = calculateHeartOpacity(fadeProgress);

    if (meshRef.current.material instanceof THREE.MeshPhysicalMaterial) {
      meshRef.current.material.opacity = opacity;
    }

    const scaleProgress = Math.min(elapsed / DEFAULT_HEART_ANIMATION.scaleUpDuration, 1);
    const scale = calculateHeartScale(
      scaleProgress,
      DEFAULT_HEART_ANIMATION.targetScale,
      DEFAULT_HEART_ANIMATION.overshootScale
    );
    groupRef.current.scale.setScalar(scale);
    updateScale(scale);

    const rotationProgress = Math.min(elapsed / DEFAULT_HEART_ANIMATION.rotationDuration, 1);
    const rotation = calculateHeartRotation(
      rotationProgress,
      DEFAULT_HEART_ANIMATION.entranceRotations
    );
    groupRef.current.rotation.y = rotation;
    updateRotation(rotation);
  });

  useEffect(() => {
    return () => {
      if (meshRef.current && meshRef.current.material instanceof THREE.Material) {
        meshRef.current.material.dispose();
      }
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <group ref={groupRef} position={position}>
      <mesh ref={meshRef} geometry={heartGeometry} material={material} castShadow receiveShadow />
    </group>
  );
}
