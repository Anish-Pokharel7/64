import { View, StyleSheet, ScrollView, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ChevronLeft, Clock, Package, ChefHat, Bike, CheckCircle2,
  Phone, MapPin,
} from 'lucide-react-native';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing } from '@theme/spacing';
import { radius } from '@theme/radius';
import { shadows } from '@theme/shadows';
import { Loading } from '@components/ui/Loading';
import { ErrorState } from '@components/ui/ErrorState';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { useOrder } from '@hooks/useOrders';
import { formatCurrency } from '@utils/currency';
import { OrderStatus } from '@models/order';

const STATUS_STEPS: { status: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { status: 'PENDING', label: 'Order Placed', icon: <Clock size={18} color={colors.textMuted} strokeWidth={2} /> },
  { status: 'CONFIRMED', label: 'Confirmed', icon: <Package size={18} color={colors.textMuted} strokeWidth={2} /> },
  { status: 'PREPARING', label: 'Preparing', icon: <ChefHat size={18} color={colors.textMuted} strokeWidth={2} /> },
  { status: 'READY_FOR_PICKUP', label: 'Ready for Pickup', icon: <Package size={18} color={colors.textMuted} strokeWidth={2} /> },
  { status: 'DRIVER_ASSIGNED', label: 'Driver Assigned', icon: <Bike size={18} color={colors.textMuted} strokeWidth={2} /> },
  { status: 'PICKED_UP', label: 'Picked Up', icon: <Bike size={18} color={colors.textMuted} strokeWidth={2} /> },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: <Bike size={18} color={colors.textMuted} strokeWidth={2} /> },
  { status: 'DELIVERED', label: 'Delivered', icon: <CheckCircle2 size={18} color={colors.textMuted} strokeWidth={2} /> },
];

const STATUS_ORDER: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'DRIVER_ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED'];

