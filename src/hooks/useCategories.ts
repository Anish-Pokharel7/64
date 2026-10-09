import { useQuery } from '@tanstack/react-query';
import { foodService } from '@services/food.service';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => foodService.getCategories(),
  });
}
