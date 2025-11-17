// src/components/3d/Scene.tsx
// Main scene orchestrator with Phase 1 environment and Phase 2 diamond interaction system

import { Camera } from './Camera';
import { LightingRig } from './LightingRig';
import { Background } from './Background';
import { Particles } from './Particles';
import { Diamond } from './Diamond';
import { ShardParticles } from './ShardParticles';
import { useDiamondInteraction } from '@/hooks/useDiamondInteraction';

export function Scene() {
  const { handleTap, currentTapEvent } = useDiamondInteraction();

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

      <group position={[0, 0, 0]}>
        <Diamond onTap={handleTap} />
      </group>

      <ShardParticles tapEvent={currentTapEvent} count={20} />
    </>
  );
}
