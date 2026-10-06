import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Star, Clock, Bike, MapPin } from 'lucide-react-native';
import { Restaurant } from '@models/restaurant';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { radius } from '@theme/radius';
import { spacing } from '@theme/spacing';
import { formatCurrency } from '@utils/currency';
import { Badge } from '@components/ui/Badge';

type RestaurantHeaderProps = {
  restaurant: Restaurant;
};

export function RestaurantHeader({ restaurant }: RestaurantHeaderProps) {
  return (
    <View>
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: restaurant.image }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.imageOverlay} />
        {!restaurant.isOpen && (
          <View style={styles.closedBadge}>
            <Badge label="Closed" variant="error" size="md" />
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{restaurant.name}</Text>
        <Text style={styles.cuisine}>{restaurant.cuisine.join(' • ')}</Text>
        <View style={styles.metaRow}>
          <View style={styles.ratingWrapper}>
            <Star size={16} color={colors.star} fill={colors.star} strokeWidth={0} />
            <Text style={styles.ratingText}>{restaurant.rating}</Text>
            <Text style={styles.reviewCount}>({restaurant.reviewCount})</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Clock size={16} color={colors.primary} strokeWidth={2} />
            <Text style={styles.infoText}>{restaurant.deliveryTime} min</Text>
          </View>
          <View style={styles.infoItem}>
            <Bike size={16} color={colors.primary} strokeWidth={2} />
            <Text style={styles.infoText}>{formatCurrency(restaurant.deliveryFee)} delivery</Text>
          </View>
          {restaurant.distanceKm !== undefined && (
            <View style={styles.infoItem}>
              <MapPin size={16} color={colors.primary} strokeWidth={2} />
              <Text style={styles.infoText}>{restaurant.distanceKm} km away</Text>
            </View>
          )}
        </View>
        {restaurant.description && (
          <Text style={styles.description}>{restaurant.description}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: 240,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  closedBadge: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
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
  cuisine: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  ratingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    ...typography.label,
    color: colors.textPrimary,
  },
  reviewCount: {
    ...typography.caption,
    color: colors.textMuted,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
    lineHeight: 22,
  },
});
