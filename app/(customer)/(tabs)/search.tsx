import { View, StyleSheet, FlatList, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useMemo, useCallback } from 'react';
import { Image } from 'expo-image';
import { Package } from 'lucide-react-native';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing } from '@theme/spacing';
import { radius } from '@theme/radius';
import { shadows } from '@theme/shadows';
import { SearchBar } from '@components/common/SearchBar';
import { SectionHeader } from '@components/common/SectionHeader';
import { FoodCard } from '@components/home/FoodCard';
import { CategoryCard } from '@components/home/CategoryCard';
import { EmptyState } from '@components/ui/EmptyState';
import { Loading } from '@components/ui/Loading';
import { useSearchFoods, useFoods, useFoodsByCategory } from '@hooks/useFood';
import { useCategories } from '@hooks/useCategories';
import { useComboSets, useSearchCombos } from '@hooks/useCombo';
import { formatCurrency } from '@utils/currency';
import { ComboSet } from '@models/combo';

type TabKey = 'all' | 'foods' | 'combos';

export default function SearchScreen() {
  const params = useLocalSearchParams<{ category?: string; tab?: string }>();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(params.category ?? 'all');
  const [activeTab, setActiveTab] = useState<TabKey>((params.tab as TabKey) ?? 'all');

  const allFoods = useFoods();
  const allCombos = useComboSets();
  const searchFoods = useSearchFoods(query);
  const searchCombos = useSearchCombos(query);
  const categoriesQuery = useCategories();
  const categoryFoods = useFoodsByCategory(selectedCategory !== 'all' ? selectedCategory : undefined);

  const isSearching = query.length > 0;
  const categories = categoriesQuery.data ?? [];

  const foods = useMemo(() => {
    if (isSearching) return searchFoods.data ?? [];
    if (selectedCategory !== 'all') return categoryFoods.data ?? [];
    return allFoods.data ?? [];
  }, [isSearching, searchFoods.data, selectedCategory, categoryFoods.data, allFoods.data]);

  const combos = useMemo(() => {
    if (isSearching) return searchCombos.data ?? [];
    return allCombos.data ?? [];
  }, [isSearching, searchCombos.data, allCombos.data]);

  const isLoading = isSearching && (searchFoods.isLoading || searchCombos.isLoading);
  const showFoods = activeTab === 'all' || activeTab === 'foods';
  const showCombos = activeTab === 'all' || activeTab === 'combos';
  const hasResults = (showFoods && foods.length > 0) || (showCombos && combos.length > 0);

  const handleClear = useCallback(() => setQuery(''), []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.searchRow}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search for food, combos..."
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

      <View style={styles.tabBar}>
        {(['all', 'foods', 'combos'] as TabKey[]).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'all' ? 'All' : tab === 'foods' ? 'Food' : 'Combos'}
            </Text>
          </Pressable>
        ))}
      </View>

      {!isSearching && (
        <View style={styles.categoriesRow}>
          <FlatList
            data={[{ id: 'all', name: 'All', icon: 'UtensilsCrossed', slug: 'all' }, ...categories]}
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
                {showFoods && foods.length > 0 && (
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
                          onPress={() => router.push(`/(customer)/food/${item.id}`)}
                          onAdd={() => router.push(`/(customer)/food/${item.id}`)}
                        />
                      )}
                      ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
                      contentContainerStyle={{ paddingHorizontal: spacing.lg }}
                    />
                  </View>
                )}

                {showCombos && combos.length > 0 && (
                  <View style={styles.section}>
                    <SectionHeader title="Combo Sets" />
                    <View style={styles.comboList}>
                      {combos.map((combo) => (
                        <ComboListItem
                          key={combo.id}
                          combo={combo}
                          onPress={() => router.push(`/(customer)/combo/${combo.id}`)}
                        />
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

function ComboListItem({ combo, onPress }: { combo: ComboSet; onPress: () => void }) {
  const savings = combo.originalPrice > combo.price ? combo.originalPrice - combo.price : 0;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.comboListItem, pressed && { opacity: 0.9 }]}
    >
      <Image source={{ uri: combo.image }} style={styles.comboListImage} contentFit="cover" transition={200} />
      <View style={styles.comboListInfo}>
        <View style={styles.comboListHeader}>
          <Package size={16} color={colors.primary} strokeWidth={2} />
          <Text style={styles.comboListBadge}>Combo</Text>
        </View>
        <Text style={styles.comboListName} numberOfLines={1}>{combo.name}</Text>
        <Text style={styles.comboListDesc} numberOfLines={2}>{combo.description}</Text>
        <View style={styles.comboListPriceRow}>
          <Text style={styles.comboListPrice}>{formatCurrency(combo.price)}</Text>
          {savings > 0 && (
            <Text style={styles.comboListOriginal}>{formatCurrency(combo.originalPrice)}</Text>
          )}
        </View>
      </View>
    </Pressable>
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
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.white,
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
  comboList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  comboListItem: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  comboListImage: {
    width: 120,
    height: 120,
  },
  comboListInfo: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
  },
  comboListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  comboListBadge: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 11,
  },
  comboListName: {
    ...typography.heading3,
    fontSize: 16,
  },
  comboListDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  comboListPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  comboListPrice: {
    ...typography.heading2,
    fontSize: 18,
    color: colors.primary,
    fontWeight: '700',
  },
  comboListOriginal: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
});
