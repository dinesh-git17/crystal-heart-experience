// src/components/3d/HeartLighting.tsx
// Dynamic lighting system for heart reveal with spotlight, background dimming, pink shockwave, and flares

import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { HEART_LIGHTING, LIGHT_FLARES } from '@/types/heart';
import { easeInOutCubic, easeOutCirc, radianceFade } from '@/utils/easingFunctions';

interface HeartLightingProps {
  heartPosition: [number, number, number];
  triggerReveal: boolean;
  onLightingComplete?: () => void;
}

export function HeartLighting({
  heartPosition,
  triggerReveal,
  onLightingComplete,
}: HeartLightingProps) {
  const spotlightRef = useRef<THREE.SpotLight>(null);
  const startTimeRef = useRef<number | null>(null);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (triggerReveal && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      startTimeRef.current = null;

      if (import.meta.env.DEV) {
        console.log('Heart lighting triggered');
      }
    }
  }, [triggerReveal]);

  useFrame((state) => {
    if (!HEART_LIGHTING.spotlight.enabled || !triggerReveal || !hasTriggeredRef.current) {
      return;
    }

    if (startTimeRef.current === null) {
      startTimeRef.current = state.clock.elapsedTime;
      return;
    }

    const elapsed = state.clock.elapsedTime - startTimeRef.current;
    const fadeProgress = Math.min(elapsed / HEART_LIGHTING.spotlight.fadeInDuration, 1);
    const easedProgress = easeInOutCubic(fadeProgress);

    if (spotlightRef.current) {
      spotlightRef.current.intensity = HEART_LIGHTING.spotlight.intensity * easedProgress;
    }

    if (fadeProgress >= 1 && onLightingComplete) {
      onLightingComplete();
    }
  });

  if (!HEART_LIGHTING.spotlight.enabled) {
    return null;
  }

  const spotlightPosition: [number, number, number] = [
    heartPosition[0],
    heartPosition[1] + 4,
    heartPosition[2] + 2,
  ];

  return (
    <spotLight
      ref={spotlightRef}
      position={spotlightPosition}
      target-position={heartPosition}
      angle={HEART_LIGHTING.spotlight.angle}
      penumbra={HEART_LIGHTING.spotlight.penumbra}
      intensity={0}
      color={new THREE.Color(HEART_LIGHTING.spotlight.color)}
      castShadow
      shadow-mapSize-width={1024}
      shadow-mapSize-height={1024}
    />
  );
}

interface BackgroundDimmerProps {
  triggerDim: boolean;
  onDimComplete?: () => void;
}

export function BackgroundDimmer({ triggerDim, onDimComplete }: BackgroundDimmerProps) {
  const [dimAmount, setDimAmount] = useState(1.0);
  const startTimeRef = useRef<number | null>(null);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (triggerDim && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      startTimeRef.current = null;

      if (import.meta.env.DEV) {
        console.log('Background dimming triggered');
      }
    }
  }, [triggerDim]);

  useFrame((state) => {
    if (!HEART_LIGHTING.backgroundDim.enabled || !triggerDim || !hasTriggeredRef.current) {
      return;
    }

    if (startTimeRef.current === null) {
      startTimeRef.current = state.clock.elapsedTime;
      return;
    }

    const elapsed = state.clock.elapsedTime - startTimeRef.current;
    const progress = Math.min(elapsed / HEART_LIGHTING.backgroundDim.transitionDuration, 1);
    const easedProgress = easeInOutCubic(progress);

    const targetDim = 1.0 - HEART_LIGHTING.backgroundDim.dimAmount;
    const currentDim = 1.0 - (1.0 - targetDim) * easedProgress;

    setDimAmount(currentDim);

    if (progress >= 1 && onDimComplete) {
      onDimComplete();
    }
  });

  if (!HEART_LIGHTING.backgroundDim.enabled) {
    return null;
  }

  return (
    <mesh position={[0, 0, -10]} renderOrder={-1}>
      <planeGeometry args={[50, 50]} />
      <meshBasicMaterial
        color={new THREE.Color(0x000000)}
        transparent
        opacity={1.0 - dimAmount}
        depthWrite={false}
      />
    </mesh>
  );
}

interface PinkShockwaveProps {
  position: [number, number, number];
  trigger: boolean;
}

