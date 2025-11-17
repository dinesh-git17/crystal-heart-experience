// src/components/3d/Background.tsx
// Enhanced cosmic gradient background with smooth multi-stop transitions and fog integration

import { useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { COLORS } from '@/constants/colors';

interface BackgroundProps {
  topColor?: string;
  middleColor?: string;
  bottomColor?: string;
  enableFog?: boolean;
}

export function Background({
  topColor = COLORS.background.top,
  middleColor = COLORS.background.middle,
  bottomColor = COLORS.background.bottom,
  enableFog = true,
}: BackgroundProps) {
  const { scene } = useThree();

  const gradientTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 1024;
    const context = canvas.getContext('2d');

    if (!context) {
      return null;
    }

    const gradient = context.createLinearGradient(0, 0, 0, 1024);

    gradient.addColorStop(0, topColor);
    gradient.addColorStop(0.25, topColor);
    gradient.addColorStop(0.5, middleColor);
    gradient.addColorStop(0.75, bottomColor);
    gradient.addColorStop(1, bottomColor);

    context.fillStyle = gradient;
    context.fillRect(0, 0, 2, 1024);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    return texture;
  }, [topColor, middleColor, bottomColor]);

  useEffect(() => {
    if (!gradientTexture) return;

    const originalBackground = scene.background;
    scene.background = gradientTexture;

    if (enableFog) {
      scene.fog = new THREE.Fog(COLORS.scene.fog, 8, 20);
    }

    return () => {
      scene.background = originalBackground;
      if (scene.fog) {
        scene.fog = null;
      }
    };
  }, [scene, gradientTexture, enableFog]);

  return (
    <mesh scale={[-1, 1, 1]} position={[0, 0, 0]}>
      <sphereGeometry args={[500, 64, 64]} />
      <meshBasicMaterial
        map={gradientTexture}
        side={THREE.BackSide}
        depthWrite={false}
        fog={false}
      />
    </mesh>
  );
}
