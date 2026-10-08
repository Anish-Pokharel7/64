import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Star, Clock, Bike } from 'lucide-react-native';
import { Restaurant } from '@models/restaurant';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { radius } from '@theme/radius';
import { spacing } from '@theme/spacing';
import { shadows } from '@theme/shadows';
import { formatCurrency } from '@utils/currency';

type RestaurantCardProps = {
  restaurant: Restaurant;
  onPress?: () => void;
  onAddPress?: () => void;
  horizontal?: boolean;
};

export function RestaurantCard({ restaurant, onPress, horizontal = false }: RestaurantCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={restaurant.name}
      style={({ pressed }) => [
        styles.container,
        horizontal && styles.horizontal,
        pressed && { opacity: 0.9 },
      ]}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: restaurant.image }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        {!restaurant.isOpen && (
          <View style={styles.closedOverlay}>
            <Text style={styles.closedText}>Closed</Text>
          </View>
        )}
        <View style={styles.ratingBadge}>
          <Star size={12} color={colors.star} fill={colors.star} strokeWidth={0} />
          <Text style={styles.ratingText}>{restaurant.rating}</Text>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{restaurant.name}</Text>
        <Text style={styles.cuisine} numberOfLines={1}>{restaurant.cuisine.join(' • ')}</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Clock size={14} color={colors.textMuted} strokeWidth={2} />
            <Text style={styles.metaText}>{restaurant.deliveryTime} min</Text>
          </View>
          <View style={styles.metaItem}>
            <Bike size={14} color={colors.textMuted} strokeWidth={2} />
            <Text style={styles.metaText}>{formatCurrency(restaurant.deliveryFee)}</Text>
          </View>
          {restaurant.distanceKm !== undefined && (
            <Text style={styles.distance}>{restaurant.distanceKm} km</Text>
          )}
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
    width: 260,
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: 160,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  closedOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closedText: {
    ...typography.label,
    color: colors.white,
    fontSize: 14,
  },
  ratingBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  ratingText: {
    ...typography.label,
    fontSize: 12,
    color: colors.textPrimary,
  },
  info: {
    padding: spacing.md,
  },
  name: {
    ...typography.heading3,
    fontSize: 16,
  },
  cuisine: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 12,
  },
  distance: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 12,
    marginLeft: 'auto',
  },
});
