import { supabase } from '@api/supabase';
import { Order, OrderStatus } from '@models/order';
import { User } from '@models/user';

function asRecords(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value as Record<string, unknown>[] : [];
}

function mapOrder(data: Record<string, unknown>): Order {
  const addressData = data.addresses as Record<string, unknown> | null;
  const driverData = data.drivers as Record<string, unknown> | null;
  const driverProfileData = data.driver_profiles as Record<string, unknown> | null;
  const items = asRecords(data.order_items);
  const statusHistory = asRecords(data.order_status_history);

  if (driverData && driverProfileData) {
    driverData.vehicle_type = driverProfileData.vehicle_type;
    driverData.vehicle_number = driverProfileData.vehicle_number;
    driverData.rating = driverProfileData.rating;
  }

  return {
    id: data.id as string,
    orderNumber: data.order_number as string,
    customerId: data.customer_id as string,
    driverId: data.driver_id as string | undefined,
    items: items.map((item) => ({
      id: item.id as string,
      productType: (item.product_type as 'FOOD' | 'COMBO') ?? 'FOOD',
      foodId: item.food_id as string | undefined,
      comboId: item.combo_id as string | undefined,
      name: item.name_snapshot as string,
      image: item.image_snapshot as string | undefined,
      quantity: Number(item.quantity),
      unitPrice: Number(item.price_snapshot),
      subtotal: Number(item.subtotal),
      specialInstructions: item.special_instructions as string | undefined,
    })),
    subtotal: Number(data.subtotal),
    deliveryFee: Number(data.delivery_fee),
    serviceFee: Number(data.service_fee ?? 0),
    tax: Number(data.tax ?? 0),
    discount: Number(data.discount ?? 0),
    total: Number(data.total),
    status: data.status as OrderStatus,
    paymentMethod: data.payment_method as Order['paymentMethod'],
    paymentStatus: data.payment_status as Order['paymentStatus'],
    couponCode: data.coupon_code as string | undefined,
    customerNote: data.customer_note as string | undefined,
    estimatedDeliveryMinutes: Number(data.estimated_delivery_minutes ?? 30),
    address: addressData
      ? {
          label: addressData.label as string,
          address: addressData.address as string,
          area: addressData.area as string,
          city: addressData.city as string,
          fullName: addressData.full_name as string,
          phone: addressData.phone as string,
        }
      : undefined,
    driver: driverData
      ? {
          id: driverData.id as string,
          name: (driverData.full_name as string) ?? '',
          phone: (driverData.phone as string) ?? '',
          vehicleType: (driverData.vehicle_type as string) ?? '',
          vehicleNumber: (driverData.vehicle_number as string) ?? '',
          rating: Number(driverData.rating ?? 0),
        }
      : undefined,
    statusHistory: statusHistory.map((h) => ({
      id: h.id as string,
      status: h.status as OrderStatus,
      note: h.note as string | undefined,
      createdAt: h.created_at as string,
    })),
    placedAt: data.placed_at as string,
    confirmedAt: data.confirmed_at as string | undefined,
    preparingAt: data.preparing_at as string | undefined,
    readyAt: data.ready_at as string | undefined,
    pickedUpAt: data.picked_up_at as string | undefined,
    deliveredAt: data.delivered_at as string | undefined,
    cancelledAt: data.cancelled_at as string | undefined,
    createdAt: data.created_at as string,
  };
}

const orderSelect = `
  *,
  addresses(*),
  drivers:users!orders_driver_id_fkey(id, full_name, phone),
  driver_profiles!orders_driver_id_fkey(vehicle_type, vehicle_number, rating),
  order_items(*),
  order_status_history(*)
`;

function mapDriver(data: Record<string, unknown>): User & {
  vehicleType: string;
  vehicleNumber: string;
  isOnline: boolean;
  totalDeliveries: number;
  rating: number;
} {
  return {
    id: data.id as string,
    fullName: data.full_name as string,
    email: data.email as string,
    phone: (data.phone as string) ?? '',
    avatar: data.avatar as string | undefined,
    role: 'DRIVER',
    status: (data.status as User['status']) ?? 'ACTIVE',
    isSuspended: (data.is_suspended as boolean) ?? false,
    createdAt: data.created_at as string,
    vehicleType: (data.vehicle_type as string) ?? 'BIKE',
    vehicleNumber: (data.vehicle_number as string) ?? '',
    isOnline: (data.is_online as boolean) ?? false,
    totalDeliveries: Number(data.total_deliveries ?? 0),
    rating: Number(data.rating ?? 5),
  };
}

