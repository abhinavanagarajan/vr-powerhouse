"use client"

import { useRef, useState, useCallback, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { DeviceOrientationControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { TargetObject } from './TargetObject';
import { GameUI } from './GameUI';

// Tree component
function Tree({ position, scale = 1 }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Tree trunk */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 2, 8]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      
      {/* Tree foliage - multiple spheres for natural look */}
      <mesh position={[0, 2.5, 0]}>
        <sphereGeometry args={[1.2, 12, 8]} />
        <meshLambertMaterial color="#228B22" />
      </mesh>
      <mesh position={[0.3, 3, 0.3]}>
        <sphereGeometry args={[0.8, 10, 6]} />
        <meshLambertMaterial color="#32CD32" />
      </mesh>
      <mesh position={[-0.4, 2.8, -0.2]}>
        <sphereGeometry args={[0.9, 10, 6]} />
        <meshLambertMaterial color="#228B22" />
      </mesh>
    </group>
  );
}

// Grass patch component
function GrassPatch({ position }) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[2, 2]} />
      <meshLambertMaterial color="#7CFC00" transparent opacity={0.8} />
    </mesh>
  );
}

// Cloud component
function Cloud({ position, scale = 1 }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1, 16, 8]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.9} />
      </mesh>
      <mesh position={[0.8, 0, 0]}>
        <sphereGeometry args={[0.8, 16, 8]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.9} />
      </mesh>
      <mesh position={[-0.8, 0, 0]}>
        <sphereGeometry args={[0.8, 16, 8]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.7, 16, 8]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

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

  // Tree positions around the player
  const treePositions = useMemo(() => [
    [8, 0, 8], [12, 0, 5], [10, 0, -8], [6, 0, -12],
    [-8, 0, 8], [-12, 0, 5], [-10, 0, -8], [-6, 0, -12],
    [15, 0, 0], [-15, 0, 0], [0, 0, 15], [0, 0, -15],
    [8, 0, -5], [-8, 0, -5], [5, 0, 10], [-5, 0, 10]
  ], []);

  // Grass patch positions
  const grassPositions = useMemo(() => [
    [3, 0.01, 3], [5, 0.01, -2], [-4, 0.01, 4], [-6, 0.01, -3],
    [7, 0.01, 1], [-3, 0.01, -6], [2, 0.01, -4], [-5, 0.01, 2],
    [9, 0.01, -7], [-8, 0.01, 6], [4, 0.01, 8], [-7, 0.01, -8]
  ], []);

  // Cloud positions
  const cloudPositions = useMemo(() => [
    [20, 25, 20], [-25, 30, 15], [30, 35, -20], [-20, 28, -25],
    [15, 32, 25], [-30, 27, -10], [25, 33, 10], [-15, 29, 30]
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
      
      {/* Natural lighting setup */}
      <ambientLight intensity={0.6} color="#87CEEB" />
      <directionalLight 
        position={[10, 20, 5]} 
        intensity={1.2}
        color="#FFF8DC"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* Clear sky environment */}
      <Environment preset="park" />
      
      {/* Sky gradient background */}
      <mesh>
        <sphereGeometry args={[100, 32, 16]} />
        <meshBasicMaterial 
          color="#87CEEB" 
          side={THREE.BackSide}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Cemented floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshLambertMaterial color="#C0C0C0" />
      </mesh>
      
      {/* Concrete texture pattern on floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[48, 48, 24, 24]} />
        <meshBasicMaterial 
          color="#B8B8B8" 
          transparent 
          opacity={0.3}
          wireframe
        />
      </mesh>
      
      {/* Trees surrounding the area */}
      {treePositions.map((pos, index) => (
        <Tree 
          key={`tree-${index}`} 
          position={pos} 
          scale={0.8 + Math.random() * 0.4}
        />
      ))}
      
      {/* Grass patches for natural feel */}
      {grassPositions.map((pos, index) => (
        <GrassPatch key={`grass-${index}`} position={pos} />
      ))}
      
      {/* Clouds in the sky */}
      {cloudPositions.map((pos, index) => (
        <Cloud 
          key={`cloud-${index}`} 
          position={pos} 
          scale={2 + Math.random() * 1.5}
        />
      ))}
      
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
            color={index === currentTarget ? "#FF6B6B" : "#4ECDC4"} 
            transparent 
            opacity={index === currentTarget ? 1 : 0.6}
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
      
      {/* Decorative elements */}
      {/* Sun in the sky */}
      <mesh position={[30, 40, -30]}>
        <sphereGeometry args={[3, 16, 16]} />
        <meshBasicMaterial color="#FFD700" />
      </mesh>
      
      {/* Birds (simple triangular shapes) */}
      <group position={[15, 15, 10]}>
        <mesh>
          <coneGeometry args={[0.1, 0.3, 3]} />
          <meshBasicMaterial color="#333333" />
        </mesh>
      </group>
      <group position={[20, 18, 15]}>
        <mesh>
          <coneGeometry args={[0.1, 0.3, 3]} />
          <meshBasicMaterial color="#333333" />
        </mesh>
      </group>
    </>
  );
}