import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, FlatList } from 'react-native';
import { router } from 'expo-router';
import { useColors } from '../../hooks/useColors';
import { SPACING, TYPOGRAPHY } from '../../constants/theme';
import { CATEGORIES, MOCK_TEMPLATES } from '../../constants/categories';
import { SearchBar } from '../../components/SearchBar';
import { AnimatedBanner } from '../../components/AnimatedBanner';
import { CategoryCard } from '../../components/CategoryCard';
import { SectionHeader } from '../../components/SectionHeader';
import { useRecentStore } from '../../store/useRecentStore';
import { useAuthStore } from '../../store/useAuthStore';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuthStore();
  const { recentCategories, addRecentCategory } = useRecentStore();

  const handleCategoryPress = (categoryId: string) => {
    addRecentCategory(categoryId);
    router.push(`/category/${categoryId}`);
  };

  const handleSubscribe = () => {
    router.push('/subscription');
  };

  const renderTemplateItem = ({ item }: { item: typeof MOCK_TEMPLATES[0] }) => (
    <TouchableOpacity 
      style={[styles.templateCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}
      onPress={() => router.push(`/camera/${item.id}`)}
    >
      <View style={[styles.templatePlaceholder, { backgroundColor: colors.secondary, borderRadius: colors.radius }]} />
      <Text style={[styles.templateName, { color: colors.foreground }]} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Animated.View entering={FadeInUp.duration(400)} style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Hello, {user?.name || 'Guest'}</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Ready to shoot?</Text>
        </View>
        <TouchableOpacity 
          style={[styles.proBadge, { backgroundColor: user?.isPremium ? colors.primary : colors.secondary, borderRadius: 20 }]}
          onPress={user?.isPremium ? undefined : handleSubscribe}
        >
          <Text style={[styles.proText, { color: user?.isPremium ? colors.primaryForeground : colors.foreground }]}>
            {user?.isPremium ? 'PRO' : 'Upgrade'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <SearchBar 
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search templates or categories..."
        style={styles.searchBar}
      />

      <AnimatedBanner 
        title="Pose Master Pro"
        subtitle="Unlock all professional templates"
        onPress={handleSubscribe}
      />

      <SectionHeader 
        title="Popular Categories" 
        actionTitle="See All" 
        onActionPress={() => router.navigate('/(tabs)/categories')} 
      />
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        data={CATEGORIES.slice(0, 6)}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <CategoryCard 
            name={item.name}
            icon={item.icon}
            count={item.templateCount}
            onPress={() => handleCategoryPress(item.id)}
          />
        )}
      />

      {recentCategories.length > 0 && (
        <>
          <SectionHeader title="Recently Viewed" style={{ marginTop: SPACING.xl }} />
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            data={recentCategories.map(id => CATEGORIES.find(c => c.id === id)).filter(Boolean) as typeof CATEGORIES}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <CategoryCard 
                name={item.name}
                icon={item.icon}
                count={item.templateCount}
                onPress={() => handleCategoryPress(item.id)}
              />
            )}
          />
        </>
      )}

      <SectionHeader title="Trending Poses" style={{ marginTop: SPACING.xl }} />
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        data={MOCK_TEMPLATES}
        keyExtractor={item => item.id}
        renderItem={renderTemplateItem}
      />

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 60, // Safe area approx
    paddingBottom: 100, // Tab bar padding approx
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  greeting: {
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.md,
    marginBottom: 4,
  },
  title: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.xxxl,
  },
  proBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  proText: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.xs,
    letterSpacing: 1,
  },
  searchBar: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  listContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  templateCard: {
    width: 140,
    padding: SPACING.sm,
  },
  templatePlaceholder: {
    width: '100%',
    aspectRatio: 3/4,
    marginBottom: SPACING.sm,
  },
  templateName: {
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  bottomPadding: {
    height: 40,
  }
});
