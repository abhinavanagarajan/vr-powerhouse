"use client"

import { useState, useEffect } from 'react';
import { VRCanvas } from '@/components/VRCanvas';
import { GameScene } from '@/components/GameScene';
import { useSensorData } from '@/hooks/useSensorData';
import { useAudioFeedback } from '@/hooks/useAudioFeedback';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, Volume2, Trophy, Activity } from 'lucide-react';

export default function VRPhysiotherapyGame() {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [gameStats, setGameStats] = useState({ score: 0, completedSessions: 0 });
  const { 
    orientation, 
    motion, 
    permissionGranted, 
    isSupported, 
    requestPermission 
  } = useSensorData();
  const audioFeedback = useAudioFeedback();

  useEffect(() => {
    // Lock screen orientation to landscape for better VR experience
    if (screen.orientation && (screen.orientation as any).lock) {
      (screen.orientation as any).lock('landscape').catch(console.warn);
    }    
  }, []);

  const handleStartGame = async () => {
    // Request sensor permissions
    const permissionGranted = await requestPermission();
    if (permissionGranted) {
      // Start audio context
      await audioFeedback.startAudio();
      setIsGameStarted(true);
    }
  };

  const handleScoreChange = (newScore: number) => {
    setGameStats(prev => ({ ...prev, score: newScore }));
  };

  const handleRepetitionComplete = (reps: any) => {
    console.log(`Repetition ${reps} completed`);
  };

  const handleGameComplete = (finalScore: any) => {
    setGameStats(prev => ({
      score: finalScore,
      completedSessions: prev.completedSessions + 1
    }));
    
    // Return to start screen after completion
    setTimeout(() => {
      setIsGameStarted(false);
    }, 5000);
  };

  if (!isSupported) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Smartphone className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <CardTitle className="text-red-600">Device Not Supported</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600">
              This application requires a mobile device with gyroscope and accelerometer sensors.
              Please try again on a compatible mobile device.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isGameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl space-y-6">
          
          {/* Main welcome card */}
          <Card className="text-center">
            <CardHeader>
              <Activity className="w-16 h-16 mx-auto mb-4 text-blue-500" />
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                VR Physiotherapy Game
              </CardTitle>
              <CardDescription className="text-lg">
                Immersive 3D exercises designed for Google Cardboard VR
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Smartphone className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <h3 className="font-semibold">Motion Tracking</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Uses device sensors for precise movement detection
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Volume2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <h3 className="font-semibold">Audio Feedback</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Real-time sound cues guide your movements
                  </p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Trophy className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                  <h3 className="font-semibold">Gamified Progress</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Score points and track your improvement
                  </p>
                </div>
              </div>
              
              {gameStats.completedSessions > 0 && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                    Your Progress
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">{gameStats.score}</div>
                      <div className="text-sm">Best Score</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">{gameStats.completedSessions}</div>
                      <div className="text-sm">Sessions</div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Setup Instructions:</h3>
                <div className="text-left space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
                    <span>Place your phone in a Google Cardboard VR headset</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
                    <span>Allow sensor permissions when prompted</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
                    <span>Follow the 3D targets with your head movements</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">4</span>
                    <span>Complete the exercise patterns for points</span>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={handleStartGame}
                size="lg"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                disabled={!isSupported || !audioFeedback.isAudioReady}
              >
                {audioFeedback.isAudioReady ? 'Start VR Experience' : 'Loading Audio...'}
              </Button>
              
              {!permissionGranted && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  ⚠️ Sensor permissions required for the full VR experience
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* VR Game Canvas */}
      <VRCanvas>
        <GameScene
          orientation={orientation}
          motion={motion}
          onScoreChange={handleScoreChange}
          onRepetitionComplete={handleRepetitionComplete}
          onGameComplete={handleGameComplete}
          audioFeedback={audioFeedback}
        />
      </VRCanvas>
      
      {/* Emergency exit button (small, unobtrusive) */}
      <Button
        onClick={() => setIsGameStarted(false)}
        variant="outline"
        size="sm"
        className="fixed top-4 right-4 z-50 opacity-50 hover:opacity-100"
      >
        Exit VR
      </Button>
    </>
  );
}