import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Plus, Star } from 'lucide-react-native';
import { Food } from '@models/food';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { radius } from '@theme/radius';
import { spacing } from '@theme/spacing';
import { shadows } from '@theme/shadows';
import { formatCurrency } from '@utils/currency';

type FoodCardProps = {
  food: Food;
  onPress?: () => void;
  onAdd?: () => void;
  horizontal?: boolean;
  showRestaurant?: boolean;
};

export function FoodCard({
  food,
  onPress,
  onAdd,
  horizontal = false,
  showRestaurant = false,
}: FoodCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={food.name}
      style={({ pressed }) => [
        styles.container,
        horizontal && styles.horizontal,
        pressed && { opacity: 0.9 },
      ]}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: food.image }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        {food.isVegetarian && (
          <View style={styles.vegBadge}>
            <View style={styles.vegDot} />
          </View>
        )}
        <Pressable
          onPress={onAdd}
          accessibilityRole="button"
          accessibilityLabel={`Add ${food.name} to cart`}
          style={({ pressed }) => [styles.addButton, pressed && { transform: [{ scale: 0.9 }] }]}
        >
          <Plus size={18} color={colors.primary} strokeWidth={2.5} />
        </Pressable>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{food.name}</Text>
        <Text style={styles.description} numberOfLines={2}>{food.description}</Text>
        {showRestaurant && food.isFeatured && (
          <Text style={styles.restaurant} numberOfLines={1}>Featured</Text>
        )}
        <View style={styles.bottomRow}>
          {food.rating && (
            <View style={styles.ratingRow}>
              <Star size={12} color={colors.star} fill={colors.star} strokeWidth={0} />
              <Text style={styles.ratingText}>{food.rating}</Text>
            </View>
          )}
          <Text style={styles.price}>{formatCurrency(food.price)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  horizontal: {
    width: 200,
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: 130,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  vegBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.success,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  addButton: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  info: {
    padding: spacing.md,
  },
  name: {
    ...typography.label,
    fontSize: 14,
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  restaurant: {
    ...typography.caption,
    color: colors.primary,
    marginTop: 4,
    fontSize: 11,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
  price: {
    ...typography.heading3,
    fontSize: 15,
    color: colors.primary,
    fontWeight: '700',
  },
});
