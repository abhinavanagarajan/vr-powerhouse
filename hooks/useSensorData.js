"use client"

import { useState, useEffect, useCallback } from 'react';

export function useSensorData() {
  const [orientation, setOrientation] = useState({
    alpha: 0, // Z axis (0-360)
    beta: 0,  // X axis (-180 to 180)
    gamma: 0  // Y axis (-90 to 90)
  });
  
  const [motion, setMotion] = useState({
    acceleration: { x: 0, y: 0, z: 0 },
    accelerationIncludingGravity: { x: 0, y: 0, z: 0 },
    rotationRate: { alpha: 0, beta: 0, gamma: 0 }
  });
  
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  const requestPermission = useCallback(async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && DeviceOrientationEvent.requestPermission) {
      // iOS 13+ permission request
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === 'granted') {
          setPermissionGranted(true);
          return true;
        }
      } catch (error) {
        console.error('Error requesting device orientation permission:', error);
      }
    } else {
      // Android or older iOS
      setPermissionGranted(true);
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    const checkSupport = () => {
      const hasOrientation = 'DeviceOrientationEvent' in window;
      const hasMotion = 'DeviceMotionEvent' in window;
      setIsSupported(hasOrientation && hasMotion);
    };

    checkSupport();
  }, []);

  useEffect(() => {
    if (!isSupported || !permissionGranted) return;

    const handleOrientation = (event) => {
      setOrientation({
        alpha: event.alpha || 0,
        beta: event.beta || 0,
        gamma: event.gamma || 0
      });
    };

    const handleMotion = (event) => {
      setMotion({
        acceleration: {
          x: event.acceleration?.x || 0,
          y: event.acceleration?.y || 0,
          z: event.acceleration?.z || 0
        },
        accelerationIncludingGravity: {
          x: event.accelerationIncludingGravity?.x || 0,
          y: event.accelerationIncludingGravity?.y || 0,
          z: event.accelerationIncludingGravity?.z || 0
        },
        rotationRate: {
          alpha: event.rotationRate?.alpha || 0,
          beta: event.rotationRate?.beta || 0,
          gamma: event.rotationRate?.gamma || 0
        }
      });
    };

    window.addEventListener('deviceorientation', handleOrientation);
    window.addEventListener('devicemotion', handleMotion);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [isSupported, permissionGranted]);

  return {
    orientation,
    motion,
    permissionGranted,
    isSupported,
    requestPermission
  };
}