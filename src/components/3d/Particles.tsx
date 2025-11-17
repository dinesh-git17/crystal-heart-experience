// src/components/3d/Particles.tsx
// Enhanced particle system with star size variation, brightness levels, and advanced twinkling

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { STAR_VARIATION } from '@/constants/diamondConfig';

interface ParticlesProps {
  count?: number;
  size?: number;
  opacity?: number;
  spread?: number;
  twinkleSpeed?: number;
  twinkleIntensity?: number;
}

export function Particles({
  count = 120,
  size = 0.05,
  opacity = 0.6,
  spread = 10,
  twinkleSpeed = 0.5,
  twinkleIntensity = 0.3,
}: ParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const [particleTexture, setParticleTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.4)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);

      const texture = new THREE.CanvasTexture(canvas);
      setParticleTexture(texture);
    }
  }, []);

  const [positions, velocities, sizes, colors, twinklePhases, brightnessFactors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const twinklePhases = new Float32Array(count);
    const brightnessFactors = new Float32Array(count);

    const numStaticStars = Math.floor(count * STAR_VARIATION.staticStarRatio);
    const numBrightStars = Math.floor((count - numStaticStars) * STAR_VARIATION.brightStarRatio);
    const numLargeStars = STAR_VARIATION.largeStarCount;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      positions[i3] = (Math.random() - 0.5) * spread;
      positions[i3 + 1] = (Math.random() - 0.5) * spread;
      positions[i3 + 2] = (Math.random() - 0.5) * spread;

      velocities[i3] = (Math.random() - 0.5) * 0.0002;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.0002;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.0002;

      const isStaticStar = i < numStaticStars;
      const isBrightStar = !isStaticStar && i < numStaticStars + numBrightStars;
      const isLargeStar =
        !isStaticStar && !isBrightStar && i < numStaticStars + numBrightStars + numLargeStars;

      if (isStaticStar) {
        sizes[i] = size * (0.7 + Math.random() * 0.5); // Larger size range
        brightnessFactors[i] = 1.0; // FULL brightness

        const colorVariation = 0.95 + Math.random() * 0.05; // Brighter colors
        colors[i3] = colorVariation;
        colors[i3 + 1] = colorVariation;
        colors[i3 + 2] = colorVariation;
      } else if (isBrightStar) {
        sizes[i] = size * STAR_VARIATION.brightStarSizeMultiplier;
        brightnessFactors[i] = STAR_VARIATION.brightStarGlowIntensity;

        colors[i3] = 0.85;
        colors[i3 + 1] = 0.8 + Math.random() * 0.05;
        colors[i3 + 2] = 0.75 + Math.random() * 0.1;
      } else if (isLargeStar) {
        sizes[i] = STAR_VARIATION.largeStarSize;
        brightnessFactors[i] = 0.85;

        colors[i3] = 0.8 + Math.random() * 0.05;
        colors[i3 + 1] = 0.75 + Math.random() * 0.1;
        colors[i3 + 2] = 0.85;
      } else {
        sizes[i] = size * (0.4 + Math.random() * 0.5);
        brightnessFactors[i] = 0.5 + Math.random() * 0.2;

        const colorVariation = 0.75 + Math.random() * 0.1;
        colors[i3] = colorVariation;
        colors[i3 + 1] = colorVariation;
        colors[i3 + 2] = colorVariation;
      }

      twinklePhases[i] = Math.random() * Math.PI * 2;
    }

    return [positions, velocities, sizes, colors, twinklePhases, brightnessFactors];
  }, [count, spread, size]);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const positionAttribute = pointsRef.current.geometry.attributes.position;
    const sizeAttribute = pointsRef.current.geometry.attributes.size;
    const colorAttribute = pointsRef.current.geometry.attributes.color;

    if (!positionAttribute || !sizeAttribute || !colorAttribute) return;

    const positions = positionAttribute.array as Float32Array;
    const sizes = sizeAttribute.array as Float32Array;
    const colors = colorAttribute.array as Float32Array;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      const vx = velocities[i3];
      const vy = velocities[i3 + 1];
      const vz = velocities[i3 + 2];

      if (vx === undefined || vy === undefined || vz === undefined) continue;

      const px = positions[i3];
      const py = positions[i3 + 1];
      const pz = positions[i3 + 2];

      if (px === undefined || py === undefined || pz === undefined) continue;

      positions[i3] = px + vx;
      positions[i3 + 1] = py + vy + Math.sin(time + i) * 0.0001;
      positions[i3 + 2] = pz + vz;

      if (Math.abs(positions[i3] ?? 0) > spread / 2) {
        positions[i3] = -(positions[i3] ?? 0);
      }
      if (Math.abs(positions[i3 + 1] ?? 0) > spread / 2) {
        positions[i3 + 1] = -(positions[i3 + 1] ?? 0);
      }
      if (Math.abs(positions[i3 + 2] ?? 0) > spread / 2) {
        positions[i3 + 2] = -(positions[i3 + 2] ?? 0);
      }

      const baseSize = sizes[i] ?? 1;
      const twinklePhase = twinklePhases[i] ?? 0;
      const brightnessFactor = brightnessFactors[i] ?? 1;

      const isStatic = brightnessFactor <= STAR_VARIATION.staticStarBrightness + 0.1;
      const twinkleAmount = isStatic ? twinkleIntensity * 0.3 : twinkleIntensity;

      const twinkleVariation = 1 + (Math.random() - 0.5) * STAR_VARIATION.twinkleVariation;
      const twinkle =
        Math.sin(time * twinkleSpeed * twinkleVariation + twinklePhase) * twinkleAmount;

      sizes[i] = baseSize * (1 + twinkle);

      const baseColorR = colors[i3] ?? 1;
      const baseColorG = colors[i3 + 1] ?? 1;
      const baseColorB = colors[i3 + 2] ?? 1;

      const colorTwinkle = isStatic ? 1 : 1 + twinkle * 0.3;
      colors[i3] = baseColorR * colorTwinkle * brightnessFactor;
      colors[i3 + 1] = baseColorG * colorTwinkle * brightnessFactor;
      colors[i3 + 2] = baseColorB * colorTwinkle * brightnessFactor;
    }

    positionAttribute.needsUpdate = true;
    sizeAttribute.needsUpdate = true;
    colorAttribute.needsUpdate = true;
  });

  if (!particleTexture) {
    return null;
  }

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute attach="attributes-size" count={count} array={sizes} itemSize={1} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        map={particleTexture}
        transparent
        opacity={opacity}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexColors
      />
    </points>
  );
}
