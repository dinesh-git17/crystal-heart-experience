// src/components/3d/LetterShimmer.tsx
// Subtle sparkle particles orbiting letter to create magical, inviting shimmer effect

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface LetterShimmerProps {
  letterPosition: [number, number, number];
  particleCount?: number;
  orbitRadius?: number;
  orbitSpeed?: number;
}

export function LetterShimmer({
  letterPosition,
  particleCount = 8,
  orbitRadius = 0.2,
  orbitSpeed = 0.15,
}: LetterShimmerProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const orbitPhaseRef = useRef(0);
  const pulsePhaseRef = useRef(0);

  const particleData = useMemo(() => {
    const positionsArray = new Float32Array(particleCount * 3);
    const phasesArray = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = orbitRadius + (Math.random() - 0.5) * 0.05;

      positionsArray[i * 3] = Math.cos(angle) * radius;
      positionsArray[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
      positionsArray[i * 3 + 2] = Math.sin(angle) * radius;

      phasesArray[i] = Math.random() * Math.PI * 2;
    }

    return {
      positions: positionsArray,
      phases: phasesArray,
    };
  }, [particleCount, orbitRadius]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(particleData.positions, 3));
    return geo;
  }, [particleData.positions]);

  const material = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.015,
      color: new THREE.Color('#ffe5b4'),
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) {
      return;
    }

    const deltaTime = state.clock.getDelta();

    orbitPhaseRef.current += deltaTime * orbitSpeed;
    pulsePhaseRef.current += deltaTime * 0.5;

    pointsRef.current.rotation.y = orbitPhaseRef.current;

    const pulseFactor = Math.sin(pulsePhaseRef.current * Math.PI * 2) * 0.5 + 0.5;
    const opacity = 0.3 + pulseFactor * 0.4;

    if (material) {
      material.opacity = opacity;
    }

    const posAttr = geometry.getAttribute('position');
    if (posAttr) {
      for (let i = 0; i < particleCount; i++) {
        const phase = particleData.phases[i];
        if (phase !== undefined) {
          const verticalWave = Math.sin(state.clock.elapsedTime * 0.8 + phase) * 0.03;
          posAttr.setY(i, (Math.random() - 0.5) * 0.1 + verticalWave);
        }
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef} position={letterPosition} geometry={geometry} material={material} />
  );
}
