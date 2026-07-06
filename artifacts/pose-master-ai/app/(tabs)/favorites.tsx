import React, { useMemo } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity } from 'react-native';
import { useColors } from '../../hooks/useColors';
import { EmptyState } from '../../components/EmptyState';
import { router } from 'expo-router';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { PoseLibraryService } from '../../services/PoseLibraryService';
import { PoseCard } from '../../components/PoseCard';
import { CategoryCard } from '../../components/CategoryCard';
import { SPACING, TYPOGRAPHY } from '../../constants/theme';

export default function FavoritesScreen() {
  const colors = useColors();
  const { favoritePoseIds, favoriteCategoryIds, toggleFavoritePose, toggleFavoriteCategory } = useFavoritesStore();

  const favoritePoses = useMemo(() => {
    return favoritePoseIds.map(id => PoseLibraryService.getPoseById(id)).filter(Boolean) as any[];
  }, [favoritePoseIds]);

  const favoriteCategories = useMemo(() => {
    return favoriteCategoryIds.map(id => PoseLibraryService.getCategoryById(id)).filter(Boolean) as any[];
  }, [favoriteCategoryIds]);

  if (favoritePoses.length === 0 && favoriteCategories.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState 
          icon="heart"
          title="No Favorites Yet"
          description="Mark pose templates and categories as favorite to easily find them later."
          actionTitle="Explore Poses"
          onActionPress={() => router.navigate('/(tabs)/categories')}
        />
      </View>
    );
  }

  const renderContent = () => (
    <View>
      {favoriteCategories.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Categories</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hList}
            data={favoriteCategories}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={[styles.catWrapper, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
                <CategoryCard 
                  name={item.name}
                  icon={item.icon}
                  count={item.poseCount}
                  onPress={() => router.push(`/category/${item.id}`)}
                />
              </View>
            )}
          />
        </View>
      )}

      {favoritePoses.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Poses</Text>
          <View style={styles.grid}>
            {favoritePoses.map((pose) => (
              <View key={pose.id} style={styles.gridItem}>
                <PoseCard 
                  pose={pose}
                  onPress={() => router.push(`/pose/${pose.id}`)}
                  isFavorite={true}
                  onToggleFavorite={() => toggleFavoritePose(pose.id)}
                  style={{ width: '100%' }}
                />
              </View>
            ))}
          </View>
        </View>
      )}
      <View style={{ height: 100 }} />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.headerText, { color: colors.foreground }]}>Favorites</Text>
      <FlatList 
        data={[{key: 'content'}]}
        renderItem={() => renderContent()}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  headerText: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.xxl,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.lg,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  hList: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  catWrapper: {
    overflow: 'hidden',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginBottom: SPACING.lg,
  }
});