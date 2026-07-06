import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, Switch, Alert, TouchableOpacity } from 'react-native';
import { useColors } from '../hooks/useColors';
import { useSettingsStore } from '../store/useSettingsStore';
import { StorageService } from '../services/StorageService';
import { useAuthStore } from '../store/useAuthStore';
import { router } from 'expo-router';
import { SPACING, TYPOGRAPHY } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function SettingsScreen() {
  const colors = useColors();
  const { isDarkMode, setDarkMode, language, setLanguage } = useSettingsStore();
  const { setUser, setHasSeenOnboarding } = useAuthStore();
  
  // UI toggle state derived from whether we forced it or system
  const [darkToggle, setDarkToggle] = useState(isDarkMode === true);

  const handleDarkToggle = (val: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDarkToggle(val);
    setDarkMode(val); // In a real app we might need to communicate this to the ThemeProvider wrapper
  };

  const handleResetApp = () => {
    Alert.alert(
      "Reset App",
      "This will clear all your data, favorites, and settings. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset", 
          style: "destructive",
          onPress: async () => {
            await StorageService.clear();
            setUser(null);
            setHasSeenOnboarding(false);
            router.replace('/');
          }
        }
      ]
    );
  };

  const SettingRow = ({ title, description, children }: any) => (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <View style={styles.rowLeft}>
        <Text style={[styles.rowTitle, { color: colors.foreground }]}>{title}</Text>
        {description && <Text style={[styles.rowDesc, { color: colors.mutedForeground }]}>{description}</Text>}
      </View>
      <View style={styles.rowRight}>
        {children}
      </View>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.section, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Appearance</Text>
        <SettingRow title="Dark Mode" description="Force dark theme across the app">
          <Switch 
            value={darkToggle} 
            onValueChange={handleDarkToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </SettingRow>
        
        <SettingRow title="Language">
          <TouchableOpacity style={styles.selector}>
            <Text style={[styles.selectorText, { color: colors.mutedForeground }]}>English</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        </SettingRow>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Camera Settings (Coming Soon)</Text>
        <SettingRow title="Auto Capture" description="Detect pose match and snap automatically">
          <Switch value={false} disabled trackColor={{ false: colors.border, true: colors.primary }} />
        </SettingRow>
        <SettingRow title="Voice Guidance" description="Spoken directions for adjustments">
          <Switch value={false} disabled trackColor={{ false: colors.border, true: colors.primary }} />
        </SettingRow>
        <SettingRow title="High Quality Mode" description="Capture uncompressed raw photos">
          <Switch value={false} disabled trackColor={{ false: colors.border, true: colors.primary }} />
        </SettingRow>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        <Text style={[styles.sectionTitle, { color: colors.destructive }]}>Danger Zone</Text>
        <TouchableOpacity style={styles.resetButton} onPress={handleResetApp}>
          <Text style={[styles.resetText, { color: colors.destructive }]}>Reset App Data</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.xl,
    paddingTop: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.xl,
    overflow: 'hidden',
    padding: SPACING.md,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  rowLeft: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  rowTitle: {
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.md,
    marginBottom: 4,
  },
  rowDesc: {
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  selectorText: {
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.md,
  },
  resetButton: {
    paddingVertical: SPACING.md,
  },
  resetText: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.md,
  }
});
