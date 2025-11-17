// src/components/3d/PerformanceMonitor.tsx
// Development performance monitor displaying FPS using requestAnimationFrame (standalone, no R3F hooks)

import { useEffect, useState } from 'react';
import { FPSTracker } from '@/utils/performance';

interface PerformanceStats {
  fps: number;
}

export function PerformanceMonitor() {
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 60,
  });
  const [fpsTracker] = useState(() => new FPSTracker());

  useEffect(() => {
    if (!import.meta.env.DEV) {
      return;
    }

    let animationFrameId: number;
    let lastUpdate = 0;

    const animate = (time: number) => {
      const currentFps = fpsTracker.update();

      if (time - lastUpdate > 500) {
        setStats({
          fps: currentFps,
        });
        lastUpdate = time;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      fpsTracker.reset();
    };
  }, [fpsTracker]);

  if (!import.meta.env.DEV) {
    return null;
  }

  const getFpsColor = (fps: number): string => {
    if (fps >= 55) return '#00ff00';
    if (fps >= 45) return '#ffff00';
    return '#ff0000';
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        padding: '12px 16px',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        color: '#ffffff',
        fontFamily: 'monospace',
        fontSize: '12px',
        borderRadius: '4px',
        zIndex: 1000,
        pointerEvents: 'none',
        userSelect: 'none',
        lineHeight: '1.6',
      }}
    >
      <div style={{ color: getFpsColor(stats.fps), fontWeight: 'bold' }}>FPS: {stats.fps}</div>
    </div>
  );
}
