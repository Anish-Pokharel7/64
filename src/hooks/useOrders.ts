import { useQuery } from '@tanstack/react-query';
import { orderService } from '@services/order.service';

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => orderService.getOrders(),
  });
}

export function useActiveOrders() {
  return useQuery({
    queryKey: ['orders', 'active'],
    queryFn: () => orderService.getActiveOrders(),
  });
}

export function usePastOrders() {
  return useQuery({
    queryKey: ['orders', 'past'],
    queryFn: () => orderService.getPastOrders(),
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrderById(id!),
    enabled: !!id,
  });
}
