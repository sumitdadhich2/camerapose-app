import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useColors } from '../../hooks/useColors';
import { SPACING, TYPOGRAPHY } from '../../constants/theme';
import { SearchBar } from '../../components/SearchBar';
import { PackAwareCategoryCard } from '../../components/PackAwareCategoryCard';
import { useRecentStore } from '../../store/useRecentStore';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { PoseLibraryService } from '../../services/PoseLibraryService';
import { PosePackService } from '../../services/PosePackService';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

export default function CategoriesScreen() {
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState('');
  const { addRecentCategory } = useRecentStore();
  const { favoriteCategoryIds, toggleFavoriteCategory } = useFavoritesStore();

  /**
   * Open a category.
   *
   * For bundled packs this resolves immediately (no visible delay).
   * For future remote packs it starts the download, animates the card,
   * and navigates automatically once the pack is ready.
   */
  const handleCategoryPress = useCallback(async (categoryId: string) => {
    addRecentCategory(categoryId);
    const ready = await PosePackService.ensurePackAvailable(categoryId);
    if (ready) {
      router.push(`/category/${categoryId}`);
    }
    // If !ready, PosePackService has already set status:'failed' in the store
    // and the card shows the retry icon — no further action needed.
  }, [addRecentCategory]);

  const allCategories = useMemo(() => PoseLibraryService.getAllCategories(), []);

  const filteredCategories = useMemo(() => {
    return allCategories.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [allCategories, searchQuery]);

  const favoriteCategories = useMemo(() => {
    return allCategories.filter(c => favoriteCategoryIds.includes(c.id));
  }, [allCategories, favoriteCategoryIds]);

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const isFav = favoriteCategoryIds.includes(item.id);
    return (
      <Animated.View
        entering={FadeIn.delay(index * 20).duration(300)}
        style={styles.cardWrapper}
      >
        {/* Relative wrapper so the fav button can overlay the card */}
        <View style={styles.cardRelative}>
          <PackAwareCategoryCard
            categoryId={item.id}
            name={item.name}
            icon={item.icon}
            count={item.poseCount}
            onPress={() => handleCategoryPress(item.id)}
            style={styles.card}
          />
          <TouchableOpacity
            style={styles.favBtn}
            onPress={() => toggleFavoriteCategory(item.id)}
            hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
          >
            <Ionicons
              name={isFav ? 'heart' : 'heart-outline'}
              size={18}
              color={isFav ? colors.primary : colors.mutedForeground}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Find a category..."
        />
      </View>
      <FlatList
        data={filteredCategories}
        keyExtractor={item => item.id}
        numColumns={3}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        ListHeaderComponent={
          !searchQuery && favoriteCategories.length > 0 ? (
            <View style={styles.favSection}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Favorite Categories
              </Text>
              <View style={styles.favRow}>
                {favoriteCategories.map((cat) => (
                  <View key={cat.id} style={styles.favCardWrapper}>
                    <View style={styles.cardRelative}>
                      <PackAwareCategoryCard
                        categoryId={cat.id}
                        name={cat.name}
                        icon={cat.icon}
                        count={cat.poseCount}
                        onPress={() => handleCategoryPress(cat.id)}
                        style={styles.card}
                      />
                      <TouchableOpacity
                        style={styles.favBtn}
                        onPress={() => toggleFavoriteCategory(cat.id)}
                        hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
                      >
                        <Ionicons name="heart" size={18} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.foreground, marginTop: SPACING.lg },
                ]}
              >
                All Categories
              </Text>
            </View>
          ) : null
        }
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 60,
    paddingBottom: SPACING.md,
  },
  listContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 100,
  },
  favSection: {
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.lg,
    marginBottom: SPACING.md,
  },
  favRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  favCardWrapper: {
    width: '31%',
    marginBottom: SPACING.md,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  cardWrapper: {
    width: '31%',
  },
  // Relative wrapper so the fav button can be absolutely positioned on the card
  cardRelative: {
    position: 'relative',
  },
  card: {
    width: '100%',
  },
  favBtn: {
    position: 'absolute',
    top: 5,
    right: 5,
    padding: 4,
  },
});
