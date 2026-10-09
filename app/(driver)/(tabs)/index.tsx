import { View, StyleSheet, ScrollView, Text, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Bike, TrendingRevenue, Package, Star, Power, ArrowRight } from 'lucide-react-native';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing } from '@theme/spacing';
import { radius } from '@theme/radius';
import { shadows } from '@theme/shadows';
import { Loading } from '@components/ui/Loading';
import { EmptyState } from '@components/ui/EmptyState';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { useAuthStore } from '@store/auth.store';
import { useDriverProfile, useDriverAssignedOrders, useToggleOnlineStatus } from '@hooks/useDriver';
import { formatCurrency } from '@utils/currency';
import { OrderStatus } from '@models/order';

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pending', CONFIRMED: 'Confirmed', PREPARING: 'Preparing',
  READY_FOR_PICKUP: 'Ready for Pickup', DRIVER_ASSIGNED: 'Assigned to You',
  DRIVER_ACCEPTED: 'Accepted', PICKED_UP: 'Picked Up',
  OUT_FOR_DELIVERY: 'Out for Delivery', DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled', REFUND_REQUESTED: 'Refund Requested', REFUNDED: 'Refunded',
};

function StatPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={styles.statPill}>
      {icon}
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

export default function DriverHomeScreen() {
  const user = useAuthStore((s) => s.user);
  const { data: profile, isLoading: profileLoading } = useDriverProfile(user?.id);
  const { data: assignedOrders, isLoading: ordersLoading } = useDriverAssignedOrders(user?.id);
  const toggleOnline = useToggleOnlineStatus();

  const activeOrders = (assignedOrders ?? []).filter(
    (o) => !['DELIVERED', 'CANCELLED'].includes(o.status),
  );

  const handleToggleOnline = () => {
    if (!user || !profile) return;
    toggleOnline.mutate(
      { driverId: user.id, isOnline: !profile.isOnline },
      {
        onError: (err) => Alert.alert('Error', err instanceof Error ? err.message : 'Failed to update status.'),
      },
    );
  };

  if (profileLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
        <Loading fullscreen message="Loading..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing['3xl'] }}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome,</Text>
            <Text style={styles.name}>{user?.fullName ?? 'Driver'}</Text>
          </View>
          <Pressable
            onPress={handleToggleOnline}
            style={({ pressed }) => [
              styles.onlineToggle,
              profile?.isOnline ? styles.onlineToggleActive : styles.onlineToggleInactive,
              pressed && { opacity: 0.8 },
            ]}
          >
            <Power size={18} color={profile?.isOnline ? colors.success : colors.textMuted} strokeWidth={2} />
            <Text style={[styles.onlineToggleText, { color: profile?.isOnline ? colors.success : colors.textMuted }]}>
              {profile?.isOnline ? 'Online' : 'Offline'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <StatPill
            icon={<Package size={20} color={colors.primary} strokeWidth={2} />}
            label="Deliveries"
            value={String(profile?.totalDeliveries ?? 0)}
          />
          <StatPill
            icon={<TrendingRevenue size={20} color={colors.success} strokeWidth={2} />}
            label="Earnings"
            value={formatCurrency(profile?.totalEarnings ?? 0)}
          />
          <StatPill
            icon={<Star size={20} color={colors.star} fill={colors.star} strokeWidth={0} />}
            label="Rating"
            value={(profile?.rating ?? 5).toFixed(1)}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Deliveries</Text>
            {activeOrders.length > 0 && (
              <Pressable onPress={() => router.push('/(driver)/(tabs)/active')}>
                <Text style={styles.seeAll}>View All</Text>
              </Pressable>
            )}
          </View>

          {ordersLoading ? (
            <Loading message="Loading orders..." />
          ) : activeOrders.length > 0 ? (
            <View style={styles.ordersList}>
              {activeOrders.slice(0, 3).map((order) => (
                <Pressable
                  key={order.id}
                  onPress={() => router.push(`/(driver)/order/${order.id}`)}
                  style={({ pressed }) => [styles.orderCard, pressed && { opacity: 0.9 }]}
                >
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                    {order.address && (
                      <Text style={styles.orderAddress} numberOfLines={1}>
                        {order.address.label} · {order.address.area}
                      </Text>
                    )}
                    <Text style={styles.orderItems}>{order.items.length} items · {formatCurrency(order.total)}</Text>
                  </View>
                  <View style={styles.orderRight}>
                    <Badge label={STATUS_LABELS[order.status] ?? order.status} variant="info" />
                    <ArrowRight size={18} color={colors.textMuted} strokeWidth={2} />
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Bike size={40} color={colors.textMuted} strokeWidth={1.5} />
              <Text style={styles.emptyTitle}>No active deliveries</Text>
              <Text style={styles.emptyText}>
                {profile?.isOnline
                  ? 'You\'re online. New orders will appear here when assigned.'
                  : 'Go online to start receiving delivery assignments.'}
              </Text>
              {!profile?.isOnline && (
                <Button
                  label="Go Online"
                  onPress={handleToggleOnline}
                  loading={toggleOnline.isPending}
                  size="md"
                  style={{ marginTop: spacing.md }}
                />
              )}
            </View>
          )}
        </View>

        {profile && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vehicle Info</Text>
            <View style={styles.vehicleCard}>
              <View style={styles.vehicleIcon}>
                <Bike size={24} color={colors.primary} strokeWidth={2} />
              </View>
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleType}>{profile.vehicleType}</Text>
                <Text style={styles.vehicleNumber}>{profile.vehicleNumber || 'Not set'}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  greeting: { ...typography.bodySmall, color: colors.textSecondary },
  name: { ...typography.heading1, fontSize: 22, color: colors.textPrimary, marginTop: 2 },
  onlineToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  onlineToggleActive: { borderColor: colors.success, backgroundColor: colors.successLight },
  onlineToggleInactive: { borderColor: colors.border, backgroundColor: colors.surfaceSecondary },
  onlineToggleText: { ...typography.label, fontSize: 13 },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  statPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  statValue: { ...typography.heading3, fontSize: 16 },
  statLabel: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  section: {
    marginTop: spacing['2xl'],
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: { ...typography.heading3, fontSize: 18 },
  seeAll: { ...typography.label, color: colors.primary, fontSize: 14 },
  ordersList: { gap: spacing.sm },
  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  orderInfo: { flex: 1 },
  orderNumber: { ...typography.label, fontSize: 14 },
  orderAddress: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  orderItems: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  orderRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.sm,
  },
  emptyTitle: {
    ...typography.heading3,
    fontSize: 16,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  vehicleIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryUltraLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleInfo: { flex: 1 },
  vehicleType: { ...typography.label, fontSize: 15 },
  vehicleNumber: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});
