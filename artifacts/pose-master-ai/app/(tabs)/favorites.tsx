import React from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity } from 'react-native';
import { useColors } from '../../hooks/useColors';
import { EmptyState } from '../../components/EmptyState';
import { router } from 'expo-router';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { MOCK_TEMPLATES } from '../../constants/categories';
import { SPACING, TYPOGRAPHY } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function FavoritesScreen() {
  const colors = useColors();
  const { favoriteIds, toggleFavorite } = useFavoritesStore();

  const favoriteTemplates = MOCK_TEMPLATES.filter(t => favoriteIds.includes(t.id));

  if (favoriteTemplates.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState 
          icon="heart"
          title="No Favorites Yet"
          description="Mark pose templates as favorite to easily find them later."
          actionTitle="Explore Poses"
          onActionPress={() => router.navigate('/(tabs)/categories')}
        />
      </View>
    );
  }

  const renderItem = ({ item }: { item: typeof MOCK_TEMPLATES[0] }) => (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius }]}
      onPress={() => router.push(`/camera/${item.id}`)}
      activeOpacity={0.8}
    >
      <View style={[styles.placeholder, { backgroundColor: colors.secondary, borderRadius: colors.radius }]} />
      <View style={styles.cardInfo}>
        <Text style={[styles.cardName, { color: colors.foreground }]} numberOfLines={1}>{item.name}</Text>
        <TouchableOpacity 
          style={styles.favButton}
          onPress={() => toggleFavorite(item.id)}
        >
          <Ionicons name="heart" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.headerText, { color: colors.foreground }]}>Favorites</Text>
      <FlatList
        data={favoriteTemplates}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
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
    marginBottom: SPACING.md,
  },
  listContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  card: {
    width: '48%',
    padding: SPACING.sm,
  },
  placeholder: {
    width: '100%',
    aspectRatio: 3/4,
    marginBottom: SPACING.sm,
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
