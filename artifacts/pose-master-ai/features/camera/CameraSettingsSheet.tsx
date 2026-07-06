import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Modal, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';
import { SPACING, TYPOGRAPHY } from '../../constants/theme';
import { useCameraSettingsStore } from '../../store/useCameraSettingsStore';

interface CameraSettingsSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const CameraSettingsSheet: React.FC<CameraSettingsSheetProps> = ({ visible, onClose }) => {
  const colors = useColors();
  const settings = useCameraSettingsStore();

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
        
        <View style={[styles.sheetContainer, { backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.card }]}>
          {Platform.OS === 'ios' && (
            <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
          )}
          
          <View style={styles.dragHandleContainer}>
            <View style={[styles.dragHandle, { backgroundColor: colors.muted }]} />
          </View>

          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.foreground }]}>Camera Settings</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            {/* Grid */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="grid-outline" size={20} color={colors.foreground} />
                <Text style={[styles.settingLabel, { color: colors.foreground }]}>Grid Lines</Text>
              </View>
              <TouchableOpacity 
                style={[styles.toggle, settings.grid ? { backgroundColor: colors.primary } : { backgroundColor: colors.muted }]} 
                onPress={() => settings.setGrid(!settings.grid)}
              >
                <View style={[styles.toggleKnob, settings.grid && styles.toggleKnobActive]} />
              </TouchableOpacity>
            </View>

            {/* Mirror Selfie */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="camera-reverse-outline" size={20} color={colors.foreground} />
                <Text style={[styles.settingLabel, { color: colors.foreground }]}>Mirror Selfie</Text>
              </View>
              <TouchableOpacity 
                style={[styles.toggle, settings.mirrorSelfie ? { backgroundColor: colors.primary } : { backgroundColor: colors.muted }]} 
                onPress={() => settings.setMirrorSelfie(!settings.mirrorSelfie)}
              >
                <View style={[styles.toggleKnob, settings.mirrorSelfie && styles.toggleKnobActive]} />
              </TouchableOpacity>
            </View>

            {/* Capture Sound */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="volume-high-outline" size={20} color={colors.foreground} />
                <View>
                  <Text style={[styles.settingLabel, { color: colors.foreground }]}>Capture Sound</Text>
                  <Text style={[styles.settingSub, { color: colors.mutedForeground }]}>Placeholder</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={[styles.toggle, settings.captureSound ? { backgroundColor: colors.primary } : { backgroundColor: colors.muted }]} 
                onPress={() => settings.setCaptureSound(!settings.captureSound)}
              >
                <View style={[styles.toggleKnob, settings.captureSound && styles.toggleKnobActive]} />
              </TouchableOpacity>
            </View>

            {/* Save Location */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="location-outline" size={20} color={colors.foreground} />
                <View>
                  <Text style={[styles.settingLabel, { color: colors.foreground }]}>Save Location</Text>
                  <Text style={[styles.settingSub, { color: colors.mutedForeground }]}>Placeholder</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={[styles.toggle, settings.saveLocation ? { backgroundColor: colors.primary } : { backgroundColor: colors.muted }]} 
                onPress={() => settings.setSaveLocation(!settings.saveLocation)}
              >
                <View style={[styles.toggleKnob, settings.saveLocation && styles.toggleKnobActive]} />
              </TouchableOpacity>
            </View>

            {/* Quality */}
            <View style={styles.settingSection}>
              <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>QUALITY</Text>
              <View style={styles.optionsRow}>
                {['High', 'Medium', 'Low'].map((q) => (
                  <TouchableOpacity
                    key={q}
                    style={[
                      styles.optionChip,
                      { backgroundColor: colors.secondary },
                      settings.quality === q && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => settings.setQuality(q as any)}
                  >
                    <Text style={[
                      styles.optionText,
                      { color: colors.foreground },
                      settings.quality === q && { color: colors.primaryForeground, fontFamily: TYPOGRAPHY.weights.bold }
                    ]}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Image Format */}
            <View style={styles.settingSection}>
              <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>FORMAT</Text>
              <View style={styles.optionsRow}>
                {['JPEG', 'PNG', 'RAW'].map((f) => (
                  <TouchableOpacity
                    key={f}
                    style={[
                      styles.optionChip,
                      { backgroundColor: colors.secondary, opacity: f === 'JPEG' ? 1 : 0.5 },
                      settings.imageQuality === f && { backgroundColor: colors.primary, opacity: 1 }
                    ]}
                    onPress={() => f === 'JPEG' && settings.setImageQuality(f as any)}
                    disabled={f !== 'JPEG'}
                  >
                    <Text style={[
                      styles.optionText,
                      { color: colors.foreground },
                      settings.imageQuality === f && { color: colors.primaryForeground, fontFamily: TYPOGRAPHY.weights.bold }
                    ]}>{f}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={[styles.noteText, { color: colors.mutedForeground }]}>PNG and RAW coming soon</Text>
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
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: '60%',
    overflow: 'hidden',
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  dragHandle: {
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
  closeButton: {
    padding: SPACING.xs,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  settingLabel: {
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.md,
  },
  settingSub: {
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
  toggleKnob: {
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
  toggleKnobActive: {
    transform: [{ translateX: 20 }],
  },
  settingSection: {
    marginTop: SPACING.xl,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.xs,
    marginBottom: SPACING.md,
    letterSpacing: 1,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  optionChip: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: 12,
  },
  optionText: {
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  noteText: {
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: SPACING.sm,
    textAlign: 'center',
  }
});
