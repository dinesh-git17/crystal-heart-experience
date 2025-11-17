// src/components/3d/Lighting.tsx
// Comprehensive lighting system with ambient, directional, and accent point lights optimized for mobile

import { Environment } from '@react-three/drei';
import { useRef } from 'react';
import type { DirectionalLight } from 'three';

interface LightingProps {
  enableShadows?: boolean;
  showHelpers?: boolean;
}

export function Lighting({ enableShadows = true, showHelpers = false }: LightingProps) {
  const directionalLightRef = useRef<DirectionalLight>(null);

  return (
    <>
      <ambientLight intensity={0.4} color="#ffffff" />

      <directionalLight
        ref={directionalLightRef}
        position={[5, 5, 5]}
        intensity={1.2}
        castShadow={enableShadows}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0001}
      />

      <pointLight position={[-3, 2, 3]} intensity={0.8} color="#ff9ec4" distance={10} decay={2} />

      <pointLight position={[3, 2, -3]} intensity={0.6} color="#c4e0ff" distance={10} decay={2} />

      <Environment preset="sunset" />

      {showHelpers && directionalLightRef.current && (
        <directionalLightHelper args={[directionalLightRef.current, 1]} />
      )}
    </>
  );
}
