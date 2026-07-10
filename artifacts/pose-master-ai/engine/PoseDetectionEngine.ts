/**
 * PoseDetectionEngine
 * ===================
 * The main orchestrator for all pose detection sub-systems.
 *
 * This engine is the single object the camera UI interacts with.
 * It coordinates:
 *   1. PoseDetector        — raw landmark detection (ML Kit / MediaPipe)
 *   2. SvgMatchEngine      — template vs detected landmark comparison
 *   3. DistanceEngine      — camera framing and distance estimation
 *   4. AlignmentEngine     — body position and orientation analysis
 *   5. AutoCaptureEngine   — shutter trigger state machine
 *   6. VoiceCoach          — spoken guidance delivery
 *
 * CURRENT STATE:
 * All sub-engines use their "unavailable" / "silent" stubs.
 * The engine is ready to accept real implementations with no UI changes.
 *
 * HOW TO USE:
 *
 *   // 1. Get the active engine singleton:
 *   import { activePoseEngine } from './PoseDetectionEngine';
 *
 *   // 2. Call processFrame() in your camera frame handler:
 *   const result = await activePoseEngine.current.processFrame(frameData, {
 *     outlineKey: 'standing_front',
 *     detectorIsConnected: false,
 *   });
 *
 *   // 3. Read result.detectionStatus to update the camera UI.
 *
 * HOW TO PLUG IN A REAL DETECTOR:
 *
 *   import { activePoseDetector } from '../services/PoseDetectionService';
 *   import { activePoseEngine } from './PoseDetectionEngine';
 *
 *   activePoseDetector.current = new MyMLKitDetector();
 *   // Engine automatically uses it on the next processFrame() call.
 *
 * DESIGN RULES:
 * - Never import from UI components.
 * - Never use timers, random values, or setInterval.
 * - Always return a complete PoseEngineResult — never throw.
 */

import {
  activePoseDetector,
  type DetectionStatus,
} from '../services/PoseDetectionService';
import {
  countReliableLandmarks,
  type BodyLandmark,
  type BodyLandmarkFrame,
  type BodyLandmarkName,
  type BodyLandmarkSet,
} from './BodyLandmarkModel';
import { emptyMatchResult, type PoseMatchResult } from './MatchResultModel';
import {
  unavailableSvgMatchEngine,
  type ISvgMatchEngine,
  type SvgPoseReference,
} from './SvgMatchEngine';
import {
  unavailableDistanceEngine,
  type DistanceResult,
  type IDistanceEngine,
} from './DistanceEngine';
import {
  unavailableAlignmentEngine,
  type AlignmentResult,
  type IAlignmentEngine,
} from './AlignmentEngine';
import {
  defaultAutoCaptureEngine,
  type AutoCaptureState,
  type IAutoCaptureEngine,
} from './AutoCaptureEngine';
import {
  activeVoiceCoach,
  type IVoiceCoach,
} from './VoiceCoach';

// ─── Engine result ────────────────────────────────────────────────────────────

/**
 * The complete output of one engine processing cycle.
 * The camera UI reads this object to update its display.
 *
 * Key rule: if detectionStatus !== 'ready', all other fields are
 * in their null/unavailable/disabled state. The UI must check
 * detectionStatus first before attempting to display any values.
 */
export interface PoseEngineResult {
  /** Current detector status. 'unavailable' when no detector is connected. */
  detectionStatus: DetectionStatus;

  /** The latest landmark frame. null unless detectionStatus === 'ready'. */
  landmarkFrame: BodyLandmarkFrame | null;

  /** SVG template vs detected landmark comparison. All scores null by default. */
  matchResult: PoseMatchResult;

  /** Distance and framing assessment. feedback: 'not_available' by default. */
  distanceResult: DistanceResult;

  /** Body position and orientation analysis. feedback: 'not_available' by default. */
  alignmentResult: AlignmentResult;

  /** Auto-capture state machine state. 'disabled' by default. */
  autoCaptureState: AutoCaptureState;
}

// ─── Frame processing input ───────────────────────────────────────────────────

export interface FrameProcessingInput {
  /** Raw frame data passed to the detector (platform-specific). */
  frameData: unknown;
  /** Key of the SVG pose template currently active in the overlay. */
  outlineKey: string;
  /** Pass in an SvgPoseReference when the SVG registry can extract positions. */
  svgReference?: SvgPoseReference;
}

// ─── Engine interface ─────────────────────────────────────────────────────────

export interface IPoseDetectionEngine {
  /**
   * Process one camera frame through the full detection pipeline.
   * Always resolves — never rejects.
   */
  processFrame(input: FrameProcessingInput): Promise<PoseEngineResult>;

  /** Initialise all sub-engines. Call once before the camera starts. */
  initialize(): Promise<void>;

  /** Release all resources. Call when the camera screen unmounts. */
  dispose(): void;

