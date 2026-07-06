import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColors } from '../../hooks/useColors';
import { EmptyState } from '../../components/EmptyState';
import { router } from 'expo-router';
import { SPACING } from '../../constants/theme';

export default function GalleryScreen() {
  const colors = useColors();

  // We are building the architecture, no real camera capture yet
  // so the gallery will always be empty for now.
  
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  }
});
