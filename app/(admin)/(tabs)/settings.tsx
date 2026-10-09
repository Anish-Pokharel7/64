import { View, StyleSheet, ScrollView, Text, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Settings, LogOut, ChevronRight, User, Bell, Shield, Info } from 'lucide-react-native';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing } from '@theme/spacing';
import { radius } from '@theme/radius';
import { useAuthStore } from '@store/auth.store';

function SettingItem({
  icon, label, onPress, danger,
}: { icon: React.ReactNode; label: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.settingItem, pressed && { opacity: 0.7 }]}
    >
      <View style={[styles.settingIcon, danger && styles.settingIconDanger]}>{icon}</View>
      <Text style={[styles.settingLabel, danger && styles.settingLabelDanger]}>{label}</Text>
      <ChevronRight size={20} color={colors.textMuted} strokeWidth={2} />
    </Pressable>
  );
}

export default function AdminSettingsScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' as const },
      {
        text: 'Log Out',
        style: 'destructive' as const,
        onPress: () => logout().then(() => router.replace('/(auth)/welcome')),
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing['3xl'] }}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Settings size={24} color={colors.primary} strokeWidth={2} />
          </View>
          <View>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Admin Panel</Text>
          </View>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitial}>{user?.fullName?.charAt(0) ?? 'A'}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.fullName ?? 'Admin'}</Text>
            <Text style={styles.profileEmail}>{user?.email ?? ''}</Text>
            <Text style={styles.profileRole}>{user?.role ?? 'ADMIN'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <SettingItem
              icon={<User size={20} color={colors.primary} strokeWidth={2} />}
              label="Edit Profile"
              onPress={() => {}}
            />
            <SettingItem
              icon={<Bell size={20} color={colors.primary} strokeWidth={2} />}
              label="Notifications"
              onPress={() => {}}
            />
            <SettingItem
              icon={<Shield size={20} color={colors.primary} strokeWidth={2} />}
              label="Security"
              onPress={() => {}}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <SettingItem
              icon={<Info size={20} color={colors.primary} strokeWidth={2} />}
              label="About 64 Delivery"
              onPress={() => {}}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.card}>
            <SettingItem
              icon={<LogOut size={20} color={colors.error} strokeWidth={2} />}
              label="Log Out"
              onPress={handleLogout}
              danger
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryUltraLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.heading2,
    fontSize: 22,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    ...typography.heading2,
    color: colors.white,
    fontSize: 22,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...typography.heading3,
    fontSize: 17,
  },
  profileEmail: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  profileRole: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textMuted,
    textTransform: 'uppercase',
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryUltraLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingIconDanger: {
    backgroundColor: colors.errorLight,
  },
  settingLabel: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
  },
  settingLabelDanger: {
    color: colors.error,
  },
});
