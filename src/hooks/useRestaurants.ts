import { useQuery } from '@tanstack/react-query';
import { restaurantService } from '@services/restaurant.service';

export function useRestaurants() {
  return useQuery({
    queryKey: ['restaurants'],
    queryFn: () => restaurantService.getRestaurants(),
  });
}

export function useRestaurant(id: string | undefined) {
  return useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => restaurantService.getRestaurantById(id!),
    enabled: !!id,
  });
}

export function usePopularRestaurants() {
  return useQuery({
    queryKey: ['restaurants', 'popular'],
    queryFn: () => restaurantService.getPopularRestaurants(),
  });
}

export function useNearbyRestaurants() {
  return useQuery({
    queryKey: ['restaurants', 'nearby'],
    queryFn: () => restaurantService.getNearbyRestaurants(),
  });
}

export function useMenuSections(restaurantId: string | undefined) {
  return useQuery({
    queryKey: ['menu-sections', restaurantId],
    queryFn: () => restaurantService.getMenuSections(restaurantId!),
    enabled: !!restaurantId,
  });
}

export function useSearchRestaurants(query: string) {
  return useQuery({
    queryKey: ['restaurants', 'search', query],
    queryFn: () => restaurantService.searchRestaurants(query),
    enabled: query.length > 0,
  });
}
