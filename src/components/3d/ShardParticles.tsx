// src/components/3d/ShardParticles.tsx
// Optimized particle system for crystal shards with object pooling, lifecycle management, and phase-aware cleanup

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS } from '@/constants/colors';
import type { TapEvent, ParticleShardData } from '@/types/diamond';

interface ShardParticlesProps {
  tapEvent: TapEvent | null;
  count?: number;
  onComplete?: () => void;
}

const MAX_PARTICLES = 100;
const PARTICLE_SIZE = 0.025;
const PARTICLE_LIFESPAN = 2000;
const INITIAL_VELOCITY = 0.8;
const GRAVITY = 0.5;
const SPREAD_RANDOMNESS = 0.3;

export function ShardParticles({ tapEvent, count = 20, onComplete }: ShardParticlesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particlesRef = useRef<ParticleShardData[]>([]);
  const matrixRef = useRef(new THREE.Matrix4());
  const colorRef = useRef(new THREE.Color(COLORS.primary.main));
  const lastTapEventRef = useRef<number | null>(null);

  const geometry = useMemo(() => {
    return new THREE.TetrahedronGeometry(PARTICLE_SIZE, 0);
  }, []);

  const material = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: COLORS.primary.main,
      transparent: true,
      opacity: 0.8,
    });
  }, []);

  useEffect(() => {
    if (!tapEvent || !meshRef.current) return;

    // Prevent duplicate particle generation for the same tap event
    if (lastTapEventRef.current === tapEvent.timestamp) {
      return;
    }
    lastTapEventRef.current = tapEvent.timestamp;

    const activeCount = particlesRef.current.filter((p) => p.active).length;
    if (activeCount + count > MAX_PARTICLES) {
      return;
    }

    const emitPoint = tapEvent.point;
    const normal = tapEvent.normal;

    for (let i = 0; i < count; i++) {
      const existingIndex = particlesRef.current.findIndex((p) => !p.active);

      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const spread = INITIAL_VELOCITY * (0.7 + Math.random() * 0.6);

      const tangent = new THREE.Vector3(-normal.y, normal.x, 0).normalize();
      const bitangent = new THREE.Vector3().crossVectors(normal, tangent);

      const velocityDir = new THREE.Vector3()
        .addScaledVector(tangent, Math.cos(angle))
        .addScaledVector(bitangent, Math.sin(angle))
        .addScaledVector(normal, 0.3)
        .normalize();

      velocityDir.x += (Math.random() - 0.5) * SPREAD_RANDOMNESS;
      velocityDir.y += (Math.random() - 0.5) * SPREAD_RANDOMNESS;
      velocityDir.z += (Math.random() - 0.5) * SPREAD_RANDOMNESS;
      velocityDir.normalize();

      const velocity = velocityDir.multiplyScalar(spread);

      const particle: ParticleShardData = {
        position: emitPoint.clone(),
        velocity,
        rotation: new THREE.Euler(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        ),
        rotationVelocity: new THREE.Vector3(
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 5
        ),
        size: PARTICLE_SIZE * (0.8 + Math.random() * 0.4),
        opacity: 0.8,
        lifeProgress: 0,
        maxLife: PARTICLE_LIFESPAN,
        active: true,
      };

      if (existingIndex !== -1) {
        particlesRef.current[existingIndex] = particle;
      } else {
        particlesRef.current.push(particle);
      }
    }
  }, [tapEvent, count]);

  // Clean up all particles when component unmounts or tapEvent becomes null permanently
  useEffect(() => {
    return () => {
      // Clear all particles on unmount
      particlesRef.current.forEach((particle) => {
        particle.active = false;
      });

      if (meshRef.current) {
        for (let i = 0; i < particlesRef.current.length; i++) {
          meshRef.current.setColorAt(i, new THREE.Color(0, 0, 0));
          const emptyMatrix = new THREE.Matrix4().makeScale(0, 0, 0);
          meshRef.current.setMatrixAt(i, emptyMatrix);
        }
        if (meshRef.current.instanceColor) {
          meshRef.current.instanceColor.needsUpdate = true;
        }
        if (meshRef.current.instanceMatrix) {
          meshRef.current.instanceMatrix.needsUpdate = true;
        }
      }
    };
  }, []);

  useFrame((_state, delta) => {
    if (!meshRef.current) return;

    const deltaSeconds = delta;
    let activeParticles = 0;

    particlesRef.current.forEach((particle, index) => {
      if (!particle.active) return;

      particle.lifeProgress += delta * 1000;

      if (particle.lifeProgress >= particle.maxLife) {
        particle.active = false;
        meshRef.current!.setColorAt(index, new THREE.Color(0, 0, 0));
        if (meshRef.current!.instanceColor) {
          meshRef.current!.instanceColor.needsUpdate = true;
        }
        return;
      }

      activeParticles++;

      particle.velocity.y -= GRAVITY * deltaSeconds;

      particle.position.add(particle.velocity.clone().multiplyScalar(deltaSeconds));

      particle.rotation.x += particle.rotationVelocity.x * deltaSeconds;
      particle.rotation.y += particle.rotationVelocity.y * deltaSeconds;
      particle.rotation.z += particle.rotationVelocity.z * deltaSeconds;

      const lifeRatio = particle.lifeProgress / particle.maxLife;
      particle.opacity = 0.8 * (1 - lifeRatio);

      const scale = particle.size * (1 - lifeRatio * 0.3);
      matrixRef.current.compose(
        particle.position,
        new THREE.Quaternion().setFromEuler(particle.rotation),
        new THREE.Vector3(scale, scale, scale)
      );

      meshRef.current!.setMatrixAt(index, matrixRef.current);

      colorRef.current.setStyle(COLORS.primary.main);
      colorRef.current.multiplyScalar(particle.opacity);
      meshRef.current!.setColorAt(index, colorRef.current);
    });

    if (meshRef.current.instanceMatrix) {
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }

    if (activeParticles === 0 && particlesRef.current.length > 0 && onComplete) {
      onComplete();
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, MAX_PARTICLES]} frustumCulled={false}>
      <instancedBufferAttribute
        attach="instanceColor"
        args={[new Float32Array(MAX_PARTICLES * 3), 3]}
      />
    </instancedMesh>
  );
}
