import { useQuery } from '@tanstack/react-query';
import { restaurantService } from '@services/restaurant.service';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => restaurantService.getCategories(),
  });
}
