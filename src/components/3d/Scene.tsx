// src/components/3d/Scene.tsx
// Main scene orchestrator combining camera, lighting, background, particles, and placeholder geometry

import { Camera } from './Camera';
import { Lighting } from './Lighting';
import { Background } from './Background';
import { Particles } from './Particles';

export function Scene() {
  return (
    <>
      <Camera position={[0, 0, 5]} fov={55} />

      <Lighting enableShadows={true} showHelpers={false} />

      <Background topColor="#1a0b2e" middleColor="#4a1a4a" bottomColor="#ff6b9d" />

      <Particles count={120} size={0.05} opacity={0.6} spread={10} />

      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ff69b4" metalness={0.8} roughness={0.2} />
      </mesh>
    </>
  );
}