function getStatusIndex(status: OrderStatus): number {
  const idx = STATUS_ORDER.indexOf(status);
  return idx === -1 ? 0 : idx;
}

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderQuery = useOrder(id);

  if (orderQuery.isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
        <Loading fullscreen message="Loading order..." />
      </SafeAreaView>
    );
  }

  if (orderQuery.isError || !orderQuery.data) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
        <ErrorState message="We couldn't load this order." onRetry={() => orderQuery.refetch()} />
      </SafeAreaView>
    );
  }

  const order = orderQuery.data;
  const currentStepIndex = getStatusIndex(order.status);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text style={styles.title}>Order Tracking</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing['3xl'] }}>
        {/* Order number and status */}
        <View style={styles.orderInfoCard}>
          <View>
            <Text style={styles.orderNumber}>{order.orderNumber}</Text>
            <Text style={styles.orderTotal}>{formatCurrency(order.total)}</Text>
          </View>
          <Badge
            label={isCancelled ? 'Cancelled' : STATUS_STEPS[currentStepIndex]?.label ?? order.status}
            variant={isCancelled ? 'error' : 'primary'}
            size="md"
          />
        </View>

        {/* Driver info */}
        {order.driver && (order.status === 'DRIVER_ASSIGNED' || order.status === 'PICKED_UP' || order.status === 'OUT_FOR_DELIVERY') && (
          <View style={styles.driverCard}>
            <View style={styles.driverInfo}>
              <View style={styles.driverAvatar}>
                <Text style={styles.driverInitial}>{order.driver.name.charAt(0)}</Text>
              </View>
              <View>
                <Text style={styles.driverName}>{order.driver.name}</Text>
                <Text style={styles.driverVehicle}>{order.driver.vehicleType} • {order.driver.vehicleNumber}</Text>
              </View>
            </View>
            <Pressable style={styles.callButton}>
              <Phone size={20} color={colors.white} strokeWidth={2} />
            </Pressable>
          </View>
        )}

        {/* Delivery address */}
        {order.address && typeof order.address !== 'string' && (
          <View style={styles.addressCard}>
            <MapPin size={18} color={colors.primary} strokeWidth={2} />
            <View style={styles.addressInfo}>
              <Text style={styles.addressLabel}>Delivery to {order.address.label}</Text>
              <Text style={styles.addressText}>{order.address.address}, {order.address.area}</Text>
              <Text style={styles.addressName}>{order.address.fullName} • {order.address.phone}</Text>
            </View>
          </View>
        )}

        {/* Status timeline */}
        <View style={styles.timelineSection}>
          <Text style={styles.sectionTitle}>Order Progress</Text>
          <View style={styles.timeline}>
            {STATUS_STEPS.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex && !isCancelled;
              const isLast = index === STATUS_STEPS.length - 1;
              return (
                <View key={step.status} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View style={[
                      styles.timelineIcon,
                      isCompleted && styles.timelineIconCompleted,
                      isCurrent && styles.timelineIconCurrent,
                    ]}>
                      {isCompleted ? (
                        <CheckCircle2 size={18} color={colors.white} strokeWidth={2} />
                      ) : (
                        step.icon
                      )}
                    </View>
                    {!isLast && (
                      <View style={[
                        styles.timelineLine,
                        isCompleted && styles.timelineLineCompleted,
                      ]} />
                    )}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={[
                      styles.timelineLabel,
                      isCompleted && styles.timelineLabelCompleted,
                      isCurrent && styles.timelineLabelCurrent,
                    ]}>
                      {step.label}
                    </Text>
                    {isCurrent && <Text style={styles.timelineCurrent}>In progress...</Text>}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Order items */}
        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>Items</Text>
          <View style={styles.itemsCard}>
            {order.items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <Text style={styles.itemName}>
                  {item.quantity}× {item.name}
                </Text>
                <Text style={styles.itemPrice}>{formatCurrency(item.subtotal ?? item.unitPrice * item.quantity)}</Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
            </View>
          </View>
        </View>

        {/* Rate button for delivered orders */}
        {order.status === 'DELIVERED' && (
          <Button
            label="Rate this Order"
            onPress={() => router.push(`/(customer)/review/${order.id}`)}
            fullWidth
            size="lg"
            style={{ marginHorizontal: spacing.lg, marginTop: spacing.lg }}
          />
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { ...typography.heading2, fontSize: 20 },
  orderInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
  },
  orderNumber: { ...typography.heading3, fontSize: 16 },
  orderTotal: { ...typography.heading2, fontSize: 20, color: colors.primary, fontWeight: '700', marginTop: 4 },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    ...shadows.sm,
  },
  driverInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  driverAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverInitial: { ...typography.heading3, color: colors.white, fontSize: 18 },
  driverName: { ...typography.label, fontSize: 15 },
  driverVehicle: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressCard: {
    flexDirection: 'row',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    ...shadows.sm,
  },
  addressInfo: { flex: 1 },
  addressLabel: { ...typography.label, fontSize: 14 },
  addressText: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 4 },
  addressName: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  timelineSection: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionTitle: {
    ...typography.label,
    color: colors.textMuted,
    textTransform: 'uppercase',
    fontSize: 12,
    marginBottom: spacing.md,
  },
  timeline: {},
  timelineItem: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timelineLeft: {
    alignItems: 'center',
  },
  timelineIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  timelineIconCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  timelineIconCurrent: {
    backgroundColor: colors.primaryUltraLight,
    borderColor: colors.primary,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 28,
    backgroundColor: colors.border,
    marginTop: 2,
  },
  timelineLineCompleted: {
    backgroundColor: colors.success,
  },
  timelineContent: {
    paddingBottom: spacing.md,
  },
  timelineLabel: {
    ...typography.body,
    color: colors.textMuted,
  },
  timelineLabelCompleted: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  timelineLabelCurrent: {
    color: colors.primary,
    fontWeight: '700',
  },
  timelineCurrent: {
    ...typography.caption,
    color: colors.primary,
    marginTop: 2,
  },
  itemsSection: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  itemsCard: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  itemName: { flex: 1, ...typography.body, color: colors.textPrimary },
  itemPrice: { ...typography.body, color: colors.textPrimary, fontWeight: '600' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: { ...typography.heading3, fontSize: 16 },
  totalValue: { ...typography.heading2, fontSize: 18, color: colors.primary, fontWeight: '700' },
});
