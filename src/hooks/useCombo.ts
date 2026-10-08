import { useQuery } from '@tanstack/react-query';
import { comboService } from '@services/combo.service';

export function useComboSets() {
  return useQuery({
    queryKey: ['combos'],
    queryFn: () => comboService.getComboSets(),
  });
}

export function useFeaturedCombos() {
  return useQuery({
    queryKey: ['combos', 'featured'],
    queryFn: () => comboService.getFeaturedCombos(),
  });
}

export function useComboSet(id: string | undefined) {
  return useQuery({
    queryKey: ['combo', id],
    queryFn: () => comboService.getComboSet(id!),
    enabled: !!id,
  });
}

export function useSearchCombos(query: string) {
  return useQuery({
    queryKey: ['combos', 'search', query],
    queryFn: () => comboService.searchCombos(query),
    enabled: query.length > 0,
  });
}
