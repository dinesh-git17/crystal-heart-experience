// src/components/3d/Effects.tsx
// Post-processing effects with cinematic bloom and vignette for professional framing

import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

interface EffectsProps {
  enableBloom?: boolean;
  bloomIntensity?: number;
  bloomThreshold?: number;
  enableVignette?: boolean;
  vignetteIntensity?: number;
  vignetteOffset?: number;
}

export function Effects({
  enableBloom = true,
  bloomIntensity = 0.3,
  bloomThreshold = 0.9,
  enableVignette = true,
  vignetteIntensity = 0.5,
  vignetteOffset = 0.5,
}: EffectsProps) {
  if (!enableBloom && !enableVignette) {
    return null;
  }

  return (
    <EffectComposer>
      <Bloom
        intensity={enableBloom ? bloomIntensity : 0}
        luminanceThreshold={bloomThreshold}
        luminanceSmoothing={0.9}
        mipmapBlur
        blendFunction={BlendFunction.ADD}
      />
      <Vignette
        offset={vignetteOffset}
        darkness={enableVignette ? vignetteIntensity : 0}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
}