export const adminService = {
  async getAllOrders(statusFilter?: OrderStatus): Promise<Order[]> {
    let query = supabase.from('orders').select(orderSelect);
    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapOrder);
  },

  async getOrdersByStatus(statuses: OrderStatus[]): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(orderSelect)
      .in('status', statuses)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapOrder);
  },

  async getOrderById(id: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select(orderSelect)
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapOrder(data) : null;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus, note?: string): Promise<void> {
    const timestampMap: Record<string, string> = {
      CONFIRMED: 'confirmed_at',
      PREPARING: 'preparing_at',
      READY_FOR_PICKUP: 'ready_at',
      PICKED_UP: 'picked_up_at',
      DELIVERED: 'delivered_at',
      CANCELLED: 'cancelled_at',
    };

    const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
    if (timestampMap[status]) {
      updates[timestampMap[status]] = new Date().toISOString();
    }

    const { error } = await supabase.from('orders').update(updates).eq('id', orderId);
    if (error) throw new Error(error.message);

    await supabase.from('order_status_history').insert({ order_id: orderId, status, note });
  },

  async assignDriver(orderId: string, driverId: string, assignedBy: string): Promise<void> {
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        driver_id: driverId,
        status: 'DRIVER_ASSIGNED',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);
    if (orderError) throw new Error(orderError.message);

    await supabase.from('order_status_history').insert({
      order_id: orderId,
      status: 'DRIVER_ASSIGNED',
    });

    await supabase.from('delivery_assignments').insert({
      order_id: orderId,
      driver_id: driverId,
      status: 'PENDING',
      assigned_by: assignedBy,
    });
  },

  async getDrivers(): Promise<(User & { vehicleType: string; vehicleNumber: string; isOnline: boolean; totalDeliveries: number; rating: number })[]> {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id, full_name, email, phone, avatar, role, status, is_suspended, created_at,
        driver_profiles(vehicle_type, vehicle_number, is_online, total_deliveries, rating)
      `)
      .eq('role', 'DRIVER')
      .order('full_name', { ascending: true });

    if (error) throw new Error(error.message);

    return (data ?? []).map((row) => {
      const profile = asRecords(row.driver_profiles)[0] ?? {};
      return mapDriver({
        ...row,
        vehicle_type: profile.vehicle_type,
        vehicle_number: profile.vehicle_number,
        is_online: profile.is_online,
        total_deliveries: profile.total_deliveries,
        rating: profile.rating,
      });
    });
  },

  async getAvailableDrivers(): Promise<(User & { vehicleType: string; vehicleNumber: string; isOnline: boolean; totalDeliveries: number; rating: number })[]> {
    const all = await this.getDrivers();
    return all.filter((d) => d.isOnline && !d.isSuspended);
  },

  async getDashboardStats(): Promise<{
    totalOrders: number;
    activeOrders: number;
    pendingOrders: number;
    revenue: number;
    totalDrivers: number;
    onlineDrivers: number;
  }> {
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    const { count: activeOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('status', ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'DRIVER_ASSIGNED', 'DRIVER_ACCEPTED', 'PICKED_UP', 'OUT_FOR_DELIVERY']);

    const { count: pendingOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PENDING');

    const { data: revenueData } = await supabase
      .from('orders')
      .select('total')
      .in('status', ['DELIVERED']);

    const revenue = (revenueData ?? []).reduce((sum, r) => sum + Number(r.total ?? 0), 0);

    const { count: totalDrivers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'DRIVER');

    const { count: onlineDrivers } = await supabase
      .from('driver_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_online', true);

    return {
      totalOrders: totalOrders ?? 0,
      activeOrders: activeOrders ?? 0,
      pendingOrders: pendingOrders ?? 0,
      revenue,
      totalDrivers: totalDrivers ?? 0,
      onlineDrivers: onlineDrivers ?? 0,
    };
  },
};
