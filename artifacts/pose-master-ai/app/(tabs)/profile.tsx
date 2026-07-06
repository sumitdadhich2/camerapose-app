import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useColors } from '../../hooks/useColors';
import { useAuthStore } from '../../store/useAuthStore';
import { AuthService } from '../../services/AuthService';
import { router } from 'expo-router';
import { SPACING, TYPOGRAPHY } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../components/PrimaryButton';

export default function ProfileScreen() {
  const colors = useColors();
  const { user, setUser } = useAuthStore();

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Sign Out', 
        style: 'destructive',
        onPress: async () => {
          await AuthService.signOut();
          setUser(null);
          router.replace('/login');
        }
      }
    ]);
  };

  const MenuItem = ({ icon, title, onPress, value }: { icon: string, title: string, onPress: () => void, value?: string }) => (
    <TouchableOpacity 
      style={[styles.menuItem, { borderBottomColor: colors.border }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <Ionicons name={icon as any} size={24} color={colors.foreground} />
        <Text style={[styles.menuItemText, { color: colors.foreground }]}>{title}</Text>
      </View>
      <View style={styles.menuItemRight}>
        {value && <Text style={[styles.menuItemValue, { color: colors.mutedForeground }]}>{value}</Text>}
        <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.secondary, borderRadius: 50 }]}>
          <Ionicons name="person" size={40} color={colors.mutedForeground} />
        </View>
        <Text style={[styles.name, { color: colors.foreground }]}>{user?.name}</Text>
        <View style={[styles.badge, { backgroundColor: user?.isGuest ? colors.secondary : colors.primary }]}>
          <Text style={[styles.badgeText, { color: user?.isGuest ? colors.secondaryForeground : colors.primaryForeground }]}>
            {user?.isGuest ? 'Guest User' : (user?.isPremium ? 'PRO Member' : 'Free Member')}
          </Text>
        </View>
      </View>

      {user?.isGuest && (
        <View style={styles.guestPromo}>
          <Text style={[styles.guestPromoText, { color: colors.foreground }]}>Create an account to sync your favorites and access premium templates.</Text>
          <PrimaryButton title="Sign Up / Log In" onPress={() => router.replace('/login')} />
        </View>
      )}

      <View style={[styles.section, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        <MenuItem icon="star" title="Pose Master Pro" onPress={() => router.push('/subscription')} value={user?.isPremium ? 'Active' : 'Upgrade'} />
        <MenuItem icon="settings-outline" title="Settings" onPress={() => router.push('/settings')} />
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        <MenuItem icon="shield-checkmark-outline" title="Privacy Policy" onPress={() => router.push('/privacy')} />
        <MenuItem icon="document-text-outline" title="Terms & Conditions" onPress={() => router.push('/terms')} />
        <MenuItem icon="information-circle-outline" title="About" onPress={() => router.push('/about')} />
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        <MenuItem icon="share-social-outline" title="Share App" onPress={() => {}} />
        <MenuItem icon="star-outline" title="Rate on App Store" onPress={() => {}} />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={[styles.logoutText, { color: colors.destructive }]}>Sign Out</Text>
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.xl,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  avatar: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  name: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.xxl,
    marginBottom: SPACING.sm,
  },
  badge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  badgeText: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.xs,
    textTransform: 'uppercase',
  },
  guestPromo: {
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  guestPromoText: {
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.md,
    textAlign: 'center',
  },
  section: {
    marginBottom: SPACING.xl,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  menuItemText: {
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.md,
  },
  menuItemValue: {
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  logoutButton: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  logoutText: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.md,
  },
  bottomPadding: {
    height: 100,
  }
});
