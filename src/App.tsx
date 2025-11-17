// src/App.tsx
// Main application component with Canvas setup and Phase 1 scene integration

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { Scene } from './components/3d/Scene';
import { Effects } from './components/3d/Effects';
import { PerformanceMonitor } from './components/3d/PerformanceMonitor';

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
          <Effects enableBloom={true} bloomIntensity={0.5} enableVignette={false} />
        </Suspense>
      </Canvas>
      <PerformanceMonitor />
    </div>
  );
}

export default App;
