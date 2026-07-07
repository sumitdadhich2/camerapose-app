/**
 * VoiceGuidanceService
 * ====================
 * Text-to-speech interface for future pose guidance narration.
 * No-op until a real TTS implementation is connected.
 *
 * To implement: replace the bodies of `speak` and `cancel` with
 * calls to expo-speech or react-native-tts.
 * No camera UI changes are required.
 */
export const VoiceGuidanceService = {
  /**
   * Speak a short instruction aloud.
   * Currently a no-op — requires a real TTS library.
   */
  async speak(_instruction: string): Promise<void> {
    // TODO: implement with expo-speech or react-native-tts
  },

  /**
   * Cancel any currently playing speech.
   * Currently a no-op.
   */
  cancel(): void {
    // TODO: implement with expo-speech or react-native-tts
  },

  /**
   * Returns true once a real TTS implementation is connected.
   */
  isSupported(): boolean {
    return false;
  },
};
