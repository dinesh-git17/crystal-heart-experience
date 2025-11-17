// src/App.tsx
// Main application component with Canvas setup and scene orchestration

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', touchAction: 'none' }}>
      <Canvas
        camera={{
          position: [0, 0, 5],
          fov: 45,
          near: 0.1,
          far: 100,
        }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={['#000000']} />

          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />

          {/* Phase 1: Diamond component will be added here */}
          {/* Phase 2: Heart component will be added here */}
          {/* Phase 3: Camera animations will be added here */}
          {/* Phase 4: Postprocessing effects will be added here */}
        </Suspense>
      </Canvas>

      {/* Phase 5: UI overlays will be added here */}
      {/* Phase 6: Letter component will be added here */}
    </div>
  );
}

export default App;
