// src/components/ui/SceneFadeIn.tsx
// Scene fade-in overlay for premium initial load experience

import { useEffect, useState } from 'react';

interface SceneFadeInProps {
  duration?: number;
  delay?: number;
}

export function SceneFadeIn({ duration = 1000, delay = 300 }: SceneFadeInProps) {
  const [opacity, setOpacity] = useState(1);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const delayTimer = setTimeout(() => {
      setOpacity(0);
      const hideTimer = setTimeout(() => {
        setVisible(false);
      }, duration);
      return () => clearTimeout(hideTimer);
    }, delay);

    return () => clearTimeout(delayTimer);
  }, [delay, duration]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#000000',
        opacity,
        transition: `opacity ${duration}ms ease-out`,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
}
