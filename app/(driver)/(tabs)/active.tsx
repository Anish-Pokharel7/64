import { View, StyleSheet, ScrollView, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Bike, MapPin, Package, ArrowRight, Clock } from 'lucide-react-native';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing } from '@theme/spacing';
import { radius } from '@theme/radius';
import { shadows } from '@theme/shadows';
import { Loading } from '@components/ui/Loading';
import { EmptyState } from '@components/ui/EmptyState';
import { Badge } from '@components/ui/Badge';
import { useAuthStore } from '@store/auth.store';
import { useDriverAssignedOrders, useDriverHistory } from '@hooks/useDriver';
import { formatCurrency } from '@utils/currency';
import { OrderStatus } from '@models/order';
import { useState } from 'react';

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pending', CONFIRMED: 'Confirmed', PREPARING: 'Preparing',
  READY_FOR_PICKUP: 'Ready', DRIVER_ASSIGNED: 'Assigned',
  DRIVER_ACCEPTED: 'Accepted', PICKED_UP: 'Picked Up',
  OUT_FOR_DELIVERY: 'Out for Delivery', DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled', REFUND_REQUESTED: 'Refund Requested', REFUNDED: 'Refunded',
};

type Tab = 'active' | 'history';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function DriverActiveScreen() {
  const user = useAuthStore((s) => s.user);
  const { data: assignedOrders, isLoading: assignedLoading } = useDriverAssignedOrders(user?.id);
  const { data: history, isLoading: historyLoading } = useDriverHistory(user?.id);
  const [tab, setTab] = useState<Tab>('active');

  const activeOrders = (assignedOrders ?? []).filter(
    (o) => !['DELIVERED', 'CANCELLED'].includes(o.status),
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Bike size={24} color={colors.primary} strokeWidth={2} />
        </View>
        <View>
          <Text style={styles.title}>Deliveries</Text>
          <Text style={styles.subtitle}>{activeOrders.length} active · {history?.length ?? 0} completed</Text>
        </View>
      </View>

      <View style={styles.tabRow}>
        <Pressable
          onPress={() => setTab('active')}
          style={[styles.tab, tab === 'active' && styles.tabActive]}
        >
          <Text style={[styles.tabText, tab === 'active' && styles.tabTextActive]}>Active ({activeOrders.length})</Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('history')}
          style={[styles.tab, tab === 'history' && styles.tabActive]}
        >
          <Text style={[styles.tabText, tab === 'history' && styles.tabTextActive]}>History ({history?.length ?? 0})</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing['3xl'] }}>
        {tab === 'active' ? (
          assignedLoading ? (
            <Loading message="Loading active orders..." />
          ) : activeOrders.length > 0 ? (
            <View style={styles.list}>
              {activeOrders.map((order) => (
                <Pressable
                  key={order.id}
                  onPress={() => router.push(`/(driver)/order/${order.id}`)}
                  style={({ pressed }) => [styles.orderCard, pressed && { opacity: 0.9 }]}
                >
                  <View style={styles.orderTop}>
                    <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                    <Badge label={STATUS_LABELS[order.status] ?? order.status} variant="info" />
                  </View>
                  {order.address && (
                    <View style={styles.addressRow}>
                      <MapPin size={16} color={colors.primary} strokeWidth={2} />
                      <Text style={styles.addressText} numberOfLines={2}>
                        {order.address.label} · {order.address.address}, {order.address.area}
                      </Text>
                    </View>
                  )}
                  <View style={styles.orderBottom}>
                    <View style={styles.orderMetaItem}>
                      <Package size={14} color={colors.textMuted} strokeWidth={2} />
                      <Text style={styles.orderMetaText}>{order.items.length} items</Text>
                    </View>
                    <Text style={styles.orderTotal}>{formatCurrency(order.total)}</Text>
                    <ArrowRight size={18} color={colors.textMuted} strokeWidth={2} />
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <EmptyState
              icon={<Bike size={48} color={colors.textMuted} strokeWidth={1.5} />}
              title="No active deliveries"
              message="When orders are assigned to you, they'll appear here."
            />
          )
        ) : (
          historyLoading ? (
            <Loading message="Loading history..." />
          ) : history && history.length > 0 ? (
            <View style={styles.list}>
              {history.map((order) => (
                <Pressable
                  key={order.id}
                  onPress={() => router.push(`/(driver)/order/${order.id}`)}
                  style={({ pressed }) => [styles.orderCard, pressed && { opacity: 0.9 }]}
                >
                  <View style={styles.orderTop}>
                    <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                    <Badge
                      label={STATUS_LABELS[order.status] ?? order.status}
                      variant={order.status === 'DELIVERED' ? 'success' : 'error'}
                    />
                  </View>
                  <View style={styles.orderBottom}>
                    <View style={styles.orderMetaItem}>
                      <Clock size={14} color={colors.textMuted} strokeWidth={2} />
                      <Text style={styles.orderMetaText}>{formatDate(order.placedAt ?? order.createdAt)}</Text>
                    </View>
                    <Text style={styles.orderTotal}>{formatCurrency(order.total)}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <EmptyState
              icon={<Package size={48} color={colors.textMuted} strokeWidth={1.5} />}
              title="No delivery history yet"
              message="Your completed deliveries will show up here."
            />
          )
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
  title: { ...typography.heading2, fontSize: 22 },
  subtitle: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { ...typography.label, color: colors.textSecondary, fontSize: 13 },
  tabTextActive: { color: colors.white },
  list: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  orderCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  orderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  orderNumber: { ...typography.label, fontSize: 15 },
  addressRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  addressText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  orderBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  orderMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  orderMetaText: { ...typography.caption, color: colors.textMuted },
  orderTotal: { ...typography.heading3, fontSize: 15, color: colors.primary, fontWeight: '700' },
});
