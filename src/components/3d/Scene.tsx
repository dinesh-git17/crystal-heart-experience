// src/components/3d/Scene.tsx
// Main scene orchestrator with Phase 4 pulse initialization and letter reveal coordination

import { useState, useCallback, useRef, useEffect } from 'react';
import { Camera, CameraMode, type CameraHandle } from './Camera';
import { LightingRig } from './LightingRig';
import { Background } from './Background';
import { Particles } from './Particles';
import { Diamond } from './Diamond';
import { ShardParticles } from './ShardParticles';
import { TransitionOrchestrator } from './TransitionOrchestrator';
import { useDiamondInteraction } from '@/hooks/useDiamondInteraction';
import { useHeartStore } from '@/stores/heartStore';
import { audioManager } from '@/utils/audioManager';

export function Scene() {
  const { handleTap, currentTapEvent } = useDiamondInteraction();
  const [diamondVisible, setDiamondVisible] = useState(true);
  const [heartIdleActivated, setHeartIdleActivated] = useState(false);
  const cameraRef = useRef<CameraHandle>(null);

  const { startPulse, setLetterVisible } = useHeartStore((state) => state.actions);

  const handleShatterStart = useCallback(() => {
    setDiamondVisible(false);

    if (import.meta.env.DEV) {
      console.log('Diamond hidden, shatter animation starting');
    }
  }, []);

  const handleCinematicStart = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.setMode(CameraMode.LOCKED);

      if (import.meta.env.DEV) {
        console.log('Camera locked for cinematic sequence');
      }
    }
  }, []);

  const handleCinematicComplete = useCallback(() => {
    if (cameraRef.current) {
      setTimeout(() => {
        if (cameraRef.current) {
          cameraRef.current.setMode(CameraMode.DRIFT);

          if (import.meta.env.DEV) {
            console.log('Camera returned to drift mode after cinematic');
          }
        }
      }, 100);
    }
  }, []);

  const handleTransitionComplete = useCallback(() => {
    if (!heartIdleActivated) {
      setHeartIdleActivated(true);

      const bpm = audioManager.getMusicBPM();
      startPulse(bpm);
      setLetterVisible(true);

      if (import.meta.env.DEV) {
        console.log('Phase 4 activated: Heart pulsing at', bpm, 'BPM with letter visible');
      }
    }
  }, [heartIdleActivated, startPulse, setLetterVisible]);

  useEffect(() => {
    return () => {
      setHeartIdleActivated(false);
    };
  }, []);

  return (
    <>
      <Camera
        ref={cameraRef}
        position={[0, 0, 5]}
        fov={55}
        introAnimation={true}
        enableDrift={true}
      />

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
          onCinematicStart={handleCinematicStart}
          onCinematicComplete={handleCinematicComplete}
          onTransitionComplete={handleTransitionComplete}
          cameraRef={cameraRef}
        />
      </group>
    </>
  );
}
