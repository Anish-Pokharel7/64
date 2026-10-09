import { View, StyleSheet, ScrollView, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState } from 'react';
import { ClipboardList, ArrowRight } from 'lucide-react-native';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing } from '@theme/spacing';
import { radius } from '@theme/radius';
import { shadows } from '@theme/shadows';
import { Loading } from '@components/ui/Loading';
import { ErrorState } from '@components/ui/ErrorState';
import { EmptyState } from '@components/ui/EmptyState';
import { Badge } from '@components/ui/Badge';
import { useAdminOrders } from '@hooks/useAdmin';
import { formatCurrency } from '@utils/currency';
import { OrderStatus } from '@models/order';

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  READY_FOR_PICKUP: 'Ready',
  DRIVER_ASSIGNED: 'Driver Assigned',
  DRIVER_ACCEPTED: 'En Route',
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

type FilterKey = 'all' | 'active' | 'delivered' | 'cancelled';

const FILTERS: { key: FilterKey; label: string; statuses?: OrderStatus[] }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active', statuses: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'DRIVER_ASSIGNED', 'DRIVER_ACCEPTED', 'PICKED_UP', 'OUT_FOR_DELIVERY'] },
  { key: 'delivered', label: 'Delivered', statuses: ['DELIVERED'] },
  { key: 'cancelled', label: 'Cancelled', statuses: ['CANCELLED'] },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminOrdersScreen() {
  const { data: orders, isLoading, isError, refetch } = useAdminOrders();
  const [filter, setFilter] = useState<FilterKey>('active');

  const filtered = (() => {
    if (!orders) return [];
    const f = FILTERS.find((x) => x.key === filter);
    if (!f?.statuses) return orders;
    return orders.filter((o) => f.statuses!.includes(o.status));
  })();

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
        <Loading fullscreen message="Loading orders..." />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
        <ErrorState onRetry={() => refetch()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <ClipboardList size={24} color={colors.primary} strokeWidth={2} />
        </View>
        <View>
          <Text style={styles.title}>All Orders</Text>
          <Text style={styles.subtitle}>{filtered.length} orders</Text>
        </View>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing['3xl'] }}>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={48} color={colors.textMuted} strokeWidth={1.5} />}
            title="No orders found"
            message="Orders will appear here once customers start placing them."
          />
        ) : (
          <View style={styles.list}>
            {filtered.map((order) => (
              <Pressable
                key={order.id}
                onPress={() => router.push(`/(admin)/order/${order.id}`)}
                style={({ pressed }) => [styles.orderCard, pressed && { opacity: 0.9 }]}
              >
                <View style={styles.orderLeft}>
                  <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                  <Text style={styles.orderDate}>{formatDate(order.placedAt ?? order.createdAt)}</Text>
                  <Text style={styles.orderItems}>{order.items.length} item{order.items.length === 1 ? '' : 's'} · {formatCurrency(order.total)}</Text>
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
        )}
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    ...typography.label,
    color: colors.textSecondary,
    fontSize: 13,
  },
  filterTextActive: {
    color: colors.white,
  },
  list: {
    paddingHorizontal: spacing.lg,
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
  orderLeft: {
    flex: 1,
  },
  orderNumber: {
    ...typography.label,
    fontSize: 15,
  },
  orderDate: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  orderItems: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 4,
  },
  orderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
