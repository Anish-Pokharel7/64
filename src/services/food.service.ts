import { supabase } from '@api/supabase';
import { Food } from '@models/food';

function mapFood(data: Record<string, unknown>): Food {
  return {
    id: data.id as string,
    name: data.name as string,
    description: data.description as string | undefined,
    price: Number(data.price ?? 0),
    image: (data.image as string) ?? '',
    category: (data.category_slug as string) ?? (data.category as string) ?? '',
    isPopular: data.is_popular as boolean | undefined,
    isVegetarian: data.is_vegetarian as boolean | undefined,
    rating: data.rating ? Number(data.rating) : undefined,
    menuSection: data.menu_section as string | undefined,
    prepTimeMinutes: data.prep_time_minutes == null ? undefined : Number(data.prep_time_minutes),
  };
}

function asRecords(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value as Record<string, unknown>[] : [];
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
      .select('*, categories(slug)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;
    return mapFood({
      ...data,
      category_slug: data.categories?.slug,
    });
  },

  async getPopularFoods(): Promise<Food[]> {
    const { data, error } = await supabase
      .from('foods')
      .select('*, categories(slug)')
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
      })
    );
  },

  async getFeaturedFoods(): Promise<Food[]> {
    const { data, error } = await supabase
      .from('foods')
      .select('*, categories(slug)')
      .eq('is_active', true)
      .eq('is_available', true)
      .order('rating', { ascending: false })
      .limit(10);

    if (error) throw new Error(error.message);
    return (data ?? []).map((f) =>
      mapFood({
        ...f,
        category_slug: f.categories?.slug,
      })
    );
  },

  async searchFoods(query: string): Promise<Food[]> {
    const { data, error } = await supabase
      .from('foods')
      .select('*, categories(slug)')
      .eq('is_active', true)
      .eq('is_available', true)
      .ilike('name', `%${query}%`);

    if (error) throw new Error(error.message);
    return (data ?? []).map((f) =>
      mapFood({
        ...f,
        category_slug: f.categories?.slug,
      })
    );
  },

  async getFoodsByCategory(categorySlug: string): Promise<Food[]> {
    const { data: catData, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .maybeSingle();

    if (categoryError) throw new Error(categoryError.message);
    if (!catData) return [];

    const { data, error } = await supabase
      .from('foods')
      .select('*, categories(slug)')
      .eq('category_id', catData.id)
      .eq('is_active', true)
      .eq('is_available', true);

    if (error) throw new Error(error.message);
    return (data ?? []).map((f) =>
      mapFood({
        ...f,
        category_slug: f.categories?.slug,
      })
    );
  },

  async getCustomizationGroups(foodId: string): Promise<import('@models/food').CustomizationGroup[]> {
    const { data, error } = await supabase
      .from('food_customization_groups')
      .select('*, food_customization_options(*)')
      .eq('food_id', foodId)
      .order('created_at');

    if (error) throw new Error(error.message);
    return (data ?? []).map((group: Record<string, unknown>) => {
      const options = asRecords(group.food_customization_options);
      return {
        id: group.id as string,
        name: group.name as string,
        isRequired: group.is_required as boolean,
        minSelections: Number(group.min_selections),
        maxSelections: Number(group.max_selections),
        options: options.map((option) => ({
          id: option.id as string,
          name: option.name as string,
          priceAdjustment: Number(option.price_adjustment),
        })),
      };
    });
  },

  async getCategories(): Promise<{ id: string; name: string; slug: string; image?: string; icon?: string }[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, image, icon')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []).map((c) => ({
      id: c.id as string,
      name: c.name as string,
      slug: c.slug as string,
      image: (c.image as string) ?? undefined,
      icon: (c.icon as string) ?? undefined,
    }));
  },
};
