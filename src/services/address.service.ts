import { supabase } from '@api/supabase';
import { Address } from '@models/address';

function mapAddress(data: Record<string, unknown>): Address {
  return {
    id: data.id as string,
    label: data.label as string,
    fullName: data.full_name as string,
    phone: data.phone as string,
    address: data.address as string,
    city: data.city as string,
    area: data.area as string,
    landmark: data.landmark as string | undefined,
    latitude: data.latitude ? Number(data.latitude) : undefined,
    longitude: data.longitude ? Number(data.longitude) : undefined,
    isDefault: data.is_default as boolean,
  };
}

export const addressService = {
  async getAddresses(): Promise<Address[]> {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapAddress);
  },

  async addAddress(input: Omit<Address, 'id'>): Promise<Address> {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) throw new Error('Not authenticated');

    if (input.isDefault) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', session.session.user.id)
        .eq('is_default', true);
    }

    const { data, error } = await supabase
      .from('addresses')
      .insert({
        user_id: session.session.user.id,
        label: input.label,
        full_name: input.fullName,
        phone: input.phone,
        address: input.address,
        city: input.city,
        area: input.area,
        landmark: input.landmark ?? null,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        is_default: input.isDefault ?? false,
      })
      .select('*')
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('Failed to create address');
    return mapAddress(data);
  },

  async updateAddress(id: string, updates: Partial<Address>): Promise<Address | null> {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) throw new Error('Not authenticated');

    if (updates.isDefault) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', session.session.user.id)
        .eq('is_default', true);
    }

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.label !== undefined) updateData.label = updates.label;
    if (updates.fullName !== undefined) updateData.full_name = updates.fullName;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.address !== undefined) updateData.address = updates.address;
    if (updates.city !== undefined) updateData.city = updates.city;
    if (updates.area !== undefined) updateData.area = updates.area;
    if (updates.landmark !== undefined) updateData.landmark = updates.landmark;
    if (updates.latitude !== undefined) updateData.latitude = updates.latitude;
    if (updates.longitude !== undefined) updateData.longitude = updates.longitude;
    if (updates.isDefault !== undefined) updateData.is_default = updates.isDefault;

    const { data, error } = await supabase
      .from('addresses')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', session.session.user.id)
      .select('*')
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;
    return mapAddress(data);
  },

  async deleteAddress(id: string): Promise<void> {
    const { error } = await supabase.from('addresses').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};
