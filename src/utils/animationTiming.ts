// src/utils/animationTiming.ts
// Easing functions, timeline management, and animation interpolation utilities for smooth transitions

import { TransitionPhase } from '@/types/heart';
import type { TransitionTimeline } from '@/types/heart';
import * as THREE from 'three';

/**
 * Cubic ease-out function for smooth deceleration
 * @param t - Progress value between 0 and 1
 * @returns Eased value between 0 and 1
 */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Cubic ease-in-out function for smooth acceleration and deceleration
 * @param t - Progress value between 0 and 1
 * @returns Eased value between 0 and 1
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Elastic ease-out function for overshoot/bounce effect
 * @param t - Progress value between 0 and 1
 * @returns Eased value that overshoots then settles at 1
 */
export function easeOutElastic(t: number): number {
  const c4 = (2 * Math.PI) / 3;

  if (t === 0) return 0;
  if (t === 1) return 1;

  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

/**
 * Exponential ease-out function for rapid deceleration (fragment fadeout)
 * @param t - Progress value between 0 and 1
 * @returns Eased value between 0 and 1
 */
export function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/**
 * Quadratic ease-out function for gentle deceleration
 * @param t - Progress value between 0 and 1
 * @returns Eased value between 0 and 1
 */
export function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

/**
 * Linear interpolation between two values
 * @param start - Starting value
 * @param end - Ending value
 * @param t - Progress value between 0 and 1
 * @returns Interpolated value
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Linear interpolation between two Vector3 values
 * @param start - Starting Vector3
 * @param end - Ending Vector3
 * @param t - Progress value between 0 and 1
 * @returns New interpolated Vector3
 */
export function lerpVector3(start: THREE.Vector3, end: THREE.Vector3, t: number): THREE.Vector3 {
  return new THREE.Vector3(
    lerp(start.x, end.x, t),
    lerp(start.y, end.y, t),
    lerp(start.z, end.z, t)
  );
}

/**
 * Clamp a value between minimum and maximum bounds
 * @param value - Value to clamp
 * @param min - Minimum bound
 * @param max - Maximum bound
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Get the current transition phase based on elapsed time
 * @param timeline - Transition timeline configuration
 * @param elapsed - Elapsed time in seconds
 * @returns Current transition phase
 */
export function getCurrentPhase(timeline: TransitionTimeline, elapsed: number): TransitionPhase {
  if (elapsed < timeline.shatterStart) {
    return TransitionPhase.IDLE;
  }

  if (elapsed < timeline.shatterStart + timeline.shatterDuration) {
    return TransitionPhase.SHATTER_ACTIVE;
  }

  if (elapsed < timeline.pauseStart + timeline.pauseDuration) {
    return TransitionPhase.PAUSE;
  }

  if (elapsed < timeline.heartFadeStart + timeline.heartFadeDuration) {
    return TransitionPhase.HEART_FADE_IN;
  }

  if (elapsed < timeline.heartEntranceStart + timeline.heartEntranceDuration) {
    return TransitionPhase.HEART_ENTRANCE;
  }

  if (elapsed >= timeline.totalDuration) {
    return TransitionPhase.TRANSITION_COMPLETE;
  }

  return TransitionPhase.HEART_ENTRANCE;
}

/**
 * Get progress within current phase (0-1)
 * @param phase - Current transition phase
 * @param timeline - Transition timeline configuration
 * @param elapsed - Total elapsed time in seconds
 * @returns Progress within phase (0-1)
 */
export function getPhaseProgress(
  phase: TransitionPhase,
  timeline: TransitionTimeline,
  elapsed: number
): number {
  switch (phase) {
    case TransitionPhase.SHATTER_ACTIVE: {
      const phaseElapsed = elapsed - timeline.shatterStart;
      return clamp(phaseElapsed / timeline.shatterDuration, 0, 1);
    }

    case TransitionPhase.PAUSE: {
      const phaseElapsed = elapsed - timeline.pauseStart;
      return clamp(phaseElapsed / timeline.pauseDuration, 0, 1);
    }

    case TransitionPhase.HEART_FADE_IN: {
      const phaseElapsed = elapsed - timeline.heartFadeStart;
      return clamp(phaseElapsed / timeline.heartFadeDuration, 0, 1);
    }

    case TransitionPhase.HEART_ENTRANCE: {
      const phaseElapsed = elapsed - timeline.heartEntranceStart;
      return clamp(phaseElapsed / timeline.heartEntranceDuration, 0, 1);
    }

    case TransitionPhase.TRANSITION_COMPLETE:
      return 1;

    default:
      return 0;
  }
}

/**
 * Calculate fragment fadeout opacity using exponential easing
 * @param lifeProgress - Progress through fragment lifespan (0-1)
 * @returns Opacity value (0-1)
 */
export function calculateFragmentOpacity(lifeProgress: number): number {
  return (1 - easeOutExpo(lifeProgress)) * 0.8;
}

/**
 * Calculate heart scale with overshoot using elastic easing
 * @param progress - Animation progress (0-1)
 * @param targetScale - Final target scale
 * @param overshootScale - Peak overshoot scale
 * @returns Current scale value
 */
export function calculateHeartScale(
  progress: number,
  targetScale: number,
  overshootScale: number
): number {
  if (progress < 0.7) {
    const scaleProgress = progress / 0.7;
    const eased = easeOutCubic(scaleProgress);
    return lerp(0, overshootScale, eased);
  } else {
    const settleProgress = (progress - 0.7) / 0.3;
    const eased = easeOutQuad(settleProgress);
    return lerp(overshootScale, targetScale, eased);
  }
}

/**
 * Calculate heart rotation during entrance
 * @param progress - Animation progress (0-1)
 * @param rotations - Number of full rotations
 * @returns Current rotation in radians
 */
export function calculateHeartRotation(progress: number, rotations: number): number {
  const eased = easeOutCubic(progress);
  return eased * rotations * Math.PI * 2;
}

/**
 * Calculate heart opacity during fade-in
 * @param progress - Fade progress (0-1)
 * @returns Opacity value (0-1)
 */
export function calculateHeartOpacity(progress: number): number {
  return easeInOutCubic(progress);
}
