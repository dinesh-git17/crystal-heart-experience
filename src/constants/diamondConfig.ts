// src/constants/diamondConfig.ts
// Centralized configuration for diamond visual properties, animations, and crack parameters

export const DIAMOND_ANIMATION = {
  heartbeat: {
    enabled: true,
    scaleAmplitude: 0.015,
    speedFactor: 0.6,
    emissiveAmplitude: 0.08,
  },
  rotation: {
    baseSpeed: 0.2,
    wobbleIntensity: 0.002,
    tiltVariation: 0.015,
  },
  float: {
    amplitude: 0.08,
    speed: 0.7,
    wobbleFrequency: 1.3,
  },
} as const;

export const DIAMOND_MATERIAL_POLISH = {
  transmission: 1.0,
  roughness: 0.08,
  metalness: 0.15,
  ior: 2.417,
  thickness: 0.9,
  envMapIntensity: 3.0,
  clearcoat: 1.0,
  clearcoatRoughness: 0.03,
  chromaticAberration: 0.02,
  emissiveBase: 0.15,
  thinFilmInterference: true,
  thinFilmThickness: 380,
  edgeBloomIntensity: 0.4,
} as const;

export const CRACK_VISUAL_CONFIG = {
  glowIntensity: 0.35,
  glowColor: '#ff9ec4',
  glowRadius: 0.15,
  depthShading: {
    enabled: true,
    surfaceColor: '#3d0008',
    deepColor: '#0d0000',
    depthFactor: 0.7,
  },
  refraction: {
    enabled: true,
    highlightColor: '#ffffff',
    highlightOpacity: 0.25,
    bloomMultiplier: 1.5,
  },
  thickness: {
    base: 3.5,
    variation: 1.5,
    taperingFactor: 0.6,
  },
  branching: {
    probability: 0.35,
    lengthMultiplier: 0.45,
    thicknessMultiplier: 0.7,
    maxDepth: 2,
  },
  propagation: {
    enabled: true,
    duration: 450,
    easingFunction: 'easeOutQuad' as const,
    flashDuration: 120,
    flashColor: '#ffe0f0',
    flashIntensity: 0.8,
  },
} as const;

export const EMOTIONAL_POLISH = {
  pinkRadiance: {
    enabled: true,
    color: '#ff6b9d',
    intensity: 0.25,
    pulseOnCrack: true,
    pulseAmplitude: 0.4,
    pulseDuration: 600,
  },
  heartShapedReflection: {
    enabled: true,
    opacity: 0.08,
    depth: 0.6,
    scale: 0.3,
  },
  subsurfaceScatter: {
    enabled: true,
    color: '#ffb3d9',
    intensity: 0.15,
    thickness: 0.4,
  },
} as const;

export const SCENE_POLISH = {
  depthOfField: {
    enabled: false,
    focusDistance: 5,
    focalLength: 0.8,
    bokehScale: 2,
  },
  vignette: {
    enabled: true,
    darkness: 0.6,
    offset: 0.5,
  },
  toneMapping: {
    type: 'ACESFilmic' as const,
    exposure: 1.1,
  },
  shadow: {
    blur: 0.8,
    opacity: 0.25,
  },
} as const;

export const STAR_VARIATION = {
  brightStarRatio: 0.15, // UP from 0.08 - more bright stars
  brightStarSizeMultiplier: 1.1, // DOWN from 1.3 - smaller
  brightStarGlowIntensity: 0.95, // DOWN from 1.1 - dimmer
  twinkleVariation: 0.4,
  largeStarCount: 0, // REMOVE large stars entirely
  largeStarSize: 0.05,
  staticStarRatio: 0.75, // UP from 0.65 - more background stars
  staticStarBrightness: 1.0, // UP from 0.75 - make visible
} as const;

export const PERFORMANCE = {
  targetFPS: 60,
  animationFrameLimit: 60,
  crackTextureSize: 2048,
  particleLimit: 150,
  shadowMapSize: 1024,
} as const;
