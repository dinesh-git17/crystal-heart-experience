// src/types/environment.ts
// Type definitions for 3D environment configuration including lighting, camera, particles, and post-processing

export interface AmbientLightConfig {
  intensity: number;
  color: string;
}

export interface DirectionalLightConfig {
  intensity: number;
  position: [number, number, number];
  castShadow: boolean;
  shadowMapSize: [number, number];
  shadowCameraNear: number;
  shadowCameraFar: number;
  shadowCameraLeft: number;
  shadowCameraRight: number;
  shadowCameraTop: number;
  shadowCameraBottom: number;
}

export interface PointLightConfig {
  intensity: number;
  position: [number, number, number];
  color: string;
  distance: number;
  decay: number;
}

export interface LightingConfiguration {
  ambient: AmbientLightConfig;
  directional: DirectionalLightConfig;
  pointLights: PointLightConfig[];
  environmentPreset?:
    | 'sunset'
    | 'dawn'
    | 'night'
    | 'warehouse'
    | 'forest'
    | 'apartment'
    | 'studio'
    | 'city'
    | 'park'
    | 'lobby';
}

export interface CameraConfiguration {
  fov: number;
  position: [number, number, number];
  near: number;
  far: number;
  lookAt?: [number, number, number];
}

export interface ParticleSystemConfig {
  count: number;
  size: number;
  opacity: number;
  color: string;
  spread: number;
  speed: number;
  driftIntensity: number;
}

export interface BloomEffectConfig {
  enabled: boolean;
  intensity: number;
  luminanceThreshold: number;
  luminanceSmoothing: number;
  mipmapBlur: boolean;
}

export interface VignetteEffectConfig {
  enabled: boolean;
  darkness: number;
  offset: number;
}

export interface PostProcessingConfig {
  bloom: BloomEffectConfig;
  vignette: VignetteEffectConfig;
}

export interface BackgroundGradientColors {
  top: string;
  middle: string;
  bottom: string;
}

export interface PerformanceThresholds {
  targetFPS: number;
  minFPS: number;
  maxMemoryMB: number;
  maxDrawCalls: number;
}

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsedMB: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
}

export interface DeviceCapabilities {
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  supportsWebGL2: boolean;
  maxTextureSize: number;
  pixelRatio: number;
}

export const DEFAULT_LIGHTING: LightingConfiguration = {
  ambient: {
    intensity: 0.4,
    color: '#ffffff',
  },
  directional: {
    intensity: 1.2,
    position: [5, 5, 5],
    castShadow: true,
    shadowMapSize: [1024, 1024],
    shadowCameraNear: 0.5,
    shadowCameraFar: 50,
    shadowCameraLeft: -10,
    shadowCameraRight: 10,
    shadowCameraTop: 10,
    shadowCameraBottom: -10,
  },
  pointLights: [
    {
      intensity: 0.8,
      position: [-3, 2, 3],
      color: '#ff9ec4',
      distance: 10,
      decay: 2,
    },
    {
      intensity: 0.6,
      position: [3, 2, -3],
      color: '#c4e0ff',
      distance: 10,
      decay: 2,
    },
  ],
  environmentPreset: 'sunset',
};

export const DEFAULT_CAMERA: CameraConfiguration = {
  fov: 55,
  position: [0, 0, 5],
  near: 0.1,
  far: 1000,
};

export const DEFAULT_PARTICLES: ParticleSystemConfig = {
  count: 75,
  size: 0.03,
  opacity: 0.5,
  color: '#ffffff',
  spread: 8,
  speed: 0.0005,
  driftIntensity: 0.5,
};

export const DEFAULT_POST_PROCESSING: PostProcessingConfig = {
  bloom: {
    enabled: true,
    intensity: 0.5,
    luminanceThreshold: 0.9,
    luminanceSmoothing: 0.9,
    mipmapBlur: true,
  },
  vignette: {
    enabled: false,
    darkness: 0.5,
    offset: 0.3,
  },
};

export const DEFAULT_BACKGROUND: BackgroundGradientColors = {
  top: '#1a0b2e',
  middle: '#4a1a4a',
  bottom: '#ff6b9d',
};

export const DEFAULT_PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
  targetFPS: 60,
  minFPS: 45,
  maxMemoryMB: 512,
  maxDrawCalls: 100,
};

export type Vector3Tuple = [number, number, number];

export interface SceneConfig {
  lighting: LightingConfiguration;
  camera: CameraConfiguration;
  particles: ParticleSystemConfig;
  postProcessing: PostProcessingConfig;
  background: BackgroundGradientColors;
  performanceThresholds: PerformanceThresholds;
}

export const DEFAULT_SCENE_CONFIG: SceneConfig = {
  lighting: DEFAULT_LIGHTING,
  camera: DEFAULT_CAMERA,
  particles: DEFAULT_PARTICLES,
  postProcessing: DEFAULT_POST_PROCESSING,
  background: DEFAULT_BACKGROUND,
  performanceThresholds: DEFAULT_PERFORMANCE_THRESHOLDS,
};