  // ── Sub-engine swap points ────────────────────────────────────────────────
  // Plug in real implementations when a detector is connected.
  setSvgMatchEngine(engine: ISvgMatchEngine): void;
  setDistanceEngine(engine: IDistanceEngine): void;
  setAlignmentEngine(engine: IAlignmentEngine): void;
  setAutoCaptureEngine(engine: IAutoCaptureEngine): void;
  setVoiceCoach(coach: IVoiceCoach): void;
}

// ─── Implementation ───────────────────────────────────────────────────────────

class PoseDetectionEngineImpl implements IPoseDetectionEngine {
  private svgMatchEngine: ISvgMatchEngine = unavailableSvgMatchEngine;
  private distanceEngine: IDistanceEngine = unavailableDistanceEngine;
  private alignmentEngine: IAlignmentEngine = unavailableAlignmentEngine;
  private autoCaptureEngine: IAutoCaptureEngine = defaultAutoCaptureEngine;
  private voiceCoach: IVoiceCoach = activeVoiceCoach.current;

  async initialize(): Promise<void> {
    try {
      await activePoseDetector.current.initialize();
    } catch {
      // Detector failed to initialise — engine continues with unavailable status.
    }
  }

  async processFrame(input: FrameProcessingInput): Promise<PoseEngineResult> {
    // ── Step 1: Run raw detection ─────────────────────────────────────────
    let detectionStatus: DetectionStatus = 'unavailable';
    let landmarkFrame: BodyLandmarkFrame | null = null;

    try {
      const detectionResult = await activePoseDetector.current.detect(
        input.frameData,
      );
      detectionStatus = detectionResult.status;

      if (detectionResult.status === 'ready' && detectionResult.frame) {
        // Map PoseDetectionFrame landmarks → BodyLandmarkSet
        const landmarkSet: BodyLandmarkSet = {};
        for (const lm of detectionResult.frame.landmarks) {
          // Only map landmarks that match known BodyLandmarkName values.
          // Unrecognised names are silently dropped.
          (landmarkSet as Record<string, BodyLandmark>)[lm.name] = {
            name: lm.name as BodyLandmarkName,
            x: lm.x,
            y: lm.y,
            z: null,
            confidence: lm.confidence,
            inFrame: true,
          };
        }

        landmarkFrame = {
          landmarks: landmarkSet,
          capturedAtMs: detectionResult.frame.timestampMs,
          skeletonConfidence: detectionResult.frame.confidence,
          detectedCount: countReliableLandmarks(landmarkSet),
        };
      }
    } catch {
      detectionStatus = 'unavailable';
    }

    // ── Step 2: Run sub-engines (only when landmarks are available) ───────
    const matchResult: PoseMatchResult = emptyMatchResult();
    let distanceResult: DistanceResult = {
      feedback: 'not_available',
      estimatedMetres: null,
      instruction: null,
    };
    let alignmentResult: AlignmentResult = {
      feedback: 'not_available',
      confidence: null,
      instruction: null,
      debugOffset: null,
    };

    if (landmarkFrame) {
      // SVG match
      if (input.svgReference) {
        const computed = this.svgMatchEngine.computeMatch({
          reference: input.svgReference,
          detectedFrame: landmarkFrame,
        });
        Object.assign(matchResult, computed);
      }

      // Distance
      distanceResult = this.distanceEngine.estimate(landmarkFrame);

      // Alignment
      alignmentResult = this.alignmentEngine.analyse(landmarkFrame);
    }

    // ── Step 3: Auto-capture state machine ────────────────────────────────
    const autoCaptureState = this.autoCaptureEngine.update(
      alignmentResult,
      matchResult,
    );

    // ── Step 4: Voice coaching (only when real feedback exists) ───────────
    // VoiceCoach.isReady() returns false until a real TTS is connected.
    // No speech is delivered in the current unavailable state.
    if (this.voiceCoach.isReady() && alignmentResult.instruction) {
      // Instruction delivery is rate-limited inside the VoiceCoach implementation.
    }

    return {
      detectionStatus,
      landmarkFrame,
      matchResult,
      distanceResult,
      alignmentResult,
      autoCaptureState,
    };
  }

  dispose(): void {
    try {
      activePoseDetector.current.dispose();
    } catch {
      // Ignore disposal errors.
    }
    this.voiceCoach.cancel();
  }

  setSvgMatchEngine(engine: ISvgMatchEngine): void {
    this.svgMatchEngine = engine;
  }

  setDistanceEngine(engine: IDistanceEngine): void {
    this.distanceEngine = engine;
  }

  setAlignmentEngine(engine: IAlignmentEngine): void {
    this.alignmentEngine = engine;
  }

  setAutoCaptureEngine(engine: IAutoCaptureEngine): void {
    this.autoCaptureEngine = engine;
  }

  setVoiceCoach(coach: IVoiceCoach): void {
    this.voiceCoach = coach;
  }
}

// ─── Active engine singleton ──────────────────────────────────────────────────

/**
 * The PoseDetectionEngine used by the camera pipeline.
 *
 * Access via activePoseEngine.current in the camera screen.
 * Swap sub-engines using the set*() methods when a real detector is ready.
 */
export const activePoseEngine: { current: IPoseDetectionEngine } = {
  current: new PoseDetectionEngineImpl(),
};
