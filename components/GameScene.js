"use client"

import { useRef, useState, useCallback, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { DeviceOrientationControls, Stars, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { TargetObject } from './TargetObject';
import { GameUI } from './GameUI';

export function GameScene({ 
  orientation, 
  motion, 
  onScoreChange, 
  onRepetitionComplete,
  onGameComplete,
  audioFeedback 
}) {
  const controlsRef = useRef();
  const [gameState, setGameState] = useState('waiting'); // 'waiting', 'playing', 'completed'
  const [score, setScore] = useState(0);
  const [repetitions, setRepetitions] = useState(0);
  const [currentTarget, setCurrentTarget] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  
  const targetReps = 10;
  const exercisePath = useMemo(() => [
    [0, 2, -5],
    [2, 0, -5],
    [0, -2, -5],
    [-2, 0, -5],
    [0, 2, -5]
  ], []);

  // Detect shake gesture
  const detectShake = useCallback((motion) => {
    const acceleration = motion.accelerationIncludingGravity;
    const totalAcceleration = Math.sqrt(
      acceleration.x ** 2 + acceleration.y ** 2 + acceleration.z ** 2
    );
    
    if (totalAcceleration > 15 && gameState === 'waiting') {
      setGameState('playing');
      setIsShaking(true);
      audioFeedback.playSuccessSound();
      setTimeout(() => setIsShaking(false), 500);
    }
  }, [gameState, audioFeedback]);

  // Calculate proximity to target
  const calculateProximity = useCallback((orientation, targetPosition) => {
    // Convert device orientation to 3D direction vector
    const alpha = (orientation.alpha || 0) * Math.PI / 180;
    const beta = (orientation.beta || 0) * Math.PI / 180;
    const gamma = (orientation.gamma || 0) * Math.PI / 180;
    
    // Create rotation matrix from device orientation
    const deviceDirection = new THREE.Vector3(0, 0, -1);
    const euler = new THREE.Euler(beta, alpha, -gamma, 'YXZ');
    deviceDirection.applyEuler(euler);
    
    // Calculate target direction from camera
    const targetDir = new THREE.Vector3(...targetPosition).normalize();
    
    // Calculate dot product (cosine of angle between vectors)
    const dotProduct = deviceDirection.dot(targetDir);
    
    // Convert to proximity (0 = far, 1 = exact match)
    return Math.max(0, (dotProduct + 1) / 2);
  }, []);

  useFrame((state, delta) => {
    if (gameState === 'waiting') {
      detectShake(motion);
      return;
    }

    if (gameState === 'playing') {
      const targetPosition = exercisePath[currentTarget];
      const proximity = calculateProximity(orientation, targetPosition);
      
      setAccuracy(proximity);
      
      // Play audio feedback based on proximity
      if (proximity > 0.3) {
        audioFeedback.playProximityTone(proximity);
      }
      
      // Check if target is reached
      if (proximity > 0.8) {
        const points = Math.round(proximity * 100);
        setScore(prev => prev + points);
        
        // Move to next target
        const nextTarget = (currentTarget + 1) % exercisePath.length;
        setCurrentTarget(nextTarget);
        
        // Check if exercise cycle is complete
        if (nextTarget === 0) {
          setRepetitions(prev => {
            const newReps = prev + 1;
            audioFeedback.playSuccessSound();
            onRepetitionComplete(newReps);
            
            if (newReps >= targetReps) {
              setGameState('completed');
              audioFeedback.playCompletionSound();
              onGameComplete(score);
            }
            
            return newReps;
          });
        }
      }
      
      onScoreChange(score);
    }
  });

  return (
    <>
      {/* Camera controls for VR */}
      <DeviceOrientationControls ref={controlsRef} />
      
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={1}
        intensity={0.5}
        castShadow
      />
      
      {/* Environment */}
      <Environment preset="night" />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} />
      
      {/* Target object */}
      {gameState === 'playing' && (
        <TargetObject
          position={exercisePath[currentTarget]}
          proximity={accuracy}
          isActive={true}
          targetSize={0.5}
        />
      )}
      
      {/* Exercise path visualization */}
      {gameState === 'playing' && exercisePath.map((position, index) => (
        <mesh key={index} position={position}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial 
            color={index === currentTarget ? "#ffff00" : "#666666"} 
            transparent 
            opacity={index === currentTarget ? 1 : 0.3}
          />
        </mesh>
      ))}
      
      {/* Game UI */}
      <GameUI
        score={score}
        repetitions={repetitions}
        targetReps={targetReps}
        accuracy={accuracy}
        gameState={gameState}
      />
      
      {/* Background grid for spatial reference */}
      <gridHelper args={[20, 20, "#333333", "#111111"]} position={[0, -5, 0]} />
    </>
  );
}