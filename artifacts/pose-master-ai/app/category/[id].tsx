import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useColors } from '../../hooks/useColors';
import { SPACING, TYPOGRAPHY } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { PoseLibraryService } from '../../services/PoseLibraryService';
import { PoseCard } from '../../components/PoseCard';
import { SearchBar } from '../../components/SearchBar';
import { FilterSheet } from '../../components/FilterSheet';
import { PoseFilter } from '../../types';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams();
  const colors = useColors();
  const { favoritePoseIds, toggleFavoritePose } = useFavoritesStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState<PoseFilter>({});

  const category = useMemo(() => PoseLibraryService.getCategoryById(id as string), [id]);

  const poses = useMemo(() => {
    let result = PoseLibraryService.getPosesByCategory(id as string, filters);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [id, filters, searchQuery]);

  if (!category) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.foreground }}>Category not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: colors.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderItem = ({ item, index }: { item: any, index: number }) => (
    <Animated.View entering={FadeInUp.delay(Math.min(index * 20, 300)).duration(300)} style={styles.cardContainer}>
      <PoseCard 
        pose={item}
        onPress={() => router.push(`/pose/${item.id}`)}
        isFavorite={favoritePoseIds.includes(item.id)}
        onToggleFavorite={() => toggleFavoritePose(item.id)}
        style={{ width: '100%' }}
      />
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>{category.name}</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{category.poseCount} Poses</Text>
        </View>
      </View>

      <View style={styles.searchRow}>
        <SearchBar 
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search within category..."
          style={styles.searchBar}
        />
        <TouchableOpacity 
          style={[styles.filterBtn, { backgroundColor: Object.keys(filters).length ? colors.primary : colors.secondary, borderRadius: colors.radius }]}
          onPress={() => setFilterVisible(true)}
        >
          <Ionicons name="options-outline" size={20} color={Object.keys(filters).length ? colors.primaryForeground : colors.foreground} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={poses}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        getItemLayout={(data, index) => (
          {length: 220, offset: 220 * index, index}
        )}
        windowSize={10}
        maxToRenderPerBatch={10}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ color: colors.mutedForeground }}>No poses found matching your filters.</Text>
            <TouchableOpacity onPress={() => { setFilters({}); setSearchQuery(''); }} style={{ marginTop: 10 }}>
              <Text style={{ color: colors.primary }}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <FilterSheet 
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        initialFilters={filters}
        onApply={setFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  backBtn: {
    padding: SPACING.sm,
    marginRight: SPACING.sm,
  },
  headerTitleContainer: {
    flex: 1,
  },
  title: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.xl,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  searchBar: {
    flex: 1,
  },
  filterBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  cardContainer: {
    width: '48%',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  }
});