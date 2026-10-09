import { View, StyleSheet, ScrollView, Text, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ChevronLeft, MapPin, Phone, Package, Bike, CheckCircle2,
  Clock, User, CreditCard, X,
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
import { Divider } from '@components/ui/Divider';
import { useAdminOrder, useUpdateOrderStatus, useAvailableDrivers, useAssignDriver } from '@hooks/useAdmin';
import { useAuthStore } from '@store/auth.store';
import { formatCurrency } from '@utils/currency';
import { OrderStatus } from '@models/order';

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pending', CONFIRMED: 'Confirmed', PREPARING: 'Preparing',
  READY_FOR_PICKUP: 'Ready for Pickup', DRIVER_ASSIGNED: 'Driver Assigned',
  DRIVER_ACCEPTED: 'Driver En Route', PICKED_UP: 'Picked Up',
  OUT_FOR_DELIVERY: 'Out for Delivery', DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled', REFUND_REQUESTED: 'Refund Requested', REFUNDED: 'Refunded',
};

const STATUS_VARIANTS: Record<OrderStatus, 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  PENDING: 'warning', CONFIRMED: 'info', PREPARING: 'info',
  READY_FOR_PICKUP: 'primary', DRIVER_ASSIGNED: 'info', DRIVER_ACCEPTED: 'info',
  PICKED_UP: 'info', OUT_FOR_DELIVERY: 'primary', DELIVERED: 'success',
  CANCELLED: 'error', REFUND_REQUESTED: 'warning', REFUNDED: 'neutral',
};

