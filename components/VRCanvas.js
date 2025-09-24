"use client"

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';

export function VRCanvas({ children, ...props }) {
  return (
    <Canvas
      camera={{ 
        position: [0, 0, 0],
        fov: 75,
        near: 0.1,
        far: 1000
      }}
      gl={{ 
        antialias: true,
        alpha: false,
        powerPreference: "high-performance"
      }}
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%',
        background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)'
      }}
      onCreated={({ gl }) => {
        // Enable VR-specific settings
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = 5; // PCF shadows
      }}
      {...props}
    >
      <Suspense fallback={null}>
        {children}
      </Suspense>
    </Canvas>
  );
}