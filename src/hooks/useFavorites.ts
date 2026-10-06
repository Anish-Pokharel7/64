import { useQuery } from '@tanstack/react-query';
import { favoriteService } from '@services/favorite.service';

export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoriteService.getFavorites(),
  });
}
