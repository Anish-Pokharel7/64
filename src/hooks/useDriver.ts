import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@api/supabase';
import { driverService } from '@services/driver.service';

export function useDriverAssignedOrders(driverId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!driverId) return;
    const channel = supabase
      .channel(`driver-orders-${driverId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `driver_id=eq.${driverId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['driver', 'assigned', driverId] });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'delivery_assignments', filter: `driver_id=eq.${driverId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['driver', 'assigned', driverId] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [driverId, queryClient]);

  return useQuery({
    queryKey: ['driver', 'assigned', driverId],
    queryFn: () => driverService.getAssignedOrders(driverId!),
    enabled: !!driverId,
  });
}

export function useDriverOrder(id: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`driver-order-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `id=eq.${id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['driver', 'order', id] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id, queryClient]);

  return useQuery({
    queryKey: ['driver', 'order', id],
    queryFn: () => driverService.getOrderById(id!),
    enabled: !!id,
  });
}

export function useDriverHistory(driverId: string | undefined) {
  return useQuery({
    queryKey: ['driver', 'history', driverId],
    queryFn: () => driverService.getDeliveryHistory(driverId!),
    enabled: !!driverId,
  });
}

export function useAcceptOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, driverId }: { orderId: string; driverId: string }) =>
      driverService.acceptOrder(orderId, driverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver'] });
    },
  });
}

export function usePickupOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, driverId }: { orderId: string; driverId: string }) =>
      driverService.pickupOrder(orderId, driverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver'] });
    },
  });
}

export function useStartDelivery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, driverId }: { orderId: string; driverId: string }) =>
      driverService.startDelivery(orderId, driverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver'] });
    },
  });
}

export function useVerifyOtp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, driverId, otpCode }: { orderId: string; driverId: string; otpCode: string }) =>
      driverService.verifyOtpAndDeliver(orderId, driverId, otpCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver'] });
    },
  });
}

export function useToggleOnlineStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ driverId, isOnline }: { driverId: string; isOnline: boolean }) =>
      driverService.toggleOnlineStatus(driverId, isOnline),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver', 'profile'] });
    },
  });
}

export function useDriverProfile(driverId: string | undefined) {
  return useQuery({
    queryKey: ['driver', 'profile', driverId],
    queryFn: () => driverService.getProfile(driverId!),
    enabled: !!driverId,
  });
}
