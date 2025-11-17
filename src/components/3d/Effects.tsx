// src/components/3d/Effects.tsx
// Enhanced post-processing with optimized bloom and vignette for premium diamond rendering

import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { SCENE_POLISH } from '@/constants/diamondConfig';

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
  bloomIntensity = 0.4,
  bloomThreshold = 0.85,
  enableVignette = true,
  vignetteIntensity = SCENE_POLISH.vignette.darkness,
  vignetteOffset = SCENE_POLISH.vignette.offset,
}: EffectsProps) {
  const bloomEnabled = enableBloom;
  const vignetteEnabled = enableVignette && SCENE_POLISH.vignette.enabled;

  if (!bloomEnabled && !vignetteEnabled) {
    return null;
  }

  return (
    <EffectComposer>
      <>
        {bloomEnabled && (
          <Bloom
            intensity={bloomIntensity}
            luminanceThreshold={bloomThreshold}
            luminanceSmoothing={0.95}
            mipmapBlur
            blendFunction={BlendFunction.ADD}
            radius={0.5}
          />
        )}
        {vignetteEnabled && (
          <Vignette
            offset={vignetteOffset}
            darkness={vignetteIntensity}
            blendFunction={BlendFunction.NORMAL}
            eskil={false}
          />
        )}
      </>
    </EffectComposer>
  );
}
