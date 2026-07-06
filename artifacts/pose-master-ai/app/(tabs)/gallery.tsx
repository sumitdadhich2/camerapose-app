import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useColors } from '../../hooks/useColors';
import { EmptyState } from '../../components/EmptyState';
import { router } from 'expo-router';
import { SPACING } from '../../constants/theme';
import { useCapturedPhotosStore } from '../../store/useCapturedPhotosStore';

const { width } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const ITEM_SIZE = width / NUM_COLUMNS;

export default function GalleryScreen() {
  const colors = useColors();
  const { photos, loadPhotos } = useCapturedPhotosStore();

  useEffect(() => {
    loadPhotos();
  }, []);

  if (photos.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState 
          icon="images"
          title="No Photos Yet"
          description="Your captured photos using Pose Master templates will appear here."
          actionTitle="Browse Templates"
          onActionPress={() => router.navigate('/(tabs)/categories')}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.photoContainer}
            activeOpacity={0.8}
            onPress={() => {
              // In a real app we'd open a full screen viewer
            }}
          >
            <Image source={{ uri: item.uri }} style={styles.photo} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  photoContainer: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    padding: 1,
  },
  photo: {
    width: '100%',
    height: '100%',
  }
});
