import { View, StyleSheet, FlatList, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useMemo } from 'react';
import { Image } from 'expo-image';
import { Clock, Package, Bike, CheckCircle2, XCircle } from 'lucide-react-native';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing } from '@theme/spacing';
import { radius } from '@theme/radius';
import { shadows } from '@theme/shadows';
import { EmptyState } from '@components/ui/EmptyState';
import { Loading } from '@components/ui/Loading';
import { Badge } from '@components/ui/Badge';
import { useOrders } from '@hooks/useOrders';
import { Order, OrderStatus } from '@models/order';
import { formatCurrency } from '@utils/currency';
import { formatDate, timeAgo } from '@utils/date';

const STATUS_CONFIG: Record<OrderStatus, { label: string; variant: 'primary' | 'warning' | 'info' | 'success' | 'error'; icon: React.ReactNode }> = {
  pending: { label: 'Pending', variant: 'warning', icon: <Clock size={14} color={colors.warning} strokeWidth={2} /> },
  confirmed: { label: 'Confirmed', variant: 'info', icon: <Package size={14} color={colors.info} strokeWidth={2} /> },
  preparing: { label: 'Preparing', variant: 'warning', icon: <Clock size={14} color={colors.warning} strokeWidth={2} /> },
  out_for_delivery: { label: 'On the way', variant: 'info', icon: <Bike size={14} color={colors.info} strokeWidth={2} /> },
  delivered: { label: 'Delivered', variant: 'success', icon: <CheckCircle2 size={14} color={colors.success} strokeWidth={2} /> },
  cancelled: { label: 'Cancelled', variant: 'error', icon: <XCircle size={14} color={colors.error} strokeWidth={2} /> },
};

type TabKey = 'active' | 'past';

export default function OrdersScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('active');
  const { data: orders, isLoading, isError, refetch } = useOrders();

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    if (activeTab === 'active') {
      return orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled');
    }
    return orders.filter((o) => o.status === 'delivered' || o.status === 'cancelled');
  }, [orders, activeTab]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
      </View>

      <View style={styles.tabBar}>
        <Pressable
          onPress={() => setActiveTab('active')}
          accessibilityRole="button"
          accessibilityLabel="Active orders"
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>Active</Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('past')}
          accessibilityRole="button"
          accessibilityLabel="Past orders"
          style={[styles.tab, activeTab === 'past' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>Past</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <Loading message="Loading orders..." />
      ) : isError ? (
        <EmptyState
          title="Couldn't load orders"
          message="Pull to refresh or try again."
          actionLabel="Try Again"
          onAction={() => refetch()}
        />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          title={activeTab === 'active' ? 'No active orders' : 'No past orders'}
          message={
            activeTab === 'active'
              ? "You haven't placed any active orders yet."
              : "You haven't placed any orders yet."
          }
        />
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <OrderCard order={item} />}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          contentContainerStyle={{ padding: spacing.lg }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

function OrderCard({ order }: { order: Order }) {
  const statusConfig = STATUS_CONFIG[order.status];

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image source={{ uri: order.restaurantImage }} style={styles.restaurantImage} contentFit="cover" />
        <View style={styles.cardHeaderInfo}>
          <Text style={styles.restaurantName} numberOfLines={1}>{order.restaurantName}</Text>
          <Text style={styles.orderNumber}>{order.orderNumber}</Text>
          <Text style={styles.orderDate}>{timeAgo(order.createdAt)}</Text>
        </View>
        <Badge label={statusConfig.label} variant={statusConfig.variant} size="md" />
      </View>

      <View style={styles.itemsSection}>
        {order.items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Image source={{ uri: item.image }} style={styles.itemImage} contentFit="cover" />
            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.itemQty}>×{item.quantity}</Text>
            <Text style={styles.itemPrice}>{formatCurrency(item.unitPrice * item.quantity)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
      </View>
    </View>
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
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.white,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  restaurantImage: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
  },
  cardHeaderInfo: {
    flex: 1,
  },
  restaurantName: {
    ...typography.heading3,
    fontSize: 16,
  },
  orderNumber: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  orderDate: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  itemsSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  itemImage: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
  },
  itemName: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  itemQty: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  itemPrice: {
    ...typography.label,
    color: colors.textPrimary,
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  totalValue: {
    ...typography.heading3,
    color: colors.primary,
    fontWeight: '700',
  },
});
