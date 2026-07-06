import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { router } from 'expo-router';
import { useColors } from '../../hooks/useColors';
import { SPACING } from '../../constants/theme';
import { CATEGORIES } from '../../constants/categories';
import { CategoryCard } from '../../components/CategoryCard';
import { SearchBar } from '../../components/SearchBar';
import { useRecentStore } from '../../store/useRecentStore';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function CategoriesScreen() {
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState('');
  const { addRecentCategory } = useRecentStore();

  const handleCategoryPress = (categoryId: string) => {
    addRecentCategory(categoryId);
    router.push(`/category/${categoryId}`);
  };

  const filteredCategories = CATEGORIES.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeIn.delay(index * 50).duration(300)}>
            <CategoryCard 
              name={item.name}
              icon={item.icon}
              count={item.templateCount}
              onPress={() => handleCategoryPress(item.id)}
              style={styles.card}
            />
          </Animated.View>
        )}
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
  row: {
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  card: {
    width: '31%', // Fits 3 columns nicely
  }
});
