import { View, StyleSheet, ScrollView, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, ShoppingCart } from 'lucide-react-native';
import { useState, useMemo } from 'react';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing } from '@theme/spacing';
import { RestaurantHeader } from '@components/restaurant/RestaurantHeader';
import { FoodCard } from '@components/home/FoodCard';
import { Loading } from '@components/ui/Loading';
import { ErrorState } from '@components/ui/ErrorState';
import { useRestaurant, useMenuSections } from '@hooks/useRestaurants';
import { useFoodsByRestaurant } from '@hooks/useFood';
import { useCartStore } from '@store/cart.store';

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const restaurantQuery = useRestaurant(id);
  const foodsQuery = useFoodsByRestaurant(id);
  const menuSectionsQuery = useMenuSections(id);
  const cartCount = useCartStore((s) => s.getItemCount());
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const foodsData = foodsQuery.data;
  const foods = useMemo(() => foodsData ?? [], [foodsData]);

  const sections = useMemo(() => {
    if (menuSectionsQuery.data && menuSectionsQuery.data.length > 0) {
      return menuSectionsQuery.data;
    }
    const sectionsMap = new Map<string, string[]>();
    foods.forEach((f) => {
      const sectionName = f.menuSection ?? 'All Items';
      if (!sectionsMap.has(sectionName)) sectionsMap.set(sectionName, []);
      sectionsMap.get(sectionName)!.push(f.id);
    });
    return Array.from(sectionsMap.entries()).map(([name, foodIds], idx) => ({
      id: `s${idx}`,
      name,
      foodIds,
    }));
  }, [menuSectionsQuery.data, foods]);

  const activeSectionId = activeSection ?? sections[0]?.id ?? null;
  const activeSectionData = sections.find((s) => s.id === activeSectionId);
  const visibleFoods = activeSectionData
    ? foods.filter((f) => activeSectionData.foodIds.includes(f.id))
    : foods;

  const isLoading = restaurantQuery.isLoading || foodsQuery.isLoading;
  const hasError = restaurantQuery.isError || foodsQuery.isError;

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
        <Loading fullscreen message="Loading restaurant..." />
      </SafeAreaView>
    );
  }

  if (hasError || !restaurantQuery.data) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
        <ErrorState
          message="We couldn't load this restaurant."
          onRetry={() => {
            restaurantQuery.refetch();
            foodsQuery.refetch();
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.topBarButton}
        >
          <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <Pressable
          onPress={() => router.push('/(customer)/cart')}
          accessibilityRole="button"
          accessibilityLabel="Cart"
          style={styles.topBarButton}
        >
          <ShoppingCart size={24} color={colors.textPrimary} strokeWidth={2} />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing['3xl'] }}
      >
        <RestaurantHeader restaurant={restaurantQuery.data} />

        <View style={styles.menuContainer}>
          <View style={styles.sectionTabs}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {sections.map((section) => (
                <Pressable
                  key={section.id}
                  onPress={() => setActiveSection(section.id)}
                  style={({ pressed }) => [
                    styles.sectionTab,
                    activeSectionId === section.id && styles.sectionTabActive,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text
                    style={[
                      styles.sectionTabText,
                      activeSectionId === section.id && styles.sectionTabTextActive,
                    ]}
                  >
                    {section.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.foodList}>
            {visibleFoods.map((food) => (
              <View key={food.id} style={{ marginBottom: spacing.md }}>
                <FoodCard
                  food={food}
                  onPress={() => router.push(`/(customer)/food/${food.id}`)}
                  onAdd={() => router.push(`/(customer)/food/${food.id}`)}
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    zIndex: 10,
  },
  topBarButton: {
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
  menuContainer: {
    backgroundColor: colors.background,
    flex: 1,
  },
  sectionTabs: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs + 2,
    borderRadius: 20,
    marginHorizontal: spacing.xs,
  },
  sectionTabActive: {
    backgroundColor: colors.primary,
  },
  sectionTabText: {
    ...typography.label,
    color: colors.textSecondary,
    fontSize: 14,
  },
  sectionTabTextActive: {
    color: colors.white,
  },
  foodList: {
    padding: spacing.lg,
  },
});
