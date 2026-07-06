import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useColors } from '../../hooks/useColors';
import { CATEGORIES, MOCK_TEMPLATES } from '../../constants/categories';
import { SPACING, TYPOGRAPHY } from '../../constants/theme';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams();
  const colors = useColors();
  const { favoriteIds, toggleFavorite } = useFavoritesStore();

  const category = CATEGORIES.find(c => c.id === id);
  const templates = MOCK_TEMPLATES.filter(t => t.categoryId === id);

  if (!category) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.foreground }}>Category not found</Text>
      </View>
    );
  }

  // Generate some fake placeholder items to show grid if empty (for architecture demo)
  const displayTemplates = templates.length > 0 ? templates : Array.from({ length: 6 }).map((_, i) => ({
    id: `fake-${i}`,
    categoryId: category.id,
    name: `Pose ${i + 1}`,
  }));

  const renderItem = (item: any, index: number) => {
    const isFav = favoriteIds.includes(item.id);
    return (
      <Animated.View key={item.id} entering={FadeInUp.delay(index * 50).duration(300)} style={styles.cardContainer}>
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius }]}
          onPress={() => router.push(`/camera/${item.id}`)}
          activeOpacity={0.8}
        >
          <View style={[styles.placeholder, { backgroundColor: colors.secondary, borderRadius: colors.radius }]}>
            <Ionicons name="body-outline" size={40} color={colors.mutedForeground} style={{ opacity: 0.5 }} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={[styles.cardName, { color: colors.foreground }]} numberOfLines={1}>{item.name}</Text>
            <TouchableOpacity 
              style={styles.favButton}
              onPress={() => toggleFavorite(item.id)}
            >
              <Ionicons name={isFav ? "heart" : "heart-outline"} size={24} color={isFav ? colors.primary : colors.mutedForeground} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: colors.secondary, borderRadius: colors.radius * 2 }]}>
          <Ionicons name={category.icon as any} size={40} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>{category.name} Poses</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{category.templateCount} Templates</Text>
      </View>

      <View style={styles.grid}>
        {displayTemplates.map((item, i) => renderItem(item, i))}
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
    marginTop: SPACING.lg,
  },
  iconContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.xxxl,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardContainer: {
    width: '48%',
    marginBottom: SPACING.lg,
  },
  card: {
    padding: SPACING.sm,
  },
  placeholder: {
    width: '100%',
    aspectRatio: 3/4,
    marginBottom: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardName: {
    flex: 1,
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.md,
  },
  favButton: {
    padding: 4,
  }
});
