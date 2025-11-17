// src/components/3d/Diamond.tsx
// Enhanced diamond with heartbeat pulse, organic floating, and polished material properties

import { useRef, useMemo, useCallback, useState } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { DiamondCracks } from './DiamondCracks';
import {
  useDiamondCrackLevel,
  useDiamondStore,
  useCurrentCrackConfig,
} from '@/stores/diamondStore';
import { COLORS } from '@/constants/colors';
import { DEFAULT_DIAMOND_GEOMETRY } from '@/types/diamond';
import {
  DIAMOND_ANIMATION,
  DIAMOND_MATERIAL_POLISH,
  EMOTIONAL_POLISH,
} from '@/constants/diamondConfig';
import type { TapEvent, DiamondAnimationState, EmotionalPolishState } from '@/types/diamond';

interface DiamondProps {
  position?: [number, number, number];
  scale?: number;
  onTap?: (event: TapEvent) => void;
}

export function Diamond({ position = [0, 0, 0], scale = 1, onTap }: DiamondProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const crackLevel = useDiamondCrackLevel();
  const crackConfig = useCurrentCrackConfig();
  const isInteractive = useDiamondStore((state) => state.isInteractive);

  const [animState] = useState<DiamondAnimationState>({
    heartbeatPhase: 0,
    floatPhase: 0,
    rotationWobble: 0,
    currentScale: 1,
    currentEmissive: DIAMOND_MATERIAL_POLISH.emissiveBase,
    pulseActive: false,
    pulseStartTime: 0,
  });

  const [emotionalState] = useState<EmotionalPolishState>({
    pinkRadianceIntensity: EMOTIONAL_POLISH.pinkRadiance.intensity,
    heartReflectionOpacity: EMOTIONAL_POLISH.heartShapedReflection.opacity,
    subsurfaceScatterIntensity: EMOTIONAL_POLISH.subsurfaceScatter.intensity,
    radiancePulsePhase: 0,
  });

  const { scene } = useGLTF('/models/diamond.glb');

  const fallbackGeometry = useMemo(() => {
    return new THREE.OctahedronGeometry(1, 2);
  }, []);

  const material = useMemo(() => {
    const baseRoughness = DIAMOND_MATERIAL_POLISH.roughness;
    const baseTransmission = DIAMOND_MATERIAL_POLISH.transmission;

    const adjustedRoughness = Math.min(1, baseRoughness + crackConfig.roughnessModifier);
    const adjustedTransmission = Math.max(0, baseTransmission + crackConfig.transmissionModifier);

    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(COLORS.primary.main),
      transmission: adjustedTransmission,
      roughness: adjustedRoughness,
      metalness: DIAMOND_MATERIAL_POLISH.metalness,
      ior: DIAMOND_MATERIAL_POLISH.ior,
      thickness: DIAMOND_MATERIAL_POLISH.thickness,
      envMapIntensity: DIAMOND_MATERIAL_POLISH.envMapIntensity,
      clearcoat: DIAMOND_MATERIAL_POLISH.clearcoat,
      clearcoatRoughness: DIAMOND_MATERIAL_POLISH.clearcoatRoughness,
      emissive: new THREE.Color(COLORS.primary.dark),
      emissiveIntensity: DIAMOND_MATERIAL_POLISH.emissiveBase,
      transparent: true,
      side: THREE.FrontSide,
    });
  }, [crackConfig]);

  const diamondGeometry = useMemo(() => {
    let geometry: THREE.BufferGeometry | null = null;
    let foundGeometry = false;

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && !foundGeometry) {
        geometry = child.geometry;
        foundGeometry = true;
        if (import.meta.env.DEV) {
          console.log('Found diamond geometry in model');
        }
      }
    });

    if (!geometry) {
      if (import.meta.env.DEV) {
        console.warn('No geometry found in model, using fallback octahedron');
      }
      return fallbackGeometry;
    }

    return geometry;
  }, [scene, fallbackGeometry]);

  useFrame((state) => {
    if (!groupRef.current || !meshRef.current) return;

    const time = state.clock.elapsedTime;

    if (DIAMOND_ANIMATION.heartbeat.enabled) {
      const heartbeatFreq = DIAMOND_ANIMATION.heartbeat.speedFactor;
      const heartbeatPhase = Math.sin(time * heartbeatFreq);

      const scaleMultiplier = 1 + heartbeatPhase * DIAMOND_ANIMATION.heartbeat.scaleAmplitude;
      animState.currentScale = scaleMultiplier;

      const emissiveVariation = heartbeatPhase * DIAMOND_ANIMATION.heartbeat.emissiveAmplitude;
      animState.currentEmissive = DIAMOND_MATERIAL_POLISH.emissiveBase + emissiveVariation;

      if (meshRef.current.material instanceof THREE.MeshPhysicalMaterial) {
        meshRef.current.material.emissiveIntensity = animState.currentEmissive;
      }

      if (EMOTIONAL_POLISH.pinkRadiance.enabled && crackLevel > 0) {
        const radiance = EMOTIONAL_POLISH.pinkRadiance.intensity + Math.sin(time * 1.2) * 0.05;
        emotionalState.pinkRadianceIntensity = radiance;

        if (meshRef.current.material instanceof THREE.MeshPhysicalMaterial) {
          const currentEmissive = meshRef.current.material.emissiveIntensity;
          meshRef.current.material.emissiveIntensity = currentEmissive + radiance * 0.2;
        }
      }
    }

    const rotationSpeed = DIAMOND_ANIMATION.rotation.baseSpeed;
    const wobbleX = Math.sin(time * 0.7) * DIAMOND_ANIMATION.rotation.wobbleIntensity;
    const wobbleZ = Math.cos(time * 0.5) * DIAMOND_ANIMATION.rotation.wobbleIntensity;

    groupRef.current.rotation.y = time * rotationSpeed;
    groupRef.current.rotation.x = wobbleX;
    groupRef.current.rotation.z = wobbleZ;

    const floatOffset =
      Math.sin(time * DIAMOND_ANIMATION.float.speed) * DIAMOND_ANIMATION.float.amplitude;
    const floatWobble = Math.cos(time * DIAMOND_ANIMATION.float.wobbleFrequency) * 0.02;
    groupRef.current.position.y = position[1] + floatOffset + floatWobble;

    const tiltX = Math.sin(time * 0.3) * DIAMOND_ANIMATION.rotation.tiltVariation;
    const tiltZ = Math.cos(time * 0.4) * DIAMOND_ANIMATION.rotation.tiltVariation;
    groupRef.current.rotation.x += tiltX;
    groupRef.current.rotation.z += tiltZ;
  });

  const handleClick = useCallback(
    (event: ThreeEvent<MouseEvent>) => {
      if (!isInteractive || !onTap) return;

      event.stopPropagation();

      const point = event.point.clone();
      const normal = event.face?.normal.clone() ?? new THREE.Vector3(0, 1, 0);

      if (event.face && meshRef.current) {
        const normalMatrix = new THREE.Matrix3().getNormalMatrix(meshRef.current.matrixWorld);
        normal.applyMatrix3(normalMatrix);
        normal.normalize();
      }

      const tapEvent: TapEvent = {
        point,
        normal,
        timestamp: Date.now(),
        crackLevel,
      };

      animState.pulseActive = true;
      animState.pulseStartTime = Date.now();

      onTap(tapEvent);
    },
    [isInteractive, onTap, crackLevel, animState]
  );

  return (
    <group position={position} ref={groupRef}>
      <mesh
        ref={meshRef}
        geometry={diamondGeometry}
        material={material}
        scale={[
          DEFAULT_DIAMOND_GEOMETRY.scale[0] * scale * animState.currentScale,
          DEFAULT_DIAMOND_GEOMETRY.scale[1] * scale * animState.currentScale,
          DEFAULT_DIAMOND_GEOMETRY.scale[2] * scale * animState.currentScale,
        ]}
        onClick={handleClick}
        castShadow
        receiveShadow
      >
        <DiamondCracks geometry={diamondGeometry} diamondMeshRef={meshRef} />
      </mesh>

      <mesh
        position={[0, -DEFAULT_DIAMOND_GEOMETRY.radius * scale * 0.65, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[3, 3]} />
        <shadowMaterial opacity={0.25} />
      </mesh>
    </group>
  );
}

useGLTF.preload('/models/diamond.glb');
