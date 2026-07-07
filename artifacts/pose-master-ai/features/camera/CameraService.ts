/**
 * CameraService
 * =============
 * Low-level camera hardware operations only.
 * No pose detection, no alignment scoring, no fake values.
 *
 * Pose detection is handled exclusively by PoseDetectionService.
 */
export const CameraService = {
  /**
   * Initialise camera hardware.
   * Returns true when the camera is ready to capture.
   */
  async initCamera(): Promise<boolean> {
    // Placeholder — actual init handled by expo-camera's useCameraPermissions.
    return true;
  },

  /**
   * Capture a still photo from the active camera.
   * Returns the local file URI of the captured image.
   * Implemented in the camera screen via CameraView.takePictureAsync.
   */
  async capturePhoto(): Promise<string | null> {
    // Placeholder — call CameraView.takePictureAsync directly in the UI layer.
    return null;
  },
};
