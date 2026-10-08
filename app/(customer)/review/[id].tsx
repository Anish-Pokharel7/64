import { View, StyleSheet, ScrollView, Text, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Star } from 'lucide-react-native';
import { useState } from 'react';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing } from '@theme/spacing';
import { radius } from '@theme/radius';
import { Button } from '@components/ui/Button';
import { Loading } from '@components/ui/Loading';
import { ErrorState } from '@components/ui/ErrorState';
import { useOrder } from '@hooks/useOrders';
import { supabase } from '@api/supabase';

export default function ReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderQuery = useOrder(id);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (orderQuery.isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
        <Loading fullscreen message="Loading order..." />
      </SafeAreaView>
    );
  }

  if (orderQuery.isError || !orderQuery.data) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
        <ErrorState message="We couldn't load this order." onRetry={() => orderQuery.refetch()} />
      </SafeAreaView>
    );
  }

  const order = orderQuery.data;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { error } = await supabase.from('reviews').insert({
        order_id: order.id,
        customer_id: order.customerId,
        rating,
        review_text: reviewText || null,
      });
      if (error) throw new Error(error.message);
      Alert.alert('Thank you!', 'Your review has been submitted.');
      router.back();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text style={styles.title}>Rate Your Order</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing['3xl'] }}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>{order.orderNumber}</Text>
          <Text style={styles.orderItems}>
            {order.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
          </Text>
        </View>

        <View style={styles.starsSection}>
          <Text style={styles.sectionTitle}>How was your experience?</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable key={star} onPress={() => setRating(star)}>
                <Star
                  size={36}
                  color={star <= rating ? colors.star : colors.border}
                  fill={star <= rating ? colors.star : 'transparent'}
                  strokeWidth={2}
                />
              </Pressable>
            ))}
          </View>
          <Text style={styles.ratingLabel}>
            {rating === 5 ? 'Excellent!' : rating === 4 ? 'Good' : rating === 3 ? 'Okay' : rating === 2 ? 'Poor' : 'Terrible'}
          </Text>
        </View>

        <View style={styles.reviewSection}>
          <Text style={styles.sectionTitle}>Write a review (optional)</Text>
          <TextInput
            style={styles.reviewInput}
            placeholder="Tell us about your experience..."
            placeholderTextColor={colors.textMuted}
            value={reviewText}
            onChangeText={setReviewText}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        <Button
          label={submitting ? 'Submitting...' : 'Submit Review'}
          onPress={handleSubmit}
          fullWidth
          size="lg"
          disabled={submitting}
        />
      </ScrollView>
    </SafeAreaView>
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
  orderInfo: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  orderNumber: { ...typography.heading3, fontSize: 16 },
  orderItems: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xs },
  starsSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textMuted,
    textTransform: 'uppercase',
    fontSize: 12,
    marginBottom: spacing.md,
  },
  starsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  ratingLabel: {
    ...typography.heading3,
    fontSize: 18,
    color: colors.primary,
  },
  reviewSection: {
    marginBottom: spacing.xl,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
    minHeight: 120,
  },
});
