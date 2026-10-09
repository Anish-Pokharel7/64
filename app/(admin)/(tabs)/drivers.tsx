import { View, StyleSheet, ScrollView, Text, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Bike, Phone, Star, UserPlus } from 'lucide-react-native';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing } from '@theme/spacing';
import { radius } from '@theme/radius';
import { shadows } from '@theme/shadows';
import { Loading } from '@components/ui/Loading';
import { ErrorState } from '@components/ui/ErrorState';
import { EmptyState } from '@components/ui/EmptyState';
import { Badge } from '@components/ui/Badge';
import { useDrivers, useAvailableDrivers, useAssignDriver, useAdminOrders } from '@hooks/useAdmin';
import { useAuthStore } from '@store/auth.store';
import { OrderStatus } from '@models/order';

export default function AdminDriversScreen() {
  const { data: drivers, isLoading, isError, refetch } = useDrivers();
  const { data: availableDrivers } = useAvailableDrivers();
  const { data: orders } = useAdminOrders();
  const assignDriver = useAssignDriver();
  const user = useAuthStore((s) => s.user);

  const readyOrders = (orders ?? []).filter((o) => o.status === 'READY_FOR_PICKUP' && !o.driverId);

  const handleAssign = (orderId: string, orderNumber: string) => {
    if (!availableDrivers || availableDrivers.length === 0) {
      Alert.alert('No drivers available', 'There are no online drivers to assign.');
      return;
    }

    const driverOptions = availableDrivers.map((d) => {
      return {
        text: `${d.fullName} - ${d.vehicleNumber || d.vehicleType}`,
        onPress: () => {
          if (!user) return;
          assignDriver.mutate(
            { orderId, driverId: d.id, assignedBy: user.id },
            {
              onSuccess: () => Alert.alert('Driver assigned', `Driver assigned to ${orderNumber}.`),
              onError: (err) => Alert.alert('Failed', err instanceof Error ? err.message : 'Could not assign driver.'),
            },
          );
        },
      };
    });

    Alert.alert('Assign Driver', `Choose a driver for ${orderNumber}:`, [
      ...driverOptions,
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
        <Loading fullscreen message="Loading drivers..." />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
        <ErrorState onRetry={() => refetch()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing['3xl'] }}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Bike size={24} color={colors.primary} strokeWidth={2} />
          </View>
          <View>
            <Text style={styles.title}>Drivers</Text>
            <Text style={styles.subtitle}>{drivers?.length ?? 0} total · {availableDrivers?.length ?? 0} online</Text>
          </View>
        </View>

        {readyOrders.length > 0 && (
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>Orders needing a driver</Text>
            {readyOrders.map((order) => (
              <Pressable
                key={order.id}
                onPress={() => handleAssign(order.id, order.orderNumber)}
                style={({ pressed }) => [styles.alertOrder, pressed && { opacity: 0.8 }]}
              >
                <View>
                  <Text style={styles.alertOrderNumber}>{order.orderNumber}</Text>
                  <Text style={styles.alertOrderItems}>{order.items.length} items</Text>
                </View>
                <UserPlus size={20} color={colors.primary} strokeWidth={2} />
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Drivers</Text>
          {drivers && drivers.length > 0 ? (
            <View style={styles.list}>
              {drivers.map((driver) => (
                <View key={driver.id} style={styles.driverCard}>
                  <View style={styles.driverAvatar}>
                    <Text style={styles.driverInitial}>{driver.fullName.charAt(0)}</Text>
                  </View>
                  <View style={styles.driverInfo}>
                    <Text style={styles.driverName}>{driver.fullName}</Text>
                    <Text style={styles.driverPhone}>{driver.phone || 'No phone'}</Text>
                    <View style={styles.driverMeta}>
                      <View style={styles.metaItem}>
                        <Bike size={14} color={colors.textMuted} strokeWidth={2} />
                        <Text style={styles.metaText}>{driver.vehicleType} · {driver.vehicleNumber || 'N/A'}</Text>
                      </View>
                      {driver.rating > 0 && (
                        <View style={styles.metaItem}>
                          <Star size={14} color={colors.star} fill={colors.star} strokeWidth={0} />
                          <Text style={styles.metaText}>{driver.rating.toFixed(1)}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={styles.driverRight}>
                    <Badge
                      label={driver.isOnline ? 'Online' : 'Offline'}
                      variant={driver.isOnline ? 'success' : 'neutral'}
                    />
                    <Text style={styles.deliveriesCount}>{driver.totalDeliveries} deliveries</Text>
                    {driver.phone ? (
                      <Pressable
                        onPress={() => {
                          Alert.alert('Call Driver', `${driver.fullName}\n${driver.phone}`);
                        }}
                        style={styles.callBtn}
                      >
                        <Phone size={16} color={colors.primary} strokeWidth={2} />
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <EmptyState
              icon={<Bike size={48} color={colors.textMuted} strokeWidth={1.5} />}
              title="No drivers yet"
              message="Drivers will appear here once they register."
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryUltraLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.heading2,
    fontSize: 22,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  alertBox: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.warningLight,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  alertTitle: {
    ...typography.label,
    color: colors.warning,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  alertOrder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.xs,
  },
  alertOrderNumber: {
    ...typography.label,
    fontSize: 14,
  },
  alertOrderItems: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  sectionTitle: {
    ...typography.heading3,
    fontSize: 18,
    marginBottom: spacing.md,
  },
  list: {
    gap: spacing.sm,
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  driverAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverInitial: {
    ...typography.heading3,
    color: colors.white,
    fontSize: 18,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    ...typography.label,
    fontSize: 15,
  },
  driverPhone: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  driverMeta: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
  driverRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  deliveriesCount: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
  callBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryUltraLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
});
