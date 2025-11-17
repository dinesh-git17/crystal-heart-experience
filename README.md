# Crystal Heart Love Letter Experience

An interactive 3D romantic web experience featuring a diamond-to-heart transformation with crack progression mechanics and immersive visual effects. Built with production-grade standards targeting 50-60 FPS performance on mobile devices.

## Project Vision

A premium interactive love letter experience that transforms a crystal diamond into a beating heart through user interaction. The experience guides users through a carefully choreographed journey: diamond cracking, heart reveal, and personalized letter display—all rendered in real-time 3D with cinematic quality.

## Key Features

- **Interactive Diamond System**: Progressive crack mechanics with haptic feedback and spatial audio
- **State Machine Architecture**: Deterministic flow from intro → cracking → heart reveal → letter display
- **Premium Visual Quality**: Physically-based rendering with bloom, subsurface scattering, and particle effects
- **Mobile-First Optimization**: Designed for iPhone Safari with aggressive performance optimization
- **Emotional Polish**: Pink radiance, heartbeat animations, and romantic lighting atmosphere

## Technology Stack

**Core**: React 18, TypeScript (strict mode), Vite  
**3D Engine**: React Three Fiber, Drei, Three.js  
**Effects**: Postprocessing, custom shaders  
**State**: Zustand  
**Animation**: Framer Motion, custom GSAP-style easing  
**Audio**: Web Audio API with spatial positioning  
**Haptics**: iOS Taptic Engine integration

## Development Standards

- Zero ESLint errors
- Zero TypeScript `any` types
- FAANG-level code quality
- Mobile-first responsive design
- 50-60 FPS performance target
- Production-ready (no TODO comments)

## Current Status

**Phase 0**: ✅ Complete - Foundation, build system, development environment  
**Phase 1**: ✅ Complete - Environment setup, lighting, particles, background  
**Phase 2**: ✅ Complete - Diamond component, crack system, interaction mechanics  
**Phase 3**: 🚧 In Progress - Next phase queued

## Project Architecture

```
src/
├── components/
│   ├── 3d/          # Three.js components (Scene, Diamond, Camera, etc.)
│   └── ui/          # 2D overlay components
├── stores/          # Zustand state management
├── hooks/           # Custom React hooks
├── types/           # TypeScript definitions
├── constants/       # Configuration and constants
├── utils/           # Helper functions
└── assets/          # 3D models, audio, textures
```

## Design Philosophy

The experience prioritizes emotional impact through technical excellence: every animation curve, every particle emission, every color gradient is crafted to evoke wonder and romance. Performance is non-negotiable—the magic only works at 60fps.

---

_Built with ❤️ for the ultimate digital love letter_
