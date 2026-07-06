import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../hooks/useColors';
import { SPACING, TYPOGRAPHY } from '../constants/theme';
import { PoseTemplate } from '../types';
import * as Haptics from 'expo-haptics';

interface PoseCardProps {
  pose: PoseTemplate;
  onPress: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  style?: any;
}

export function PoseCard({ pose, onPress, isFavorite, onToggleFavorite, style }: PoseCardProps) {
  const colors = useColors();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const handleFavoritePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onToggleFavorite) onToggleFavorite();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      style={[
        styles.container,
        { backgroundColor: colors.card, borderRadius: colors.radius },
        style
      ]}
    >
      <View style={[styles.placeholder, { backgroundColor: pose.previewImage || colors.secondary, borderRadius: colors.radius }]}>
        <Ionicons name="body-outline" size={40} color={colors.card} style={{ opacity: 0.5 }} />
        {pose.premium && (
          <View style={[styles.premiumBadge, { backgroundColor: colors.primary }]}>
            <Ionicons name="star" size={12} color={colors.primaryForeground} />
          </View>
        )}
      </View>
      <View style={styles.cardInfo}>
        <Text style={[styles.cardName, { color: colors.foreground }]} numberOfLines={1}>{pose.title}</Text>
        {onToggleFavorite && (
          <TouchableOpacity 
            style={styles.favButton}
            onPress={handleFavoritePress}
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={20} 
              color={isFavorite ? colors.primary : colors.mutedForeground} 
            />
          </TouchableOpacity>
        )}
      </View>
      <Text style={[styles.difficulty, { color: colors.mutedForeground }]} numberOfLines={1}>
        {pose.difficulty.charAt(0).toUpperCase() + pose.difficulty.slice(1)} • {pose.gender}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.sm,
    width: 140, // default width, override with style prop for grids
  },
  placeholder: {
    width: '100%',
    aspectRatio: 3/4,
    marginBottom: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  premiumBadge: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    padding: 4,
    borderRadius: 12,
  },
  cardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  cardName: {
    flex: 1,
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  favButton: {
    padding: 2,
  },
  difficulty: {
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.xs,
  }
});