const NEXT_ACTION: Record<string, { status: OrderStatus; label: string }> = {
  PENDING: { status: 'CONFIRMED', label: 'Confirm Order' },
  CONFIRMED: { status: 'PREPARING', label: 'Start Preparing' },
  PREPARING: { status: 'READY_FOR_PICKUP', label: 'Mark as Ready' },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function AdminOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order, isLoading, isError, refetch } = useAdminOrder(id);
  const updateStatus = useUpdateOrderStatus();
  const { data: availableDrivers } = useAvailableDrivers();
  const assignDriver = useAssignDriver();
  const user = useAuthStore((s) => s.user);
  const [showDriverPicker, setShowDriverPicker] = useState(false);

  const handleNextStatus = () => {
    if (!order) return;
    const next = NEXT_ACTION[order.status];
    if (next) {
      updateStatus.mutate(
        { orderId: order.id, status: next.status },
        {
          onError: (err) => Alert.alert('Error', err instanceof Error ? err.message : 'Failed to update order.'),
        },
      );
    }
  };

  const handleCancel = () => {
    if (!order) return;
    Alert.alert('Cancel Order', `Cancel ${order.orderNumber}?`, [
      { text: 'No', style: 'cancel' as const },
      {
        text: 'Yes, Cancel',
        style: 'destructive' as const,
        onPress: () => updateStatus.mutate({ orderId: order.id, status: 'CANCELLED', note: 'Cancelled by admin' }),
      },
    ]);
  };

  const handleAssignDriver = (driverId: string, driverName: string) => {
    if (!order || !user) return;
    assignDriver.mutate(
      { orderId: order.id, driverId, assignedBy: user.id },
      {
        onSuccess: () => {
          setShowDriverPicker(false);
          Alert.alert('Driver Assigned', `${driverName} has been assigned to ${order.orderNumber}.`);
        },
        onError: (err) => Alert.alert('Error', err instanceof Error ? err.message : 'Failed to assign driver.'),
      },
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
        <Loading fullscreen message="Loading order..." />
      </SafeAreaView>
    );
  }

  if (isError || !order) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2} />
          </Pressable>
          <Text style={styles.title}>Order Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <ErrorState message="We couldn't load this order." onRetry={() => refetch()} />
      </SafeAreaView>
    );
  }

  const isActive = !['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(order.status);
  const nextAction = NEXT_ACTION[order.status];
  const canAssignDriver = order.status === 'READY_FOR_PICKUP' && !order.driverId;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text style={styles.title}>Order Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing['3xl'] }}>
        <View style={styles.orderHeaderCard}>
          <View>
            <Text style={styles.orderNumber}>{order.orderNumber}</Text>
            <Text style={styles.orderDate}>{formatDate(order.placedAt ?? order.createdAt)}</Text>
          </View>
          <Badge
            label={STATUS_LABELS[order.status] ?? order.status}
            variant={STATUS_VARIANTS[order.status] ?? 'neutral'}
            size="md"
          />
        </View>

        {order.status === 'CANCELLED' && order.cancelledAt && (
          <View style={styles.cancelledBanner}>
            <X size={18} color={colors.error} strokeWidth={2} />
            <Text style={styles.cancelledText}>Cancelled on {formatDate(order.cancelledAt)}</Text>
          </View>
        )}

        {order.address && (
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <MapPin size={18} color={colors.primary} strokeWidth={2} />
              <Text style={styles.infoCardTitle}>Delivery Address</Text>
            </View>
            <Text style={styles.addressLabel}>{order.address.label} · {order.address.area}</Text>
            <Text style={styles.addressText}>{order.address.address}{order.address.city ? `, ${order.address.city}` : ''}</Text>
            <View style={styles.addressContact}>
              <User size={14} color={colors.textMuted} strokeWidth={2} />
              <Text style={styles.addressName}>{order.address.fullName} · {order.address.phone}</Text>
            </View>
          </View>
        )}

        {order.driver && (
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <Bike size={18} color={colors.primary} strokeWidth={2} />
              <Text style={styles.infoCardTitle}>Driver</Text>
            </View>
            <View style={styles.driverRow}>
              <View style={styles.driverAvatar}>
                <Text style={styles.driverInitial}>{order.driver.name.charAt(0)}</Text>
              </View>
              <View style={styles.driverInfo}>
                <Text style={styles.driverName}>{order.driver.name}</Text>
                <Text style={styles.driverVehicle}>{order.driver.vehicleType} · {order.driver.vehicleNumber}</Text>
              </View>
              <Pressable style={styles.callBtn}>
                <Phone size={18} color={colors.white} strokeWidth={2} />
              </Pressable>
            </View>
          </View>
        )}

        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <Package size={18} color={colors.primary} strokeWidth={2} />
            <Text style={styles.infoCardTitle}>Items ({order.items.length})</Text>
          </View>
          {order.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.quantity}× {item.name}</Text>
                {item.specialInstructions && (
                  <Text style={styles.itemNote}>Note: {item.specialInstructions}</Text>
                )}
              </View>
              <Text style={styles.itemPrice}>{formatCurrency(item.subtotal)}</Text>
            </View>
          ))}
          <Divider spacing_size="sm" />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <CreditCard size={18} color={colors.primary} strokeWidth={2} />
            <Text style={styles.infoCardTitle}>Payment</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Method</Text>
            <Text style={styles.paymentValue}>
              {order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod === 'KHALTI' ? 'Khalti' : 'eSewa'}
            </Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Status</Text>
            <Badge
              label={order.paymentStatus === 'PENDING' ? 'Pending' : order.paymentStatus === 'PAID' ? 'Paid' : order.paymentStatus === 'CASH_COLLECTED' ? 'Cash Collected' : order.paymentStatus}
              variant={order.paymentStatus === 'PAID' || order.paymentStatus === 'CASH_COLLECTED' ? 'success' : 'warning'}
            />
          </View>
          {order.couponCode && (
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Coupon</Text>
              <Text style={styles.paymentValue}>{order.couponCode}</Text>
            </View>
          )}
        </View>

        {order.statusHistory && order.statusHistory.length > 0 && (
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <Clock size={18} color={colors.primary} strokeWidth={2} />
              <Text style={styles.infoCardTitle}>Status History</Text>
            </View>
            {order.statusHistory.map((h, idx) => (
              <View key={h.id} style={styles.historyRow}>
                <View style={styles.historyDot}>
                  {idx === 0 ? (
                    <CheckCircle2 size={14} color={colors.primary} strokeWidth={2} />
                  ) : (
                    <View style={styles.historyDotInner} />
                  )}
                </View>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyStatus}>{STATUS_LABELS[h.status] ?? h.status}</Text>
                  <Text style={styles.historyTime}>{formatDate(h.createdAt)}</Text>
                  {h.note && <Text style={styles.historyNote}>{h.note}</Text>}
                </View>
              </View>
            ))}
          </View>
        )}

        {isActive && (
          <View style={styles.actionsCard}>
            {nextAction && (
              <Button
                label={nextAction.label}
                onPress={handleNextStatus}
                loading={updateStatus.isPending}
                fullWidth
                size="lg"
              />
            )}

            {canAssignDriver && (
              <>
                {!showDriverPicker ? (
                  <Button
                    label="Assign Driver"
                    onPress={() => setShowDriverPicker(true)}
                    variant="outline"
                    fullWidth
                    size="lg"
                    style={{ marginTop: spacing.sm }}
                  />
                ) : (
                  <View style={styles.driverPicker}>
                    <Text style={styles.driverPickerTitle}>Select a driver:</Text>
                    {availableDrivers && availableDrivers.length > 0 ? (
                      availableDrivers.map((d) => (
                        <Pressable
                          key={d.id}
                          onPress={() => handleAssignDriver(d.id, d.fullName)}
                          style={({ pressed }) => [styles.driverOption, pressed && { opacity: 0.8 }]}
                        >
                          <View style={styles.driverOptionAvatar}>
                            <Text style={styles.driverOptionInitial}>{d.fullName.charAt(0)}</Text>
                          </View>
                          <View style={styles.driverOptionInfo}>
                            <Text style={styles.driverOptionName}>{d.fullName}</Text>
                            <Text style={styles.driverOptionVehicle}>{d.vehicleType} · {d.vehicleNumber || 'N/A'}</Text>
                          </View>
                          <Bike size={20} color={colors.primary} strokeWidth={2} />
                        </Pressable>
                      ))
                    ) : (
                      <Text style={styles.noDriversText}>No online drivers available.</Text>
                    )}
                    <Pressable onPress={() => setShowDriverPicker(false)} style={styles.cancelPickerBtn}>
                      <Text style={styles.cancelPickerText}>Cancel</Text>
                    </Pressable>
                  </View>
                )}
              </>
            )}

            {order.status !== 'DRIVER_ASSIGNED' && order.status !== 'DRIVER_ACCEPTED' && order.status !== 'PICKED_UP' && order.status !== 'OUT_FOR_DELIVERY' && (
              <Pressable onPress={handleCancel} style={styles.cancelOrderBtn}>
                <Text style={styles.cancelOrderText}>Cancel Order</Text>
              </Pressable>
            )}
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { ...typography.heading2, fontSize: 20 },
  orderHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    ...shadows.sm,
  },
  orderNumber: { ...typography.heading3, fontSize: 16 },
  orderDate: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  cancelledBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.errorLight,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  cancelledText: { ...typography.bodySmall, color: colors.error, fontWeight: '600' },
  infoCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  infoCardTitle: { ...typography.label, fontSize: 15 },
  addressLabel: { ...typography.body, fontWeight: '600' },
  addressText: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 4 },
  addressContact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  addressName: { ...typography.caption, color: colors.textMuted },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  driverAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverInitial: { ...typography.heading3, color: colors.white, fontSize: 16 },
  driverInfo: { flex: 1 },
  driverName: { ...typography.label, fontSize: 14 },
  driverVehicle: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  itemInfo: { flex: 1 },
  itemName: { ...typography.body, color: colors.textPrimary },
  itemNote: { ...typography.caption, color: colors.textMuted, marginTop: 2, fontStyle: 'italic' },
  itemPrice: { ...typography.body, fontWeight: '600', marginLeft: spacing.md },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: { ...typography.heading3, fontSize: 16 },
  totalValue: { ...typography.heading2, fontSize: 18, color: colors.primary, fontWeight: '700' },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  paymentLabel: { ...typography.body, color: colors.textSecondary },
  paymentValue: { ...typography.body, fontWeight: '600' },
  historyRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  historyDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  historyDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textMuted,
  },
  historyInfo: { flex: 1 },
  historyStatus: { ...typography.bodySmall, fontWeight: '600' },
  historyTime: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  historyNote: { ...typography.caption, color: colors.textSecondary, marginTop: 2, fontStyle: 'italic' },
  actionsCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  driverPicker: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.sm,
    ...shadows.sm,
  },
  driverPickerTitle: {
    ...typography.label,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  driverOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  driverOptionAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverOptionInitial: { ...typography.heading3, color: colors.white, fontSize: 14 },
  driverOptionInfo: { flex: 1 },
  driverOptionName: { ...typography.label, fontSize: 14 },
  driverOptionVehicle: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  noDriversText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  cancelPickerBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
  cancelPickerText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  cancelOrderBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  cancelOrderText: {
    ...typography.label,
    color: colors.error,
    fontSize: 14,
  },
});
