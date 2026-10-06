import { View, StyleSheet, ScrollView, FlatList, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ShoppingCart, Bell, Package, Heart, Ticket } from 'lucide-react-native';
import { Image } from 'expo-image';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing } from '@theme/spacing';
import { radius } from '@theme/radius';
import { shadows } from '@theme/shadows';
import { LocationSelector } from '@components/common/LocationSelector';
import { SearchBar } from '@components/common/SearchBar';
import { SectionHeader } from '@components/common/SectionHeader';
import { PromoBanner } from '@components/home/PromoBanner';
import { CategoryCard } from '@components/home/CategoryCard';
import { FoodCard } from '@components/home/FoodCard';
import { Loading } from '@components/ui/Loading';
import { ErrorState } from '@components/ui/ErrorState';
import { useLocation } from '@hooks/useLocation';
import { usePopularFoods, useFeaturedFoods } from '@hooks/useFood';
import { useCategories } from '@hooks/useCategories';
import { useFeaturedCombos } from '@hooks/useCombo';
import { usePromotions, useUnreadNotificationCount } from '@hooks/useNotifications';
import { useCartStore } from '@store/cart.store';
import { formatCurrency } from '@utils/currency';
import { ComboSet } from '@models/combo';

export default function HomeScreen() {
  const { currentLocation } = useLocation();
  const cartCount = useCartStore((s) => s.getItemCount());
  const unreadCount = useUnreadNotificationCount();

  const popularFoods = usePopularFoods();
  const featuredFoods = useFeaturedFoods();
  const combos = useFeaturedCombos();
  const categoriesQuery = useCategories();
  const promotionsQuery = usePromotions();

  const categories = categoriesQuery.data ?? [];
  const isLoading = popularFoods.isLoading || combos.isLoading;
  const hasError = popularFoods.isError;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const promotions = promotionsQuery.data ?? [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing['3xl'] }}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.brandName}>64 Delivery</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => router.push('/(customer)/cart')}
              accessibilityRole="button"
              accessibilityLabel="Cart"
              style={styles.iconButton}
            >
              <ShoppingCart size={24} color={colors.textPrimary} strokeWidth={2} />
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
              )}
            </Pressable>
            <Pressable
              onPress={() => router.push('/(customer)/notification')}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              style={[styles.iconButton, { marginLeft: spacing.sm }]}
            >
              <Bell size={24} color={colors.textPrimary} strokeWidth={2} />
              {unreadCount.data && unreadCount.data > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{unreadCount.data}</Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        <View style={styles.locationRow}>
          <LocationSelector
            location={currentLocation}
            onPress={() => router.push('/(customer)/addresses')}
          />
        </View>

        <View style={styles.content}>
          <SearchBar onPress={() => router.push('/(customer)/(tabs)/search')} />

          {promotions.length > 0 && (
            <View style={styles.section}>
              {promotions.map((promo) => (
                <PromoBanner
                  key={promo.id}
                  title={promo.title}
                  subtitle={promo.description ?? ''}
                  image={promo.image ?? ''}
                  onPress={() => router.push('/(customer)/(tabs)/search')}
                />
              ))}
            </View>
          )}

          {categories.length > 0 && (
            <View style={styles.section}>
              <SectionHeader title="Categories" />
              <FlatList
                data={categories}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <CategoryCard
                    name={item.name}
                    iconName={item.icon}
                    onPress={() => router.push(`/(customer)/(tabs)/search?category=${item.id}`)}
                  />
                )}
                ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
                contentContainerStyle={{ paddingVertical: spacing.xs }}
              />
            </View>
          )}

          {hasError ? (
            <ErrorState onRetry={() => popularFoods.refetch()} />
          ) : isLoading ? (
            <Loading message="Loading menu..." />
          ) : (
            <>
              {combos.data && combos.data.length > 0 && (
                <View style={styles.section}>
                  <SectionHeader
                    title="Special Combo Sets"
                    actionLabel="See All"
                    onAction={() => router.push('/(customer)/(tabs)/search?tab=combos')}
                  />
                  <FlatList
                    data={combos.data}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <ComboCard combo={item} onPress={() => router.push(`/(customer)/combo/${item.id}`)} />
                    )}
                    ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
                    contentContainerStyle={{ paddingBottom: spacing.xs }}
                  />
                </View>
              )}

              <View style={styles.section}>
                <SectionHeader
                  title="Popular Today"
                  actionLabel="See All"
                  onAction={() => router.push('/(customer)/(tabs)/search')}
                />
                <FlatList
                  data={popularFoods.data ?? []}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <FoodCard
                      food={item}
                      horizontal
                      onPress={() => router.push(`/(customer)/food/${item.id}`)}
                      onAdd={() => router.push(`/(customer)/food/${item.id}`)}
                    />
                  )}
                  ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
                  contentContainerStyle={{ paddingBottom: spacing.xs }}
                />
              </View>

              {featuredFoods.data && featuredFoods.data.length > 0 && (
                <View style={styles.section}>
                  <SectionHeader title="Chef's Picks" />
                  <FlatList
                    data={featuredFoods.data}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <FoodCard
                        food={item}
                        horizontal
                        onPress={() => router.push(`/(customer)/food/${item.id}`)}
                        onAdd={() => router.push(`/(customer)/food/${item.id}`)}
                      />
                    )}
                    ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
                    contentContainerStyle={{ paddingBottom: spacing.xs }}
                  />
                </View>
              )}

              <View style={styles.quickActions}>
                <QuickActionCard
                  icon={<Package size={24} color={colors.primary} strokeWidth={2} />}
                  label="Combo Sets"
                  onPress={() => router.push('/(customer)/(tabs)/search?tab=combos')}
                />
                <QuickActionCard
                  icon={<Heart size={24} color={colors.primary} strokeWidth={2} />}
                  label="Favorites"
                  onPress={() => router.push('/(customer)/favorites')}
                />
                <QuickActionCard
                  icon={<Ticket size={24} color={colors.primary} strokeWidth={2} />}
                  label="Coupons"
                  onPress={() => router.push('/(customer)/cupon')}
                />
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ComboCard({ combo, onPress }: { combo: ComboSet; onPress: () => void }) {
  const savings = combo.originalPrice > combo.price ? combo.originalPrice - combo.price : 0;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={combo.name}
      style={({ pressed }) => [styles.comboCard, pressed && { opacity: 0.9 }]}
    >
      <Image source={{ uri: combo.image }} style={styles.comboImage} contentFit="cover" transition={200} />
      <View style={styles.comboInfo}>
        <Text style={styles.comboName} numberOfLines={1}>{combo.name}</Text>
        <Text style={styles.comboDesc} numberOfLines={2}>{combo.description}</Text>
        <View style={styles.comboPriceRow}>
          <Text style={styles.comboPrice}>{formatCurrency(combo.price)}</Text>
          {savings > 0 && (
            <Text style={styles.comboSavings}>Save {formatCurrency(savings)}</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

function QuickActionCard({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.quickAction, pressed && { opacity: 0.7 }]}
    >
      <View style={styles.quickActionIcon}>{icon}</View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  headerLeft: {},
  greeting: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  brandName: {
    ...typography.heading1,
    fontSize: 24,
    color: colors.primary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
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
  locationRow: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  content: {
    padding: spacing.lg,
  },
  section: {
    marginTop: spacing['2xl'],
  },
  comboCard: {
    width: 260,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    ...shadows.sm,
    overflow: 'hidden',
  },
  comboImage: {
    width: '100%',
    height: 140,
  },
  comboInfo: {
    padding: spacing.md,
  },
  comboName: {
    ...typography.heading3,
    fontSize: 15,
  },
  comboDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  comboPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  comboPrice: {
    ...typography.heading2,
    fontSize: 18,
    color: colors.primary,
    fontWeight: '700',
  },
  comboSavings: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing['2xl'],
  },
  quickAction: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryUltraLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  quickActionLabel: {
    ...typography.label,
    fontSize: 12,
    color: colors.textPrimary,
  },
});
