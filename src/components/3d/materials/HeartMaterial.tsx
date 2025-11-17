// src/components/3d/materials/HeartMaterial.tsx
// Advanced heart material with subsurface scattering simulation, internal pulse, and micro-highlights

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  DEFAULT_HEART_MATERIAL,
  SUBSURFACE_SCATTER,
  INTERNAL_PULSE,
  MICRO_HIGHLIGHTS,
  AMBIENT_GLOW,
} from '@/types/heart';
import { heartbeatPulse, shimmerCurve } from '@/utils/easingFunctions';

interface HeartMaterialProps {
  meshRef: React.RefObject<THREE.Mesh>;
  isIdle: boolean;
  opacity?: number;
}

export function useHeartMaterial({ meshRef, isIdle, opacity = 1 }: HeartMaterialProps) {
  const pulsePhaseRef = useRef(0);
  const shimmerPhaseRef = useRef(Math.random() * Math.PI * 2);
  const pointLightRef = useRef<THREE.PointLight | null>(null);

  const material = useMemo(() => {
    const mat = new THREE.MeshPhysicalMaterial({
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

    if (SUBSURFACE_SCATTER.enabled) {
      mat.transmission = Math.min(
        DEFAULT_HEART_MATERIAL.transmission + SUBSURFACE_SCATTER.intensity * 0.2,
        1.0
      );
      mat.thickness = DEFAULT_HEART_MATERIAL.thickness * SUBSURFACE_SCATTER.scale;

      const subsurfaceColor = new THREE.Color(SUBSURFACE_SCATTER.color);
      mat.color.lerp(subsurfaceColor, SUBSURFACE_SCATTER.intensity * 0.3);
    }

    if (MICRO_HIGHLIGHTS.enabled) {
      mat.clearcoat = Math.min(DEFAULT_HEART_MATERIAL.clearcoat + MICRO_HIGHLIGHTS.intensity, 1.0);
      mat.clearcoatRoughness =
        DEFAULT_HEART_MATERIAL.clearcoatRoughness * MICRO_HIGHLIGHTS.sharpness;
    }

    return mat;
  }, []);

  const ambientGlow = useMemo(() => {
    if (!AMBIENT_GLOW.enabled) return null;

    const light = new THREE.PointLight(
      new THREE.Color(AMBIENT_GLOW.color),
      AMBIENT_GLOW.intensity,
      AMBIENT_GLOW.distance,
      AMBIENT_GLOW.decay
    );

    light.castShadow = false;
    pointLightRef.current = light;

    return light;
  }, []);

  useFrame((state) => {
    if (!meshRef.current || !(meshRef.current.material instanceof THREE.MeshPhysicalMaterial)) {
      return;
    }

    const mat = meshRef.current.material;
    mat.opacity = opacity;

    if (isIdle && INTERNAL_PULSE.enabled) {
      pulsePhaseRef.current += state.clock.getDelta() * INTERNAL_PULSE.frequency;
      const pulseProgress = pulsePhaseRef.current % 1.0;
      const pulseValue = heartbeatPulse(pulseProgress);

      const pulseIntensity = INTERNAL_PULSE.baseIntensity + pulseValue * INTERNAL_PULSE.amplitude;

      mat.emissiveIntensity = pulseIntensity;

      if (pointLightRef.current && AMBIENT_GLOW.enabled) {
        pointLightRef.current.intensity = AMBIENT_GLOW.intensity * (1 + pulseValue * 0.15);
      }
    } else {
      mat.emissiveIntensity = DEFAULT_HEART_MATERIAL.emissiveIntensity;
    }

    if (isIdle && MICRO_HIGHLIGHTS.enabled) {
      shimmerPhaseRef.current += state.clock.getDelta() * 0.5;
      const shimmer = shimmerCurve(shimmerPhaseRef.current, 2, 0.1);

      mat.clearcoat = DEFAULT_HEART_MATERIAL.clearcoat * shimmer;
    }

    if (SUBSURFACE_SCATTER.enabled) {
      const subsurfaceBase = new THREE.Color(SUBSURFACE_SCATTER.color);
      const targetColor = new THREE.Color(DEFAULT_HEART_MATERIAL.color);

      if (isIdle) {
        const breathPhase = Math.sin(state.clock.elapsedTime * 0.8) * 0.5 + 0.5;
        const blendFactor = SUBSURFACE_SCATTER.intensity * 0.3 * (1 + breathPhase * 0.2);
        mat.color.copy(targetColor).lerp(subsurfaceBase, blendFactor);
      } else {
        mat.color.copy(targetColor).lerp(subsurfaceBase, SUBSURFACE_SCATTER.intensity * 0.3);
      }
    }
  });

  useEffect(() => {
    return () => {
      material.dispose();
      if (pointLightRef.current) {
        pointLightRef.current.dispose();
      }
    };
  }, [material]);

  return {
    material,
    ambientGlow,
  };
}

interface HeartMaterialComponentProps {
  meshRef: React.RefObject<THREE.Mesh>;
  isIdle: boolean;
  opacity?: number;
  position?: [number, number, number];
}

export function HeartMaterialComponent({
  meshRef,
  isIdle,
  opacity = 1,
  position = [0, 0, 0],
}: HeartMaterialComponentProps) {
  const { ambientGlow } = useHeartMaterial({ meshRef, isIdle, opacity });

  if (!ambientGlow) {
    return null;
  }

  return <primitive object={ambientGlow} position={position} />;
}
