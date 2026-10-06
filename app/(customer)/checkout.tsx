import { View, StyleSheet, ScrollView, Text, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, MapPin, CreditCard, Banknote, Truck, Check } from 'lucide-react-native';
import { useState } from 'react';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing } from '@theme/spacing';
import { radius } from '@theme/radius';
import { Button } from '@components/ui/Button';
import { Loading } from '@components/ui/Loading';
import { EmptyState } from '@components/ui/EmptyState';
import { Divider } from '@components/ui/Divider';
import { useCartStore } from '@store/cart.store';
import { useAuthStore } from '@store/auth.store';
import { useCreateOrder } from '@hooks/useOrders';
import { useAddresses } from '@hooks/useAddresses';
import { useDeliveryZones } from '@hooks/useDelivery';
import { formatCurrency } from '@utils/currency';
import { PaymentMethod } from '@models/order';

export default function CheckoutScreen() {
  const items = useCartStore((s) => s.items);
  const cartTotals = useCartStore((s) => s.getTotals());
  const appliedCouponCode = useCartStore((s) => s.appliedCouponCode);
  const clearCart = useCartStore((s) => s.clearCart);
  const user = useAuthStore((s) => s.user);
  const createOrder = useCreateOrder();
  const { data: addresses, isLoading: addrLoading } = useAddresses();
  const { data: zones } = useDeliveryZones();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [customerNote, setCustomerNote] = useState('');
  const [placing, setPlacing] = useState(false);

  const activeAddressId =
    selectedAddressId ?? addresses?.find((address) => address.isDefault)?.id ?? addresses?.[0]?.id ?? null;
  const selectedAddress = addresses?.find((address) => address.id === activeAddressId);
  const matchedZone = selectedAddress
    ? zones?.find((z) =>
        z.area.toLowerCase().includes(selectedAddress.area.toLowerCase()) ||
        selectedAddress.area.toLowerCase().includes(z.name.toLowerCase())
      )
    : null;
  const totals = {
    ...cartTotals,
    deliveryFee: matchedZone?.deliveryFee ?? cartTotals.deliveryFee,
    total:
      cartTotals.subtotal +
      (cartTotals.freeDelivery ? 0 : matchedZone?.deliveryFee ?? cartTotals.deliveryFee) +
      cartTotals.serviceFee +
      cartTotals.tax -
      cartTotals.discount,
  };

  if (addrLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
        <Loading fullscreen message="Loading checkout..." />
      </SafeAreaView>
    );
  }

  if (items.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2} />
          </Pressable>
          <Text style={styles.title}>Checkout</Text>
          <View style={{ width: 40 }} />
        </View>
        <EmptyState title="Your cart is empty" message="Add items before checking out." />
      </SafeAreaView>
    );
  }

  if (!addresses || addresses.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2} />
          </Pressable>
          <Text style={styles.title}>Checkout</Text>
          <View style={{ width: 40 }} />
        </View>
        <EmptyState
          icon={<MapPin size={48} color={colors.textMuted} strokeWidth={1.5} />}
          title="No delivery address"
          message="Add a delivery address to continue with checkout."
          actionLabel="Add Address"
          onAction={() => router.push('/(customer)/addresses/add')}
        />
      </SafeAreaView>
    );
  }

  const handlePlaceOrder = async () => {
    if (!user || !activeAddressId) return;
    if (!matchedZone) {
      Alert.alert('Outside service area', 'Sorry, we currently don\'t deliver to this location.');
      return;
    }

    setPlacing(true);
    try {
      const order = await createOrder.mutateAsync({
        customerId: user.id,
        addressId: activeAddressId,
        items,
        subtotal: totals.subtotal,
        deliveryFee: totals.deliveryFee,
        serviceFee: totals.serviceFee,
        tax: totals.tax,
        discount: totals.discount,
        total: totals.total,
        paymentMethod,
        couponCode: appliedCouponCode ?? undefined,
        customerNote: customerNote || undefined,
        estimatedDeliveryMinutes: matchedZone.estimatedDeliveryMinutes,
      });
      clearCart();
      router.replace(`/(customer)/order-conformation/${order.id}`);
    } catch (err) {
      Alert.alert('Order failed', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text style={styles.title}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Address selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          {addresses.map((addr) => (
            <Pressable
              key={addr.id}
              onPress={() => setSelectedAddressId(addr.id)}
              style={[styles.addressCard, activeAddressId === addr.id && styles.addressCardSelected]}
            >
              <View style={styles.addressRadio}>
                {activeAddressId === addr.id && <View style={styles.addressRadioDot} />}
              </View>
              <View style={styles.addressInfo}>
                <Text style={styles.addressLabel}>{addr.label} • {addr.area}</Text>
                <Text style={styles.addressText}>{addr.address}, {addr.city}</Text>
                <Text style={styles.addressName}>{addr.fullName} • {addr.phone}</Text>
              </View>
            </Pressable>
          ))}
          <Pressable
            onPress={() => router.push('/(customer)/addresses/add')}
            style={styles.addAddressBtn}
          >
            <Text style={styles.addAddressText}>+ Add New Address</Text>
          </Pressable>
        </View>

        {/* Service area check */}
        {selectedAddress && !matchedZone && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>
              We may not deliver to this area. Please check if your location is within our service zones.
            </Text>
          </View>
        )}
        {matchedZone && (
          <View style={styles.zoneInfo}>
            <Truck size={16} color={colors.success} strokeWidth={2} />
            <Text style={styles.zoneText}>
              {matchedZone.name} • Est. {matchedZone.estimatedDeliveryMinutes} min • Delivery {formatCurrency(matchedZone.deliveryFee)}
            </Text>
          </View>
        )}

        {/* Payment method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <PaymentOption
            icon={<Banknote size={22} color={colors.primary} strokeWidth={2} />}
            label="Cash on Delivery"
            description="Pay with cash when your order arrives"
            selected={paymentMethod === 'cod'}
            onPress={() => setPaymentMethod('cod')}
          />
          <PaymentOption
            icon={<CreditCard size={22} color={colors.textMuted} strokeWidth={2} />}
            label="Khalti"
            description="Pay online via Khalti (coming soon)"
            selected={false}
            disabled
            onPress={() => {}}
          />
          <PaymentOption
            icon={<CreditCard size={22} color={colors.textMuted} strokeWidth={2} />}
            label="eSewa"
            description="Pay online via eSewa (coming soon)"
            selected={false}
            disabled
            onPress={() => {}}
          />
        </View>

        {/* Order note */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Note (Optional)</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="Any special instructions for your order?"
            placeholderTextColor={colors.textMuted}
            value={customerNote}
            onChangeText={setCustomerNote}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Order summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            {items.map((item) => (
              <View key={item.id} style={styles.summaryItem}>
                <Text style={styles.summaryItemName} numberOfLines={1}>
                  {item.quantity}× {item.productType === 'combo' ? item.combo?.name : item.food?.name}
                </Text>
                <Text style={styles.summaryItemPrice}>{formatCurrency(item.unitPrice * item.quantity)}</Text>
              </View>
            ))}
            <Divider spacing_size="sm" />
            <SummaryRow label="Subtotal" value={formatCurrency(totals.subtotal)} />
            <SummaryRow label="Delivery Fee" value={totals.freeDelivery ? 'FREE' : formatCurrency(totals.deliveryFee)} />
            {totals.discount > 0 && (
              <SummaryRow label="Discount" value={`-${formatCurrency(totals.discount)}`} color={colors.success} />
            )}
            <Divider spacing_size="sm" />
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalValue}>{formatCurrency(totals.total)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          label={placing ? 'Placing Order...' : `Place Order • ${formatCurrency(totals.total)}`}
          onPress={handlePlaceOrder}
          fullWidth
          size="lg"
          disabled={placing || !activeAddressId}
        />
      </View>
    </SafeAreaView>
  );
}

function PaymentOption({
  icon,
  label,
  description,
  selected,
  disabled,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.paymentOption, selected && styles.paymentOptionSelected, disabled && styles.paymentOptionDisabled]}
    >
      <View style={styles.paymentIcon}>{icon}</View>
      <View style={styles.paymentInfo}>
        <Text style={styles.paymentLabel}>{label}</Text>
        <Text style={styles.paymentDesc}>{description}</Text>
      </View>
      <View style={[styles.paymentRadio, selected && styles.paymentRadioSelected]}>
        {selected && <Check size={14} color={colors.white} strokeWidth={3} />}
      </View>
    </Pressable>
  );
}

function SummaryRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryRowLabel}>{label}</Text>
      <Text style={[styles.summaryRowValue, color ? { color } : undefined]}>{value}</Text>
    </View>
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
  section: { paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  sectionTitle: {
    ...typography.label,
    color: colors.textMuted,
    textTransform: 'uppercase',
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  addressCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryUltraLight,
  },
  addressRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  addressRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  addressInfo: { flex: 1 },
  addressLabel: { ...typography.label, color: colors.textPrimary, fontSize: 14 },
  addressText: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 4 },
  addressName: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  addAddressBtn: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  addAddressText: {
    ...typography.label,
    color: colors.primary,
  },
  warningBanner: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    backgroundColor: colors.warningLight,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  warningText: {
    ...typography.bodySmall,
    color: colors.warning,
  },
  zoneInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    backgroundColor: colors.successLight,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  zoneText: {
    ...typography.bodySmall,
    color: colors.success,
    fontWeight: '600',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  paymentOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryUltraLight,
  },
  paymentOptionDisabled: {
    opacity: 0.5,
  },
  paymentIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentInfo: { flex: 1 },
  paymentLabel: { ...typography.label, color: colors.textPrimary, fontSize: 15 },
  paymentDesc: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  paymentRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentRadioSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
    minHeight: 80,
  },
  summaryCard: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  summaryItemName: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  summaryItemPrice: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  summaryRowLabel: { ...typography.body, color: colors.textSecondary },
  summaryRowValue: { ...typography.body, color: colors.textPrimary, fontWeight: '600' },
  grandTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  grandTotalLabel: { ...typography.heading3, fontSize: 17, color: colors.textPrimary },
  grandTotalValue: { ...typography.heading2, fontSize: 20, color: colors.primary, fontWeight: '700' },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
