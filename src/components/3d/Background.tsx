// src/components/3d/Background.tsx
// Cosmic gradient background sphere with romantic color palette

import { useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

interface BackgroundProps {
  topColor?: string;
  middleColor?: string;
  bottomColor?: string;
}

export function Background({
  topColor = '#1a0b2e',
  middleColor = '#4a1a4a',
  bottomColor = '#ff6b9d',
}: BackgroundProps) {
  const { scene } = useThree();

  const gradientTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 512;
    const context = canvas.getContext('2d');

    if (!context) {
      return null;
    }

    const gradient = context.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, topColor);
    gradient.addColorStop(0.5, middleColor);
    gradient.addColorStop(1, bottomColor);

    context.fillStyle = gradient;
    context.fillRect(0, 0, 2, 512);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    return texture;
  }, [topColor, middleColor, bottomColor]);

  useEffect(() => {
    if (!gradientTexture) return;

    const originalBackground = scene.background;
    scene.background = gradientTexture;

    return () => {
      scene.background = originalBackground;
    };
  }, [scene, gradientTexture]);

  return (
    <mesh scale={[-1, 1, 1]} position={[0, 0, 0]}>
      <sphereGeometry args={[500, 32, 32]} />
      <meshBasicMaterial map={gradientTexture} side={THREE.BackSide} depthWrite={false} />
    </mesh>
  );
}
