import { View, StyleSheet, ScrollView, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Package, Clock, TrendingRevenue, Bike, ArrowRight } from 'lucide-react-native';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing } from '@theme/spacing';
import { radius } from '@theme/radius';
import { shadows } from '@theme/shadows';
import { Loading } from '@components/ui/Loading';
import { ErrorState } from '@components/ui/ErrorState';
import { Badge } from '@components/ui/Badge';
import { useDashboardStats, useAdminActiveOrders } from '@hooks/useAdmin';
import { formatCurrency } from '@utils/currency';
import { OrderStatus } from '@models/order';

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  READY_FOR_PICKUP: 'Ready',
  DRIVER_ASSIGNED: 'Driver Assigned',
  DRIVER_ACCEPTED: 'Driver En Route',
  PICKED_UP: 'Picked Up',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REFUND_REQUESTED: 'Refund Requested',
  REFUNDED: 'Refunded',
};

const STATUS_VARIANTS: Record<OrderStatus, 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PREPARING: 'info',
  READY_FOR_PICKUP: 'primary',
  DRIVER_ASSIGNED: 'info',
  DRIVER_ACCEPTED: 'info',
  PICKED_UP: 'info',
  OUT_FOR_DELIVERY: 'primary',
  DELIVERED: 'success',
  CANCELLED: 'error',
  REFUND_REQUESTED: 'warning',
  REFUNDED: 'neutral',
};

function StatCard({
  icon, label, value, color, bgColor,
}: { icon: React.ReactNode; label: string; value: string; color: string; bgColor: string }) {
  return (
    <View style={[styles.statCard, shadows.sm]}>
      <View style={[styles.statIcon, { backgroundColor: bgColor }]}>
        {icon}
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

export default function AdminDashboardScreen() {
  const { data: stats, isLoading: statsLoading, isError: statsError } = useDashboardStats();
  const { data: activeOrders, isLoading: ordersLoading } = useAdminActiveOrders();

  if (statsLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
        <Loading fullscreen message="Loading dashboard..." />
      </SafeAreaView>
    );
  }

  if (statsError) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
        <ErrorState message="Failed to load dashboard data." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing['3xl'] }}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.title}>64 Delivery Admin</Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            icon={<Package size={22} color={colors.primary} strokeWidth={2} />}
            label="Total Orders"
            value={String(stats?.totalOrders ?? 0)}
            color={colors.primary}
            bgColor={colors.primaryUltraLight}
          />
          <StatCard
            icon={<Clock size={22} color={colors.warning} strokeWidth={2} />}
            label="Active Orders"
            value={String(stats?.activeOrders ?? 0)}
            color={colors.warning}
            bgColor={colors.warningLight}
          />
          <StatCard
            icon={<TrendingRevenue size={22} color={colors.success} strokeWidth={2} />}
            label="Revenue"
            value={formatCurrency(stats?.revenue ?? 0)}
            color={colors.success}
            bgColor={colors.successLight}
          />
          <StatCard
            icon={<Bike size={22} color={colors.info} strokeWidth={2} />}
            label="Online Drivers"
            value={`${stats?.onlineDrivers ?? 0}/${stats?.totalDrivers ?? 0}`}
            color={colors.info}
            bgColor={colors.infoLight}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Orders</Text>
            <Pressable onPress={() => router.push('/(admin)/(tabs)/orders')}>
              <Text style={styles.seeAll}>View All</Text>
            </Pressable>
          </View>

          {ordersLoading ? (
            <Loading message="Loading orders..." />
          ) : activeOrders && activeOrders.length > 0 ? (
            <View style={styles.ordersList}>
              {activeOrders.slice(0, 5).map((order) => (
                <Pressable
                  key={order.id}
                  onPress={() => router.push(`/(admin)/order/${order.id}`)}
                  style={({ pressed }) => [styles.orderCard, pressed && { opacity: 0.9 }]}
                >
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                    <Text style={styles.orderTotal}>{formatCurrency(order.total)}</Text>
                  </View>
                  <View style={styles.orderRight}>
                    <Badge
                      label={STATUS_LABELS[order.status] ?? order.status}
                      variant={STATUS_VARIANTS[order.status] ?? 'neutral'}
                    />
                    <ArrowRight size={18} color={colors.textMuted} strokeWidth={2} />
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No active orders right now</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  greeting: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  title: {
    ...typography.heading1,
    fontSize: 24,
    color: colors.textPrimary,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  statCard: {
    flexBasis: '47%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    ...typography.heading2,
    fontSize: 20,
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
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
  sectionTitle: {
    ...typography.heading3,
    fontSize: 18,
  },
  seeAll: {
    ...typography.label,
    color: colors.primary,
    fontSize: 14,
  },
  ordersList: {
    gap: spacing.sm,
  },
  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    ...typography.label,
    fontSize: 14,
    color: colors.textPrimary,
  },
  orderTotal: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  orderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },
});
