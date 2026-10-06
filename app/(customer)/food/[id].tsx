import { View, StyleSheet, ScrollView, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, ShoppingCart, Star } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useState } from 'react';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing } from '@theme/spacing';
import { radius } from '@theme/radius';
import { shadows } from '@theme/shadows';
import { Button } from '@components/ui/Button';
import { Loading } from '@components/ui/Loading';
import { ErrorState } from '@components/ui/ErrorState';
import { QuantitySelector } from '@components/food/QuantitySelector';
import { Badge } from '@components/ui/Badge';
import { useFood } from '@hooks/useFood';
import { useCartStore } from '@store/cart.store';
import { formatCurrency } from '@utils/currency';

export default function FoodDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const foodQuery = useFood(id);
  const addItem = useCartStore((s) => s.addItem);
  const cartCount = useCartStore((s) => s.getItemCount());
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

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

  const handleAddToCart = () => {
    addItem(food, quantity);
    setAdded(true);
    setTimeout(() => router.push('/(customer)/cart'), 600);
  };

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
            <Text style={styles.price}>{formatCurrency(food.price)}</Text>
          </View>

          {food.restaurantName && (
            <Pressable
              onPress={() => router.push(`/(customer)/restaurant/${food.restaurantId}`)}
              style={styles.restaurantLink}
            >
              <Text style={styles.restaurantName}>{food.restaurantName}</Text>
            </Pressable>
          )}

          {food.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{food.description}</Text>
            </View>
          )}

          <View style={styles.customizationSection}>
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
            <Text style={styles.totalValue}>{formatCurrency(food.price * quantity)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          label={added ? 'Added! Going to cart...' : `Add to Cart • ${formatCurrency(food.price * quantity)}`}
          onPress={handleAddToCart}
          fullWidth
          size="lg"
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
  price: {
    ...typography.heading2,
    fontSize: 22,
    color: colors.primary,
    fontWeight: '700',
  },
  restaurantLink: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  restaurantName: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
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
  customizationSection: {
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
