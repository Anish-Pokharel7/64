import { useQuery } from '@tanstack/react-query';
import { deliveryService } from '@services/delivery.service';

export function useDeliveryZones() {
  return useQuery({
    queryKey: ['delivery-zones'],
    queryFn: () => deliveryService.getDeliveryZones(),
  });
}
