/**
 * VoiceCoach
 * ==========
 * Delivers spoken pose guidance instructions to the user via text-to-speech.
 *
 * CURRENT STATE: Architecture only. The SilentVoiceCoach implementation is a
 * no-op — no audio is played until a real TTS library is connected.
 *
 * FUTURE IMPLEMENTATION:
 * Use expo-speech or react-native-tts:
 *   import * as Speech from 'expo-speech';
 *   Speech.speak(instruction, { language: 'en-US', rate: 0.9 });
 *
 * DESIGN RULES:
 * - Never call speak() with hardcoded fake instructions.
 * - Only speak when AlignmentEngine or DistanceEngine produces real feedback.
 * - Rate-limit speak() calls to avoid overlapping instructions.
 *   (Track the last-spoken instruction and skip duplicates within 2 seconds.)
 *
 * HOW TO ACTIVATE:
 * - Enable voiceGuide in useGuideSettingsStore.
 * - Connect a real detector via activePoseDetector.current.
 * - Set activeVoiceCoach.current = new ExpoSpeechVoiceCoach().
 */

// ─── Voice instructions ───────────────────────────────────────────────────────

/**
 * The set of instructions the VoiceCoach can deliver.
 * Each instruction maps to a short spoken phrase.
 */
export type VoiceInstruction =
  | 'move_left'
  | 'move_right'
  | 'move_closer'
  | 'move_back'
  | 'raise_right_hand'
  | 'raise_left_hand'
  | 'lower_right_hand'
  | 'lower_left_hand'
  | 'stand_straighter'
  | 'face_the_camera'
  | 'rotate_body_left'
  | 'rotate_body_right'
  | 'perfect_pose'
  | 'hold_still';

/**
 * The spoken text for each VoiceInstruction.
 * Keep phrases short (≤5 words) for quick comprehension.
 */
export const VOICE_SCRIPTS: Record<VoiceInstruction, string> = {
  move_left:         'Move a little left',
  move_right:        'Move a little right',
  move_closer:       'Come a bit closer',
  move_back:         'Step back a little',
  raise_right_hand:  'Raise your right hand',
  raise_left_hand:   'Raise your left hand',
  lower_right_hand:  'Lower your right hand',
  lower_left_hand:   'Lower your left hand',
  stand_straighter:  'Stand up straight',
  face_the_camera:   'Face the camera',
  rotate_body_left:  'Rotate left',
  rotate_body_right: 'Rotate right',
  perfect_pose:      'Perfect pose',
  hold_still:        'Hold still',
};

// ─── Engine interface ─────────────────────────────────────────────────────────

export interface IVoiceCoach {
  /**
   * Speak the given instruction aloud.
   * Implementations should rate-limit to avoid overlapping speech.
   * Never throws — fail silently if TTS is unavailable.
   */
  speak(instruction: VoiceInstruction): Promise<void>;

  /**
   * Speak an arbitrary string (for future custom template instructions).
   * Implementations may reject strings that are too long.
   */
  speakCustom(text: string): Promise<void>;

  /**
   * Immediately cancel any currently playing speech.
   */
  cancel(): void;

  /**
   * Returns true once a real TTS implementation is wired in and ready.
   * The camera UI checks this before showing any voice-related UI.
   */
  isReady(): boolean;
}

// ─── Silent implementation ────────────────────────────────────────────────────

/**
 * Default no-op VoiceCoach.
 * All methods are no-ops. No audio is played. No fake speech.
 */
export class SilentVoiceCoach implements IVoiceCoach {
  async speak(_instruction: VoiceInstruction): Promise<void> {
    // No TTS library connected.
  }

  async speakCustom(_text: string): Promise<void> {
    // No TTS library connected.
  }

  cancel(): void {
    // Nothing to cancel.
  }

  isReady(): boolean {
    return false;
  }
}

// ─── Active voice coach singleton ─────────────────────────────────────────────

/**
 * The VoiceCoach used by the camera pipeline.
 * Default: SilentVoiceCoach (no-op).
 *
 * To plug in a real TTS implementation:
 *   activeVoiceCoach.current = new ExpoSpeechVoiceCoach();
 */
export const activeVoiceCoach: { current: IVoiceCoach } = {
  current: new SilentVoiceCoach(),
};
