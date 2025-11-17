// src/App.tsx
// Main application with enhanced post-processing and optimized renderer configuration

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { Scene } from './components/3d/Scene';
import { Effects } from './components/3d/Effects';
import { PerformanceMonitor } from './components/3d/PerformanceMonitor';
import { SceneFadeIn } from './components/ui/SceneFadeIn';

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', touchAction: 'none' }}>
      <Canvas
        shadows
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        frameloop="always"
      >
        <Suspense fallback={null}>
          <Scene />
          <Effects
            enableBloom={true}
            bloomIntensity={0.08} // DOWN from 0.15
            bloomThreshold={0.995} // UP from 0.98
            enableVignette={true}
            vignetteOffset={0.5}
            vignetteIntensity={0.45}
          />
        </Suspense>
      </Canvas>
      <PerformanceMonitor />
      <SceneFadeIn duration={1000} delay={300} />
    </div>
  );
}

export default App;
