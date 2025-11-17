// src/components/3d/Cube.tsx
// Enhanced placeholder cube with subtle floating animation and polished material properties

import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import { COLORS } from '@/constants/colors';

interface CubeProps {
  position?: [number, number, number];
  size?: number;
  floatAmplitude?: number;
  floatSpeed?: number;
}

export function Cube({
  position = [0, 0, 0],
  size = 1,
  floatAmplitude = 0.15,
  floatSpeed = 0.8,
}: CubeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const baseY = position[1];

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;
    const floatOffset = Math.sin(time * floatSpeed) * floatAmplitude;

    meshRef.current.position.y = baseY + floatOffset;

    meshRef.current.rotation.y += 0.003;
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        position={position}
        castShadow
        receiveShadow
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial
          color={COLORS.primary.main}
          metalness={0.9}
          roughness={0.1}
          envMapIntensity={1.2}
          emissive={COLORS.primary.dark}
          emissiveIntensity={hovered ? 0.15 : 0.05}
        />
      </mesh>

      <mesh
        position={[position[0], position[1] - size * 0.55, position[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[3, 3]} />
        <shadowMaterial opacity={0.3} />
      </mesh>
    </group>
  );
}
