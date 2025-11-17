// src/components/3d/Camera.tsx
// Camera with smooth intro animation, natural drift motion, and cinematic mode coordination

import { PerspectiveCamera } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { easeOutCubic, easeInOutCubic } from '@/utils/easingFunctions';

export enum CameraMode {
  INTRO = 'INTRO',
  DRIFT = 'DRIFT',
  CINEMATIC = 'CINEMATIC',
  LOCKED = 'LOCKED',
}

interface CameraProps {
  position?: [number, number, number];
  fov?: number;
  introAnimation?: boolean;
  introDuration?: number;
  enableDrift?: boolean;
  driftIntensity?: number;
}

export interface CameraHandle {
  setMode: (mode: CameraMode) => void;
  updateBasePosition: (position: THREE.Vector3) => void;
  getMode: () => CameraMode;
}

export const Camera = forwardRef<CameraHandle, CameraProps>(
  (
    {
      position = [0, 0, 5],
      fov = 55,
      introAnimation = true,
      introDuration = 0.9,
      enableDrift = true,
      driftIntensity = 0.08,
    },
    ref
  ) => {
    const cameraRef = useRef<THREE.PerspectiveCamera>(null);
    const { size } = useThree();
    const [mode, setMode] = useState<CameraMode>(
      introAnimation ? CameraMode.INTRO : CameraMode.DRIFT
    );
    const startTime = useRef<number | null>(null);
    const basePositionRef = useRef<THREE.Vector3>(new THREE.Vector3(...position));
    const driftTransitionRef = useRef(0);

    useImperativeHandle(ref, () => ({
      setMode: (newMode: CameraMode) => {
        setMode(newMode);
        if (newMode === CameraMode.DRIFT) {
          driftTransitionRef.current = 0;
        }
      },
      updateBasePosition: (newPosition: THREE.Vector3) => {
        basePositionRef.current.copy(newPosition);
      },
      getMode: () => mode,
    }));

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

      const time = state.clock.elapsedTime;

      if (mode === CameraMode.INTRO) {
        if (startTime.current === null) {
          startTime.current = time;
        }

        const elapsed = time - startTime.current;
        const progress = Math.min(elapsed / introDuration, 1);
        const eased = easeOutCubic(progress);

        const startZ = position[2] + 2;
        const targetZ = position[2];
        cameraRef.current.position.z = startZ + (targetZ - startZ) * eased;

        if (progress >= 1) {
          setMode(CameraMode.DRIFT);
          startTime.current = null;
          driftTransitionRef.current = 0;
          basePositionRef.current.copy(cameraRef.current.position);
        }
      } else if (mode === CameraMode.DRIFT && enableDrift) {
        if (driftTransitionRef.current < 1) {
          driftTransitionRef.current = Math.min(driftTransitionRef.current + 0.016, 1);
        }

        const transitionEase = easeInOutCubic(driftTransitionRef.current);
        const driftX = Math.sin(time * 0.3) * driftIntensity * transitionEase;
        const driftY = Math.cos(time * 0.2) * driftIntensity * 0.5 * transitionEase;

        cameraRef.current.position.x = basePositionRef.current.x + driftX;
        cameraRef.current.position.y = basePositionRef.current.y + driftY;
        cameraRef.current.position.z = basePositionRef.current.z;
      } else if (mode === CameraMode.LOCKED) {
        cameraRef.current.position.copy(basePositionRef.current);
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
);

Camera.displayName = 'Camera';
