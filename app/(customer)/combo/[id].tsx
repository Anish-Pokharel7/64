import { View, StyleSheet, ScrollView, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, ShoppingCart, Package, Check } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useState, useMemo } from 'react';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing } from '@theme/spacing';
import { radius } from '@theme/radius';
import { Button } from '@components/ui/Button';
import { Loading } from '@components/ui/Loading';
import { ErrorState } from '@components/ui/ErrorState';
import { QuantitySelector } from '@components/food/QuantitySelector';
import { useComboSet } from '@hooks/useCombo';
import { useCartStore } from '@store/cart.store';
import { formatCurrency } from '@utils/currency';
import { ComboOption } from '@models/combo';

export default function ComboDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const comboQuery = useComboSet(id);
  const addCombo = useCartStore((s) => s.addCombo);
  const cartCount = useCartStore((s) => s.getItemCount());
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const combo = comboQuery.data;
  const items = combo?.items ?? [];
  const options = combo?.options;

  const optionGroups = useMemo(() => {
    const groups = new Map<string, ComboOption[]>();
    for (const opt of options ?? []) {
      const arr = groups.get(opt.groupName) ?? [];
      arr.push(opt);
      groups.set(opt.groupName, arr);
    }
    return Array.from(groups.entries());
  }, [options]);

  const optionPriceAdjustment = useMemo(() => {
    let extra = 0;
    for (const [, optLabel] of Object.entries(selectedOptions)) {
      for (const [, opts] of optionGroups) {
        const found = opts.find((o) => o.optionLabel === optLabel);
        if (found) extra += found.priceAdjustment;
      }
    }
    return extra;
  }, [selectedOptions, optionGroups]);

  if (comboQuery.isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
        <Loading fullscreen message="Loading combo..." />
      </SafeAreaView>
    );
  }

  if (comboQuery.isError || !comboQuery.data) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
        <ErrorState message="We couldn't load this combo." onRetry={() => comboQuery.refetch()} />
      </SafeAreaView>
    );
  }

  if (!combo) return null;
  const savings = combo.originalPrice > combo.price ? combo.originalPrice - combo.price : 0;

  const unitPrice = combo.price + optionPriceAdjustment;
  const totalPrice = unitPrice * quantity;

  const selectOption = (groupName: string, optionLabel: string) => {
    setSelectedOptions((prev) => ({ ...prev, [groupName]: optionLabel }));
  };

  const handleAddToCart = () => {
    const comboOptions = Object.entries(selectedOptions).map(([groupName, optionLabel]) => {
      const opt = options?.find((o) => o.groupName === groupName && o.optionLabel === optionLabel);
      return {
        id: opt?.id ?? `${groupName}:${optionLabel}`,
        groupName,
        optionLabel,
        priceAdjustment: opt?.priceAdjustment ?? 0,
      };
    });
    addCombo(combo, quantity, comboOptions.length > 0 ? comboOptions : undefined);
    setAdded(true);
    setTimeout(() => router.push('/(customer)/cart'), 600);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.topBarButton}>
          <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <Pressable onPress={() => router.push('/(customer)/cart')} style={styles.topBarButton}>
          <ShoppingCart size={24} color={colors.textPrimary} strokeWidth={2} />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.imageWrapper}>
          <Image source={{ uri: combo.image }} style={styles.image} contentFit="cover" transition={200} />
          <View style={styles.comboBadge}>
            <Package size={14} color={colors.white} strokeWidth={2} />
            <Text style={styles.comboBadgeText}>Combo Set</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.name}>{combo.name}</Text>
          {combo.description && <Text style={styles.description}>{combo.description}</Text>}

          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatCurrency(combo.price)}</Text>
            {savings > 0 && (
              <>
                <Text style={styles.originalPrice}>{formatCurrency(combo.originalPrice)}</Text>
                <Text style={styles.savings}>Save {formatCurrency(savings)}</Text>
              </>
            )}
          </View>

          {items.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What&apos;s Included</Text>
              {items.map((item) => (
                <View key={item.id} style={styles.includedItem}>
                  <View style={styles.includedDot} />
                  <Text style={styles.includedName}>{item.foodName}</Text>
                  <Text style={styles.includedQty}>×{item.quantity}</Text>
                </View>
              ))}
            </View>
          )}

          {optionGroups.map(([groupName, opts]) => (
            <View key={groupName} style={styles.section}>
              <Text style={styles.sectionTitle}>Choose {groupName}</Text>
              {opts.map((opt) => {
                const isSelected = selectedOptions[groupName] === opt.optionLabel;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => selectOption(groupName, opt.optionLabel)}
                    style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                  >
                    <View style={[styles.optionRadio, isSelected && styles.optionRadioSelected]}>
                      {isSelected && <Check size={14} color={colors.white} strokeWidth={3} />}
                    </View>
                    <Text style={styles.optionName}>{opt.optionLabel}</Text>
                    {opt.priceAdjustment > 0 && (
                      <Text style={styles.optionPrice}>+{formatCurrency(opt.priceAdjustment)}</Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          ))}

          <View style={styles.quantitySection}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <QuantitySelector
              quantity={quantity}
              onIncrease={() => setQuantity((q) => q + 1)}
              onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
              size="lg"
            />
          </View>

          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Combo Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalPrice)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          label={added ? 'Added! Going to cart...' : `Add to Cart • ${formatCurrency(totalPrice)}`}
          onPress={handleAddToCart}
          fullWidth
          size="lg"
          disabled={added}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  topBarButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: 280,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  comboBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  comboBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
    fontSize: 11,
  },
  content: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    marginTop: -radius['2xl'],
    padding: spacing.lg,
  },
  name: {
    ...typography.heading1,
    fontSize: 24,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  price: {
    ...typography.heading2,
    fontSize: 24,
    color: colors.primary,
    fontWeight: '700',
  },
  originalPrice: {
    ...typography.body,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  savings: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textMuted,
    textTransform: 'uppercase',
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  includedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  includedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  includedName: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
  },
  includedQty: {
    ...typography.label,
    color: colors.textSecondary,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
  },
  optionRowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryUltraLight,
  },
  optionRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionRadioSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionName: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
  },
  optionPrice: {
    ...typography.label,
    color: colors.textSecondary,
    fontSize: 13,
  },
  quantitySection: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.xl,
  },
  totalLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  totalValue: {
    ...typography.heading2,
    fontSize: 20,
    color: colors.textPrimary,
    fontWeight: '700',
  },
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
