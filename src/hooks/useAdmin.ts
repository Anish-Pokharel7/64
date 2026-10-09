import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@api/supabase';
import { adminService } from '@services/admin.service';
import { OrderStatus } from '@models/order';

const ACTIVE_STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'DRIVER_ASSIGNED', 'DRIVER_ACCEPTED', 'PICKED_UP', 'OUT_FOR_DELIVERY'];

export function useAdminOrders(statusFilter?: OrderStatus) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('admin-orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
        queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return useQuery({
    queryKey: ['admin', 'orders', statusFilter ?? 'all'],
    queryFn: () => adminService.getAllOrders(statusFilter),
  });
}

export function useAdminActiveOrders() {
  return useQuery({
    queryKey: ['admin', 'orders', 'active'],
    queryFn: () => adminService.getOrdersByStatus(ACTIVE_STATUSES),
  });
}

export function useAdminOrder(id: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`admin-order-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `id=eq.${id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'order', id] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_status_history', filter: `order_id=eq.${id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'order', id] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id, queryClient]);

  return useQuery({
    queryKey: ['admin', 'order', id],
    queryFn: () => adminService.getOrderById(id!),
    enabled: !!id,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, status, note }: { orderId: string; status: OrderStatus; note?: string }) =>
      adminService.updateOrderStatus(orderId, status, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

export function useAssignDriver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, driverId, assignedBy }: { orderId: string; driverId: string; assignedBy: string }) =>
      adminService.assignDriver(orderId, driverId, assignedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'drivers'] });
    },
  });
}

export function useDrivers() {
  return useQuery({
    queryKey: ['admin', 'drivers'],
    queryFn: () => adminService.getDrivers(),
  });
}

export function useAvailableDrivers() {
  return useQuery({
    queryKey: ['admin', 'drivers', 'available'],
    queryFn: () => adminService.getAvailableDrivers(),
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminService.getDashboardStats(),
    refetchInterval: 30000,
  });
}
