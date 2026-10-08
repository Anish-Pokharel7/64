import { View, StyleSheet, FlatList, Text, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, Minus, Plus, Trash2, ShoppingCart, Package, Ticket, X } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useState } from 'react';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing } from '@theme/spacing';
import { radius } from '@theme/radius';
import { Button } from '@components/ui/Button';
import { EmptyState } from '@components/ui/EmptyState';
import { Divider } from '@components/ui/Divider';
import { useCartStore } from '@store/cart.store';
import { couponService } from '@services/coupon.service';
import { formatCurrency } from '@utils/currency';
import { CartItem } from '@models/cart';

export default function CartScreen() {
  const items = useCartStore((s) => s.items);
  const increaseQuantity = useCartStore((s) => s.increaseQuantity);
  const decreaseQuantity = useCartStore((s) => s.decreaseQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const totals = useCartStore((s) => s.getTotals());
  const appliedCouponCode = useCartStore((s) => s.appliedCouponCode);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const hasCombo = items.some((i) => i.productType === 'combo');
      const hasMomo = items.some((i) => i.food?.category === 'momo');
      const result = await couponService.validateCoupon(
        couponInput.trim(),
        totals.subtotal,
        hasCombo,
        hasMomo,
        false
      );
      if (result.valid) {
        applyCoupon(couponInput.trim().toUpperCase(), result.discountAmount, result.freeDelivery);
        setCouponInput('');
      } else {
        setCouponError(result.message);
      }
    } catch {
      setCouponError('Failed to validate coupon. Try again.');
    } finally {
      setCouponLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2} />
          </Pressable>
          <Text style={styles.title}>Cart</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <EmptyState
            icon={<ShoppingCart size={48} color={colors.textMuted} strokeWidth={1.5} />}
            title="Your cart is empty"
            message="Browse our menu and add your favorite food to get started."
            actionLabel="Browse Menu"
            onAction={() => router.replace('/(customer)/(tabs)')}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text style={styles.title}>Cart</Text>
        <Pressable onPress={clearCart} style={styles.clearButton}>
          <Trash2 size={20} color={colors.error} strokeWidth={2} />
        </Pressable>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CartItemRow
            item={item}
            onIncrease={() => increaseQuantity(item.id)}
            onDecrease={() => decreaseQuantity(item.id)}
            onRemove={() => removeItem(item.id)}
          />
        )}
        ItemSeparatorComponent={() => <Divider spacing_size="sm" />}
        contentContainerStyle={{ padding: spacing.lg }}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={() => (
          <View style={styles.footer}>
            {/* Coupon section */}
            {appliedCouponCode ? (
              <View style={styles.appliedCouponCard}>
                <View style={styles.appliedCouponInfo}>
                  <Ticket size={18} color={colors.success} strokeWidth={2} />
                  <View>
                    <Text style={styles.appliedCouponCode}>{appliedCouponCode}</Text>
                    <Text style={styles.appliedCouponDesc}>
                      {totals.freeDelivery ? 'Free delivery' : `${formatCurrency(totals.discount)} off`}
                    </Text>
                  </View>
                </View>
                <Pressable onPress={removeCoupon} style={styles.removeCouponBtn}>
                  <X size={18} color={colors.textMuted} strokeWidth={2} />
                </Pressable>
              </View>
            ) : (
              <View style={styles.couponSection}>
                <View style={styles.couponInputRow}>
                  <Ticket size={20} color={colors.textMuted} strokeWidth={2} />
                  <TextInput
                    style={styles.couponInput}
                    placeholder="Enter coupon code"
                    placeholderTextColor={colors.textMuted}
                    value={couponInput}
                    onChangeText={setCouponInput}
                    autoCapitalize="characters"
                  />
                </View>
                <Button
                  label={couponLoading ? '...' : 'Apply'}
                  onPress={handleApplyCoupon}
                  size="sm"
                  disabled={couponLoading || !couponInput.trim()}
                />
              </View>
            )}
            {couponError ? <Text style={styles.couponError}>{couponError}</Text> : null}

            <View style={styles.totalsCard}>
              <TotalRow label="Subtotal" value={formatCurrency(totals.subtotal)} />
              <TotalRow label="Delivery Fee" value={totals.freeDelivery ? 'FREE' : formatCurrency(totals.deliveryFee)} />
              {totals.serviceFee > 0 && <TotalRow label="Service Fee" value={formatCurrency(totals.serviceFee)} />}
              {totals.tax > 0 && <TotalRow label="Tax" value={formatCurrency(totals.tax)} />}
              {totals.discount > 0 && (
                <TotalRow label="Discount" value={`-${formatCurrency(totals.discount)}`} color={colors.success} />
              )}
              <Divider spacing_size="sm" />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatCurrency(totals.total)}</Text>
              </View>
            </View>
            <Button
              label="Proceed to Checkout"
              onPress={() => router.push('/(customer)/checkout')}
              fullWidth
              size="lg"
              style={{ marginTop: spacing.md }}
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

function CartItemRow({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}: {
  item: CartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}) {
  const isCombo = item.productType === 'combo';
  const image = isCombo ? item.combo?.image : item.food?.image;
  const name = isCombo ? item.combo?.name : item.food?.name;
  const customText = item.customizations?.map((c) => c.optionName).join(', ');
  const comboOptionsText = item.comboOptions?.map((o) => o.optionLabel).join(', ');

  return (
    <View style={styles.cartItem}>
      <Image source={{ uri: image }} style={styles.itemImage} contentFit="cover" />
      <View style={styles.itemInfo}>
        <View style={styles.itemNameRow}>
          {isCombo && <Package size={14} color={colors.primary} strokeWidth={2} />}
          <Text style={styles.itemName} numberOfLines={1}>{name}</Text>
        </View>
        {customText && <Text style={styles.itemCustom} numberOfLines={1}>{customText}</Text>}
        {comboOptionsText && <Text style={styles.itemCustom} numberOfLines={1}>{comboOptionsText}</Text>}
        {item.specialInstructions && <Text style={styles.itemCustom} numberOfLines={1}>{item.specialInstructions}</Text>}
        <Text style={styles.itemPrice}>{formatCurrency(item.unitPrice)}</Text>
      </View>
      <View style={styles.itemActions}>
        <View style={styles.quantityControls}>
          <Pressable onPress={onDecrease} style={styles.qtyButton}>
            <Minus size={16} color={colors.textPrimary} strokeWidth={2.5} />
          </Pressable>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <Pressable onPress={onIncrease} style={[styles.qtyButton, styles.qtyButtonActive]}>
            <Plus size={16} color={colors.white} strokeWidth={2.5} />
          </Pressable>
        </View>
        <Text style={styles.itemTotal}>{formatCurrency(item.unitPrice * item.quantity)}</Text>
      </View>
    </View>
  );
}

function TotalRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.totalRow}>
      <Text style={styles.totalRowLabel}>{label}</Text>
      <Text style={[styles.totalRowValue, color ? { color } : undefined]}>{value}</Text>
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
  clearButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  itemImage: { width: 64, height: 64, borderRadius: radius.md },
  itemInfo: { flex: 1 },
  itemNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  itemName: { ...typography.label, fontSize: 15, flex: 1 },
  itemCustom: { ...typography.caption, color: colors.textSecondary, marginTop: 2, fontSize: 11 },
  itemPrice: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  itemActions: { alignItems: 'flex-end', gap: spacing.sm },
  quantityControls: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  qtyButton: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center', justifyContent: 'center',
  },
  qtyButtonActive: { backgroundColor: colors.primary },
  quantityText: { ...typography.label, fontSize: 15, minWidth: 20, textAlign: 'center' },
  itemTotal: { ...typography.heading3, fontSize: 15, color: colors.textPrimary, fontWeight: '700' },
  footer: { marginTop: spacing.lg, paddingBottom: spacing['2xl'] },
  couponSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  couponInputRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  couponInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: spacing.xs,
  },
  appliedCouponCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.successLight,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  appliedCouponInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  appliedCouponCode: { ...typography.label, color: colors.success, fontWeight: '700' },
  appliedCouponDesc: { ...typography.caption, color: colors.textSecondary },
  removeCouponBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  couponError: {
    ...typography.caption,
    color: colors.error,
    marginBottom: spacing.md,
  },
  totalsCard: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  totalRowLabel: { ...typography.body, color: colors.textSecondary },
  totalRowValue: { ...typography.body, color: colors.textPrimary, fontWeight: '600' },
  totalLabel: { ...typography.heading3, fontSize: 17, color: colors.textPrimary },
  totalValue: { ...typography.heading2, fontSize: 20, color: colors.primary, fontWeight: '700' },
});
