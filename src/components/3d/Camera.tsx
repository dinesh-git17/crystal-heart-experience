// src/components/3d/Camera.tsx
// Camera with smooth intro animation and subtle natural drift motion

import { PerspectiveCamera } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface CameraProps {
  position?: [number, number, number];
  fov?: number;
  introAnimation?: boolean;
  introDuration?: number;
  enableDrift?: boolean;
  driftIntensity?: number;
}

export function Camera({
  position = [0, 0, 5],
  fov = 55,
  introAnimation = true,
  introDuration = 0.9,
  enableDrift = true,
  driftIntensity = 0.08,
}: CameraProps) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const { size } = useThree();
  const [introComplete, setIntroComplete] = useState(false);
  const startTime = useRef<number | null>(null);

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

  useFrame((state) => {
    if (!cameraRef.current) return;

    if (introAnimation && !introComplete) {
      if (startTime.current === null) {
        startTime.current = state.clock.elapsedTime;
      }

      const elapsed = state.clock.elapsedTime - startTime.current;
      const progress = Math.min(elapsed / introDuration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      const startZ = position[2] + 2;
      const targetZ = position[2];
      cameraRef.current.position.z = startZ + (targetZ - startZ) * eased;

      if (progress >= 1) {
        setIntroComplete(true);
      }
    } else if (enableDrift && introComplete) {
      const time = state.clock.elapsedTime;
      const driftX = Math.sin(time * 0.3) * driftIntensity;
      const driftY = Math.cos(time * 0.2) * driftIntensity * 0.5;

      cameraRef.current.position.x = position[0] + driftX;
      cameraRef.current.position.y = position[1] + driftY;
    }
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[position[0], position[1], position[2] + (introAnimation ? 2 : 0)]}
      fov={fov}
      near={0.1}
      far={1000}
    />
  );
}
