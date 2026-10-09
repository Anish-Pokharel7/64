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

export function useFeaturedFoods() {
  return useQuery({
    queryKey: ['foods', 'featured'],
    queryFn: () => foodService.getFeaturedFoods(),
  });
}

export function useSearchFoods(query: string) {
  return useQuery({
    queryKey: ['foods', 'search', query],
    queryFn: () => foodService.searchFoods(query),
    enabled: query.length > 0,
  });
}

export function useFoodsByCategory(categorySlug: string | undefined) {
  return useQuery({
    queryKey: ['foods', 'category', categorySlug],
    queryFn: () => foodService.getFoodsByCategory(categorySlug!),
    enabled: !!categorySlug,
  });
}

export function useCustomizationGroups(foodId: string | undefined) {
  return useQuery({
    queryKey: ['food', foodId, 'customization-groups'],
    queryFn: () => foodService.getCustomizationGroups(foodId!),
    enabled: !!foodId,
  });
}
