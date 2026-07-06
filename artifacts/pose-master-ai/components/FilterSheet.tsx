import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../hooks/useColors';
import { SPACING, TYPOGRAPHY } from '../constants/theme';
import { PoseFilter } from '../types';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  initialFilters: PoseFilter;
  onApply: (filters: PoseFilter) => void;
}

export function FilterSheet({ visible, onClose, initialFilters, onApply }: FilterSheetProps) {
  const colors = useColors();
  const [filters, setFilters] = useState<PoseFilter>(initialFilters);

  const toggleArrayFilter = (key: keyof PoseFilter, value: string) => {
    const current = (filters[key] as string[]) || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setFilters({ ...filters, [key]: updated });
  };

  const togglePremium = (val: boolean | null) => {
    setFilters({ ...filters, premium: val });
  };

  const clearFilters = () => {
    setFilters({});
  };

  const renderChips = (title: string, key: keyof PoseFilter, options: string[]) => {
    const currentValues = (filters[key] as string[]) || [];
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
        <View style={styles.chipRow}>
          {options.map(opt => {
            const isSelected = currentValues.includes(opt);
            return (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.chip,
                  { backgroundColor: isSelected ? colors.primary : colors.secondary, borderRadius: colors.radius }
                ]}
                onPress={() => toggleArrayFilter(key, opt)}
              >
                <Text style={[
                  styles.chipText,
                  { color: isSelected ? colors.primaryForeground : colors.foreground }
                ]}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.sheet, { backgroundColor: colors.background, borderTopLeftRadius: colors.radius * 2, borderTopRightRadius: colors.radius * 2 }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.foreground }]}>Filters</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.content}>
            {renderChips('Gender', 'gender', ['girl', 'boy', 'unisex'])}
            {renderChips('Age Group', 'ageGroup', ['kids', 'teen', 'adult', 'family'])}
            {renderChips('Difficulty', 'difficulty', ['easy', 'medium', 'hard'])}
            {renderChips('Camera Type', 'cameraType', ['front', 'rear'])}
            
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Premium Status</Text>
              <View style={styles.chipRow}>
                <TouchableOpacity
                  style={[styles.chip, { backgroundColor: filters.premium === null || filters.premium === undefined ? colors.primary : colors.secondary, borderRadius: colors.radius }]}
                  onPress={() => togglePremium(null)}
                >
                  <Text style={[styles.chipText, { color: filters.premium === null || filters.premium === undefined ? colors.primaryForeground : colors.foreground }]}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.chip, { backgroundColor: filters.premium === false ? colors.primary : colors.secondary, borderRadius: colors.radius }]}
                  onPress={() => togglePremium(false)}
                >
                  <Text style={[styles.chipText, { color: filters.premium === false ? colors.primaryForeground : colors.foreground }]}>Free</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.chip, { backgroundColor: filters.premium === true ? colors.primary : colors.secondary, borderRadius: colors.radius }]}
                  onPress={() => togglePremium(true)}
                >
                  <Text style={[styles.chipText, { color: filters.premium === true ? colors.primaryForeground : colors.foreground }]}>Premium</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: colors.border, borderTopWidth: 1 }]}>
            <SecondaryButton title="Clear" onPress={clearFilters} style={styles.footerBtn} />
            <PrimaryButton title="Apply" onPress={() => { onApply(filters); onClose(); }} style={styles.footerBtn} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  title: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.xl,
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  content: {
    paddingHorizontal: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.weights.semiBold,
    fontSize: TYPOGRAPHY.sizes.md,
    marginBottom: SPACING.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  chipText: {
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  footer: {
    flexDirection: 'row',
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  footerBtn: {
    flex: 1,
  }
});