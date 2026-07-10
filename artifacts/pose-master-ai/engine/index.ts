/**
 * PoseDetectionEngine — Public API
 * =================================
 * Import everything you need from this single entry point.
 *
 * QUICK START (camera screen):
 *
 *   import { activePoseEngine } from '../engine';
 *
 *   // In your camera frame handler:
 *   const result = await activePoseEngine.current.processFrame({
 *     frameData,
 *     outlineKey: activePose.svgOutline,
 *   });
 *
 *   // Check status before using any result values:
 *   if (result.detectionStatus !== 'ready') {
 *     // Show "Pose Detection Not Available" in the camera UI
 *   }
 *
 * PLUG IN A REAL DETECTOR:
 *
 *   import { activePoseDetector } from '../services/PoseDetectionService';
 *   activePoseDetector.current = new MyMLKitDetector();
 *   // Engine picks it up automatically — no UI changes needed.
 */

// ── Main engine ───────────────────────────────────────────────────────────────
export { activePoseEngine } from './PoseDetectionEngine';
export type {
  IPoseDetectionEngine,
  PoseEngineResult,
  FrameProcessingInput,
} from './PoseDetectionEngine';

// ── Body landmark model ───────────────────────────────────────────────────────
export type {
  BodyLandmarkName,
  FutureLandmarkName,
  BodyLandmark,
  BodyLandmarkSet,
  BodyLandmarkFrame,
} from './BodyLandmarkModel';
export {
  ALL_BODY_LANDMARK_NAMES,
  isLandmarkReliable,
  countReliableLandmarks,
} from './BodyLandmarkModel';

// ── Match result model ────────────────────────────────────────────────────────
export type {
  RegionScore,
  CameraMetrics,
  MissingBodyPart,
  PoseMatchResult,
} from './MatchResultModel';
export { emptyMatchResult } from './MatchResultModel';

// ── SVG match engine ──────────────────────────────────────────────────────────
export type {
  SvgLandmarkPosition,
  SvgPoseReference,
  SvgMatchInput,
  ISvgMatchEngine,
} from './SvgMatchEngine';
export { unavailableSvgMatchEngine } from './SvgMatchEngine';

// ── Distance engine ───────────────────────────────────────────────────────────
export type {
  DistanceFeedback,
  DistanceResult,
  RecommendedDistanceRange,
  IDistanceEngine,
} from './DistanceEngine';
export { DISTANCE_INSTRUCTIONS, unavailableDistanceEngine } from './DistanceEngine';

// ── Alignment engine ──────────────────────────────────────────────────────────
export type {
  AlignmentFeedback,
  AlignmentResult,
  IAlignmentEngine,
} from './AlignmentEngine';
export { ALIGNMENT_INSTRUCTIONS, unavailableAlignmentEngine } from './AlignmentEngine';

// ── Auto-capture engine ───────────────────────────────────────────────────────
export type {
  AutoCaptureState,
  AutoCaptureConfig,
  IAutoCaptureEngine,
} from './AutoCaptureEngine';
export {
  DEFAULT_AUTO_CAPTURE_CONFIG,
  DisabledAutoCaptureEngine,
  defaultAutoCaptureEngine,
} from './AutoCaptureEngine';

// ── Voice coach ───────────────────────────────────────────────────────────────
export type {
  VoiceInstruction,
  IVoiceCoach,
} from './VoiceCoach';
export {
  VOICE_SCRIPTS,
  SilentVoiceCoach,
  activeVoiceCoach,
} from './VoiceCoach';
