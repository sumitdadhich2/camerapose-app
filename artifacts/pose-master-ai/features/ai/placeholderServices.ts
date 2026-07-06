import {
  AlignmentResult,
  BodyDetectionService,
  DistanceDetectionService,
  PoseAlignmentService,
  SkeletonDetectionService,
  SkeletonFrame,
  AutoCaptureService,
  VoiceGuidanceService,
} from './types';

/**
 * Placeholder implementations of the future AI services.
 *
 * These exist so the architecture (interfaces + call shape) is locked in
 * ahead of time. They intentionally do nothing real yet — every method
 * resolves instantly with a neutral/no-op result. Swap these out for real
 * on-device ML implementations later without touching call sites.
 */

export const placeholderPoseAlignmentService: PoseAlignmentService = {
  async analyzeFrame(): Promise<AlignmentResult> {
    return { status: 'yellow', message: 'Pose alignment AI not implemented yet', confidence: 0 };
  },
};

export const placeholderBodyDetectionService: BodyDetectionService = {
  async detectBody() {
    return { detected: false };
  },
};

export const placeholderSkeletonDetectionService: SkeletonDetectionService = {
  async detectSkeleton(): Promise<SkeletonFrame | null> {
    return null;
  },
};

export const placeholderDistanceDetectionService: DistanceDetectionService = {
  async estimateDistance() {
    return { meters: 0, recommendation: 'good' as const };
  },
};

export const placeholderAutoCaptureService: AutoCaptureService = {
  shouldCapture() {
    return false;
  },
};

export const placeholderVoiceGuidanceService: VoiceGuidanceService = {
  async speak() {
    // no-op — voice guidance is not implemented yet
  },
  cancel() {
    // no-op
  },
};
