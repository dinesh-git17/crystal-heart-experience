// src/components/3d/Scene.tsx
// Main scene orchestrator with Phase 1 environment, Phase 2 diamond interaction, and Phase 3 transition system

import { useState, useCallback } from 'react';
import { Camera } from './Camera';
import { LightingRig } from './LightingRig';
import { Background } from './Background';
import { Particles } from './Particles';
import { Diamond } from './Diamond';
import { ShardParticles } from './ShardParticles';
import { TransitionOrchestrator } from './TransitionOrchestrator';
import { useDiamondInteraction } from '@/hooks/useDiamondInteraction';

export function Scene() {
  const { handleTap, currentTapEvent } = useDiamondInteraction();
  const [diamondVisible, setDiamondVisible] = useState(true);

  const handleShatterStart = useCallback(() => {
    setDiamondVisible(false);

    if (import.meta.env.DEV) {
      console.log('Diamond hidden, shatter animation starting');
    }
  }, []);

  const handleTransitionComplete = useCallback(() => {
    if (import.meta.env.DEV) {
      console.log('Transition complete, heart now idle and ready for Phase 4');
    }
  }, []);

  return (
    <>
      <Camera position={[0, 0, 5]} fov={55} introAnimation={true} enableDrift={true} />

      <LightingRig enableShadows={true} />

      <Background enableFog={true} />

      <Particles
        count={300}
        size={0.038}
        opacity={0.65}
        spread={10}
        twinkleSpeed={0.5}
        twinkleIntensity={0.18}
      />

      <group position={[0, 0, 0]}>
        {diamondVisible && <Diamond onTap={handleTap} />}

        <ShardParticles tapEvent={currentTapEvent} count={20} />

        <TransitionOrchestrator
          diamondPosition={[0, 0, 0]}
          onShatterStart={handleShatterStart}
          onTransitionComplete={handleTransitionComplete}
        />
      </group>
    </>
  );
}
