"use client"

import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

export function GameUI({ 
  score = 0, 
  repetitions = 0, 
  targetReps = 10, 
  accuracy = 0,
  gameState = 'playing' // 'waiting', 'playing', 'completed'
}) {
  const textRef = useRef();

  useFrame((state) => {
    if (textRef.current) {
      // Subtle floating animation
      textRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <group>
      {/* Score display */}
      <Text
        ref={textRef}
        position={[-3, 3, -5]}
        fontSize={0.5}
        color="#00ff88"
        anchorX="left"
        anchorY="middle"
        font="/fonts/Inter-Bold.woff"
      >
        Score: {score}
      </Text>
      
      {/* Repetitions counter */}
      <Text
        position={[0, 3, -5]}
        fontSize={0.4}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        Reps: {repetitions}/{targetReps}
      </Text>
      
      {/* Accuracy indicator */}
      <Text
        position={[3, 3, -5]}
        fontSize={0.4}
        color={accuracy > 0.8 ? "#00ff88" : accuracy > 0.5 ? "#ffaa00" : "#ff4444"}
        anchorX="right"
        anchorY="middle"
      >
        Accuracy: {Math.round(accuracy * 100)}%
      </Text>
      
      {/* Game state messages */}
      {gameState === 'waiting' && (
        <Text
          position={[0, 0, -4]}
          fontSize={0.6}
          color="#ffff00"
          anchorX="center"
          anchorY="middle"
        >
          Shake phone to start!
        </Text>
      )}
      
      {gameState === 'completed' && (
        <group>
          <Text
            position={[0, 0, -4]}
            fontSize={0.8}
            color="#00ff88"
            anchorX="center"
            anchorY="middle"
          >
            Exercise Complete!
          </Text>
          <Text
            position={[0, -1, -4]}
            fontSize={0.4}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            Final Score: {score}
          </Text>
        </group>
      )}
      
      {/* Progress bar */}
      <group position={[0, -3, -5]}>
        {/* Background bar */}
        <mesh>
          <boxGeometry args={[4, 0.2, 0.1]} />
          <meshBasicMaterial color="#333333" />
        </mesh>
        
        {/* Progress fill */}
        <mesh position={[(-4 + (repetitions / targetReps) * 4) / 2, 0, 0.01]}>
          <boxGeometry args={[(repetitions / targetReps) * 4, 0.2, 0.1]} />
          <meshBasicMaterial color="#00ff88" />
        </mesh>
      </group>
    </group>
  );
}