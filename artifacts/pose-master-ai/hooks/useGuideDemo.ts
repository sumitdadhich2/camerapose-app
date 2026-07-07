/**
 * useGuideDemo — REMOVED
 * ======================
 * This hook previously cycled through fake alignment scenes every 4 seconds
 * to simulate pose detection. It has been removed because:
 *
 *   - It produced misleading data (fake percentages, fake "Perfect" states)
 *   - Random timers are not a substitute for real pose detection
 *
 * For real detection, implement PoseDetector from:
 *   services/PoseDetectionService.ts
 *
 * This file is kept as a placeholder to avoid breaking any lingering imports
 * during the transition. It exports nothing usable.
 */

export {};
