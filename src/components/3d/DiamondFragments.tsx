// src/components/3d/DiamondFragments.tsx
// Enhanced diamond fragments with staggered timing, motion trails, and coordinated glow burst

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DEFAULT_SHATTER_CONFIG } from '@/types/heart';
import type { FragmentData } from '@/types/heart';
import { easeOutExpo, easeInQuad } from '@/utils/easingFunctions';
import { COLORS } from '@/constants/colors';

interface DiamondFragmentsProps {
  triggerShatter: boolean;
  diamondPosition?: [number, number, number];
  onComplete?: () => void;
}

export function DiamondFragments({
  triggerShatter,
  diamondPosition = [0, 0, 0],
  onComplete,
}: DiamondFragmentsProps) {
  const fragmentsRef = useRef<THREE.Group>(null);
  const [fragments, setFragments] = useState<FragmentData[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const hasTriggeredRef = useRef(false);
  const glowBurstRef = useRef<THREE.PointLight | null>(null);

  const fragmentGeometries = useMemo(() => {
    return Array.from({ length: DEFAULT_SHATTER_CONFIG.fragmentCount }, () => {
      const size =
        DEFAULT_SHATTER_CONFIG.minFragmentSize +
        Math.random() *
          (DEFAULT_SHATTER_CONFIG.maxFragmentSize - DEFAULT_SHATTER_CONFIG.minFragmentSize);

      const geometry = new THREE.OctahedronGeometry(size, 0);

      const scaleVariation = 0.5 + Math.random() * 0.5;
      geometry.scale(scaleVariation, 1 + Math.random() * 0.3, scaleVariation);

      return geometry;
    });
  }, []);

  const fragmentMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(COLORS.primary.main),
      transmission: 0.8,
      roughness: 0.15,
      metalness: 0.2,
      ior: 2.4,
      thickness: 0.4,
      envMapIntensity: 1.2,
      emissive: new THREE.Color(COLORS.primary.light),
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
  }, []);

  useEffect(() => {
    if (triggerShatter && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;

      const newFragments: FragmentData[] = Array.from(
        { length: DEFAULT_SHATTER_CONFIG.fragmentCount },
        (_, i) => {
          const theta = (i / DEFAULT_SHATTER_CONFIG.fragmentCount) * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const randomRadius = 0.3 + Math.random() * 0.4;

          const x = randomRadius * Math.sin(phi) * Math.cos(theta);
          const y = randomRadius * Math.sin(phi) * Math.sin(theta);
          const z = randomRadius * Math.cos(phi);

          const velocityMagnitude =
            DEFAULT_SHATTER_CONFIG.initialVelocity *
            (1 + (Math.random() - 0.5) * DEFAULT_SHATTER_CONFIG.velocityVariation);

          const staggerDelay = i * DEFAULT_SHATTER_CONFIG.staggerDelay;
          const maxLife = DEFAULT_SHATTER_CONFIG.duration + staggerDelay;

          return {
            id: `fragment-${i}`,
            position: new THREE.Vector3(
              diamondPosition[0] + x * 0.2,
              diamondPosition[1] + y * 0.2,
              diamondPosition[2] + z * 0.2
            ),
            velocity: new THREE.Vector3(x, y, z).normalize().multiplyScalar(velocityMagnitude),
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
            scale: 1.0,
            opacity: 0.8,
            lifeProgress: -staggerDelay / maxLife,
            maxLife: maxLife,
            active: true,
          };
        }
      );

      setFragments(newFragments);
      startTimeRef.current = null;

      if (import.meta.env.DEV) {
        console.log('Diamond fragments created with stagger delays');
      }
    }
  }, [triggerShatter, diamondPosition]);

  useFrame((state, delta) => {
    if (!hasTriggeredRef.current || fragments.length === 0) {
      return;
    }

    if (startTimeRef.current === null) {
      startTimeRef.current = state.clock.elapsedTime;
    }

    const elapsed = state.clock.elapsedTime - startTimeRef.current;

    let allComplete = true;

    const updatedFragments = fragments.map((fragment) => {
      if (!fragment.active) {
        return fragment;
      }

      const newLifeProgress = elapsed / fragment.maxLife;

      if (newLifeProgress < 0) {
        allComplete = false;
        return { ...fragment, lifeProgress: newLifeProgress };
      }

      if (newLifeProgress >= 1) {
        return { ...fragment, active: false, opacity: 0 };
      }

      allComplete = false;

      const adjustedProgress = newLifeProgress;
      const fadeProgress = Math.max(0, (adjustedProgress - 0.6) / 0.4);

      const newPosition = fragment.position.clone();
      newPosition.add(fragment.velocity.clone().multiplyScalar(delta));
      newPosition.y -= DEFAULT_SHATTER_CONFIG.gravity * delta;

      const newRotation = new THREE.Euler(
        fragment.rotation.x + fragment.rotationVelocity.x * delta,
        fragment.rotation.y + fragment.rotationVelocity.y * delta,
        fragment.rotation.z + fragment.rotationVelocity.z * delta
      );

      const newOpacity = (1 - easeOutExpo(fadeProgress)) * 0.8;

      const scaleProgress = Math.min(adjustedProgress / 0.3, 1);
      const newScale = 1.0 - easeInQuad(scaleProgress) * 0.2;

      return {
        ...fragment,
        position: newPosition,
        rotation: newRotation,
        opacity: newOpacity,
        scale: newScale,
        lifeProgress: newLifeProgress,
      };
    });

    setFragments(updatedFragments);

    if (DEFAULT_SHATTER_CONFIG.glowBurstEnabled && glowBurstRef.current) {
      const burstProgress = Math.min(elapsed / 0.4, 1);
      const burstIntensity = (1 - easeOutExpo(burstProgress)) * 3.0;
      glowBurstRef.current.intensity = burstIntensity;
    }

    if (allComplete && onComplete) {
      onComplete();
      hasTriggeredRef.current = false;

      if (import.meta.env.DEV) {
        console.log('All fragments complete');
      }
    }
  });

  useEffect(() => {
    return () => {
      fragmentGeometries.forEach((geo) => geo.dispose());
      fragmentMaterial.dispose();
    };
  }, [fragmentGeometries, fragmentMaterial]);

  if (!triggerShatter || fragments.length === 0) {
    return null;
  }

  return (
    <group ref={fragmentsRef}>
      {DEFAULT_SHATTER_CONFIG.glowBurstEnabled && (
        <pointLight
          ref={glowBurstRef}
          position={diamondPosition}
          color={new THREE.Color('#ff69b4')}
          intensity={0}
          distance={8}
          decay={2}
        />
      )}

      {fragments.map((fragment, index) => {
        if (!fragment.active || fragment.lifeProgress < 0) {
          return null;
        }

        return (
          <group
            key={fragment.id}
            position={fragment.position.toArray()}
            rotation={fragment.rotation}
            scale={fragment.scale}
          >
            <mesh
              geometry={fragmentGeometries[index]}
              material={fragmentMaterial}
              material-opacity={fragment.opacity}
            />

            {DEFAULT_SHATTER_CONFIG.trailIntensity > 0 && fragment.lifeProgress < 0.5 && (
              <FragmentTrail
                velocity={fragment.velocity}
                opacity={fragment.opacity * DEFAULT_SHATTER_CONFIG.trailIntensity}
              />
            )}
          </group>
        );
      })}
    </group>
  );
}

interface FragmentTrailProps {
  velocity: THREE.Vector3;
  opacity: number;
}

function FragmentTrail({ velocity, opacity }: FragmentTrailProps) {
  const trailRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (trailRef.current) {
      const direction = velocity.clone().normalize();
      const length = velocity.length() * 0.3;

      trailRef.current.scale.set(0.02, length, 0.02);

      const angle = Math.atan2(direction.x, direction.z);
      const elevation = Math.asin(direction.y);

      trailRef.current.rotation.set(elevation, angle, 0);
    }
  });

  return (
    <mesh ref={trailRef} position={[0, 0, 0]}>
      <cylinderGeometry args={[0.01, 0.03, 1, 8]} />
      <meshBasicMaterial
        color={new THREE.Color(COLORS.primary.light)}
        transparent
        opacity={opacity * 0.5}
        depthWrite={false}
      />
    </mesh>
  );
}
