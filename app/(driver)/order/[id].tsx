import { View, StyleSheet, ScrollView, Text, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ChevronLeft, MapPin, Phone, Package, Bike, CheckCircle2,
  Clock, User, Navigation, ShieldCheck, Star,
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
import { useAuthStore } from '@store/auth.store';
import {
  useDriverOrder, useAcceptOrder, usePickupOrder, useStartDelivery, useVerifyOtp,
} from '@hooks/useDriver';
import { formatCurrency } from '@utils/currency';
import { OrderStatus } from '@models/order';

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pending', CONFIRMED: 'Confirmed', PREPARING: 'Preparing',
  READY_FOR_PICKUP: 'Ready for Pickup', DRIVER_ASSIGNED: 'Assigned to You',
  DRIVER_ACCEPTED: 'Accepted', PICKED_UP: 'Picked Up',
  OUT_FOR_DELIVERY: 'Out for Delivery', DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled', REFUND_REQUESTED: 'Refund Requested', REFUNDED: 'Refunded',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function DriverOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const { data: order, isLoading, isError, refetch } = useDriverOrder(id);
  const acceptOrder = useAcceptOrder();
  const pickupOrder = usePickupOrder();
  const startDelivery = useStartDelivery();
  const verifyOtp = useVerifyOtp();

  const [otpInput, setOtpInput] = useState('');
  const [otpMessage, setOtpMessage] = useState<{ success: boolean; text: string } | null>(null);

  const handleAccept = () => {
    if (!order || !user) return;
    acceptOrder.mutate(
      { orderId: order.id, driverId: user.id },
      {
        onError: (err) => Alert.alert('Error', err instanceof Error ? err.message : 'Failed to accept order.'),
      },
    );
  };

  const handlePickup = () => {
    if (!order || !user) return;
    pickupOrder.mutate(
      { orderId: order.id, driverId: user.id },
      {
        onError: (err) => Alert.alert('Error', err instanceof Error ? err.message : 'Failed to update order.'),
      },
    );
  };

  const handleStartDelivery = () => {
    if (!order || !user) return;
    startDelivery.mutate(
      { orderId: order.id, driverId: user.id },
      {
        onError: (err) => Alert.alert('Error', err instanceof Error ? err.message : 'Failed to update order.'),
      },
    );
  };

  const handleVerifyOtp = () => {
    if (!order || !user || !otpInput.trim()) return;
    setOtpMessage(null);
    verifyOtp.mutate(
      { orderId: order.id, driverId: user.id, otpCode: otpInput.trim() },
      {
        onSuccess: (result) => {
          setOtpMessage({ success: result.success, text: result.message });
          if (result.success) {
            setOtpInput('');
            setTimeout(() => {
              router.replace('/(driver)/(tabs)/active');
            }, 1500);
          }
        },
        onError: (err) => {
          setOtpMessage({ success: false, text: err instanceof Error ? err.message : 'Verification failed.' });
        },
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

  const isDelivered = order.status === 'DELIVERED';
  const isCancelled = order.status === 'CANCELLED';
  const showOtp = order.status === 'PICKED_UP' || order.status === 'OUT_FOR_DELIVERY';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text style={styles.title}>Delivery Details</Text>
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
            variant={isDelivered ? 'success' : isCancelled ? 'error' : 'info'}
            size="md"
          />
        </View>

        {order.address && (
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <MapPin size={18} color={colors.primary} strokeWidth={2} />
              <Text style={styles.infoCardTitle}>Drop-off Address</Text>
            </View>
            <Text style={styles.addressLabel}>{order.address.label} · {order.address.area}</Text>
            <Text style={styles.addressText}>{order.address.address}{order.address.city ? `, ${order.address.city}` : ''}</Text>
            <View style={styles.addressContact}>
              <User size={14} color={colors.textMuted} strokeWidth={2} />
              <Text style={styles.addressName}>{order.address.fullName}</Text>
            </View>
            <Pressable
              onPress={() => Alert.alert('Call Customer', `${order.address!.fullName}\n${order.address!.phone}`)}
              style={styles.callButton}
            >
              <Phone size={16} color={colors.white} strokeWidth={2} />
              <Text style={styles.callText}>Call Customer</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <Package size={18} color={colors.primary} strokeWidth={2} />
            <Text style={styles.infoCardTitle}>Pickup Items ({order.items.length})</Text>
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
          {order.paymentMethod === 'COD' && (
            <View style={styles.codBanner}>
              <Text style={styles.codText}>Collect {formatCurrency(order.total)} in cash on delivery</Text>
            </View>
          )}
        </View>

        {order.statusHistory && order.statusHistory.length > 0 && (
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <Clock size={18} color={colors.primary} strokeWidth={2} />
              <Text style={styles.infoCardTitle}>Timeline</Text>
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
                </View>
              </View>
            ))}
          </View>
        )}

        {showOtp && !isDelivered && (
          <View style={styles.otpCard}>
            <View style={styles.otpHeader}>
              <ShieldCheck size={24} color={colors.primary} strokeWidth={2} />
              <Text style={styles.otpTitle}>Delivery Verification</Text>
            </View>
            <Text style={styles.otpDesc}>
              Ask the customer for the 6-digit OTP code to confirm delivery.
            </Text>
            <TextInput
              style={styles.otpInput}
              placeholder="Enter OTP code"
              placeholderTextColor={colors.textMuted}
              value={otpInput}
              onChangeText={setOtpInput}
              keyboardType="number-pad"
              maxLength={6}
            />
            {otpMessage && (
              <View style={[styles.otpMessage, otpMessage.success ? styles.otpMessageSuccess : styles.otpMessageError]}>
                <Text style={[styles.otpMessageText, { color: otpMessage.success ? colors.success : colors.error }]}>
                  {otpMessage.text}
                </Text>
              </View>
            )}
            <Button
              label="Verify & Complete Delivery"
              onPress={handleVerifyOtp}
              loading={verifyOtp.isPending}
              fullWidth
              size="lg"
              disabled={!otpInput.trim()}
            />
          </View>
        )}

        {!isDelivered && !isCancelled && (
          <View style={styles.actionsCard}>
            {order.status === 'DRIVER_ASSIGNED' && (
              <Button
                label="Accept Order"
                onPress={handleAccept}
                loading={acceptOrder.isPending}
                fullWidth
                size="lg"
              />
            )}
            {order.status === 'DRIVER_ACCEPTED' && (
              <>
                <Text style={styles.actionHint}>Go to the kitchen to pick up the order.</Text>
                <Button
                  label="Mark as Picked Up"
                  onPress={handlePickup}
                  loading={pickupOrder.isPending}
                  fullWidth
                  size="lg"
                />
              </>
            )}
            {order.status === 'PICKED_UP' && (
              <Button
                label="Start Delivery"
                onPress={handleStartDelivery}
                loading={startDelivery.isPending}
                fullWidth
                size="lg"
                variant="outline"
              />
            )}
            {order.status === 'OUT_FOR_DELIVERY' && (
              <View style={styles.navigationHint}>
                <Navigation size={18} color={colors.primary} strokeWidth={2} />
                <Text style={styles.navigationText}>On the way to customer. Verify OTP on arrival.</Text>
              </View>
            )}
          </View>
        )}

        {isDelivered && (
          <View style={styles.deliveredBanner}>
            <CheckCircle2 size={28} color={colors.success} strokeWidth={2} />
            <Text style={styles.deliveredText}>Order delivered successfully!</Text>
            {order.deliveredAt && (
              <Text style={styles.deliveredTime}>{formatDate(order.deliveredAt)}</Text>
            )}
          </View>
        )}

        {isCancelled && (
          <View style={styles.cancelledBanner}>
            <Text style={styles.cancelledText}>This order was cancelled.</Text>
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
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.success,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
  },
  callText: { ...typography.label, color: colors.white, fontSize: 14 },
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
  codBanner: {
    backgroundColor: colors.warningLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  codText: {
    ...typography.bodySmall,
    color: colors.warning,
    fontWeight: '600',
    textAlign: 'center',
  },
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
  otpCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  otpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  otpTitle: { ...typography.heading3, fontSize: 17 },
  otpDesc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  otpInput: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    ...typography.heading2,
    fontSize: 24,
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 8,
    marginBottom: spacing.md,
  },
  otpMessage: {
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  otpMessageSuccess: { backgroundColor: colors.successLight },
  otpMessageError: { backgroundColor: colors.errorLight },
  otpMessageText: { ...typography.bodySmall, fontWeight: '600' },
  actionsCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  actionHint: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  navigationHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.infoLight,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  navigationText: {
    ...typography.bodySmall,
    color: colors.info,
    fontWeight: '600',
    flex: 1,
  },
  deliveredBanner: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: colors.successLight,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
  },
  deliveredText: {
    ...typography.heading3,
    fontSize: 18,
    color: colors.success,
    marginTop: spacing.md,
  },
  deliveredTime: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  cancelledBanner: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: colors.errorLight,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
  },
  cancelledText: {
    ...typography.heading3,
    fontSize: 16,
    color: colors.error,
  },
});
