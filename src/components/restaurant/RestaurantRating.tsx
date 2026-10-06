import { View, Text, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { radius } from '@theme/radius';
import { spacing } from '@theme/spacing';

type RestaurantRatingProps = {
  rating: number;
  reviewCount?: number;
  size?: number;
};

export function RestaurantRating({ rating, reviewCount, size = 14 }: RestaurantRatingProps) {
  return (
    <View style={styles.container}>
      <Star size={size} color={colors.star} fill={colors.star} strokeWidth={0} />
      <Text style={[styles.text, { fontSize: size - 1 }]}>{rating}</Text>
      {reviewCount !== undefined && (
        <Text style={[styles.reviewCount, { fontSize: size - 2 }]}>({reviewCount})</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  text: {
    ...typography.label,
    color: colors.textPrimary,
  },
  reviewCount: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
