/**
 * PoseDetectionService
 * ====================
 * Single integration point for real pose detection engines.
 *
 * CURRENT STATE: No detector is connected. Every call returns
 * status: 'unavailable'. No simulation, no random values.
 *
 * HOW TO PLUG IN A REAL DETECTOR (ML Kit or MediaPipe):
 *
 *   // 1. Implement the PoseDetector interface:
 *   class MLKitDetector implements PoseDetector {
 *     async initialize() { ... }
 *     async detect(frameData) { ... }
 *     dispose() { ... }
 *   }
 *
 *   // 2. Set the active detector once at app startup:
 *   import { activePoseDetector } from './PoseDetectionService';
 *   activePoseDetector.current = new MLKitDetector();
 *
 * The camera UI reads activePoseDetector.current — no UI changes needed.
 */

// ─── Landmark types (MediaPipe / ML Kit compatible) ──────────────────────────

/**
 * A single body landmark returned by the detector.
 * Coordinate system matches MediaPipe Pose Landmarker:
 *   x, y are normalised (0–1); (0,0) = top-left corner.
 */
export interface PoseLandmark {
  /** COCO / MediaPipe name, e.g. "left_shoulder", "right_knee" */
  name: string;
  /** Normalised horizontal position (0 = left edge, 1 = right edge) */
  x: number;
  /** Normalised vertical position (0 = top edge, 1 = bottom edge) */
  y: number;
  /** Model confidence for this landmark (0 = uncertain, 1 = certain) */
  confidence: number;
}

/** A complete set of landmarks for one detected person in one frame. */
export interface PoseDetectionFrame {
  landmarks: PoseLandmark[];
  /** Unix timestamp in milliseconds when the frame was captured */
  timestampMs: number;
  /** Overall skeleton detection confidence (0–1) */
  confidence: number;
}

// ─── Detection status ─────────────────────────────────────────────────────────

export type DetectionStatus =
  | 'unavailable' // No detector implementation connected
  | 'no_person'   // Detector running but no body visible in frame
  | 'detecting'   // Body found; landmarks are being computed
  | 'ready';      // Full landmark set available in `frame`

export interface PoseDetectionResult {
  status: DetectionStatus;
  /** Populated only when status is 'ready'. Null otherwise — never fake. */
  frame: PoseDetectionFrame | null;
  /**
   * Short human-readable message for developer/diagnostic use.
   * Must NOT be displayed in the user-facing camera UI.
   */
  message: string;
}

// ─── Detector interface ───────────────────────────────────────────────────────

/**
 * Every real pose detector (ML Kit, MediaPipe, TFLite custom model)
 * must implement this interface.
 */
export interface PoseDetector {
  /**
   * Called once before the camera starts processing frames.
   * Load the model, allocate GPU buffers, etc.
   */
  initialize(): Promise<void>;

  /**
   * Called per camera frame.
   * `frameData` is platform-specific:
   *   - react-native-vision-camera: Frame object
   *   - ML Kit Android:             ImageProxy
   *   - MediaPipe WASM:             HTMLVideoElement or ImageBitmap
   *
   * Return a PoseDetectionResult — never throw; catch internally and
   * return status: 'unavailable' on error.
   */
  detect(frameData: unknown): Promise<PoseDetectionResult>;

  /**
   * Called when the camera screen unmounts.
   * Release GPU/native resources to avoid memory leaks.
   */
  dispose(): void;
}

// ─── Unavailable stub ─────────────────────────────────────────────────────────

/**
 * Default no-op detector used until a real implementation is connected.
 * Returns status: 'unavailable' every time. Contains zero simulation logic.
 */
export const unavailableDetector: PoseDetector = {
  async initialize(): Promise<void> {
    // Nothing to initialise — no real ML runtime attached.
  },

  async detect(_frameData: unknown): Promise<PoseDetectionResult> {
    return {
      status: 'unavailable',
      frame: null,
      message:
        'Detection unavailable — connect ML Kit or MediaPipe to enable pose guidance.',
    };
  },

  dispose(): void {
    // Nothing to release.
  },
};

// ─── Active detector singleton ────────────────────────────────────────────────

/**
 * The detector currently used by the camera screen.
 *
 * Default: unavailableDetector (safe no-op).
 *
 * Swap at runtime before the camera screen mounts:
 *   activePoseDetector.current = new MyMLKitDetector();
 */
export const activePoseDetector: { current: PoseDetector } = {
  current: unavailableDetector,
};
