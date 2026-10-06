import { useQuery } from '@tanstack/react-query';
import { foodService } from '@services/food.service';

export function useFoods() {
  return useQuery({
    queryKey: ['foods'],
    queryFn: () => foodService.getFoods(),
  });
}

export function useFood(id: string | undefined) {
  return useQuery({
    queryKey: ['food', id],
    queryFn: () => foodService.getFoodById(id!),
    enabled: !!id,
  });
}

export function usePopularFoods() {
  return useQuery({
    queryKey: ['foods', 'popular'],
    queryFn: () => foodService.getPopularFoods(),
  });
}

export function useFoodsByRestaurant(restaurantId: string | undefined) {
  return useQuery({
    queryKey: ['foods', 'restaurant', restaurantId],
    queryFn: () => foodService.getFoodsByRestaurant(restaurantId!),
    enabled: !!restaurantId,
  });
}

export function useSearchFoods(query: string) {
  return useQuery({
    queryKey: ['foods', 'search', query],
    queryFn: () => foodService.searchFoods(query),
    enabled: query.length > 0,
  });
}
