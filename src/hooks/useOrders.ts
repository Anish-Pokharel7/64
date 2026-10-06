import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreateOrderInput, orderService } from '@services/order.service';

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

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOrderInput) => orderService.createOrder(input),
    onSuccess: (order) => {
      queryClient.setQueryData(['order', order.id], order);
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
