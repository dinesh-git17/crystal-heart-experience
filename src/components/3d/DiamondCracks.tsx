// src/components/3d/DiamondCracks.tsx
// Physically accurate crack rendering with depth shading, glow, refraction, and propagation animation

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useDiamondCrackLevel, useDiamondTapPositions } from '@/stores/diamondStore';
import { CRACK_VISUAL_CONFIG, EMOTIONAL_POLISH } from '@/constants/diamondConfig';
import type { CrackVisualState } from '@/types/diamond';

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

  const [visualState] = useState<CrackVisualState>({
    glowIntensity: 0,
    propagationProgress: 0,
    flashActive: false,
    lastCrackTimestamp: 0,
  });

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

    newTaps.forEach((tap) => {
      const positionAttribute = geometry.getAttribute('position');
      if (!positionAttribute || !(positionAttribute instanceof THREE.BufferAttribute)) return;

      const uvAttribute = geometry.getAttribute('uv');
      if (!uvAttribute || !(uvAttribute instanceof THREE.BufferAttribute)) return;

      let closestDistance = Infinity;
      let closestUV = new THREE.Vector2(0.5, 0.5);

      const vertex = new THREE.Vector3();
      const uv = new THREE.Vector2();

      for (let i = 0; i < positionAttribute.count; i++) {
        vertex.fromBufferAttribute(positionAttribute, i);

        if (diamondMeshRef.current) {
          vertex.applyMatrix4(diamondMeshRef.current.matrixWorld);
        }

        const distance = vertex.distanceTo(tap.point);

        if (distance < closestDistance) {
          closestDistance = distance;
          uv.fromBufferAttribute(uvAttribute, i);
          closestUV.copy(uv);
        }
      }

      const centerX = closestUV.x * 2048;
      const centerY = (1 - closestUV.y) * 2048;

      visualState.lastCrackTimestamp = Date.now();
      visualState.flashActive = true;

      if (CRACK_VISUAL_CONFIG.propagation.enabled) {
        const flashColor = CRACK_VISUAL_CONFIG.propagation.flashColor;
        ctx.globalCompositeOperation = 'lighter';
        const flashGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 80);
        flashGradient.addColorStop(0, flashColor);
        flashGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = flashGradient;
        ctx.fillRect(centerX - 80, centerY - 80, 160, 160);
        ctx.globalCompositeOperation = 'source-over';
      }

      const numCracks = 5 + Math.floor(Math.random() * 3);
      for (let i = 0; i < numCracks; i++) {
        const angle = (Math.PI * 2 * i) / numCracks + (Math.random() - 0.5) * 0.4;

        drawPhysicalCrackWithDepth(
          ctx,
          centerX,
          centerY,
          angle,
          300 + Math.random() * 250,
          CRACK_VISUAL_CONFIG.thickness.base +
            Math.random() * CRACK_VISUAL_CONFIG.thickness.variation,
          0,
          0.2
        );
      }

      const epicenterCracks = 16;
      for (let e = 0; e < epicenterCracks; e++) {
        const epicenterAngle = (Math.PI * 2 * e) / epicenterCracks;
        const epicenterLength = 60 + Math.random() * 70;

        ctx.strokeStyle = CRACK_VISUAL_CONFIG.depthShading.deepColor;
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

        if (CRACK_VISUAL_CONFIG.refraction.enabled) {
          ctx.strokeStyle = CRACK_VISUAL_CONFIG.refraction.highlightColor;
          ctx.lineWidth = 0.4;
          ctx.globalAlpha = CRACK_VISUAL_CONFIG.refraction.highlightOpacity;
          ctx.stroke();
        }
      }

      if (CRACK_VISUAL_CONFIG.glowIntensity > 0 && EMOTIONAL_POLISH.pinkRadiance.enabled) {
        const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 200);
        glowGradient.addColorStop(
          0,
          CRACK_VISUAL_CONFIG.glowColor +
            Math.floor(CRACK_VISUAL_CONFIG.glowIntensity * 255)
              .toString(16)
              .padStart(2, '0')
        );
        glowGradient.addColorStop(0.5, CRACK_VISUAL_CONFIG.glowColor + '20');
        glowGradient.addColorStop(1, 'transparent');

        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = glowGradient;
        ctx.fillRect(centerX - 200, centerY - 200, 400, 400);
        ctx.globalCompositeOperation = 'source-over';
      }
    });

    function drawPhysicalCrackWithDepth(
      ctx: CanvasRenderingContext2D,
      startX: number,
      startY: number,
      angle: number,
      length: number,
      startThickness: number,
      depth: number,
      normalizedDepth: number
    ) {
      const segments = 6 + Math.floor(Math.random() * 4);
      const maxDepth = CRACK_VISUAL_CONFIG.branching.maxDepth;

      let currentX = startX;
      let currentY = startY;
      let currentAngle = angle;
      let currentThickness = startThickness;

      const depthFactor = CRACK_VISUAL_CONFIG.depthShading.enabled ? normalizedDepth : 0.5;

      const baseColor = CRACK_VISUAL_CONFIG.depthShading.surfaceColor;
      const deepColor = CRACK_VISUAL_CONFIG.depthShading.deepColor;

      const r1 = parseInt(baseColor.slice(1, 3), 16);
      const g1 = parseInt(baseColor.slice(3, 5), 16);
      const b1 = parseInt(baseColor.slice(5, 7), 16);
      const r2 = parseInt(deepColor.slice(1, 3), 16);
      const g2 = parseInt(deepColor.slice(3, 5), 16);
      const b2 = parseInt(deepColor.slice(5, 7), 16);

      const r = Math.floor(r1 + (r2 - r1) * depthFactor);
      const g = Math.floor(g1 + (g2 - g1) * depthFactor);
      const b = Math.floor(b1 + (b2 - b1) * depthFactor);

      for (let i = 0; i < segments; i++) {
        const progress = i / segments;

        const taperingFactor = CRACK_VISUAL_CONFIG.thickness.taperingFactor;
        const taperedThickness = startThickness * (1 - progress * taperingFactor);
        currentThickness = Math.max(0.5, taperedThickness);

        ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.lineWidth = currentThickness;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = 0.85 - depthFactor * 0.15;

        const segmentLength = length / segments;
        const angleDeviation = (Math.random() - 0.5) * 0.15;
        currentAngle += angleDeviation;

        const microJaggedX = (Math.random() - 0.5) * 2;
        const microJaggedY = (Math.random() - 0.5) * 2;

        const nextX = currentX + Math.cos(currentAngle) * segmentLength + microJaggedX;
        const nextY = currentY + Math.sin(currentAngle) * segmentLength + microJaggedY;

        const wrappedNextX = ((nextX % 2048) + 2048) % 2048;
        const wrappedNextY = ((nextY % 2048) + 2048) % 2048;

        ctx.beginPath();
        ctx.moveTo(currentX, currentY);
        ctx.lineTo(wrappedNextX, wrappedNextY);
        ctx.stroke();

        if (CRACK_VISUAL_CONFIG.refraction.enabled && i % 2 === 0) {
          ctx.strokeStyle = CRACK_VISUAL_CONFIG.refraction.highlightColor;
          ctx.lineWidth = currentThickness * 0.3;
          ctx.globalAlpha = CRACK_VISUAL_CONFIG.refraction.highlightOpacity;
          ctx.stroke();
        }

        const branchProbability =
          depth === 0 ? CRACK_VISUAL_CONFIG.branching.probability : depth === 1 ? 0.15 : 0;

        if (i > 2 && Math.random() < branchProbability && depth < maxDepth) {
          const branchAngleOffset =
            (Math.random() > 0.5 ? 1 : -1) * (Math.PI / 6 + (Math.random() * Math.PI) / 12);
          const branchAngle = currentAngle + branchAngleOffset;
          const branchLength = length * CRACK_VISUAL_CONFIG.branching.lengthMultiplier;
          const branchThickness =
            currentThickness * CRACK_VISUAL_CONFIG.branching.thicknessMultiplier;

          drawPhysicalCrackWithDepth(
            ctx,
            wrappedNextX,
            wrappedNextY,
            branchAngle,
            branchLength,
            branchThickness,
            depth + 1,
            normalizedDepth + 0.15
          );
        }

        currentX = wrappedNextX;
        currentY = wrappedNextY;
      }
    }

    crackTexture.needsUpdate = true;
    lastProcessedIndexRef.current = tapPositions.length;
  }, [tapPositions, crackTexture, diamondMeshRef, geometry, visualState]);

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

  useFrame((state) => {
    if (!meshRef.current || !meshRef.current.parent) return;

    meshRef.current.rotation.copy(meshRef.current.parent.rotation);

    if (visualState.flashActive) {
      const elapsed = Date.now() - visualState.lastCrackTimestamp;
      if (elapsed > CRACK_VISUAL_CONFIG.propagation.flashDuration) {
        visualState.flashActive = false;
      }
    }

    if (EMOTIONAL_POLISH.pinkRadiance.pulseOnCrack && crackLevel > 0) {
      const time = state.clock.elapsedTime;
      visualState.glowIntensity = CRACK_VISUAL_CONFIG.glowIntensity + Math.sin(time * 2) * 0.1;
    }
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
