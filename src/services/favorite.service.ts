import { supabase } from '@api/supabase';
import { Favorite, Food } from '@models/food';

function mapFood(data: Record<string, unknown>): Food {
  return {
    id: data.id as string,
    name: data.name as string,
    description: data.description as string | undefined,
    price: Number(data.price),
    image: (data.image as string) ?? '',
    category: (data.category as string) ?? '',
    isPopular: data.is_popular as boolean | undefined,
    isVegetarian: data.is_vegetarian as boolean | undefined,
    rating: data.rating == null ? undefined : Number(data.rating),
  };
}

export const favoriteService = {
  async getFavorites(): Promise<Favorite[]> {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) throw new Error(authError.message);
    if (!authData.user) return [];

    const { data, error } = await supabase
      .from('favorites')
      .select('id, food:foods(*)')
      .eq('user_id', authData.user.id)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map((favorite) => {
      const foodData: unknown = Array.isArray(favorite.food) ? favorite.food[0] : favorite.food;
      const food = typeof foodData === 'object' && foodData !== null
        ? foodData as Record<string, unknown>
        : null;
      return { id: favorite.id, food: food ? mapFood(food) : null };
    });
  },
};
