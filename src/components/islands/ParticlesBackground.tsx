import React, { useEffect, useRef, useState } from 'react';
import { ParticlesSwarm } from '../../lib/three/ParticlesSwarm';

export const ParticlesBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const swarmRef = useRef<ParticlesSwarm | null>(null);
  const [useFallback, setUseFallback] = useState(false);

  // WebGL Availability Check
  const isWebGLAvailable = () => {
    try {
      const canvas = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    // 1. Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setUseFallback(true);
      return;
    }

    // 2. Check WebGL
    if (!isWebGLAvailable()) {
      setUseFallback(true);
      return;
    }

    // 3. Initialize Swarm dynamically so Three.js is code-split out of island chunk
    if (containerRef.current) {
      let isMounted = true;
      import('../../lib/three/ParticlesSwarm')
        .then(({ ParticlesSwarm }) => {
          if (isMounted && containerRef.current) {
            try {
              const swarm = new ParticlesSwarm(containerRef.current);
              swarmRef.current = swarm;
            } catch (err) {
              console.warn('Failed to initialize particle swarm:', err);
              setUseFallback(true);
            }
          }
        })
        .catch((err) => {
          console.warn('Failed to load particle swarm module:', err);
          if (isMounted) setUseFallback(true);
        });

      return () => {
        isMounted = false;
        if (swarmRef.current) {
          swarmRef.current.dispose();
          swarmRef.current = null;
        }
      };
    }

    // Cleanup
    return () => {
      if (swarmRef.current) {
        swarmRef.current.dispose();
        swarmRef.current = null;
      }
    };
  }, []);

  if (useFallback) {
    return (
      <div 
        className="fixed inset-0 w-full h-full transition-opacity duration-500" 
        style={{
          zIndex: -1,
          background: 'linear-gradient(135deg, #f5f5f5 0%, #fafafa 50%, #f0efed 100%)',
          pointerEvents: 'none',
          opacity: 'var(--bg-particles-opacity, 0.95)'
        }}
      />
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 w-full h-full overflow-hidden bg-[#f5f5f5] transition-opacity duration-500"
      style={{ 
        zIndex: -1, 
        pointerEvents: 'none',
        opacity: 'var(--bg-particles-opacity, 0.95)'
      }}
    />
  );
};

export default ParticlesBackground;
