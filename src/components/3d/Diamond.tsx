// src/components/3d/Diamond.tsx
// Interactive rose-diamond crystal with fallback geometry

import { useFrame, ThreeEvent } from '@react-three/fiber';
import { useRef, useMemo, useCallback } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { DiamondCracks } from './DiamondCracks';
import {
  useDiamondStore,
  useDiamondCrackLevel,
  useCurrentCrackConfig,
} from '@/stores/diamondStore';
import { DEFAULT_DIAMOND_MATERIAL, DEFAULT_DIAMOND_GEOMETRY } from '@/types/diamond';
import { COLORS } from '@/constants/colors';
import type { TapEvent } from '@/types/diamond';

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

  const { scene } = useGLTF('/models/diamond.glb');

  const fallbackGeometry = useMemo(() => {
    return new THREE.OctahedronGeometry(1, 2);
  }, []);

  const material = useMemo(() => {
    const baseRoughness = 0.05;
    const baseTransmission = DEFAULT_DIAMOND_MATERIAL.transmission;

    const adjustedRoughness = Math.min(1, baseRoughness + crackConfig.roughnessModifier);
    const adjustedTransmission = Math.max(0, baseTransmission + crackConfig.transmissionModifier);

    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(COLORS.primary.main),
      transmission: adjustedTransmission,
      roughness: adjustedRoughness,
      metalness: DEFAULT_DIAMOND_MATERIAL.metalness,
      ior: DEFAULT_DIAMOND_MATERIAL.ior,
      thickness: 0.8,
      envMapIntensity: 2.5,
      clearcoat: DEFAULT_DIAMOND_MATERIAL.clearcoat,
      clearcoatRoughness: 0.05,
      emissive: new THREE.Color(COLORS.primary.dark),
      emissiveIntensity: 0.2,
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
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;
    const rotationSpeed = 0.2;
    groupRef.current.rotation.y = time * rotationSpeed;
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

      onTap(tapEvent);
    },
    [isInteractive, onTap, crackLevel]
  );

  return (
    <group position={position} ref={groupRef}>
      <mesh
        ref={meshRef}
        geometry={diamondGeometry}
        material={material}
        scale={[
          DEFAULT_DIAMOND_GEOMETRY.scale[0] * scale,
          DEFAULT_DIAMOND_GEOMETRY.scale[1] * scale,
          DEFAULT_DIAMOND_GEOMETRY.scale[2] * scale,
        ]}
        onClick={handleClick}
        castShadow
        receiveShadow
      >
        {/* Pass mesh ref so cracks can access rotation */}
        <DiamondCracks geometry={diamondGeometry} diamondMeshRef={meshRef} />
      </mesh>

      <mesh
        position={[0, -DEFAULT_DIAMOND_GEOMETRY.radius * scale * 0.65, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[3, 3]} />
        <shadowMaterial opacity={0.3} />
      </mesh>
    </group>
  );
}

useGLTF.preload('/models/diamond.glb');
