// src/components/3d/Letter.tsx
// Elegant letter with handwritten text lines and paper texture

import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { DEFAULT_LETTER_GEOMETRY, DEFAULT_LETTER_ANIMATION } from '@/types/letter';

interface LetterProps {
  position?: [number, number, number];
  scale?: number;
  floatSpeed?: number;
  floatAmplitude?: number;
}

export function Letter({
  position = [0, 0, 0.8],
  scale = 0.75,
  floatSpeed = DEFAULT_LETTER_ANIMATION.floatSpeed,
  floatAmplitude = DEFAULT_LETTER_ANIMATION.floatAmplitude,
}: LetterProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const floatPhaseRef = useRef(0);

  const paperTexture = useLoader(THREE.TextureLoader, '/textures/paper.jpg');

  const textOverlay = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.fillStyle = 'transparent';
      ctx.fillRect(0, 0, 512, 512);

      ctx.strokeStyle = 'rgba(80, 60, 40, 0.25)';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';

      const lines = [
        { y: 120, width: 0.7 },
        { y: 160, width: 0.75 },
        { y: 200, width: 0.65 },
        { y: 240, width: 0.7 },
        { y: 280, width: 0.6 },
        { y: 320, width: 0.55 },
        { y: 360, width: 0.7 },
      ];

      lines.forEach((line) => {
        const startX = 60;
        const endX = 60 + 390 * line.width;
        const wobble = Math.sin(line.y * 0.1) * 2;

        ctx.beginPath();
        ctx.moveTo(startX, line.y);

        for (let x = startX; x < endX; x += 5) {
          const y = line.y + Math.sin(x * 0.05) * 1.5 + wobble;
          ctx.lineTo(x, y);
        }

        ctx.stroke();
      });

      ctx.font = 'italic 80px serif';
      ctx.fillStyle = 'rgba(139, 69, 19, 0.2)';
      ctx.textAlign = 'center';
      ctx.fillText('♥', 256, 440);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) {
      return;
    }

    const deltaTime = state.clock.getDelta();
    floatPhaseRef.current += deltaTime * floatSpeed;

    const floatOffset = Math.sin(floatPhaseRef.current * Math.PI * 2) * floatAmplitude;
    meshRef.current.position.y = position[1] + floatOffset;
  });

  return (
    <group>
      <mesh ref={meshRef} position={position} scale={scale} renderOrder={999}>
        <boxGeometry
          args={[
            DEFAULT_LETTER_GEOMETRY.paperSize[0],
            DEFAULT_LETTER_GEOMETRY.paperSize[1],
            DEFAULT_LETTER_GEOMETRY.thickness,
          ]}
        />
        <meshStandardMaterial
          map={paperTexture}
          alphaMap={textOverlay}
          emissive="#fff8f0"
          emissiveIntensity={0.3}
          roughness={0.85}
          metalness={0}
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      <mesh position={position} scale={scale} renderOrder={1000}>
        <planeGeometry args={[0.25, 0.35]} />
        <meshBasicMaterial
          map={textOverlay}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>

      <pointLight
        position={[position[0], position[1], position[2] + 0.2]}
        intensity={0.5}
        distance={1.2}
        color="#fff8f0"
        decay={2}
      />
    </group>
  );
}
