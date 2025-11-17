// src/constants/colors.ts
// Centralized color palette for romantic cosmic theme with consistent design tokens

export const COLORS = {
  // Background gradient colors
  background: {
    top: '#1a0b2e',
    middle: '#4a1a4a',
    bottom: '#ff6b9d',
  },

  // Accent lighting colors
  accent: {
    pink: '#ff9ec4',
    blue: '#c4e0ff',
    warm: '#ffc4e0',
    cool: '#c4d9ff',
  },

  // Placeholder/Diamond colors
  primary: {
    main: '#ff69b4',
    light: '#ffb4d9',
    dark: '#ff1f8f',
  },

  // Particle colors
  particle: {
    white: '#ffffff',
    tintPink: '#ffeef5',
    tintPurple: '#f0e6ff',
  },

  // UI colors
  ui: {
    overlay: 'rgba(0, 0, 0, 0.75)',
    text: '#ffffff',
    success: '#00ff00',
    warning: '#ffff00',
    error: '#ff0000',
  },

  // Scene environment
  scene: {
    fog: '#2d1b4e',
    ambient: '#ffffff',
    key: '#fff5f0',
    rim: '#a8c0ff',
    fill: '#ffb4d9',
  },
} as const;

export type ColorToken = typeof COLORS;
