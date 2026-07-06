import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Text, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useColors } from '../../hooks/useColors';
import { SPACING, TYPOGRAPHY } from '../../constants/theme';
import { SearchBar } from '../../components/SearchBar';
import { AnimatedBanner } from '../../components/AnimatedBanner';
import { CategoryCard } from '../../components/CategoryCard';
import { PoseCard } from '../../components/PoseCard';
import { SectionHeader } from '../../components/SectionHeader';
import { useRecentStore } from '../../store/useRecentStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { PoseLibraryService } from '../../services/PoseLibraryService';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuthStore();
  const { recentCategories, continueLastPoseId } = useRecentStore();
  const { favoritePoseIds, toggleFavoritePose } = useFavoritesStore();

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/category/${categoryId}`);
  };

  const handlePosePress = (poseId: string) => {
    router.push(`/pose/${poseId}`);
  };

  const handleSubscribe = () => {
    router.push('/subscription');
  };

  const trendingPoses = useMemo(() => PoseLibraryService.getTrending(), []);
  const recommendedPoses = useMemo(() => PoseLibraryService.getRecommended(), []);
  const newPoses = useMemo(() => PoseLibraryService.getNewPoses(), []);
  const allCategories = useMemo(() => PoseLibraryService.getAllCategories(), []);
  const quickCategories = useMemo(() => allCategories.slice(0, 8), [allCategories]);

  // Search results logic
  const searchResults = useMemo(() => {
    if (searchQuery.trim() === '') return null;
    return PoseLibraryService.searchPoses(searchQuery);
  }, [searchQuery]);

  const renderPoseItem = ({ item }: { item: any }) => (
    <PoseCard 
      pose={item}
      onPress={() => handlePosePress(item.id)}
      isFavorite={favoritePoseIds.includes(item.id)}
      onToggleFavorite={() => toggleFavoritePose(item.id)}
    />
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      contentInsetAdjustmentBehavior="automatic"
      stickyHeaderIndices={[1]}
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

      <View style={[styles.searchWrapper, { backgroundColor: colors.background }]}>
        <SearchBar 
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search poses, tags, categories..."
          style={styles.searchBar}
        />
      </View>

      {searchResults && (
        <View style={styles.searchResultsContainer}>
          <Text style={[styles.resultsHeader, { color: colors.foreground }]}>Search Results</Text>
          {searchResults.length > 0 ? (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
              data={searchResults}
              keyExtractor={item => item.id}
              renderItem={renderPoseItem}
            />
          ) : (
            <Text style={[styles.noResults, { color: colors.mutedForeground }]}>No poses found</Text>
          )}
        </View>
      )}

      {!searchResults && (
        <>
          <AnimatedBanner 
            title="Pose Master Pro"
            subtitle="Unlock all professional templates"
            onPress={handleSubscribe}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickCatsRow}>
            {quickCategories.map(cat => (
              <TouchableOpacity 
                key={cat.id} 
                style={[styles.quickCatChip, { backgroundColor: colors.secondary, borderRadius: colors.radius }]}
                onPress={() => handleCategoryPress(cat.id)}
              >
                <Ionicons name={cat.icon as any} size={16} color={colors.foreground} />
                <Text style={[styles.quickCatText, { color: colors.foreground }]}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {continueLastPoseId && PoseLibraryService.getPoseById(continueLastPoseId) && (
            <View style={styles.continueSection}>
              <SectionHeader title="Continue Last Pose" />
              <TouchableOpacity 
                style={[styles.continueCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}
                onPress={() => handlePosePress(continueLastPoseId)}
              >
                <View style={[styles.continueImg, { backgroundColor: PoseLibraryService.getPoseById(continueLastPoseId)?.previewImage || colors.secondary, borderRadius: colors.radius }]} />
                <View style={styles.continueInfo}>
                  <Text style={[styles.continueTitle, { color: colors.foreground }]} numberOfLines={1}>
                    {PoseLibraryService.getPoseById(continueLastPoseId)?.title}
                  </Text>
                  <Text style={[styles.continueSub, { color: colors.mutedForeground }]}>Tap to resume</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          )}

          <SectionHeader title="Trending Today" style={{ marginTop: SPACING.xl }} />
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            data={trendingPoses}
            keyExtractor={item => item.id}
            renderItem={renderPoseItem}
          />

          <SectionHeader 
            title="Popular Categories" 
            actionTitle="See All" 
            onActionPress={() => router.navigate('/(tabs)/categories')} 
            style={{ marginTop: SPACING.xl }} 
          />
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            data={allCategories.slice(0, 6)}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <CategoryCard 
                name={item.name}
                icon={item.icon}
                count={item.poseCount}
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
                data={recentCategories.map(id => PoseLibraryService.getCategoryById(id)).filter(Boolean) as any}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <CategoryCard 
                    name={item.name}
                    icon={item.icon}
                    count={item.poseCount}
                    onPress={() => handleCategoryPress(item.id)}
                  />
                )}
              />
            </>
          )}

          <SectionHeader title="Recommended For You" style={{ marginTop: SPACING.xl }} />
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            data={recommendedPoses}
            keyExtractor={item => item.id}
            renderItem={renderPoseItem}
          />

          <SectionHeader title="New Arrivals" style={{ marginTop: SPACING.xl }} />
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            data={newPoses}
            keyExtractor={item => item.id}
            renderItem={renderPoseItem}
          />
        </>
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 60,
    paddingBottom: 100,
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
  searchWrapper: {
    paddingBottom: SPACING.md,
  },
  searchBar: {
    marginHorizontal: SPACING.lg,
  },
  searchResultsContainer: {
    marginTop: SPACING.md,
  },
  resultsHeader: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.xl,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  noResults: {
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.md,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  quickCatsRow: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
    paddingTop: SPACING.md,
  },
  quickCatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  quickCatText: {
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  continueSection: {
    marginTop: SPACING.md,
  },
  continueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    padding: SPACING.sm,
  },
  continueImg: {
    width: 60,
    height: 60,
    marginRight: SPACING.md,
  },
  continueInfo: {
    flex: 1,
  },
  continueTitle: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.md,
    marginBottom: 4,
  },
  continueSub: {
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  listContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  bottomPadding: {
    height: 40,
  }
});