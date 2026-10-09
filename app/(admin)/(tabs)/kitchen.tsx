import { View, StyleSheet, ScrollView, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChefHat, Clock, Package, Check, ArrowRight } from 'lucide-react-native';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing } from '@theme/spacing';
import { radius } from '@theme/radius';
import { shadows } from '@theme/shadows';
import { Loading } from '@components/ui/Loading';
import { ErrorState } from '@components/ui/ErrorState';
import { EmptyState } from '@components/ui/EmptyState';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { useAdminOrders, useUpdateOrderStatus } from '@hooks/useAdmin';
import { formatCurrency } from '@utils/currency';
import { OrderStatus } from '@models/order';
import { Order } from '@models/order';

const KITCHEN_STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP'];

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'New',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Cooking',
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

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

function OrderTicket({
  order,
  onAction,
  actionLabel,
  actionLoading,
}: {
  order: Order;
  onAction: () => void;
  actionLabel: string;
  actionLoading?: boolean;
}) {
  return (
    <View style={styles.ticketCard}>
      <View style={styles.ticketHeader}>
        <View>
          <Text style={styles.ticketNumber}>{order.orderNumber}</Text>
          <Text style={styles.ticketTime}>{timeAgo(order.placedAt ?? order.createdAt)}</Text>
        </View>
        <Badge label={STATUS_LABELS[order.status] ?? order.status} variant="warning" />
      </View>

      <View style={styles.ticketItems}>
        {order.items.map((item) => (
          <View key={item.id} style={styles.ticketItem}>
            <Text style={styles.ticketQty}>{item.quantity}×</Text>
            <Text style={styles.ticketName} numberOfLines={2}>{item.name}</Text>
          </View>
        ))}
      </View>

      {order.customerNote && (
        <View style={styles.noteBox}>
          <Text style={styles.noteLabel}>Note:</Text>
          <Text style={styles.noteText}>{order.customerNote}</Text>
        </View>
      )}

      <View style={styles.ticketFooter}>
        <Text style={styles.ticketTotal}>{formatCurrency(order.total)}</Text>
        <Button
          label={actionLabel}
          onPress={onAction}
          loading={actionLoading}
          size="sm"
        />
      </View>
    </View>
  );
}

