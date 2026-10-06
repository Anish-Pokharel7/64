import { View, StyleSheet, ScrollView, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { CheckCircle2, Package, Home, ChevronRight } from 'lucide-react-native';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing } from '@theme/spacing';
import { radius } from '@theme/radius';
import { shadows } from '@theme/shadows';
import { Button } from '@components/ui/Button';
import { Loading } from '@components/ui/Loading';
import { useOrder } from '@hooks/useOrders';
import { formatCurrency } from '@utils/currency';

export default function OrderConfirmationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderQuery = useOrder(id);

  if (orderQuery.isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
        <Loading fullscreen message="Loading order..." />
      </SafeAreaView>
    );
  }

  const order = orderQuery.data;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: spacing['3xl'] }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.successSection}>
          <View style={styles.successIcon}>
            <CheckCircle2 size={64} color={colors.success} strokeWidth={1.5} />
          </View>
          <Text style={styles.successTitle}>Order Placed!</Text>
          <Text style={styles.successSubtitle}>
            {order ? `Order #${order.orderNumber}` : 'Your order has been received'}
          </Text>
          <Text style={styles.successDesc}>
            We&apos;re preparing your food. You&apos;ll receive updates as your order progresses.
          </Text>
        </View>

        {order && (
          <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Package size={20} color={colors.primary} strokeWidth={2} />
              <Text style={styles.orderHeaderText}>Order Summary</Text>
            </View>
            {order.items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <Text style={styles.itemName}>
                  {item.quantity}× {item.name}
                </Text>
                <Text style={styles.itemPrice}>{formatCurrency(item.subtotal ?? item.unitPrice * item.quantity)}</Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Payment</Text>
              <Text style={styles.paymentValue}>
                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod ?? 'Cash on Delivery'}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.actions}>
          <Button
            label="Track Order"
            onPress={() => router.replace(`/(customer)/order-tracking/${id}`)}
            fullWidth
            size="lg"
            style={{ marginBottom: spacing.md }}
          />
          <Pressable
            onPress={() => router.replace('/(customer)/(tabs)')}
            style={styles.homeButton}
          >
            <Home size={18} color={colors.textSecondary} strokeWidth={2} />
            <Text style={styles.homeText}>Back to Home</Text>
            <ChevronRight size={18} color={colors.textMuted} strokeWidth={2} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  successSection: {
    alignItems: 'center',
    paddingTop: spacing['3xl'],
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  successIcon: {
    marginBottom: spacing.lg,
  },
  successTitle: {
    ...typography.heading1,
    fontSize: 28,
    color: colors.success,
    textAlign: 'center',
  },
  successSubtitle: {
    ...typography.heading3,
    fontSize: 18,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  successDesc: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  orderCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  orderHeaderText: {
    ...typography.heading3,
    fontSize: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  itemName: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
  },
  itemPrice: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    ...typography.heading3,
    fontSize: 17,
  },
  totalValue: {
    ...typography.heading2,
    fontSize: 20,
    color: colors.primary,
    fontWeight: '700',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  paymentLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  paymentValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  actions: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing['2xl'],
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  homeText: {
    ...typography.label,
    color: colors.textSecondary,
  },
});
