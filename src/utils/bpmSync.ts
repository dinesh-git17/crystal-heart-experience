// src/utils/bpmSync.ts
// BPM synchronization utilities for heart pulse animation matched to background music tempo

export const BACKGROUND_MUSIC_BPM = 140;

export interface BPMClock {
  start: () => void;
  stop: () => void;
  getCurrentBeat: () => number;
  getPhase: () => number;
  onBeat: (callback: () => void) => void;
  isRunning: () => boolean;
}

/**
 * Convert BPM to duration in seconds per beat
 * @param bpm - Beats per minute
 * @returns Seconds per beat
 */
export function bpmToDuration(bpm: number): number {
  return 60 / bpm;
}

/**
 * Convert duration to BPM
 * @param duration - Seconds per beat
 * @returns Beats per minute
 */
export function durationToBpm(duration: number): number {
  return 60 / duration;
}

/**
 * Convert beats to seconds at given BPM
 * @param beats - Number of beats
 * @param bpm - Beats per minute
 * @returns Duration in seconds
 */
export function beatsToSeconds(beats: number, bpm: number): number {
  return beats * bpmToDuration(bpm);
}

/**
 * Get current pulse phase (0-1) within current beat
 * @param elapsed - Total elapsed time in seconds
 * @param bpm - Beats per minute
 * @returns Phase within current beat (0-1)
 */
export function getPulsePhase(elapsed: number, bpm: number): number {
  const beatDuration = bpmToDuration(bpm);
  return (elapsed % beatDuration) / beatDuration;
}

/**
 * Get pulse value with easing applied (0-1 scaled)
 * @param phase - Current phase (0-1)
 * @param easing - Optional easing function (defaults to sine wave)
 * @returns Eased pulse value (0-1)
 */
export function getPulseValue(phase: number, easing?: (t: number) => number): number {
  const easingFn = easing || ((t: number) => Math.sin(t * Math.PI * 2) * 0.5 + 0.5);
  return easingFn(phase);
}

/**
 * Check if current phase is at beat peak
 * @param phase - Current phase (0-1)
 * @param threshold - Peak detection threshold (default 0.05)
 * @returns True if at peak of beat
 */
export function isBeatPeak(phase: number, threshold = 0.05): boolean {
  return phase < threshold || phase > 1 - threshold;
}

/**
 * Synchronize time to BPM grid
 * @param currentTime - Current time in seconds
 * @param bpm - Beats per minute
 * @param offset - Optional offset in seconds
 * @returns Synchronized time aligned to beat grid
 */
export function syncToBPM(currentTime: number, bpm: number, offset = 0): number {
  const beatDuration = bpmToDuration(bpm);
  const adjustedTime = currentTime + offset;
  const beatNumber = Math.floor(adjustedTime / beatDuration);
  return beatNumber * beatDuration - offset;
}

/**
 * Calculate which beat number we're on
 * @param elapsed - Total elapsed time in seconds
 * @param bpm - Beats per minute
 * @returns Current beat number (integer)
 */
export function getCurrentBeatNumber(elapsed: number, bpm: number): number {
  const beatDuration = bpmToDuration(bpm);
  return Math.floor(elapsed / beatDuration);
}

/**
 * Create a BPM clock for tracking beats and triggering callbacks
 * @param bpm - Beats per minute
 * @returns BPM clock object
 */
export function createBPMClock(bpm: number): BPMClock {
  let startTime = 0;
  let running = false;
  let lastBeatNumber = -1;
  let beatCallbacks: Array<() => void> = [];
  let animationFrameId: number | null = null;

  const update = () => {
    if (!running) return;

    const elapsed = (performance.now() - startTime) / 1000;
    const currentBeat = getCurrentBeatNumber(elapsed, bpm);

    if (currentBeat !== lastBeatNumber) {
      lastBeatNumber = currentBeat;
      beatCallbacks.forEach((callback) => callback());
    }

    animationFrameId = requestAnimationFrame(update);
  };

  return {
    start: () => {
      if (!running) {
        startTime = performance.now();
        running = true;
        lastBeatNumber = -1;
        update();
      }
    },

    stop: () => {
      running = false;
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    },

    getCurrentBeat: () => {
      if (!running) return 0;
      const elapsed = (performance.now() - startTime) / 1000;
      return getCurrentBeatNumber(elapsed, bpm);
    },

    getPhase: () => {
      if (!running) return 0;
      const elapsed = (performance.now() - startTime) / 1000;
      return getPulsePhase(elapsed, bpm);
    },

    onBeat: (callback: () => void) => {
      beatCallbacks.push(callback);
    },

    isRunning: () => running,
  };
}

/**
 * Linear interpolation between min and max based on pulse value
 * @param pulseValue - Pulse value (0-1)
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Interpolated value
 */
export function pulseLerp(pulseValue: number, min: number, max: number): number {
  return min + (max - min) * pulseValue;
}

/**
 * Get scale value for heart pulse based on phase
 * @param phase - Current phase (0-1)
 * @param scaleRange - [min, max] scale range
 * @param easing - Optional easing function
 * @returns Current scale value
 */
export function getHeartPulseScale(
  phase: number,
  scaleRange: [number, number],
  easing?: (t: number) => number
): number {
  const pulseValue = getPulseValue(phase, easing);
  return pulseLerp(pulseValue, scaleRange[0], scaleRange[1]);
}

/**
 * Get emissive intensity for heart pulse based on phase
 * @param phase - Current phase (0-1)
 * @param emissiveRange - [min, max] emissive range
 * @param easing - Optional easing function
 * @returns Current emissive intensity
 */
export function getHeartPulseEmissive(
  phase: number,
  emissiveRange: [number, number],
  easing?: (t: number) => number
): number {
  const pulseValue = getPulseValue(phase, easing);
  return pulseLerp(pulseValue, emissiveRange[0], emissiveRange[1]);
}
