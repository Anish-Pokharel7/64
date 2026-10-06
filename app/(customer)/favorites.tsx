import { View, StyleSheet, FlatList, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, Heart, Star } from 'lucide-react-native';
import { Image } from 'expo-image';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing } from '@theme/spacing';
import { radius } from '@theme/radius';
import { shadows } from '@theme/shadows';
import { EmptyState } from '@components/ui/EmptyState';
import { Loading } from '@components/ui/Loading';
import { useFavorites } from '@hooks/useFavorites';
import { formatCurrency } from '@utils/currency';
import { Favorite } from '@models/food';

export default function FavoritesScreen() {
  const { data: favorites, isLoading } = useFavorites();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text style={styles.title}>Favorites</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <Loading message="Loading favorites..." />
      ) : !favorites || favorites.length === 0 ? (
        <EmptyState
          icon={<Heart size={48} color={colors.textMuted} strokeWidth={1.5} />}
          title="No favorites yet"
          message="Tap the heart icon on any food item to save it here."
          actionLabel="Browse Menu"
          onAction={() => router.replace('/(customer)/(tabs)')}
        />
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.lg }}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <FavoriteCard favorite={item} />}
        />
      )}
    </SafeAreaView>
  );
}

function FavoriteCard({ favorite }: { favorite: Favorite }) {
  const food = favorite.food;
  if (!food) return null;

  return (
    <Pressable
      onPress={() => router.push(`/(customer)/food/${food.id}`)}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
    >
      <Image source={{ uri: food.image }} style={styles.image} contentFit="cover" transition={200} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{food.name}</Text>
        <Text style={styles.category}>{food.category}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatCurrency(food.price)}</Text>
          {food.rating !== undefined && (
            <View style={styles.ratingRow}>
              <Star size={14} color={colors.star} fill={colors.star} strokeWidth={0} />
              <Text style={styles.rating}>{food.rating}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
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
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  image: { width: 100, height: 100 },
  info: { flex: 1, padding: spacing.md, justifyContent: 'center' },
  name: { ...typography.heading3, fontSize: 16 },
  category: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm },
  price: { ...typography.heading2, fontSize: 18, color: colors.primary, fontWeight: '700' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rating: { ...typography.caption, color: colors.textPrimary },
});