export default function KitchenScreen() {
  const { data: orders, isLoading, isError, refetch } = useAdminOrders();
  const updateStatus = useUpdateOrderStatus();

  const kitchenOrders = (orders ?? []).filter((o) => KITCHEN_STATUSES.includes(o.status));

  const pendingOrders = kitchenOrders.filter((o) => o.status === 'PENDING');
  const confirmedOrders = kitchenOrders.filter((o) => o.status === 'CONFIRMED');
  const preparingOrders = kitchenOrders.filter((o) => o.status === 'PREPARING');
  const readyOrders = kitchenOrders.filter((o) => o.status === 'READY_FOR_PICKUP');

  const handleAction = (order: Order) => {
    const nextStatus: Record<string, OrderStatus> = {
      PENDING: 'CONFIRMED',
      CONFIRMED: 'PREPARING',
      PREPARING: 'READY_FOR_PICKUP',
    };
    const next = nextStatus[order.status];
    if (next) {
      updateStatus.mutate({ orderId: order.id, status: next });
    }
  };

  const getActionLabel = (status: OrderStatus): string => {
    if (status === 'PENDING') return 'Confirm';
    if (status === 'CONFIRMED') return 'Start Cooking';
    if (status === 'PREPARING') return 'Mark Ready';
    return '';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
        <Loading fullscreen message="Loading kitchen orders..." />
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
          <ChefHat size={24} color={colors.primary} strokeWidth={2} />
        </View>
        <View>
          <Text style={styles.title}>Kitchen Display</Text>
          <Text style={styles.subtitle}>{kitchenOrders.length} active orders</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing['3xl'] }}>
        {kitchenOrders.length === 0 ? (
          <EmptyState
            icon={<ChefHat size={48} color={colors.textMuted} strokeWidth={1.5} />}
            title="All caught up!"
            message="No orders in the kitchen right now."
          />
        ) : (
          <>
            {pendingOrders.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.warning }]}>
                  New Orders ({pendingOrders.length})
                </Text>
                {pendingOrders.map((order) => (
                  <OrderTicket
                    key={order.id}
                    order={order}
                    onAction={() => handleAction(order)}
                    actionLabel={getActionLabel(order.status)}
                    actionLoading={updateStatus.isPending}
                  />
                ))}
              </View>
            )}

            {confirmedOrders.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.info }]}>
                  Confirmed ({confirmedOrders.length})
                </Text>
                {confirmedOrders.map((order) => (
                  <OrderTicket
                    key={order.id}
                    order={order}
                    onAction={() => handleAction(order)}
                    actionLabel={getActionLabel(order.status)}
                    actionLoading={updateStatus.isPending}
                  />
                ))}
              </View>
            )}

            {preparingOrders.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                  Cooking ({preparingOrders.length})
                </Text>
                {preparingOrders.map((order) => (
                  <OrderTicket
                    key={order.id}
                    order={order}
                    onAction={() => handleAction(order)}
                    actionLabel={getActionLabel(order.status)}
                    actionLoading={updateStatus.isPending}
                  />
                ))}
              </View>
            )}

            {readyOrders.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.success }]}>
                  Ready for Pickup ({readyOrders.length})
                </Text>
                {readyOrders.map((order) => (
                  <Pressable
                    key={order.id}
                    onPress={() => router.push(`/(admin)/order/${order.id}`)}
                  >
                    <View style={[styles.ticketCard, { borderColor: colors.success, borderWidth: 1.5 }]}>
                      <View style={styles.ticketHeader}>
                        <View>
                          <Text style={styles.ticketNumber}>{order.orderNumber}</Text>
                          <Text style={styles.ticketTime}>{timeAgo(order.placedAt ?? order.createdAt)}</Text>
                        </View>
                        <View style={styles.readyBadge}>
                          <Check size={16} color={colors.success} strokeWidth={3} />
                          <Text style={styles.readyText}>Ready</Text>
                        </View>
                      </View>
                      <View style={styles.ticketItems}>
                        {order.items.map((item) => (
                          <View key={item.id} style={styles.ticketItem}>
                            <Text style={styles.ticketQty}>{item.quantity}×</Text>
                            <Text style={styles.ticketName} numberOfLines={2}>{item.name}</Text>
                          </View>
                        ))}
                      </View>
                      <View style={styles.ticketFooter}>
                        <Text style={styles.ticketTotal}>{formatCurrency(order.total)}</Text>
                        <View style={styles.awaitingDriver}>
                          <ArrowRight size={16} color={colors.textMuted} strokeWidth={2} />
                          <Text style={styles.awaitingText}>Assign driver</Text>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </>
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
    paddingBottom: spacing.md,
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
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.heading3,
    fontSize: 16,
    marginBottom: spacing.md,
  },
  ticketCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  ticketNumber: {
    ...typography.label,
    fontSize: 15,
  },
  ticketTime: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  ticketItems: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  ticketItem: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  ticketQty: {
    ...typography.label,
    color: colors.primary,
    fontSize: 14,
    minWidth: 28,
  },
  ticketName: {
    ...typography.body,
    flex: 1,
    color: colors.textPrimary,
  },
  noteBox: {
    backgroundColor: colors.warningLight,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  noteLabel: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '700',
  },
  noteText: {
    ...typography.caption,
    color: colors.textPrimary,
    marginTop: 2,
  },
  ticketFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  ticketTotal: {
    ...typography.heading3,
    fontSize: 16,
    color: colors.primary,
  },
  readyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  readyText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '700',
  },
  awaitingDriver: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  awaitingText: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
