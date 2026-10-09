import { View, StyleSheet, ScrollView, Text, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { User, Bike, Star, Package, LogOut, ChevronRight, Power } from 'lucide-react-native';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing } from '@theme/spacing';
import { radius } from '@theme/radius';
import { useAuthStore } from '@store/auth.store';
import { useDriverProfile, useToggleOnlineStatus } from '@hooks/useDriver';
import { Loading } from '@components/ui/Loading';
import { formatCurrency } from '@utils/currency';

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>{icon}</View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function DriverProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { data: profile, isLoading } = useDriverProfile(user?.id);
  const toggleOnline = useToggleOnlineStatus();

  const handleToggleOnline = () => {
    if (!user || !profile) return;
    toggleOnline.mutate(
      { driverId: user.id, isOnline: !profile.isOnline },
      {
        onError: (err) => Alert.alert('Error', err instanceof Error ? err.message : 'Failed to update status.'),
      },
    );
  };

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

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
        <Loading fullscreen message="Loading profile..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing['3xl'] }}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>{user?.fullName?.charAt(0) ?? 'D'}</Text>
          </View>
          <Text style={styles.name}>{user?.fullName ?? 'Driver'}</Text>
          <Text style={styles.email}>{user?.email ?? ''}</Text>
          <Pressable
            onPress={handleToggleOnline}
            style={({ pressed }) => [
              styles.onlineToggle,
              profile?.isOnline ? styles.onlineToggleActive : styles.onlineToggleInactive,
              pressed && { opacity: 0.8 },
            ]}
          >
            <Power size={16} color={profile?.isOnline ? colors.success : colors.textMuted} strokeWidth={2} />
            <Text style={[styles.onlineToggleText, { color: profile?.isOnline ? colors.success : colors.textMuted }]}>
              {profile?.isOnline ? 'Online' : 'Offline'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stats</Text>
          <View style={styles.card}>
            <InfoRow
              icon={<Package size={20} color={colors.primary} strokeWidth={2} />}
              label="Total Deliveries"
              value={String(profile?.totalDeliveries ?? 0)}
            />
            <InfoRow
              icon={<Star size={20} color={colors.star} fill={colors.star} strokeWidth={0} />}
              label="Rating"
              value={(profile?.rating ?? 5).toFixed(1)}
            />
            <InfoRow
              icon={<Bike size={20} color={colors.primary} strokeWidth={2} />}
              label="COD Collected Today"
              value={formatCurrency(profile?.codCollectedToday ?? 0)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle</Text>
          <View style={styles.card}>
            <InfoRow
              icon={<Bike size={20} color={colors.primary} strokeWidth={2} />}
              label="Vehicle Type"
              value={profile?.vehicleType ?? 'Bike'}
            />
            <InfoRow
              icon={<User size={20} color={colors.primary} strokeWidth={2} />}
              label="Vehicle Number"
              value={profile?.vehicleNumber || 'Not set'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <Pressable onPress={handleLogout} style={({ pressed }) => [styles.logoutRow, pressed && { opacity: 0.7 }]}>
              <View style={[styles.infoIcon, { backgroundColor: colors.errorLight }]}>
                <LogOut size={20} color={colors.error} strokeWidth={2} />
              </View>
              <Text style={[styles.infoLabel, { color: colors.error }]}>Log Out</Text>
              <ChevronRight size={20} color={colors.textMuted} strokeWidth={2} />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    ...typography.heading1,
    color: colors.white,
    fontSize: 28,
  },
  name: {
    ...typography.heading2,
    fontSize: 22,
    marginTop: spacing.md,
  },
  email: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 4,
  },
  onlineToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1.5,
    marginTop: spacing.md,
  },
  onlineToggleActive: { borderColor: colors.success, backgroundColor: colors.successLight },
  onlineToggleInactive: { borderColor: colors.border, backgroundColor: colors.surfaceSecondary },
  onlineToggleText: { ...typography.label, fontSize: 13 },
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryUltraLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: { flex: 1 },
  infoLabel: { ...typography.body, color: colors.textSecondary },
  infoValue: { ...typography.label, color: colors.textPrimary, marginTop: 2 },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
});
