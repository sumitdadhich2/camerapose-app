import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useColors } from '../../hooks/useColors';
import { SPACING, TYPOGRAPHY } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { useRecentStore } from '../../store/useRecentStore';
import { PoseLibraryService } from '../../services/PoseLibraryService';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { PrimaryButton } from '../../components/PrimaryButton';

export default function PoseDetailsScreen() {
  const { id } = useLocalSearchParams();
  const colors = useColors();
  const { favoritePoseIds, toggleFavoritePose } = useFavoritesStore();
  const { addRecentTemplate } = useRecentStore();

  const pose = PoseLibraryService.getPoseById(id as string);

  React.useEffect(() => {
    if (pose) {
      addRecentTemplate(pose.id);
    }
  }, [pose]);

  if (!pose) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.foreground }}>Pose not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: colors.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isFavorite = favoritePoseIds.includes(pose.id);
  const category = PoseLibraryService.getCategoryById(pose.categoryId);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeInDown.duration(400)} style={[styles.previewContainer, { backgroundColor: pose.previewImage || colors.secondary, borderRadius: colors.radius * 2 }]}>
          <Ionicons name="body-outline" size={100} color={colors.card} style={{ opacity: 0.5 }} />
          {pose.premium && (
            <View style={[styles.premiumBadge, { backgroundColor: colors.primary }]}>
              <Ionicons name="star" size={16} color={colors.primaryForeground} />
              <Text style={[styles.premiumText, { color: colors.primaryForeground }]}>PREMIUM</Text>
            </View>
          )}
          <TouchableOpacity 
            style={[styles.favCircle, { backgroundColor: colors.card }]} 
            onPress={() => toggleFavoritePose(pose.id)}
          >
            <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={28} color={isFavorite ? colors.primary : colors.mutedForeground} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.detailsContainer}>
          <Text style={[styles.title, { color: colors.foreground }]}>{pose.title}</Text>
          
          <View style={styles.metaRow}>
            <View style={[styles.metaBadge, { backgroundColor: colors.secondary, borderRadius: colors.radius }]}>
              <Ionicons name="bar-chart-outline" size={16} color={colors.foreground} />
              <Text style={[styles.metaText, { color: colors.foreground }]}>{pose.difficulty.toUpperCase()}</Text>
            </View>
            {category && (
              <View style={[styles.metaBadge, { backgroundColor: colors.secondary, borderRadius: colors.radius }]}>
                <Ionicons name={category.icon as any} size={16} color={colors.foreground} />
                <Text style={[styles.metaText, { color: colors.foreground }]}>{category.name}</Text>
              </View>
            )}
            <View style={[styles.metaBadge, { backgroundColor: colors.secondary, borderRadius: colors.radius }]}>
              <Ionicons name="camera-outline" size={16} color={colors.foreground} />
              <Text style={[styles.metaText, { color: colors.foreground }]}>{pose.cameraType}</Text>
            </View>
          </View>

          <Text style={[styles.description, { color: colors.mutedForeground }]}>{pose.description}</Text>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recommended Distance</Text>
            <Text style={[styles.sectionContent, { color: colors.mutedForeground }]}>{pose.recommendedDistance}</Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Tips</Text>
            {pose.tips.map((tip, index) => (
              <View key={index} style={styles.tipRow}>
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                <Text style={[styles.tipText, { color: colors.mutedForeground }]}>{tip}</Text>
              </View>
            ))}
          </View>

          <View style={styles.tagsRow}>
            {pose.tags.map(tag => (
              <View key={tag} style={[styles.tag, { backgroundColor: colors.secondary, borderRadius: colors.radius }]}>
                <Text style={[styles.tagText, { color: colors.mutedForeground }]}>#{tag}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border, borderTopWidth: 1 }]}>
        <PrimaryButton 
          title="Open Camera" 
          onPress={() => router.push(`/camera/${pose.id}`)} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingTop: 60,
    paddingBottom: 100,
  },
  previewContainer: {
    width: '100%',
    aspectRatio: 3/4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
    position: 'relative',
  },
  premiumBadge: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
  },
  premiumText: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  favCircle: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  detailsContainer: {
    flex: 1,
  },
  title: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.xxl,
    marginBottom: SPACING.md,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    gap: SPACING.xs,
  },
  metaText: {
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  description: {
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.lg,
    marginBottom: SPACING.sm,
  },
  sectionContent: {
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.md,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  tipText: {
    flex: 1,
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: 22,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  tag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  tagText: {
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    paddingBottom: 40,
  }
});