"use client"

import { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';

export function useAudioFeedback() {
  const synthRef = useRef(null);
  const [isAudioReady, setIsAudioReady] = useState(false);

  useEffect(() => {
    const initAudio = async () => {
      try {
        // Create a simple synthesizer
        synthRef.current = new Tone.Synth({
          oscillator: {
            type: "sine"
          },
          envelope: {
            attack: 0.1,
            decay: 0.2,
            sustain: 0.5,
            release: 0.8
          }
        }).toDestination();

        setIsAudioReady(true);
      } catch (error) {
        console.error('Error initializing audio:', error);
      }
    };

    initAudio();

    return () => {
      if (synthRef.current) {
        synthRef.current.dispose();
      }
    };
  }, []);

  const startAudio = async () => {
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
  };

  const playProximityTone = (proximity) => {
    if (!isAudioReady || !synthRef.current) return;
    
    // Map proximity (0-1) to frequency (200-800 Hz)
    const frequency = 200 + (proximity * 600);
    const volume = -20 + (proximity * 20); // -20dB to 0dB
    
    synthRef.current.volume.value = volume;
    synthRef.current.triggerAttackRelease(frequency, "8n");
  };

  const playSuccessSound = () => {
    if (!isAudioReady || !synthRef.current) return;
    
    // Play ascending chord
    synthRef.current.triggerAttackRelease("C5", "4n");
    setTimeout(() => synthRef.current.triggerAttackRelease("E5", "4n"), 150);
    setTimeout(() => synthRef.current.triggerAttackRelease("G5", "4n"), 300);
  };

  const playCompletionSound = () => {
    if (!isAudioReady || !synthRef.current) return;
    
    // Play victory fanfare
    const notes = ["C5", "D5", "E5", "F5", "G5"];
    notes.forEach((note, index) => {
      setTimeout(() => synthRef.current.triggerAttackRelease(note, "8n"), index * 100);
    });
  };

  return {
    isAudioReady,
    startAudio,
    playProximityTone,
    playSuccessSound,
    playCompletionSound
  };
}