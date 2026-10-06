import { View, StyleSheet, ScrollView, Text, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, Minus, Plus, Trash2, ShoppingCart } from 'lucide-react-native';
import { Image } from 'expo-image';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing } from '@theme/spacing';
import { radius } from '@theme/radius';
import { shadows } from '@theme/shadows';
import { Button } from '@components/ui/Button';
import { EmptyState } from '@components/ui/EmptyState';
import { Divider } from '@components/ui/Divider';
import { useCartStore } from '@store/cart.store';
import { formatCurrency } from '@utils/currency';

export default function CartScreen() {
  const items = useCartStore((s) => s.items);
  const increaseQuantity = useCartStore((s) => s.increaseQuantity);
  const decreaseQuantity = useCartStore((s) => s.decreaseQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const totals = useCartStore((s) => s.getTotals());

  if (items.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={styles.backButton}
          >
            <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2} />
          </Pressable>
          <Text style={styles.title}>Cart</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <EmptyState
            icon={<ShoppingCart size={48} color={colors.textMuted} strokeWidth={1.5} />}
            title="Your cart is empty"
            message="Browse restaurants and add your favorite food to get started."
            actionLabel="Browse Restaurants"
            onAction={() => router.replace('/(customer)/(tabs)')}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.backButton}
        >
          <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text style={styles.title}>Cart</Text>
        <Pressable
          onPress={clearCart}
          accessibilityRole="button"
          accessibilityLabel="Clear cart"
          style={styles.clearButton}
        >
          <Trash2 size={20} color={colors.error} strokeWidth={2} />
        </Pressable>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Image source={{ uri: item.food.image }} style={styles.itemImage} contentFit="cover" />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>{item.food.name}</Text>
              {item.food.restaurantName && (
                <Text style={styles.itemRestaurant} numberOfLines={1}>{item.food.restaurantName}</Text>
              )}
              <Text style={styles.itemPrice}>{formatCurrency(item.unitPrice)}</Text>
            </View>
            <View style={styles.itemActions}>
              <View style={styles.quantityControls}>
                <Pressable
                  onPress={() => decreaseQuantity(item.id)}
                  accessibilityRole="button"
                  accessibilityLabel="Decrease quantity"
                  style={styles.qtyButton}
                >
                  <Minus size={16} color={colors.textPrimary} strokeWidth={2.5} />
                </Pressable>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <Pressable
                  onPress={() => increaseQuantity(item.id)}
                  accessibilityRole="button"
                  accessibilityLabel="Increase quantity"
                  style={[styles.qtyButton, styles.qtyButtonActive]}
                >
                  <Plus size={16} color={colors.white} strokeWidth={2.5} />
                </Pressable>
              </View>
              <Text style={styles.itemTotal}>{formatCurrency(item.unitPrice * item.quantity)}</Text>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <Divider spacing_size="sm" />}
        contentContainerStyle={{ padding: spacing.lg }}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={() => (
          <View style={styles.footer}>
            <View style={styles.totalsCard}>
              <TotalRow label="Subtotal" value={formatCurrency(totals.subtotal)} />
              <TotalRow label="Delivery Fee" value={formatCurrency(totals.deliveryFee)} />
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
              onPress={() => {}}
              fullWidth
              size="lg"
              style={{ marginTop: spacing.md }}
            />
            <Text style={styles.checkoutNote}>
              Checkout and payments will be available in a future update.
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
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
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.heading2,
    fontSize: 20,
  },
  clearButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    ...typography.label,
    fontSize: 15,
  },
  itemRestaurant: {
    ...typography.caption,
    color: colors.primary,
    marginTop: 2,
  },
  itemPrice: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemActions: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyButtonActive: {
    backgroundColor: colors.primary,
  },
  quantityText: {
    ...typography.label,
    fontSize: 15,
    minWidth: 20,
    textAlign: 'center',
  },
  itemTotal: {
    ...typography.heading3,
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  footer: {
    marginTop: spacing.lg,
    paddingBottom: spacing['2xl'],
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
  totalRowLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  totalRowValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  totalLabel: {
    ...typography.heading3,
    fontSize: 17,
    color: colors.textPrimary,
  },
  totalValue: {
    ...typography.heading2,
    fontSize: 20,
    color: colors.primary,
    fontWeight: '700',
  },
  checkoutNote: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
