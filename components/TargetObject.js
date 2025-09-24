"use client"

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function TargetObject({ 
  position = [0, 0, -5], 
  proximity = 0, 
  isActive = true, 
  targetSize = 1,
  onHit 
}) {
  const meshRef = useRef();
  const particlesRef = useRef();

  // Create particle system for visual effects
  const particles = useMemo(() => {
    const particleCount = 50;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 4;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
      
      colors[i * 3] = Math.random();
      colors[i * 3 + 1] = Math.random();
      colors[i * 3 + 2] = 1;
    }
    
    return { positions, colors };
  }, []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Rotate target object
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.3;
      
      // Scale based on proximity
      const scale = 1 + proximity * 0.3;
      meshRef.current.scale.setScalar(scale);
      
      // Change color based on proximity
      const hue = proximity * 0.3; // Green to red
      meshRef.current.material.color.setHSL(hue, 0.8, 0.6);
      
      // Pulse effect when close
      if (proximity > 0.8) {
        const pulse = Math.sin(state.clock.elapsedTime * 10) * 0.1 + 1;
        meshRef.current.scale.setScalar(scale * pulse);
      }
    }

    // Animate particles
    if (particlesRef.current && isActive) {
      particlesRef.current.rotation.y += delta * 0.2;
      
      // Update particle positions
      const positions = particlesRef.current.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(state.clock.elapsedTime + i) * 0.01;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group position={position}>
      {/* Main target sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[targetSize, 32, 32]} />
        <meshPhysicalMaterial 
          color="#00ff88"
          emissive="#004422"
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Outer ring */}
      <mesh>
        <ringGeometry args={[targetSize * 1.5, targetSize * 1.8, 32]} />
        <meshBasicMaterial 
          color="#44ffaa" 
          transparent 
          opacity={proximity * 0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Particle system */}
      {isActive && (
        <points ref={particlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={particles.positions.length / 3}
              array={particles.positions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={particles.colors.length / 3}
              array={particles.colors}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial 
            size={0.05} 
            vertexColors 
            transparent 
            opacity={0.6}
          />
        </points>
      )}
    </group>
  );
}