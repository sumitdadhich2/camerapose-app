/**
 * FloatingGuidePanel — REMOVED
 * =============================
 * The previous implementation auto-cycled fake instruction text using
 * setTimeout. This was misleading — the instructions were not driven by
 * real pose detection.
 *
 * When a real PoseDetector is connected via PoseDetectionService,
 * a new guidance panel can be built here that reads from
 * activePoseDetector.current.detect() and shows only real feedback.
 *
 * This file renders nothing until then.
 */

export const FloatingGuidePanel: React.FC = () => null;

import React from 'react';
