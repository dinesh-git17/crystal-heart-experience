// src/components/3d/InteractionHint.tsx
// Interaction hint system that intensifies heart pulse to guide user toward tapping

import { useEffect } from 'react';
import { DEFAULT_INTERACTION_HINT } from '@/types/letter';

interface InteractionHintProps {
  enabled: boolean;
  hintIntensity?: number;
  onHintActivated?: () => void;
}

/**
 * Interaction hint component
 * Intensifies pulse animation when user hasn't tapped heart after delay
 * Does not render visible geometry - modifies existing pulse behavior
 */
export function InteractionHint({
  enabled,
  hintIntensity = DEFAULT_INTERACTION_HINT.intensityMultiplier,
  onHintActivated,
}: InteractionHintProps) {
  useEffect(() => {
    if (enabled && onHintActivated) {
      onHintActivated();

      if (import.meta.env.DEV) {
        console.log('Interaction hint effect active - pulse intensity:', hintIntensity);
      }
    }
  }, [enabled, hintIntensity, onHintActivated]);

  return null;
}

/**
 * Calculate hint-adjusted pulse scale
 * Multiplies base pulse scale by hint intensity when active
 * @param baseScale - Base pulse scale value
 * @param hintActive - Whether hint is currently active
 * @param hintIntensity - Intensity multiplier (default 1.5)
 * @returns Adjusted scale value
 */
export function applyHintIntensity(
  baseScale: number,
  hintActive: boolean,
  hintIntensity = DEFAULT_INTERACTION_HINT.intensityMultiplier
): number {
  if (!hintActive) {
    return baseScale;
  }

  const scaleOffset = baseScale - 1.0;
  const amplifiedOffset = scaleOffset * hintIntensity;
  return 1.0 + amplifiedOffset;
}

/**
 * Calculate hint-adjusted pulse emissive intensity
 * Multiplies base emissive variation by hint intensity when active
 * @param baseEmissive - Base emissive intensity value
 * @param hintActive - Whether hint is currently active
 * @param hintIntensity - Intensity multiplier (default 1.5)
 * @returns Adjusted emissive intensity
 */
export function applyHintEmissiveIntensity(
  baseEmissive: number,
  hintActive: boolean,
  hintIntensity = DEFAULT_INTERACTION_HINT.intensityMultiplier
): number {
  if (!hintActive) {
    return baseEmissive;
  }

  const baseValue = 0.8;
  const emissiveOffset = baseEmissive - baseValue;
  const amplifiedOffset = emissiveOffset * hintIntensity;
  return baseValue + amplifiedOffset;
}
