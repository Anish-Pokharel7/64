import { View, StyleSheet, ScrollView, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  MapPin, ClipboardList, Heart, Bell, HelpCircle, LogOut,
  ChevronRight, Edit3, Ticket, Package,
} from 'lucide-react-native';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing } from '@theme/spacing';
import { Avatar } from '@components/ui/Avatar';
import { useLogout } from '@hooks/useAuth';
import { useAuthStore } from '@store/auth.store';
import { useUnreadNotificationCount } from '@hooks/useNotifications';

export default function ProfileScreen() {
  const logoutMutation = useLogout();
  const user = useAuthStore((s) => s.user);
  const unreadCount = useUnreadNotificationCount();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => router.replace('/(auth)/welcome'),
    });
  };

  if (!user) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing['3xl'] }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        <View style={styles.profileCard}>
          <Avatar name={user.fullName} size={64} />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user.fullName}</Text>
            <Text style={styles.email}>{user.email}</Text>
            <Text style={styles.phone}>{user.phone}</Text>
          </View>
          <Pressable
            onPress={() => {}}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
            style={styles.editButton}
          >
            <Edit3 size={18} color={colors.primary} strokeWidth={2} />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <MenuItem icon={<MapPin size={20} color={colors.primary} strokeWidth={2} />} label="Saved Addresses" onPress={() => router.push('/(customer)/addresses')} />
          <MenuItem icon={<ClipboardList size={20} color={colors.primary} strokeWidth={2} />} label="My Orders" onPress={() => router.push('/(customer)/(tabs)/orders')} />
          <MenuItem icon={<Edit3 size={20} color={colors.primary} strokeWidth={2} />} label="Edit Profile" onPress={() => {}} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <MenuItem icon={<Heart size={20} color={colors.primary} strokeWidth={2} />} label="Favorites" onPress={() => router.push('/(customer)/favorites')} />
          <MenuItem
            icon={<Bell size={20} color={colors.primary} strokeWidth={2} />}
            label="Notifications"
            badge={unreadCount.data && unreadCount.data > 0 ? unreadCount.data : undefined}
            onPress={() => router.push('/(customer)/notification')}
          />
          <MenuItem icon={<Ticket size={20} color={colors.primary} strokeWidth={2} />} label="Coupons" onPress={() => router.push('/(customer)/cupon')} />
          <MenuItem icon={<Package size={20} color={colors.primary} strokeWidth={2} />} label="Combo Sets" onPress={() => router.push('/(customer)/(tabs)/search?tab=combos')} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <MenuItem icon={<HelpCircle size={20} color={colors.primary} strokeWidth={2} />} label="Help & Support" onPress={() => router.push('/(customer)/support')} />
        </View>

        <View style={styles.logoutSection}>
          <Pressable
            onPress={handleLogout}
            accessibilityRole="button"
            accessibilityLabel="Logout"
            style={({ pressed }) => [styles.logoutButton, pressed && { opacity: 0.7 }]}
          >
            <LogOut size={20} color={colors.error} strokeWidth={2} />
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>

        <Text style={styles.versionText}>64 Delivery v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  badge?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.7 }]}
    >
      <View style={styles.menuIcon}>{icon}</View>
      <Text style={styles.menuLabel}>{label}</Text>
      {badge !== undefined && (
        <View style={styles.menuBadge}>
          <Text style={styles.menuBadgeText}>{badge}</Text>
        </View>
      )}
      <ChevronRight size={20} color={colors.textMuted} strokeWidth={2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.heading1,
    fontSize: 26,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    ...typography.heading2,
    fontSize: 20,
  },
  email: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  phone: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 1,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryUltraLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textMuted,
    textTransform: 'uppercase',
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primaryUltraLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
  },
  menuBadge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  menuBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  logoutSection: {
    marginTop: spacing['2xl'],
    paddingHorizontal: spacing.lg,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.error,
  },
  logoutText: {
    ...typography.button,
    color: colors.error,
  },
  versionText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing['2xl'],
  },
});
