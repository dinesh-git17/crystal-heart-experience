// src/components/3d/Scene.tsx
// Main scene orchestrator with all enhanced Phase 1 polish components

import { Camera } from './Camera';
import { LightingRig } from './LightingRig';
import { Background } from './Background';
import { Particles } from './Particles';
import { Cube } from './Cube';

export function Scene() {
  return (
    <>
      <Camera position={[0, 0, 5]} fov={55} introAnimation={true} enableDrift={true} />

      <LightingRig enableShadows={true} />

      <Background enableFog={true} />

      <Particles
        count={120}
        size={0.05}
        opacity={0.6}
        spread={10}
        twinkleSpeed={0.5}
        twinkleIntensity={0.3}
      />

      <Cube position={[0, 0, 0]} floatAmplitude={0.15} floatSpeed={0.8} />
    </>
  );
}
