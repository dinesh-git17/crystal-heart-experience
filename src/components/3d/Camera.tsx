// src/components/3d/Camera.tsx
// Camera configuration component with mobile-optimized settings and responsive positioning

import { PerspectiveCamera } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import type { PerspectiveCamera as ThreePerspectiveCamera } from 'three';

interface CameraProps {
  position?: [number, number, number];
  fov?: number;
}

export function Camera({ position = [0, 0, 5], fov = 55 }: CameraProps) {
  const cameraRef = useRef<ThreePerspectiveCamera>(null);
  const { size } = useThree();

  useEffect(() => {
    if (!cameraRef.current) return;

    const aspect = size.width / size.height;
    const camera = cameraRef.current;

    if (aspect < 1) {
      camera.fov = fov * 1.2;
    } else if (aspect < 1.5) {
      camera.fov = fov * 1.1;
    } else {
      camera.fov = fov;
    }

    camera.updateProjectionMatrix();
  }, [size, fov]);

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={position}
      fov={fov}
      near={0.1}
      far={1000}
    />
  );
}
