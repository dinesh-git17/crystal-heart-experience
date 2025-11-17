// src/components/3d/DiamondFragments.tsx
// Large diamond fragment system for shatter animation with radial burst physics and cleanup

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS } from '@/constants/colors';
import { DEFAULT_SHATTER_CONFIG } from '@/types/heart';
import type { FragmentData } from '@/types/heart';

interface DiamondFragmentsProps {
  triggerShatter: boolean;
  diamondPosition?: [number, number, number];
  onComplete?: () => void;
}

const FRAGMENT_GEOMETRY_DETAIL = 0;

export function DiamondFragments({
  triggerShatter,
  diamondPosition = [0, 0, 0],
  onComplete,
}: DiamondFragmentsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const fragmentsRef = useRef<FragmentData[]>([]);
  const matrixRef = useRef(new THREE.Matrix4());
  const colorRef = useRef(new THREE.Color(COLORS.primary.main));
  const hasShatteredRef = useRef(false);
  const startTimeRef = useRef<number | null>(null);

  const geometry = useMemo(() => {
    return new THREE.OctahedronGeometry(0.15, FRAGMENT_GEOMETRY_DETAIL);
  }, []);

  const material = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(COLORS.primary.main),
      transmission: 0.8,
      roughness: 0.15,
      metalness: 0.2,
      ior: 2.417,
      thickness: 0.3,
      emissive: new THREE.Color(COLORS.primary.dark),
      emissiveIntensity: 0.2,
      transparent: true,
      opacity: 1.0,
      side: THREE.DoubleSide,
    });
  }, []);

  useEffect(() => {
    if (!triggerShatter || hasShatteredRef.current || !meshRef.current) {
      return;
    }

    hasShatteredRef.current = true;
    startTimeRef.current = null;
    fragmentsRef.current = [];

    const centerPos = new THREE.Vector3(...diamondPosition);
    const fragmentCount = DEFAULT_SHATTER_CONFIG.fragmentCount;

    for (let i = 0; i < fragmentCount; i++) {
      const phi = Math.acos(2 * (i / fragmentCount) - 1);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      const baseDirection = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta)
      ).normalize();

      const spreadAngle = (Math.random() - 0.5) * 0.4;
      const spreadAxis = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
      ).normalize();

      const spreadQuaternion = new THREE.Quaternion().setFromAxisAngle(spreadAxis, spreadAngle);
      const finalDirection = baseDirection.clone().applyQuaternion(spreadQuaternion);

      const speed =
        DEFAULT_SHATTER_CONFIG.initialVelocity *
        (1 + (Math.random() - 0.5) * DEFAULT_SHATTER_CONFIG.velocityVariation);

      const velocity = finalDirection.multiplyScalar(speed);

      const sizeVariation =
        DEFAULT_SHATTER_CONFIG.minFragmentSize +
        Math.random() *
          (DEFAULT_SHATTER_CONFIG.maxFragmentSize - DEFAULT_SHATTER_CONFIG.minFragmentSize);

      const fragment: FragmentData = {
        id: `fragment-${i}`,
        position: centerPos.clone(),
        velocity: velocity,
        rotation: new THREE.Euler(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        ),
        rotationVelocity: new THREE.Vector3(
          (Math.random() - 0.5) * DEFAULT_SHATTER_CONFIG.rotationSpeed,
          (Math.random() - 0.5) * DEFAULT_SHATTER_CONFIG.rotationSpeed,
          (Math.random() - 0.5) * DEFAULT_SHATTER_CONFIG.rotationSpeed
        ),
        scale: sizeVariation,
        opacity: 1.0,
        lifeProgress: 0,
        maxLife: DEFAULT_SHATTER_CONFIG.duration,
        active: true,
      };

      fragmentsRef.current.push(fragment);
    }
  }, [triggerShatter, diamondPosition]);

  useFrame((state, delta) => {
    if (!meshRef.current || fragmentsRef.current.length === 0 || !hasShatteredRef.current) {
      return;
    }

    if (startTimeRef.current === null) {
      startTimeRef.current = state.clock.elapsedTime;
    }

    const elapsed = state.clock.elapsedTime - startTimeRef.current;
    let activeCount = 0;

    fragmentsRef.current.forEach((fragment, index) => {
      if (!fragment.active) {
        meshRef.current!.setMatrixAt(index, new THREE.Matrix4().makeScale(0, 0, 0));
        return;
      }

      fragment.lifeProgress = Math.min(elapsed / fragment.maxLife, 1);

      if (fragment.lifeProgress >= 1) {
        fragment.active = false;
        meshRef.current!.setMatrixAt(index, new THREE.Matrix4().makeScale(0, 0, 0));
        return;
      }

      activeCount++;

      fragment.velocity.y -= DEFAULT_SHATTER_CONFIG.gravity * delta;
      fragment.position.add(fragment.velocity.clone().multiplyScalar(delta));

      fragment.rotation.x += fragment.rotationVelocity.x * delta;
      fragment.rotation.y += fragment.rotationVelocity.y * delta;
      fragment.rotation.z += fragment.rotationVelocity.z * delta;

      const opacityProgress = fragment.lifeProgress;
      const opacity = 1 - Math.pow(opacityProgress, 2);
      fragment.opacity = opacity;

      const scale = fragment.scale * (1 - opacityProgress * 0.2);

      matrixRef.current.compose(
        fragment.position,
        new THREE.Quaternion().setFromEuler(fragment.rotation),
        new THREE.Vector3(scale, scale, scale)
      );

      meshRef.current!.setMatrixAt(index, matrixRef.current);

      colorRef.current.setStyle(COLORS.primary.main);
      colorRef.current.multiplyScalar(opacity);
      meshRef.current!.setColorAt(index, colorRef.current);
    });

    if (meshRef.current.instanceMatrix) {
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }

    if (activeCount === 0 && fragmentsRef.current.length > 0) {
      if (onComplete) {
        onComplete();
      }
      fragmentsRef.current = [];
      hasShatteredRef.current = false;
      startTimeRef.current = null;
    }
  });

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  if (!triggerShatter) {
    return null;
  }

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, DEFAULT_SHATTER_CONFIG.fragmentCount]}
      frustumCulled={false}
    >
      <instancedBufferAttribute
        attach="instanceColor"
        args={[new Float32Array(DEFAULT_SHATTER_CONFIG.fragmentCount * 3), 3]}
      />
    </instancedMesh>
  );
}
