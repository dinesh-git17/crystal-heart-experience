// src/components/3d/Particles.tsx
// Enhanced star particle system with twinkling animation and color variation for natural appearance

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { COLORS } from '@/constants/colors';

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

  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');

    if (!context) {
      return null;
    }

    const centerX = 32;
    const centerY = 32;
    const radius = 32;

    const gradient = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);

    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.4)');
    gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    return texture;
  }, []);

  const [positions, velocities, sizes, colors, twinklePhases] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const twinklePhases = new Float32Array(count);

    const colorPalette = [
      new THREE.Color(COLORS.particle.white),
      new THREE.Color(COLORS.particle.tintPink),
      new THREE.Color(COLORS.particle.tintPurple),
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      positions[i3] = (Math.random() - 0.5) * spread;
      positions[i3 + 1] = (Math.random() - 0.5) * spread;
      positions[i3 + 2] = (Math.random() - 0.5) * spread;

      velocities[i3] = (Math.random() - 0.5) * 0.0002;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.0002;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.0002;

      sizes[i] = Math.random() * 0.5 + 0.5;

      const colorChoice = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      if (colorChoice) {
        colors[i3] = colorChoice.r;
        colors[i3 + 1] = colorChoice.g;
        colors[i3 + 2] = colorChoice.b;
      }

      twinklePhases[i] = Math.random() * Math.PI * 2;
    }

    return [positions, velocities, sizes, colors, twinklePhases];
  }, [count, spread]);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const positionAttribute = pointsRef.current.geometry.attributes.position;
    const sizeAttribute = pointsRef.current.geometry.attributes.size;

    if (!positionAttribute || !sizeAttribute) return;

    const positions = positionAttribute.array as Float32Array;
    const sizes = sizeAttribute.array as Float32Array;
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
      const twinkle = Math.sin(time * twinkleSpeed + twinklePhase) * twinkleIntensity;
      sizes[i] = baseSize * (1 + twinkle);
    }

    positionAttribute.needsUpdate = true;
    sizeAttribute.needsUpdate = true;
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
