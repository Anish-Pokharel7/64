import { supabase } from '@api/supabase';
import { DeliveryZone } from '@models/delivery';

export const deliveryService = {
  async getDeliveryZones(): Promise<DeliveryZone[]> {
    const { data, error } = await supabase
      .from('delivery_zones')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw new Error(error.message);
    return (data ?? []).map((zone) => ({
      id: zone.id,
      name: zone.name,
      area: zone.area,
      deliveryFee: Number(zone.delivery_fee),
      estimatedDeliveryMinutes: Number(zone.estimated_delivery_minutes),
    }));
  },
};
