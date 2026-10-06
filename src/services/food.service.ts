import { supabase } from '@api/supabase';
import { Food } from '@models/food';

function mapFood(data: Record<string, unknown>): Food {
  return {
    id: data.id as string,
    name: data.name as string,
    description: data.description as string | undefined,
    price: Number(data.price) ?? 0,
    image: (data.image as string) ?? '',
    restaurantId: data.restaurant_id as string,
    restaurantName: data.restaurant_name as string | undefined,
    category: (data.category_slug as string) ?? (data.category as string) ?? '',
    isPopular: data.is_popular as boolean | undefined,
    isVegetarian: data.is_vegetarian as boolean | undefined,
    rating: data.rating ? Number(data.rating) : undefined,
    menuSection: data.menu_section as string | undefined,
  };
}

export const foodService = {
  async getFoods(): Promise<Food[]> {
    const { data, error } = await supabase
      .from('foods')
      .select('*, categories(slug)')
      .eq('is_active', true)
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map((f) =>
      mapFood({ ...f, category_slug: f.categories?.slug })
    );
  },

  async getFoodById(id: string): Promise<Food | null> {
    const { data, error } = await supabase
      .from('foods')
      .select('*, categories(slug), restaurants(name)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;
    return mapFood({
      ...data,
      category_slug: data.categories?.slug,
      restaurant_name: data.restaurants?.name,
    });
  },

  async getPopularFoods(): Promise<Food[]> {
    const { data, error } = await supabase
      .from('foods')
      .select('*, categories(slug), restaurants(name)')
      .eq('is_active', true)
      .eq('is_available', true)
      .eq('is_popular', true)
      .order('rating', { ascending: false })
      .limit(10);

    if (error) throw new Error(error.message);
    return (data ?? []).map((f) =>
      mapFood({
        ...f,
        category_slug: f.categories?.slug,
        restaurant_name: f.restaurants?.name,
      })
    );
  },

  async getFoodsByRestaurant(restaurantId: string): Promise<Food[]> {
    const { data, error } = await supabase
      .from('foods')
      .select('*, categories(slug), restaurants(name)')
      .eq('restaurant_id', restaurantId)
      .eq('is_active', true)
      .eq('is_available', true)
      .order('menu_section', { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []).map((f) =>
      mapFood({
        ...f,
        category_slug: f.categories?.slug,
        restaurant_name: f.restaurants?.name,
      })
    );
  },

  async searchFoods(query: string): Promise<Food[]> {
    const { data, error } = await supabase
      .from('foods')
      .select('*, categories(slug), restaurants(name)')
      .eq('is_active', true)
      .eq('is_available', true)
      .ilike('name', `%${query}%`);

    if (error) throw new Error(error.message);
    return (data ?? []).map((f) =>
      mapFood({
        ...f,
        category_slug: f.categories?.slug,
        restaurant_name: f.restaurants?.name,
      })
    );
  },

  async getFoodsByCategory(categorySlug: string): Promise<Food[]> {
    const { data: catData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .maybeSingle();

    if (!catData) return [];

    const { data, error } = await supabase
      .from('foods')
      .select('*, categories(slug), restaurants(name)')
      .eq('category_id', catData.id)
      .eq('is_active', true)
      .eq('is_available', true);

    if (error) throw new Error(error.message);
    return (data ?? []).map((f) =>
      mapFood({
        ...f,
        category_slug: f.categories?.slug,
        restaurant_name: f.restaurants?.name,
      })
    );
  },
};
