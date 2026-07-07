import { create } from 'zustand';

interface GuideState {
  isActive: boolean;
  currentStep: number;
  steps: string[];
  poseTitle: string;
  activateGuide: (steps: string[], poseTitle: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  deactivateGuide: () => void;
}

export const useGuideStore = create<GuideState>((set, get) => ({
  isActive: false,
  currentStep: 0,
  steps: [],
  poseTitle: '',

  activateGuide: (steps, poseTitle) => {
    set({ isActive: true, currentStep: 0, steps, poseTitle });
  },

  nextStep: () => {
    const { currentStep, steps } = get();
    if (currentStep < steps.length - 1) {
      set({ currentStep: currentStep + 1 });
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  },

  deactivateGuide: () => {
    set({ isActive: false, currentStep: 0, steps: [], poseTitle: '' });
  },
}));
