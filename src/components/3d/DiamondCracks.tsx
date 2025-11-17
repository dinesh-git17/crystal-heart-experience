// src/components/3d/DiamondCracks.tsx
// Physically accurate crack rendering with proper color, thickness, and branching

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useDiamondCrackLevel, useDiamondTapPositions } from '@/stores/diamondStore';

interface DiamondCracksProps {
  geometry: THREE.BufferGeometry;
  diamondMeshRef: React.RefObject<THREE.Mesh>;
}

export function DiamondCracks({ geometry, diamondMeshRef }: DiamondCracksProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const crackLevel = useDiamondCrackLevel();
  const tapPositions = useDiamondTapPositions();
  const [crackTexture, setCrackTexture] = useState<THREE.CanvasTexture | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastProcessedIndexRef = useRef(0);

  useEffect(() => {
    if (!canvasRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 2048;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 2048, 2048);
      }
      canvasRef.current = canvas;

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      setCrackTexture(texture);
    }
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !crackTexture || !diamondMeshRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const newTaps = tapPositions.slice(lastProcessedIndexRef.current);

    if (newTaps.length === 0) return;

    const raycaster = new THREE.Raycaster();
    const tempMesh = new THREE.Mesh(geometry);
    tempMesh.matrixWorld.copy(diamondMeshRef.current.matrixWorld);

    newTaps.forEach((tap) => {
      const direction = new THREE.Vector3(0, 0, 0).sub(tap.point).normalize();
      raycaster.set(tap.point, direction);

      const intersects = raycaster.intersectObject(tempMesh);

      let centerX: number;
      let centerY: number;

      const firstIntersect = intersects[0];
      if (firstIntersect && firstIntersect.uv) {
        centerX = firstIntersect.uv.x * 2048;
        centerY = (1 - firstIntersect.uv.y) * 2048;
      } else {
        const worldToLocal = new THREE.Matrix4();
        if (diamondMeshRef.current) {
          worldToLocal.copy(diamondMeshRef.current.matrixWorld).invert();
        }

        const localPoint = tap.point.clone().applyMatrix4(worldToLocal);
        const normalized = localPoint.normalize();

        const theta = Math.atan2(normalized.z, normalized.x);
        const u = (theta + Math.PI) / (2 * Math.PI);
        const v = (normalized.y + 1) / 2;

        centerX = u * 2048;
        centerY = v * 2048;
      }

      // Physics: Main cracks radiate from impact (8-12 primary fractures)
      const mainBranches = 8 + Math.floor(Math.random() * 4);

      for (let i = 0; i < mainBranches; i++) {
        const baseAngle = (Math.PI * 2 * i) / mainBranches;
        const angleVariation = (Math.random() - 0.5) * 0.4;
        const angle = baseAngle + angleVariation;

        // Draw main crack with gradient thickness
        drawPhysicalCrack(
          ctx,
          centerX,
          centerY,
          angle,
          300 + Math.random() * 250, // Length
          3.5 + Math.random() * 1.5, // Initial thickness
          0 // Depth level
        );
      }

      // Physics: Fine radial cracks from impact epicenter (stress concentration)
      const epicenterCracks = 16;
      for (let e = 0; e < epicenterCracks; e++) {
        const epicenterAngle = (Math.PI * 2 * e) / epicenterCracks;
        const epicenterLength = 60 + Math.random() * 70;

        // Thin, dark cracks at impact point
        ctx.strokeStyle = '#0d0000';
        ctx.lineWidth = 0.8 + Math.random() * 0.6;
        ctx.globalAlpha = 0.8;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
          centerX + Math.cos(epicenterAngle) * epicenterLength,
          centerY + Math.sin(epicenterAngle) * epicenterLength
        );
        ctx.stroke();
      }
    });

    function drawPhysicalCrack(
      ctx: CanvasRenderingContext2D,
      startX: number,
      startY: number,
      angle: number,
      length: number,
      startThickness: number,
      depth: number
    ) {
      const segments = 6 + Math.floor(Math.random() * 4);
      const maxDepth = 2;

      let currentX = startX;
      let currentY = startY;
      let currentAngle = angle;
      let currentThickness = startThickness;

      // Color gets lighter with depth (subsurface scattering effect)
      const depthColorMap: string[] = ['#0d0000', '#1a0000', '#2a0000'];
      const colorIndex = Math.min(depth, depthColorMap.length - 1);
      const baseColor = depthColorMap[colorIndex] || '#0d0000'; // Fallback

      for (let i = 0; i < segments; i++) {
        const segmentRatio = i / segments;

        const angleDeviation = (Math.random() - 0.5) * 0.26;
        currentAngle += angleDeviation;

        const segmentLength = (length / segments) * (0.7 + Math.random() * 0.6);

        const thickness = currentThickness * (1 - segmentRatio * 0.7);

        const nextX = currentX + Math.cos(currentAngle) * segmentLength;
        const nextY = currentY + Math.sin(currentAngle) * segmentLength;

        const wrappedNextX = ((nextX % 2048) + 2048) % 2048;
        const wrappedNextY = ((nextY % 2048) + 2048) % 2048;

        // Draw crack segment with gradient
        const gradient = ctx.createLinearGradient(currentX, currentY, wrappedNextX, wrappedNextY);
        gradient.addColorStop(0, baseColor);
        gradient.addColorStop(0.5, baseColor);
        gradient.addColorStop(1, baseColor + '99');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = thickness;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = 0.85 - depth * 0.15;

        ctx.shadowColor = baseColor;
        ctx.shadowBlur = thickness * 0.5;

        ctx.beginPath();
        ctx.moveTo(currentX, currentY);
        ctx.lineTo(wrappedNextX, wrappedNextY);
        ctx.stroke();

        ctx.shadowBlur = 0;

        const branchProbability = depth === 0 ? 0.35 : depth === 1 ? 0.15 : 0;

        if (i > 2 && Math.random() < branchProbability && depth < maxDepth) {
          const branchAngleOffset =
            (Math.random() > 0.5 ? 1 : -1) * (Math.PI / 6 + (Math.random() * Math.PI) / 12);
          const branchAngle = currentAngle + branchAngleOffset;
          const branchLength = length * (0.4 + Math.random() * 0.3);
          const branchThickness = thickness * 0.7;

          drawPhysicalCrack(
            ctx,
            wrappedNextX,
            wrappedNextY,
            branchAngle,
            branchLength,
            branchThickness,
            depth + 1
          );
        }

        currentX = wrappedNextX;
        currentY = wrappedNextY;
      }
    }

    crackTexture.needsUpdate = true;
    lastProcessedIndexRef.current = tapPositions.length;
  }, [tapPositions, crackTexture, diamondMeshRef, geometry]);

  useEffect(() => {
    if (crackLevel === 0 && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 2048, 2048);
        if (crackTexture) {
          crackTexture.needsUpdate = true;
        }
      }
      lastProcessedIndexRef.current = 0;
    }
  }, [crackLevel, crackTexture]);

  const opacity = useMemo(() => {
    if (crackLevel === 0) return 0;
    return Math.min(0.95, 0.15 + crackLevel * 0.12);
  }, [crackLevel]);

  useFrame(() => {
    if (!meshRef.current || !meshRef.current.parent) return;
    meshRef.current.rotation.copy(meshRef.current.parent.rotation);
  });

  if (crackLevel === 0 || !crackTexture) {
    return null;
  }

  return (
    <mesh ref={meshRef} geometry={geometry} scale={1.005}>
      <meshBasicMaterial
        map={crackTexture}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        depthWrite={false}
        depthTest={true}
        alphaTest={0.05}
        color="#3d0008"
      />
    </mesh>
  );
}
