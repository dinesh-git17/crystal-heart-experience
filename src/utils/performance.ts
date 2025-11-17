// src/utils/performance.ts
// Performance monitoring utilities for FPS tracking, memory analysis, and device capability detection

import type {
  PerformanceMetrics,
  DeviceCapabilities,
  PerformanceThresholds,
} from '@/types/environment';

export class FPSTracker {
  private frames: number[] = [];
  private lastTime: number = performance.now();
  private readonly maxSamples: number = 60;

  update(): number {
    const currentTime = performance.now();
    const delta = currentTime - this.lastTime;
    this.lastTime = currentTime;

    if (delta > 0) {
      const fps = 1000 / delta;
      this.frames.push(fps);

      if (this.frames.length > this.maxSamples) {
        this.frames.shift();
      }
    }

    return this.getAverageFPS();
  }

  getAverageFPS(): number {
    if (this.frames.length === 0) return 60;
    const sum = this.frames.reduce((acc, fps) => acc + fps, 0);
    return Math.round(sum / this.frames.length);
  }

  getCurrentFPS(): number {
    return this.frames.length > 0 ? Math.round(this.frames[this.frames.length - 1] ?? 60) : 60;
  }

  reset(): void {
    this.frames = [];
    this.lastTime = performance.now();
  }
}

export function getMemoryUsage(): number {
  if ('memory' in performance && performance.memory) {
    const memory = performance.memory as {
      usedJSHeapSize: number;
      jsHeapSizeLimit: number;
      totalJSHeapSize: number;
    };
    return Math.round(memory.usedJSHeapSize / 1024 / 1024);
  }
  return 0;
}

export function getRendererInfo(renderer: THREE.WebGLRenderer): {
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
} {
  const info = renderer.info;
  return {
    drawCalls: info.render.calls,
    triangles: info.render.triangles,
    geometries: info.memory.geometries,
    textures: info.memory.textures,
  };
}

export function detectDevice(): DeviceCapabilities {
  const ua = navigator.userAgent.toLowerCase();
  const isMobile = /iphone|ipad|ipod|android|webos|blackberry|windows phone/i.test(ua);
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isAndroid = /android/i.test(ua);

  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
  const supportsWebGL2 = canvas.getContext('webgl2') !== null;

  let maxTextureSize = 2048;
  if (gl) {
    maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
  }

  const pixelRatio = Math.min(window.devicePixelRatio ?? 1, 2);

  return {
    isMobile,
    isIOS,
    isAndroid,
    supportsWebGL2,
    maxTextureSize,
    pixelRatio,
  };
}

export function getIOSVersion(): number | null {
  const ua = navigator.userAgent;
  const match = ua.match(/OS (\d+)_(\d+)_?(\d+)?/);
  if (match) {
    return parseInt(match[1] ?? '0', 10);
  }
  return null;
}

export function getDeviceModel(): string {
  const ua = navigator.userAgent;

  if (/iPhone/.test(ua)) {
    if (/iPhone1[5-9]|iPhone[2-9][0-9]/.test(ua)) {
      return 'iPhone (Modern)';
    }
    if (/iPhone1[0-4]/.test(ua)) {
      return 'iPhone (Recent)';
    }
    return 'iPhone (Legacy)';
  }

  if (/iPad/.test(ua)) {
    return 'iPad';
  }

  if (/Android/.test(ua)) {
    return 'Android Device';
  }

  return 'Desktop';
}

export function checkPerformanceThresholds(
  metrics: PerformanceMetrics,
  thresholds: PerformanceThresholds
): {
  isHealthy: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  if (metrics.fps < thresholds.minFPS) {
    warnings.push(`FPS below minimum threshold: ${metrics.fps} < ${thresholds.minFPS}`);
  }

  if (metrics.memoryUsedMB > thresholds.maxMemoryMB) {
    warnings.push(`Memory usage high: ${metrics.memoryUsedMB}MB > ${thresholds.maxMemoryMB}MB`);
  }

  if (metrics.drawCalls > thresholds.maxDrawCalls) {
    warnings.push(`Draw calls high: ${metrics.drawCalls} > ${thresholds.maxDrawCalls}`);
  }

  return {
    isHealthy: warnings.length === 0,
    warnings,
  };
}

export function shouldReduceQuality(device: DeviceCapabilities, currentFPS: number): boolean {
  if (device.isMobile && currentFPS < 45) {
    return true;
  }

  if (!device.supportsWebGL2) {
    return true;
  }

  if (device.maxTextureSize < 2048) {
    return true;
  }

  return false;
}

export function getRecommendedSettings(device: DeviceCapabilities): {
  shadowsEnabled: boolean;
  particleCount: number;
  bloomEnabled: boolean;
  pixelRatio: number;
} {
  if (device.isMobile) {
    return {
      shadowsEnabled: device.isIOS,
      particleCount: device.isIOS ? 75 : 50,
      bloomEnabled: true,
      pixelRatio: Math.min(device.pixelRatio, 2),
    };
  }

  return {
    shadowsEnabled: true,
    particleCount: 100,
    bloomEnabled: true,
    pixelRatio: Math.min(device.pixelRatio, 2),
  };
}

export function logPerformanceMetrics(metrics: PerformanceMetrics): void {
  if (import.meta.env.DEV) {
    console.log('Performance Metrics:', {
      fps: `${metrics.fps} fps`,
      frameTime: `${metrics.frameTime.toFixed(2)}ms`,
      memory: `${metrics.memoryUsedMB}MB`,
      drawCalls: metrics.drawCalls,
      triangles: metrics.triangles,
      geometries: metrics.geometries,
      textures: metrics.textures,
    });
  }
}

export function createPerformanceMetrics(
  fps: number,
  frameTime: number,
  memoryUsedMB: number,
  renderer: THREE.WebGLRenderer
): PerformanceMetrics {
  const rendererInfo = getRendererInfo(renderer);

  return {
    fps,
    frameTime,
    memoryUsedMB,
    drawCalls: rendererInfo.drawCalls,
    triangles: rendererInfo.triangles,
    geometries: rendererInfo.geometries,
    textures: rendererInfo.textures,
  };
}

export const performanceUtils = {
  FPSTracker,
  getMemoryUsage,
  getRendererInfo,
  detectDevice,
  getIOSVersion,
  getDeviceModel,
  checkPerformanceThresholds,
  shouldReduceQuality,
  getRecommendedSettings,
  logPerformanceMetrics,
  createPerformanceMetrics,
};