export function PinkShockwave({ position, trigger }: PinkShockwaveProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  const startTimeRef = useRef<number | null>(null);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (trigger && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      startTimeRef.current = null;

      if (import.meta.env.DEV) {
        console.log('Pink shockwave triggered');
      }
    }
  }, [trigger]);

  useFrame((state) => {
    if (!HEART_LIGHTING.pinkShockwave.enabled || !trigger || !hasTriggeredRef.current) {
      return;
    }

    if (startTimeRef.current === null) {
      startTimeRef.current = state.clock.elapsedTime;
      return;
    }

    const elapsed = state.clock.elapsedTime - startTimeRef.current;
    const progress = Math.min(elapsed / HEART_LIGHTING.pinkShockwave.duration, 1);

    if (ringRef.current) {
      const scale = 0.1 + progress * HEART_LIGHTING.pinkShockwave.radius;
      ringRef.current.scale.set(scale, scale, scale);

      const opacity = radianceFade(progress, 0.1, 0.9) * HEART_LIGHTING.pinkShockwave.intensity;

      if (ringRef.current.material instanceof THREE.MeshBasicMaterial) {
        ringRef.current.material.opacity = opacity;
      }
    }

    if (progress >= 1) {
      hasTriggeredRef.current = false;
      startTimeRef.current = null;
    }
  });

  if (!HEART_LIGHTING.pinkShockwave.enabled) {
    return null;
  }

  return (
    <mesh ref={ringRef} position={position} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.9, 1.0, 32]} />
      <meshBasicMaterial
        color={new THREE.Color(HEART_LIGHTING.pinkShockwave.color)}
        transparent
        opacity={0}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

interface LightFlareProps {
  position: [number, number, number];
  trigger: boolean;
}

export function LightFlare({ position, trigger }: LightFlareProps) {
  const [flares, setFlares] = useState<Array<{ id: number; angle: number; delay: number }>>([]);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (trigger && !hasTriggeredRef.current && LIGHT_FLARES.enabled) {
      hasTriggeredRef.current = true;

      const newFlares = Array.from({ length: LIGHT_FLARES.count }, (_, i) => ({
        id: i,
        angle: (i / LIGHT_FLARES.count) * Math.PI * 2,
        delay: i * 0.05,
      }));

      setFlares(newFlares);

      if (import.meta.env.DEV) {
        console.log('Light flares triggered, count:', LIGHT_FLARES.count);
      }
    }
  }, [trigger]);

  if (!LIGHT_FLARES.enabled || flares.length === 0) {
    return null;
  }

  return (
    <group position={position}>
      {flares.map((flare) => (
        <FlareBeam key={flare.id} angle={flare.angle} delay={flare.delay} trigger={trigger} />
      ))}
    </group>
  );
}

interface FlareBeamProps {
  angle: number;
  delay: number;
  trigger: boolean;
}

function FlareBeam({ angle, delay, trigger }: FlareBeamProps) {
  const beamRef = useRef<THREE.Mesh>(null);
  const startTimeRef = useRef<number | null>(null);
  const hasStartedRef = useRef(false);

  useFrame((state) => {
    if (!trigger) {
      return;
    }

    if (startTimeRef.current === null) {
      startTimeRef.current = state.clock.elapsedTime;
      return;
    }

    const elapsed = state.clock.elapsedTime - startTimeRef.current;

    if (elapsed < delay) {
      return;
    }

    hasStartedRef.current = true;

    const progress = Math.min((elapsed - delay) / LIGHT_FLARES.duration, 1);
    const easedProgress = easeOutCirc(progress);

    if (beamRef.current) {
      const length = easedProgress * LIGHT_FLARES.spread;
      beamRef.current.scale.set(0.02, length, 0.02);

      const opacity = (1 - progress) * LIGHT_FLARES.intensity;

      if (beamRef.current.material instanceof THREE.MeshBasicMaterial) {
        beamRef.current.material.opacity = opacity;
      }
    }
  });

  const x = Math.cos(angle) * 0.5;
  const z = Math.sin(angle) * 0.5;

  return (
    <mesh ref={beamRef} position={[x, 0, z]} rotation={[0, angle, 0]}>
      <boxGeometry args={[0.05, 1, 0.05]} />
      <meshBasicMaterial
        color={new THREE.Color('#ffffff')}
        transparent
        opacity={0}
        depthWrite={false}
      />
    </mesh>
  );
}
