import { View, StyleSheet, FlatList, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, Plus, MapPin, Home, Briefcase, MapPinned } from 'lucide-react-native';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing } from '@theme/spacing';
import { radius } from '@theme/radius';
import { shadows } from '@theme/shadows';
import { Button } from '@components/ui/Button';
import { EmptyState } from '@components/ui/EmptyState';
import { Loading } from '@components/ui/Loading';
import { Badge } from '@components/ui/Badge';
import { useAddresses } from '@hooks/useAddresses';
import { useLocation } from '@hooks/useLocation';
import { Address } from '@models/address';

const LABEL_ICONS: Record<string, React.ReactNode> = {
  Home: <Home size={20} color={colors.primary} strokeWidth={2} />,
  Office: <Briefcase size={20} color={colors.primary} strokeWidth={2} />,
};

export default function AddressesScreen() {
  const { data: addresses, isLoading, isError, refetch } = useAddresses();
  const { setLocation } = useLocation();

  const handleSelectAddress = (addr: Address) => {
    setLocation(`${addr.label} — ${addr.address}, ${addr.city}`);
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.backButton}
        >
          <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text style={styles.title}>Saved Addresses</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <Loading message="Loading addresses..." />
      ) : isError ? (
        <EmptyState
          title="Couldn't load addresses"
          message="Please try again."
          actionLabel="Try Again"
          onAction={() => refetch()}
        />
      ) : !addresses || addresses.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <EmptyState
            icon={<MapPin size={48} color={colors.textMuted} strokeWidth={1.5} />}
            title="No saved addresses"
            message="Add a delivery address to start ordering food."
            actionLabel="Add Address"
            onAction={() => router.push('/(customer)/addresses/add')}
          />
        </View>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleSelectAddress(item)}
              accessibilityRole="button"
              accessibilityLabel={`Select ${item.label} address`}
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardIcon}>
                  {LABEL_ICONS[item.label] ?? <MapPinned size={20} color={colors.primary} strokeWidth={2} />}
                </View>
                <View style={styles.cardHeaderInfo}>
                  <View style={styles.labelRow}>
                    <Text style={styles.label}>{item.label}</Text>
                    {item.isDefault && <Badge label="Default" variant="primary" size="sm" />}
                  </View>
                  <Text style={styles.name}>{item.fullName} • {item.phone}</Text>
                </View>
              </View>
              <Text style={styles.addressText}>
                {item.address}, {item.area}, {item.city}
              </Text>
              {item.landmark && <Text style={styles.landmark}>Landmark: {item.landmark}</Text>}
            </Pressable>
          )}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          contentContainerStyle={{ padding: spacing.lg }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.bottomBar}>
        <Button
          label="Add New Address"
          onPress={() => router.push('/(customer)/addresses/add')}
          fullWidth
          size="lg"
          leftIcon={<Plus size={20} color={colors.white} strokeWidth={2.5} />}
        />
      </View>
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
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.heading2,
    fontSize: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primaryUltraLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderInfo: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    ...typography.heading3,
    fontSize: 16,
  },
  name: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addressText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
    lineHeight: 20,
  },
  landmark: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  bottomBar: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
