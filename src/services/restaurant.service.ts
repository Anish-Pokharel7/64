import { supabase } from '@api/supabase';
import { Restaurant, MenuSection, FoodCategory } from '@models/restaurant';

function mapRestaurant(data: Record<string, unknown>): Restaurant {
  return {
    id: data.id as string,
    name: data.name as string,
    description: data.description as string | undefined,
    image: (data.image as string) ?? '',
    rating: Number(data.rating) ?? 0,
    reviewCount: Number(data.review_count) ?? 0,
    deliveryTime: Number(data.delivery_time) ?? 0,
    deliveryFee: Number(data.delivery_fee) ?? 0,
    cuisine: (data.cuisine as string[]) ?? [],
    isOpen: data.is_open as boolean,
    address: data.address as string | undefined,
  };
}

export const restaurantService = {
  async getRestaurants(): Promise<Restaurant[]> {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapRestaurant);
  },

  async getRestaurantById(id: string): Promise<Restaurant | null> {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;
    return mapRestaurant(data);
  },

  async getPopularRestaurants(): Promise<Restaurant[]> {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('is_active', true)
      .eq('is_open', true)
      .order('rating', { ascending: false })
      .limit(5);

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapRestaurant);
  },

  async getNearbyRestaurants(): Promise<Restaurant[]> {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('is_active', true)
      .order('delivery_time', { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapRestaurant);
  },

  async getMenuSections(restaurantId: string): Promise<MenuSection[]> {
    const { data, error } = await supabase
      .from('foods')
      .select('id, menu_section')
      .eq('restaurant_id', restaurantId)
      .eq('is_active', true)
      .eq('is_available', true);

    if (error) throw new Error(error.message);

    const sectionsMap = new Map<string, string[]>();
    (data ?? []).forEach((f) => {
      const sectionName = (f.menu_section as string) ?? 'All Items';
      if (!sectionsMap.has(sectionName)) sectionsMap.set(sectionName, []);
      sectionsMap.get(sectionName)!.push(f.id as string);
    });

    return Array.from(sectionsMap.entries()).map(([name, foodIds], idx) => ({
      id: `s${idx}`,
      name,
      foodIds,
    }));
  },

  async searchRestaurants(query: string): Promise<Restaurant[]> {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('is_active', true)
      .ilike('name', `%${query}%`);

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapRestaurant);
  },

  async getCategories(): Promise<FoodCategory[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw new Error(error.message);

    const iconMap: Record<string, string> = {
      momo: 'CircleDot',
      pizza: 'Pizza',
      burger: 'Sandwich',
      biryani: 'BowlRice',
      chowmein: 'Noodles',
      thukpa: 'Soup',
      sekuwa: 'Flame',
      drinks: 'CupSoda',
      dessert: 'IceCream',
    };

    return (data ?? []).map((c) => ({
      id: c.slug as string,
      name: c.name as string,
      icon: iconMap[c.slug as string] ?? 'UtensilsCrossed',
      image: c.image as string | undefined,
    }));
  },
};
