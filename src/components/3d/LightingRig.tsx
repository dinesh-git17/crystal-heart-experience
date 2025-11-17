// src/components/3d/LightingRig.tsx
// Premium lighting setup with enhanced diamond edge highlights and softer shadows

import { Environment } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { COLORS } from '@/constants/colors';
import { SCENE_POLISH } from '@/constants/diamondConfig';

interface LightingRigProps {
  enableShadows?: boolean;
}

export function LightingRig({ enableShadows = true }: LightingRigProps) {
  const keyLightRef = useRef<THREE.DirectionalLight>(null);
  const { gl } = useThree();

  useEffect(() => {
    if (SCENE_POLISH.toneMapping.type === 'ACESFilmic') {
      gl.toneMapping = THREE.ACESFilmicToneMapping;
    } else {
      gl.toneMapping = THREE.LinearToneMapping;
    }
    gl.toneMappingExposure = 0.95;
  }, [gl]);

  return (
    <>
      <ambientLight intensity={0.28} color={COLORS.scene.ambient} />

      <directionalLight
        ref={keyLightRef}
        position={[5, 6, 3]}
        intensity={1.3}
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
        shadow-radius={SCENE_POLISH.shadow.blur}
      />

      <directionalLight position={[-3, 2, -3]} intensity={0.35} color={COLORS.scene.fill} />

      <directionalLight position={[0, 1, -5]} intensity={0.7} color={COLORS.scene.rim} />

      <pointLight
        position={[-3, 2, 3]}
        intensity={0.55}
        color={COLORS.accent.pink}
        distance={14}
        decay={2}
      />

      <pointLight
        position={[3, 2, -3]}
        intensity={0.5}
        color={COLORS.accent.blue}
        distance={14}
        decay={2}
      />

      <pointLight position={[0, 3, 2]} intensity={0.35} color="#ffffff" distance={10} decay={2} />

      <pointLight
        position={[2, -1, 1]}
        intensity={0.3}
        color={COLORS.accent.pink}
        distance={8}
        decay={2}
      />

      <pointLight
        position={[-2, -1, -1]}
        intensity={0.25}
        color={COLORS.accent.blue}
        distance={8}
        decay={2}
      />

      <Environment preset="sunset" />
    </>
  );
}
