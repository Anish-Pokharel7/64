import { supabase } from '@api/supabase';
import { ComboSet } from '@models/combo';

function asRecordArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value as Record<string, unknown>[] : [];
}

function mapCombo(data: Record<string, unknown>): ComboSet {
  const items = asRecordArray(data.combo_items);
  const options = asRecordArray(data.combo_options);
  return {
    id: data.id as string,
    name: data.name as string,
    description: data.description as string | undefined,
    image: (data.image as string) ?? '',
    price: Number(data.price),
    originalPrice: Number(data.original_price ?? data.price),
    items: items.map((item) => ({
      id: item.id as string,
      foodId: item.food_id as string,
      foodName: item.food_name as string,
      quantity: Number(item.quantity),
    })),
    options: options.map((option) => ({
      id: option.id as string,
      groupName: option.group_name as string,
      optionLabel: option.option_label as string,
      priceAdjustment: Number(option.price_adjustment),
    })),
  };
}

const comboSelection = '*, combo_items(*), combo_options(*)';

export const comboService = {
  async getComboSets(): Promise<ComboSet[]> {
    const { data, error } = await supabase
      .from('combo_sets')
      .select(comboSelection)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapCombo);
  },

  async getFeaturedCombos(): Promise<ComboSet[]> {
    const { data, error } = await supabase
      .from('combo_sets')
      .select(comboSelection)
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapCombo);
  },

  async getComboSet(id: string): Promise<ComboSet | null> {
    const { data, error } = await supabase
      .from('combo_sets')
      .select(comboSelection)
      .eq('id', id)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? mapCombo(data) : null;
  },

  async searchCombos(query: string): Promise<ComboSet[]> {
    const { data, error } = await supabase
      .from('combo_sets')
      .select(comboSelection)
      .eq('is_active', true)
      .ilike('name', `%${query}%`);

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapCombo);
  },
};
