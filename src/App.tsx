// src/App.tsx
// Main application with Canvas, enhanced effects, and premium fade-in experience

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
        }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
      >
        <Suspense fallback={null}>
          <Scene />
          <Effects
            enableBloom={true}
            bloomIntensity={0.3}
            enableVignette={true}
            vignetteOffset={0.5}
            vignetteIntensity={0.5}
          />
        </Suspense>
      </Canvas>
      <PerformanceMonitor />
      <SceneFadeIn duration={1000} delay={300} />
    </div>
  );
}

export default App;
