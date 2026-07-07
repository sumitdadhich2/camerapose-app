/**
 * useGuideDemo
 * ============
 * Drives the Smart Guide Panel with demo data cycling every ~4 seconds.
 * When real AI (MediaPipe / ML Kit) is available, replace this hook's
 * output with the PoseAlignmentEngine + DistanceEngine results and the
 * UI will update automatically — no component changes required.
 */

import { useState, useEffect, useRef } from 'react';
import { GuideState } from '../features/ai/interfaces';

const DEMO_SCENES: GuideState[] = [
  {
    overallStatus: 'waiting',
    instruction: 'Position yourself in the frame',
    currentStep: 1,
    totalSteps: 4,
    distanceStatus: 'too-far',
    bodyAlignment: {
      head: 'waiting',
      leftHand: 'waiting',
      rightHand: 'waiting',
      body: 'waiting',
      leftLeg: 'waiting',
      rightLeg: 'waiting',
    },
  },
  {
    overallStatus: 'aligning',
    instruction: 'Move closer to the camera',
    currentStep: 1,
    totalSteps: 4,
    distanceStatus: 'too-far',
    bodyAlignment: {
      head: 'incorrect',
      leftHand: 'waiting',
      rightHand: 'waiting',
      body: 'incorrect',
      leftLeg: 'waiting',
      rightLeg: 'waiting',
    },
  },
  {
    overallStatus: 'aligning',
    instruction: 'Raise your right arm higher',
    currentStep: 2,
    totalSteps: 4,
    distanceStatus: 'perfect',
    bodyAlignment: {
      head: 'correct',
      leftHand: 'waiting',
      rightHand: 'incorrect',
      body: 'correct',
      leftLeg: 'incorrect',
      rightLeg: 'incorrect',
    },
  },
  {
    overallStatus: 'aligning',
    instruction: 'Turn your face slightly left',
    currentStep: 2,
    totalSteps: 4,
    distanceStatus: 'perfect',
    bodyAlignment: {
      head: 'incorrect',
      leftHand: 'correct',
      rightHand: 'correct',
      body: 'correct',
      leftLeg: 'correct',
      rightLeg: 'incorrect',
    },
  },
  {
    overallStatus: 'aligning',
    instruction: 'Move right hand to hip level',
    currentStep: 3,
    totalSteps: 4,
    distanceStatus: 'too-close',
    bodyAlignment: {
      head: 'correct',
      leftHand: 'correct',
      rightHand: 'incorrect',
      body: 'correct',
      leftLeg: 'correct',
      rightLeg: 'correct',
    },
  },
  {
    overallStatus: 'almost',
    instruction: 'Lower your left shoulder slightly',
    currentStep: 3,
    totalSteps: 4,
    distanceStatus: 'perfect',
    bodyAlignment: {
      head: 'correct',
      leftHand: 'incorrect',
      rightHand: 'correct',
      body: 'correct',
      leftLeg: 'correct',
      rightLeg: 'correct',
    },
  },
  {
    overallStatus: 'almost',
    instruction: 'Stand straight — almost there!',
    currentStep: 3,
    totalSteps: 4,
    distanceStatus: 'perfect',
    bodyAlignment: {
      head: 'correct',
      leftHand: 'correct',
      rightHand: 'correct',
      body: 'incorrect',
      leftLeg: 'correct',
      rightLeg: 'correct',
    },
  },
  {
    overallStatus: 'perfect',
    instruction: 'Perfect! Hold still',
    currentStep: 4,
    totalSteps: 4,
    distanceStatus: 'perfect',
    bodyAlignment: {
      head: 'correct',
      leftHand: 'correct',
      rightHand: 'correct',
      body: 'correct',
      leftLeg: 'correct',
      rightLeg: 'correct',
    },
  },
];

const SCENE_INTERVAL_MS = 4000;

export function useGuideDemo(): GuideState {
  const [sceneIndex, setSceneIndex] = useState(0);
  const indexRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      indexRef.current = (indexRef.current + 1) % DEMO_SCENES.length;
      setSceneIndex(indexRef.current);
    }, SCENE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return DEMO_SCENES[sceneIndex];
}
