// src/utils/easingFunctions.ts
// Comprehensive easing function library for cinematic animations and emotional timing curves

/**
 * Linear interpolation between two values
 */
export function lerp(start: number, end: number, progress: number): number {
  return start + (end - start) * progress;
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Sine-based easing in and out (smooth acceleration and deceleration)
 * Perfect for organic floating motions
 */
export function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

/**
 * Cubic easing out (decelerating to zero velocity)
 * Used for natural-feeling endings
 */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Cubic easing in and out
 * Smooth acceleration and deceleration
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Quadratic easing out
 * Gentler deceleration than cubic
 */
export function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

/**
 * Quadratic easing in
 * Gentle acceleration
 */
export function easeInQuad(t: number): number {
  return t * t;
}

/**
 * Exponential easing out
 * Very sharp deceleration, good for dramatic stops
 */
export function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/**
 * Exponential easing in
 * Very sharp acceleration
 */
export function easeInExpo(t: number): number {
  return t === 0 ? 0 : Math.pow(2, 10 * t - 10);
}

/**
 * Elastic easing out with overshoot
 * Creates a spring-like bounce effect perfect for heart reveal
 * @param amplitude - Controls overshoot intensity (default: 1)
 * @param period - Controls oscillation frequency (default: 0.3)
 */
export function easeOutElastic(t: number, amplitude = 1, period = 0.3): number {
  if (t === 0) return 0;
  if (t === 1) return 1;

  const s = (period / (2 * Math.PI)) * Math.asin(1 / amplitude);
  return amplitude * Math.pow(2, -10 * t) * Math.sin(((t - s) * (2 * Math.PI)) / period) + 1;
}

/**
 * Back easing out (slight overshoot then settle)
 * Less dramatic than elastic, more controlled
 * @param overshoot - Amount of overshoot (default: 1.70158)
 */
export function easeOutBack(t: number, overshoot = 1.70158): number {
  const c3 = overshoot + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + overshoot * Math.pow(t - 1, 2);
}

/**
 * Back easing in (slight pullback before motion)
 */
export function easeInBack(t: number, overshoot = 1.70158): number {
  const c3 = overshoot + 1;
  return c3 * t * t * t - overshoot * t * t;
}

/**
 * Circular easing out
 * Smooth, rounded deceleration
 */
export function easeOutCirc(t: number): number {
  return Math.sqrt(1 - Math.pow(t - 1, 2));
}

/**
 * Circular easing in
 * Smooth, rounded acceleration
 */
export function easeInCirc(t: number): number {
  return 1 - Math.sqrt(1 - Math.pow(t, 2));
}

/**
 * Heartbeat pulse curve
 * Mimics realistic cardiac contraction pattern
 * @param t - Progress through one heartbeat cycle (0-1)
 * @returns Intensity value (0-1) representing contraction strength
 */
export function heartbeatPulse(t: number): number {
  if (t < 0.15) {
    return easeInOutCubic(t / 0.15);
  } else if (t < 0.25) {
    return 1 - easeInOutCubic((t - 0.15) / 0.1);
  } else if (t < 0.35) {
    return easeInOutCubic((t - 0.25) / 0.1) * 0.6;
  } else if (t < 0.45) {
    return 0.6 - easeInOutCubic((t - 0.35) / 0.1) * 0.6;
  }
  return 0;
}

/**
 * Gentle breathing curve
 * Mimics natural inhale/exhale pattern
 * @param t - Progress through one breath cycle (0-1)
 * @returns Scale multiplier for breath effect
 */
export function breathingCurve(t: number): number {
  return Math.sin(t * Math.PI * 2) * 0.5 + 0.5;
}

/**
 * Shimmer curve for subtle light effects
 * Creates organic, non-uniform sparkle timing
 */
export function shimmerCurve(t: number, frequency = 3, intensity = 0.3): number {
  const base = Math.sin(t * Math.PI * 2 * frequency);
  const variation = Math.sin(t * Math.PI * 5.7) * 0.3;
  return 1 + (base + variation) * intensity;
}

/**
 * Glow pulse curve with soft attack and release
 * Perfect for ambient light pulsing
 */
export function glowPulse(t: number): number {
  return easeInOutSine(Math.sin(t * Math.PI) * 0.5 + 0.5);
}

/**
 * Camera dolly easing (Apple-style product reveal)
 * Slow start, smooth middle, gentle end
 */
export function cameraDolly(t: number): number {
  if (t < 0.4) {
    return easeOutQuad(t / 0.4) * 0.3;
  } else if (t < 0.7) {
    return 0.3 + easeInOutCubic((t - 0.4) / 0.3) * 0.5;
  } else {
    return 0.8 + easeOutCirc((t - 0.7) / 0.3) * 0.2;
  }
}

/**
 * Emotional swell curve
 * Builds intensity then holds at peak before gentle release
 */
export function emotionalSwell(t: number): number {
  if (t < 0.6) {
    return easeOutQuad(t / 0.6);
  } else if (t < 0.85) {
    return 1;
  } else {
    return 1 - easeInQuad((t - 0.85) / 0.15) * 0.2;
  }
}

/**
 * Radiance fade curve
 * Soft bloom that fades naturally
 */
export function radianceFade(t: number, peakTime = 0.3, fadeTime = 0.7): number {
  if (t < peakTime) {
    return easeOutCirc(t / peakTime);
  } else {
    return 1 - easeInQuad((t - peakTime) / fadeTime);
  }
}

/**
 * Orchestrated sequence timing
 * Maps normalized time to specific phase with easing
 */
export function phaseTransition(
  t: number,
  startTime: number,
  duration: number,
  easingFn: (t: number) => number = easeInOutCubic
): number {
  if (t < startTime) return 0;
  if (t > startTime + duration) return 1;
  const phaseProgress = (t - startTime) / duration;
  return easingFn(phaseProgress);
}

/**
 * Romantic sparkle timing
 * Random-feeling but deterministic sparkle pattern
 */
export function sparkleRandom(seed: number, t: number): number {
  const phase = (seed * 12.9898 + t * 78.233) % 1;
  return Math.sin(phase * Math.PI * 2) * 0.5 + 0.5;
}
