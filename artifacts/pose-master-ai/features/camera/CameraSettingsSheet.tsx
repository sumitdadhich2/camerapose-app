import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Modal, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';
import { SPACING, TYPOGRAPHY } from '../../constants/theme';
import { useCameraSettingsStore } from '../../store/useCameraSettingsStore';
import { useDevModeStore } from '../../store/useDevModeStore';

interface CameraSettingsSheetProps {
  visible: boolean;
  onClose: () => void;
}

// ─── Reusable toggle row ──────────────────────────────────────────────────────

interface ToggleRowProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  sublabel?: string;
  value: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const ToggleRow: React.FC<ToggleRowProps> = ({
  icon, label, sublabel, value, onToggle, disabled,
}) => {
  const colors = useColors();
  return (
    <View style={[rowStyles.row, { borderBottomColor: 'rgba(255,255,255,0.1)' }]}>
      <View style={rowStyles.info}>
        <Ionicons name={icon} size={20} color={disabled ? colors.mutedForeground : colors.foreground} />
        <View>
          <Text style={[rowStyles.label, { color: disabled ? colors.mutedForeground : colors.foreground }]}>
            {label}
          </Text>
          {sublabel ? (
            <Text style={[rowStyles.sub, { color: colors.mutedForeground }]}>{sublabel}</Text>
          ) : null}
        </View>
      </View>
      <TouchableOpacity
        style={[
          rowStyles.toggle,
          value && !disabled
            ? { backgroundColor: colors.primary }
            : { backgroundColor: colors.muted },
        ]}
        onPress={onToggle}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <View style={[rowStyles.knob, value && !disabled && rowStyles.knobActive]} />
      </TouchableOpacity>
    </View>
  );
};

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  label: {
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.md,
  },
  sub: {
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    padding: 2,
  },
  knob: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  knobActive: {
    transform: [{ translateX: 20 }],
  },
});

// ─── Main sheet ───────────────────────────────────────────────────────────────

export const CameraSettingsSheet: React.FC<CameraSettingsSheetProps> = ({ visible, onClose }) => {
  const colors = useColors();
  const settings = useCameraSettingsStore();
  const dev = useDevModeStore();

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />

        <View style={[styles.sheet, { backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.card }]}>
          {Platform.OS === 'ios' && (
            <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
          )}

          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: colors.muted }]} />
          </View>

          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.foreground }]}>Camera Settings</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content}>

            {/* ── Camera ── */}
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>CAMERA</Text>

            <ToggleRow
              icon="grid-outline"
              label="Grid Lines"
              value={settings.grid}
              onToggle={() => settings.setGrid(!settings.grid)}
            />
            <ToggleRow
              icon="camera-reverse-outline"
              label="Mirror Selfie"
              value={settings.mirrorSelfie}
              onToggle={() => settings.setMirrorSelfie(!settings.mirrorSelfie)}
            />
            <ToggleRow
              icon="volume-high-outline"
              label="Capture Sound"
              sublabel="Placeholder"
              value={settings.captureSound}
              onToggle={() => settings.setCaptureSound(!settings.captureSound)}
            />
            <ToggleRow
              icon="location-outline"
              label="Save Location"
              sublabel="Placeholder"
              value={settings.saveLocation}
              onToggle={() => settings.setSaveLocation(!settings.saveLocation)}
            />

            {/* ── Quality ── */}
            <View style={styles.chipSection}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>QUALITY</Text>
              <View style={styles.chipRow}>
                {(['High', 'Medium', 'Low'] as const).map((q) => (
                  <TouchableOpacity
                    key={q}
                    style={[
                      styles.chip,
                      { backgroundColor: colors.secondary },
                      settings.quality === q && { backgroundColor: colors.primary },
                    ]}
                    onPress={() => settings.setQuality(q)}
                  >
                    <Text style={[
                      styles.chipText,
                      { color: colors.foreground },
                      settings.quality === q && {
                        color: colors.primaryForeground,
                        fontFamily: TYPOGRAPHY.weights.bold,
                      },
                    ]}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* ── Format ── */}
            <View style={styles.chipSection}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>FORMAT</Text>
              <View style={styles.chipRow}>
                {(['JPEG', 'PNG', 'RAW'] as const).map((f) => (
                  <TouchableOpacity
                    key={f}
                    style={[
                      styles.chip,
                      { backgroundColor: colors.secondary, opacity: f === 'JPEG' ? 1 : 0.4 },
                      settings.imageQuality === f && { backgroundColor: colors.primary, opacity: 1 },
                    ]}
                    onPress={() => f === 'JPEG' && settings.setImageQuality(f)}
                    disabled={f !== 'JPEG'}
                  >
                    <Text style={[
                      styles.chipText,
                      { color: colors.foreground },
                      settings.imageQuality === f && {
                        color: colors.primaryForeground,
                        fontFamily: TYPOGRAPHY.weights.bold,
                      },
                    ]}>{f}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={[styles.note, { color: colors.mutedForeground }]}>
                PNG and RAW coming soon
              </Text>
            </View>

            {/* ── Developer Mode ── */}
            <View style={styles.devSection}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>DEVELOPER</Text>

              <ToggleRow
                icon="code-slash-outline"
                label="Developer Mode"
                sublabel="Off by default"
                value={dev.developerMode}
                onToggle={() => dev.setDeveloperMode(!dev.developerMode)}
              />

              {dev.developerMode && (
                <>
                  <View style={[styles.devIndent, { borderLeftColor: colors.primary }]}>
                    <ToggleRow
                      icon="eye-outline"
                      label="Debug Overlay"
                      sublabel="Show detection debug layer"
                      value={dev.debugOverlay}
                      onToggle={() => dev.setDebugOverlay(!dev.debugOverlay)}
                    />
                    <ToggleRow
                      icon="radio-button-on-outline"
                      label="Show Landmarks"
                      sublabel="Draw detected body points"
                      value={dev.showLandmarks}
                      onToggle={() => dev.setShowLandmarks(!dev.showLandmarks)}
                      disabled={!dev.debugOverlay}
                    />
                    <ToggleRow
                      icon="body-outline"
                      label="Show Body Points"
                      sublabel="Draw landmark labels"
                      value={dev.showBodyPoints}
                      onToggle={() => dev.setShowBodyPoints(!dev.showBodyPoints)}
                      disabled={!dev.debugOverlay}
                    />
                    <ToggleRow
                      icon="bar-chart-outline"
                      label="Show Debug Values"
                      sublabel="Scores, confidence, frame index"
                      value={dev.showDebugValues}
                      onToggle={() => dev.setShowDebugValues(!dev.showDebugValues)}
                      disabled={!dev.debugOverlay}
                    />
                  </View>
                  <Text style={[styles.devNote, { color: colors.mutedForeground }]}>
                    Debug overlay requires a connected pose detector to show data.
                  </Text>
                </>
              )}
            </View>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: '60%',
    overflow: 'hidden',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.xl,
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: 48,
  },
  sectionLabel: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.xs,
    letterSpacing: 1,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  chipSection: {
    marginTop: SPACING.lg,
  },
  chipRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  chip: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: 12,
  },
  chipText: {
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  note: {
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  devSection: {
    marginTop: SPACING.xl,
  },
  devIndent: {
    borderLeftWidth: 2,
    paddingLeft: SPACING.md,
    marginLeft: SPACING.xs,
    marginTop: SPACING.xs,
  },
  devNote: {
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
});
