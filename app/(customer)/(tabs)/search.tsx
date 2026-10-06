import { View, StyleSheet, FlatList, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState, useCallback } from 'react';
import { X, SlidersHorizontal } from 'lucide-react-native';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing } from '@theme/spacing';
import { SearchBar } from '@components/common/SearchBar';
import { SectionHeader } from '@components/common/SectionHeader';
import { RestaurantCard } from '@components/home/RestaurantCard';
import { FoodCard } from '@components/home/FoodCard';
import { EmptyState } from '@components/ui/EmptyState';
import { Loading } from '@components/ui/Loading';
import { useSearchRestaurants } from '@hooks/useRestaurants';
import { useSearchFoods } from '@hooks/useFood';
import { useRestaurants } from '@hooks/useRestaurants';
import { useFoods } from '@hooks/useFood';
import { mockCategories } from '@mock/categories';
import { CategoryCard } from '@components/home/CategoryCard';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const allRestaurants = useRestaurants();
  const allFoods = useFoods();
  const searchRestaurants = useSearchRestaurants(query);
  const searchFoods = useSearchFoods(query);

  const isSearching = query.length > 0;
  const isLoading = isSearching && (searchRestaurants.isLoading || searchFoods.isLoading);

  const restaurants = isSearching
    ? searchRestaurants.data ?? []
    : (allRestaurants.data ?? []).filter(
        (r) => selectedCategory === 'all' || r.categoryId === selectedCategory
      );

  const foods = isSearching
    ? searchFoods.data ?? []
    : (allFoods.data ?? []).filter(
        (f) => selectedCategory === 'all' || f.category === selectedCategory
      );

  const hasResults = restaurants.length > 0 || foods.length > 0;

  const handleClear = useCallback(() => setQuery(''), []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.searchRow}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search for food, restaurants..."
            showClear={isSearching}
            onClear={handleClear}
          />
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Close search"
            style={styles.closeButton}
          >
            <Text style={styles.closeText}>Cancel</Text>
          </Pressable>
        </View>
      </View>

      {!isSearching && (
        <View style={styles.categoriesRow}>
          <FlatList
            data={mockCategories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <CategoryCard
                name={item.name}
                iconName={item.icon}
                isActive={selectedCategory === item.id}
                onPress={() => setSelectedCategory(item.id)}
              />
            )}
            ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
            contentContainerStyle={{ paddingHorizontal: spacing.lg }}
          />
        </View>
      )}

      <FlatList
        data={[{ id: 'content' }]}
        renderItem={() => (
          <View style={{ paddingBottom: spacing['3xl'] }}>
            {isLoading ? (
              <Loading message="Searching..." />
            ) : !hasResults && isSearching ? (
              <EmptyState
                title="No results found"
                message={`We couldn't find anything for "${query}". Try a different search.`}
              />
            ) : !hasResults && !isSearching ? (
              <EmptyState
                title="Nothing here yet"
                message="Try selecting a different category or search for your favorite food."
              />
            ) : (
              <>
                {foods.length > 0 && (
                  <View style={styles.section}>
                    <SectionHeader title="Food Items" />
                    <FlatList
                      data={foods}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      keyExtractor={(item) => item.id}
                      renderItem={({ item }) => (
                        <FoodCard
                          food={item}
                          horizontal
                          showRestaurant
                          onPress={() => router.push(`/(customer)/food/${item.id}`)}
                          onAdd={() => router.push(`/(customer)/food/${item.id}`)}
                        />
                      )}
                      ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
                      contentContainerStyle={{ paddingHorizontal: spacing.lg }}
                    />
                  </View>
                )}

                {restaurants.length > 0 && (
                  <View style={styles.section}>
                    <SectionHeader title="Restaurants" />
                    <View style={styles.restaurantList}>
                      {restaurants.map((r) => (
                        <View key={r.id} style={{ marginBottom: spacing.md, paddingHorizontal: spacing.lg }}>
                          <RestaurantCard
                            restaurant={r}
                            onPress={() => router.push(`/(customer)/restaurant/${r.id}`)}
                          />
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </>
            )}
          </View>
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  closeButton: {
    padding: spacing.xs,
  },
  closeText: {
    ...typography.label,
    color: colors.primary,
  },
  categoriesRow: {
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  section: {
    marginTop: spacing['2xl'],
  },
  restaurantList: {},
});
