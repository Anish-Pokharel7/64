import { View, StyleSheet, ScrollView, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, ShoppingCart, Star, Check } from 'lucide-react-native';
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
import { Badge } from '@components/ui/Badge';
import { useFood, useCustomizationGroups } from '@hooks/useFood';
import { useCartStore } from '@store/cart.store';
import { formatCurrency } from '@utils/currency';
import { CartItemCustomization } from '@models/cart';

export default function FoodDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const foodQuery = useFood(id);
  const customizationQuery = useCustomizationGroups(id);
  const addItem = useCartStore((s) => s.addItem);
  const cartCount = useCartStore((s) => s.getItemCount());
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, Set<string>>>({});
  const customizationGroups = customizationQuery.data;

  const customizationPrice = useMemo(() => {
    let extra = 0;
    for (const group of customizationGroups ?? []) {
      const selected = selectedOptions[group.id];
      if (!selected) continue;
      for (const option of group.options) {
        if (selected.has(option.id)) {
          extra += option.priceAdjustment;
        }
      }
    }
    return extra;
  }, [customizationGroups, selectedOptions]);

  if (foodQuery.isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
        <Loading fullscreen message="Loading..." />
      </SafeAreaView>
    );
  }

  if (foodQuery.isError || !foodQuery.data) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
        <ErrorState
          message="We couldn't load this item."
          onRetry={() => foodQuery.refetch()}
        />
      </SafeAreaView>
    );
  }

  const food = foodQuery.data;

  const toggleOption = (groupId: string, optionId: string, maxSelections: number) => {
    setSelectedOptions((prev) => {
      const current = new Set(prev[groupId] ?? []);
      if (current.has(optionId)) {
        current.delete(optionId);
      } else {
        if (maxSelections === 1) {
          current.clear();
        }
        current.add(optionId);
      }
      return { ...prev, [groupId]: current };
    });
  };

  const unitPrice = food.price + customizationPrice;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    const cartCustomizations: CartItemCustomization[] = [];
    for (const group of groups) {
      const selected = selectedOptions[group.id];
      if (!selected) continue;
      for (const option of group.options) {
        if (selected.has(option.id)) {
          cartCustomizations.push({
            groupId: group.id,
            groupName: group.name,
            optionId: option.id,
            optionName: option.name,
            priceAdjustment: option.priceAdjustment,
          });
        }
      }
    }
    addItem(food, quantity, cartCustomizations.length > 0 ? cartCustomizations : undefined);
    setAdded(true);
    setTimeout(() => router.push('/(customer)/cart'), 600);
  };

  const groups = customizationGroups ?? [];
  const canAddToCart = groups.every((g) => !g.isRequired || (selectedOptions[g.id] && selectedOptions[g.id].size >= g.minSelections));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.topBarButton}
        >
          <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <Pressable
          onPress={() => router.push('/(customer)/cart')}
          accessibilityRole="button"
          accessibilityLabel="Cart"
          style={styles.topBarButton}
        >
          <ShoppingCart size={24} color={colors.textPrimary} strokeWidth={2} />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.imageWrapper}>
          <Image source={{ uri: food.image }} style={styles.image} contentFit="cover" transition={200} />
          {food.isVegetarian && (
            <View style={styles.vegBadge}>
              <View style={styles.vegDot} />
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.name}>{food.name}</Text>
            {food.isPopular && <Badge label="Popular" variant="primary" size="md" />}
          </View>

          <View style={styles.metaRow}>
            {food.rating && (
              <View style={styles.ratingRow}>
                <Star size={16} color={colors.star} fill={colors.star} strokeWidth={0} />
                <Text style={styles.ratingText}>{food.rating}</Text>
              </View>
            )}
            {food.prepTimeMinutes && (
              <Text style={styles.prepTime}>~{food.prepTimeMinutes} min</Text>
            )}
            <Text style={styles.price}>{formatCurrency(food.price)}</Text>
          </View>

          {food.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{food.description}</Text>
            </View>
          )}

          {groups.map((group) => (
            <View key={group.id} style={styles.customizationGroup}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupName}>{group.name}</Text>
                {group.isRequired && <Text style={styles.requiredLabel}>Required</Text>}
              </View>
              {group.options.map((option) => {
                const isSelected = selectedOptions[group.id]?.has(option.id) ?? false;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => toggleOption(group.id, option.id, group.maxSelections)}
                    style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                  >
                    <View style={[styles.optionCheckbox, isSelected && styles.optionCheckboxSelected]}>
                      {isSelected && <Check size={14} color={colors.white} strokeWidth={3} />}
                    </View>
                    <Text style={styles.optionName}>{option.name}</Text>
                    {option.priceAdjustment > 0 && (
                      <Text style={styles.optionPrice}>+{formatCurrency(option.priceAdjustment)}</Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          ))}

          <View style={styles.specialInstructionsSection}>
            <Text style={styles.sectionTitle}>Special Instructions</Text>
            <Text style={styles.instructionsHint}>Any special requests for this item?</Text>
          </View>

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
            <Text style={styles.totalLabel}>Item Total</Text>
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
          disabled={!canAddToCart || added}
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
  vegBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.success,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vegDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
  },
  content: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    marginTop: -radius['2xl'],
    padding: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  name: {
    ...typography.heading1,
    fontSize: 24,
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    ...typography.label,
    color: colors.textPrimary,
  },
  prepTime: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  price: {
    ...typography.heading2,
    fontSize: 22,
    color: colors.primary,
    fontWeight: '700',
  },
  descriptionSection: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textMuted,
    textTransform: 'uppercase',
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  customizationGroup: {
    marginTop: spacing.lg,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  groupName: {
    ...typography.heading3,
    fontSize: 16,
  },
  requiredLabel: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '600',
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
  optionCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionCheckboxSelected: {
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
  specialInstructionsSection: {
    marginTop: spacing.lg,
  },
  instructionsHint: {
    ...typography.body,
    color: colors.textMuted,
    fontStyle: 'italic',
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
