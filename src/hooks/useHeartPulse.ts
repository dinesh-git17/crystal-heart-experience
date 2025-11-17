// src/hooks/useHeartPulse.ts
// Custom hook for heart pulse animation synchronized to background music BPM

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useHeartStore } from '@/stores/heartStore';
import { getPulsePhase, getHeartPulseScale, getHeartPulseEmissive } from '@/utils/bpmSync';

interface HeartPulseReturn {
  pulseScale: number;
  pulseEmissive: number;
  pulsePhase: number;
  isAtPeak: boolean;
}

/**
 * Heart pulse animation hook synchronized to BPM
 * Calculates real-time pulse values and updates heart store
 * @param bpm - Beats per minute for synchronization
 * @param enabled - Whether pulse animation is active
 * @returns Current pulse state values
 */
export function useHeartPulse(bpm: number, enabled: boolean): HeartPulseReturn {
  const startTimeRef = useRef<number | null>(null);
  const lastPhaseRef = useRef(0);
  const isAtPeakRef = useRef(false);

  const updatePulsePhase = useHeartStore((state) => state.actions.updatePulsePhase);
  const updatePulseScale = useHeartStore((state) => state.actions.updatePulseScale);
  const updatePulseEmissive = useHeartStore((state) => state.actions.updatePulseEmissive);

  const pulseScale = useHeartStore((state) => state.pulseScale);
  const pulseEmissive = useHeartStore((state) => state.pulseEmissive);
  const pulsePhase = useHeartStore((state) => state.pulsePhase);

  useEffect(() => {
    if (enabled) {
      startTimeRef.current = null;
    }
  }, [enabled]);

  useFrame((state) => {
    if (!enabled) {
      return;
    }

    if (startTimeRef.current === null) {
      startTimeRef.current = state.clock.elapsedTime;
    }

    const elapsed = state.clock.elapsedTime - startTimeRef.current;

    const phase = getPulsePhase(elapsed, bpm);

    const scaleRange: [number, number] = [1.0, 1.08];
    const emissiveRange: [number, number] = [0.8, 1.2];

    const sinePulse = (t: number) => Math.sin(t * Math.PI * 2) * 0.5 + 0.5;

    const scale = getHeartPulseScale(phase, scaleRange, sinePulse);
    const emissive = getHeartPulseEmissive(phase, emissiveRange, sinePulse);

    const peakThreshold = 0.05;
    const isAtPeak = phase < peakThreshold || phase > 1 - peakThreshold;

    if (Math.abs(phase - lastPhaseRef.current) > 0.01) {
      updatePulsePhase(phase);
      updatePulseScale(scale);
      updatePulseEmissive(emissive);
      lastPhaseRef.current = phase;
    }

    isAtPeakRef.current = isAtPeak;
  });

  return {
    pulseScale,
    pulseEmissive,
    pulsePhase,
    isAtPeak: isAtPeakRef.current,
  };
}
