import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useColors } from '../../hooks/useColors';
import { SPACING, TYPOGRAPHY } from '../../constants/theme';
import { SearchBar } from '../../components/SearchBar';
import { CategoryCard } from '../../components/CategoryCard';
import { useRecentStore } from '../../store/useRecentStore';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { PoseLibraryService } from '../../services/PoseLibraryService';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

export default function CategoriesScreen() {
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState('');
  const { addRecentCategory } = useRecentStore();
  const { favoriteCategoryIds, toggleFavoriteCategory } = useFavoritesStore();

  const handleCategoryPress = (categoryId: string) => {
    addRecentCategory(categoryId);
    router.push(`/category/${categoryId}`);
  };

  const allCategories = useMemo(() => PoseLibraryService.getAllCategories(), []);

  const filteredCategories = useMemo(() => {
    return allCategories.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allCategories, searchQuery]);

  const favoriteCategories = useMemo(() => {
    return allCategories.filter(c => favoriteCategoryIds.includes(c.id));
  }, [allCategories, favoriteCategoryIds]);

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const isFav = favoriteCategoryIds.includes(item.id);
    return (
      <Animated.View entering={FadeIn.delay(index * 20).duration(300)} style={styles.cardWrapper}>
        <View style={[styles.cardBg, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
          <CategoryCard 
            name={item.name}
            icon={item.icon}
            count={item.poseCount}
            onPress={() => handleCategoryPress(item.id)}
            style={styles.card}
          />
          <TouchableOpacity 
            style={styles.favBtn} 
            onPress={() => toggleFavoriteCategory(item.id)}
          >
            <Ionicons name={isFav ? "heart" : "heart-outline"} size={20} color={isFav ? colors.primary : colors.mutedForeground} />
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
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Favorite Categories</Text>
              <View style={styles.favRow}>
                {favoriteCategories.map((cat, index) => (
                  <View key={cat.id} style={{ width: '31%', marginBottom: SPACING.md }}>
                    <View style={[styles.cardBg, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
                      <CategoryCard 
                        name={cat.name}
                        icon={cat.icon}
                        count={cat.poseCount}
                        onPress={() => handleCategoryPress(cat.id)}
                        style={styles.card}
                      />
                      <TouchableOpacity style={styles.favBtn} onPress={() => toggleFavoriteCategory(cat.id)}>
                        <Ionicons name="heart" size={20} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
              <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: SPACING.lg }]}>All Categories</Text>
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
  row: {
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  cardWrapper: {
    width: '31%',
  },
  cardBg: {
    position: 'relative',
    overflow: 'hidden',
  },
  card: {
    width: '100%',
    padding: SPACING.sm,
  },
  favBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    padding: 4,
  }
});