// src/utils/haptics.ts
// Haptic feedback utility with intensity patterns for mobile devices

type HapticIntensity = 'light' | 'medium' | 'heavy';

interface HapticPattern {
  duration: number;
  pattern?: number[];
}

const HAPTIC_PATTERNS: Record<HapticIntensity, HapticPattern> = {
  light: {
    duration: 10,
    pattern: [10],
  },
  medium: {
    duration: 20,
    pattern: [20],
  },
  heavy: {
    duration: 30,
    pattern: [30],
  },
};

function isHapticSupported(): boolean {
  return 'vibrate' in navigator;
}

export function triggerHaptic(intensity: HapticIntensity = 'light'): void {
  if (!isHapticSupported()) {
    return;
  }

  const pattern = HAPTIC_PATTERNS[intensity];
  if (!pattern) {
    return;
  }

  try {
    if (pattern.pattern) {
      navigator.vibrate(pattern.pattern);
    } else {
      navigator.vibrate(pattern.duration);
    }
  } catch (error) {
    console.warn('Haptic feedback failed:', error);
  }
}

export function triggerHapticPattern(pattern: number[]): void {
  if (!isHapticSupported()) {
    return;
  }

  try {
    navigator.vibrate(pattern);
  } catch (error) {
    console.warn('Haptic pattern failed:', error);
  }
}

export function cancelHaptic(): void {
  if (!isHapticSupported()) {
    return;
  }

  try {
    navigator.vibrate(0);
  } catch (error) {
    console.warn('Cancel haptic failed:', error);
  }
}

export function triggerSuccessHaptic(): void {
  if (!isHapticSupported()) {
    return;
  }

  try {
    navigator.vibrate([10, 50, 10]);
  } catch (error) {
    console.warn('Success haptic failed:', error);
  }
}

export function triggerShatterHaptic(): void {
  if (!isHapticSupported()) {
    return;
  }

  try {
    navigator.vibrate([50, 50, 50, 50, 100]);
  } catch (error) {
    console.warn('Shatter haptic failed:', error);
  }
}

export const haptics = {
  trigger: triggerHaptic,
  triggerPattern: triggerHapticPattern,
  cancel: cancelHaptic,
  success: triggerSuccessHaptic,
  shatter: triggerShatterHaptic,
  isSupported: isHapticSupported,
};
