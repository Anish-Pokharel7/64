import { View, StyleSheet, ScrollView, FlatList, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ShoppingCart, Bell } from 'lucide-react-native';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing } from '@theme/spacing';
import { LocationSelector } from '@components/common/LocationSelector';
import { SearchBar } from '@components/common/SearchBar';
import { SectionHeader } from '@components/common/SectionHeader';
import { PromoBanner } from '@components/home/PromoBanner';
import { CategoryCard } from '@components/home/CategoryCard';
import { RestaurantCard } from '@components/home/RestaurantCard';
import { FoodCard } from '@components/home/FoodCard';
import { Loading } from '@components/ui/Loading';
import { ErrorState } from '@components/ui/ErrorState';
import { useLocation } from '@hooks/useLocation';
import { useRestaurants, usePopularRestaurants, useNearbyRestaurants } from '@hooks/useRestaurants';
import { usePopularFoods } from '@hooks/useFood';
import { useCartStore } from '@store/cart.store';
import { useCategories } from '@hooks/useCategories';

const PROMO_IMAGE = 'https://images.pexels.com/photos/3926123/pexels-photo-3926123.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

const FALLBACK_CATEGORIES = [
  { id: 'all', name: 'All', icon: 'UtensilsCrossed' },
  { id: 'momo', name: 'Momo', icon: 'CircleDot' },
  { id: 'pizza', name: 'Pizza', icon: 'Pizza' },
  { id: 'burger', name: 'Burger', icon: 'Sandwich' },
  { id: 'biryani', name: 'Biryani', icon: 'BowlRice' },
  { id: 'chowmein', name: 'Chowmein', icon: 'Noodles' },
  { id: 'thukpa', name: 'Thukpa', icon: 'Soup' },
  { id: 'sekuwa', name: 'Sekuwa', icon: 'Flame' },
  { id: 'drinks', name: 'Drinks', icon: 'CupSoda' },
];

export default function HomeScreen() {
  const { currentLocation } = useLocation();
  const cartCount = useCartStore((s) => s.getItemCount());

  const popularRestaurants = usePopularRestaurants();
  const nearbyRestaurants = useNearbyRestaurants();
  const popularFoods = usePopularFoods();
  const categoriesQuery = useCategories();

  const categories = categoriesQuery.data ?? FALLBACK_CATEGORIES;

  const isLoading = popularRestaurants.isLoading || popularFoods.isLoading;
  const hasError = popularRestaurants.isError || popularFoods.isError;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing['3xl'] }}
      >
        <View style={styles.header}>
          <LocationSelector
            location={currentLocation}
            onPress={() => router.push('/(customer)/addresses')}
          />
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
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              style={[styles.iconButton, { marginLeft: spacing.sm }]}
            >
              <Bell size={24} color={colors.textPrimary} strokeWidth={2} />
            </Pressable>
          </View>
        </View>

        <View style={styles.content}>
          <SearchBar onPress={() => router.push('/(customer)/(tabs)/search')} />

          <PromoBanner
            title="Hungry?"
            subtitle="Your favorites are just a few taps away."
            image={PROMO_IMAGE}
            onPress={() => router.push('/(customer)/(tabs)/search')}
          />

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
                  onPress={() => router.push('/(customer)/(tabs)/search')}
                />
              )}
              ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
              contentContainerStyle={{ paddingVertical: spacing.xs }}
            />
          </View>

          {hasError ? (
            <ErrorState onRetry={() => popularRestaurants.refetch()} />
          ) : isLoading ? (
            <Loading message="Loading restaurants..." />
          ) : (
            <>
              <View style={styles.section}>
                <SectionHeader
                  title="Popular Restaurants"
                  actionLabel="See All"
                  onAction={() => router.push('/(customer)/(tabs)/search')}
                />
                <FlatList
                  data={popularRestaurants.data ?? []}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <RestaurantCard
                      restaurant={item}
                      horizontal
                      onPress={() => router.push(`/(customer)/restaurant/${item.id}`)}
                    />
                  )}
                  ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
                  contentContainerStyle={{ paddingBottom: spacing.xs }}
                />
              </View>

              <View style={styles.section}>
                <SectionHeader
                  title="Recommended Food"
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

              <View style={styles.section}>
                <SectionHeader title="Nearby Restaurants" />
                <View style={styles.verticalList}>
                  {(nearbyRestaurants.data ?? []).map((restaurant) => (
                    <View key={restaurant.id} style={{ marginBottom: spacing.md }}>
                      <RestaurantCard
                        restaurant={restaurant}
                        onPress={() => router.push(`/(customer)/restaurant/${restaurant.id}`)}
                      />
                    </View>
                  ))}
                </View>
              </View>
            </>
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
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
  content: {
    padding: spacing.lg,
  },
  section: {
    marginTop: spacing['2xl'],
  },
  verticalList: {
    gap: 0,
  },
});
