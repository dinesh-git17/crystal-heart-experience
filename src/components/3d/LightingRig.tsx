// src/components/3d/LightingRig.tsx
// Professional 3-point lighting setup with key, fill, and rim lights plus ACES tone mapping

import { Environment } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { COLORS } from '@/constants/colors';

interface LightingRigProps {
  enableShadows?: boolean;
}

export function LightingRig({ enableShadows = true }: LightingRigProps) {
  const keyLightRef = useRef<THREE.DirectionalLight>(null);
  const { gl } = useThree();

  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.0;
  }, [gl]);

  return (
    <>
      <ambientLight intensity={0.3} color={COLORS.scene.ambient} />

      <directionalLight
        ref={keyLightRef}
        position={[5, 6, 3]}
        intensity={1.5}
        color={COLORS.scene.key}
        castShadow={enableShadows}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-bias={-0.0001}
      />

      <directionalLight position={[-3, 2, -3]} intensity={0.4} color={COLORS.scene.fill} />

      <directionalLight position={[0, 1, -5]} intensity={0.8} color={COLORS.scene.rim} />

      <pointLight
        position={[-3, 2, 3]}
        intensity={0.6}
        color={COLORS.accent.pink}
        distance={12}
        decay={2}
      />

      <pointLight
        position={[3, 2, -3]}
        intensity={0.5}
        color={COLORS.accent.blue}
        distance={12}
        decay={2}
      />

      <Environment preset="sunset" />
    </>
  );
}
