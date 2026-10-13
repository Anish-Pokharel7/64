import { supabase } from '@api/supabase';
import { Order, OrderStatus } from '@models/order';

function asRecords(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value as Record<string, unknown>[] : [];
}

function mapOrder(data: Record<string, unknown>): Order {
  const addressData = data.addresses as Record<string, unknown> | null;
  const items = asRecords(data.order_items);
  const statusHistory = asRecords(data.order_status_history);

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
  order_items(*),
  order_status_history(*)
`;

function throwIfError(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

async function updateAssignedOrder(
  orderId: string,
  driverId: string,
  expectedStatus: OrderStatus | OrderStatus[],
  updates: Record<string, unknown>,
): Promise<void> {
  let query = supabase
    .from('orders')
    .update(updates)
    .eq('id', orderId)
    .eq('driver_id', driverId);

  query = Array.isArray(expectedStatus)
    ? query.in('status', expectedStatus)
    : query.eq('status', expectedStatus);

  const { data, error } = await query.select('id').maybeSingle();
  throwIfError(error);
  if (!data) throw new Error('This order is no longer available for this action.');
}

async function addStatusHistory(orderId: string, status: OrderStatus): Promise<void> {
  const { error } = await supabase
    .from('order_status_history')
    .insert({ order_id: orderId, status });
  throwIfError(error);
}

export const driverService = {
  async getAssignedOrders(driverId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(orderSelect)
      .eq('driver_id', driverId)
      .in('status', ['DRIVER_ASSIGNED', 'DRIVER_ACCEPTED', 'PICKED_UP', 'OUT_FOR_DELIVERY'])
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapOrder);
  },

  async getOrderById(id: string, driverId: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select(orderSelect)
      .eq('id', id)
      .eq('driver_id', driverId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapOrder(data) : null;
  },

  async getDeliveryHistory(driverId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(orderSelect)
      .eq('driver_id', driverId)
      .in('status', ['DELIVERED', 'CANCELLED'])
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapOrder);
  },

  async acceptOrder(orderId: string, driverId: string): Promise<void> {
    const now = new Date().toISOString();
    await updateAssignedOrder(orderId, driverId, 'DRIVER_ASSIGNED', {
      status: 'DRIVER_ACCEPTED',
      updated_at: now,
    });
    await addStatusHistory(orderId, 'DRIVER_ACCEPTED');

    const { data: assignment, error } = await supabase.from('delivery_assignments')
      .update({ status: 'ACCEPTED', accepted_at: new Date().toISOString() })
      .eq('order_id', orderId)
      .eq('driver_id', driverId)
      .select('id')
      .maybeSingle();
    throwIfError(error);
    if (!assignment) throw new Error('Delivery assignment not found.');
  },

  async pickupOrder(orderId: string, driverId: string): Promise<void> {
    const now = new Date().toISOString();
    await updateAssignedOrder(orderId, driverId, 'DRIVER_ACCEPTED', {
      status: 'PICKED_UP',
      picked_up_at: now,
      updated_at: now,
    });
    await addStatusHistory(orderId, 'PICKED_UP');
  },

  async startDelivery(orderId: string, driverId: string): Promise<void> {
    await updateAssignedOrder(orderId, driverId, 'PICKED_UP', {
      status: 'OUT_FOR_DELIVERY',
      updated_at: new Date().toISOString(),
    });
    await addStatusHistory(orderId, 'OUT_FOR_DELIVERY');
  },

  async verifyOtpAndDeliver(orderId: string, driverId: string, otpCode: string): Promise<{ success: boolean; message: string }> {
    const { data: order, error: orderReadError } = await supabase
      .from('orders')
      .select('id, status, payment_method, total')
      .eq('id', orderId)
      .eq('driver_id', driverId)
      .in('status', ['PICKED_UP', 'OUT_FOR_DELIVERY'])
      .maybeSingle();

    throwIfError(orderReadError);
    if (!order) {
      return { success: false, message: 'This order is not assigned to you or is not ready for delivery.' };
    }

    const { data: otp, error: otpError } = await supabase
      .from('delivery_otps')
      .select('id, otp_code, is_verified, attempts, max_attempts, expires_at')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpError) throw new Error(otpError.message);
    if (!otp) return { success: false, message: 'No OTP found for this order. Please contact support.' };
    if (otp.is_verified) return { success: false, message: 'This OTP has already been used.' };
    if (otp.attempts >= otp.max_attempts) {
      return { success: false, message: 'Maximum attempts reached. Please contact support.' };
    }
    if (new Date(otp.expires_at) < new Date()) {
      return { success: false, message: 'This OTP has expired. Please request a new one.' };
    }

    if (otp.otp_code !== otpCode) {
      const { data: updatedOtp, error } = await supabase
        .from('delivery_otps')
        .update({ attempts: otp.attempts + 1 })
        .eq('id', otp.id)
        .eq('attempts', otp.attempts)
        .eq('is_verified', false)
        .select('id')
        .maybeSingle();
      throwIfError(error);
      if (!updatedOtp) {
        return { success: false, message: 'OTP changed while verifying. Please try again.' };
      }
      const remaining = otp.max_attempts - (otp.attempts + 1);
      return {
        success: false,
        message: `Invalid OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
      };
    }

    const now = new Date().toISOString();
    await updateAssignedOrder(orderId, driverId, order.status as OrderStatus, {
      status: 'DELIVERED',
      delivered_at: now,
      updated_at: now,
    });

    const { data: verifiedOtp, error: verifyError } = await supabase
      .from('delivery_otps')
      .update({ is_verified: true, verified_at: now })
      .eq('id', otp.id)
      .eq('is_verified', false)
      .select('id')
      .maybeSingle();
    throwIfError(verifyError);
    if (!verifiedOtp) throw new Error('The OTP was already used. Please refresh this delivery.');

    await addStatusHistory(orderId, 'DELIVERED');

    if (order?.payment_method === 'COD') {
      const { error } = await supabase.from('cod_collections').insert({
        order_id: orderId,
        driver_id: driverId,
        expected_amount: Number(order.total),
        collected_amount: Number(order.total),
        collected_at: now,
      });
      throwIfError(error);

      const { data: payment, error: paymentError } = await supabase.from('payments')
        .update({ status: 'CASH_COLLECTED' })
        .eq('order_id', orderId)
        .select('id')
        .maybeSingle();
      throwIfError(paymentError);
      if (!payment) throw new Error('Payment record not found for this order.');
    } else {
      const { data: payment, error } = await supabase.from('payments')
        .update({ status: 'PAID' })
        .eq('order_id', orderId)
        .select('id')
        .maybeSingle();
      throwIfError(error);
      if (!payment) throw new Error('Payment record not found for this order.');
    }

    const { error: deliveryRecordError } = await supabase.rpc(
      'record_driver_delivery',
      { p_order_id: orderId },
    );
    throwIfError(deliveryRecordError);

    return { success: true, message: 'Order delivered successfully!' };
  },

  async toggleOnlineStatus(driverId: string, isOnline: boolean): Promise<void> {
    const { data, error } = await supabase
      .from('driver_profiles')
      .update({
        is_online: isOnline,
        status: isOnline ? 'ONLINE' : 'OFFLINE',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', driverId)
      .select('user_id')
      .maybeSingle();
    throwIfError(error);
    if (!data) throw new Error('Driver profile not found.');
  },

  async getProfile(driverId: string): Promise<{
    vehicleType: string;
    vehicleNumber: string;
    isOnline: boolean;
    rating: number;
    totalDeliveries: number;
    totalEarnings: number;
    codCollectedToday: number;
  } | null> {
    const { data, error } = await supabase
      .from('driver_profiles')
      .select('vehicle_type, vehicle_number, is_online, rating, total_deliveries, total_earnings, cod_collected_today')
      .eq('user_id', driverId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return {
      vehicleType: data.vehicle_type as string,
      vehicleNumber: data.vehicle_number as string,
      isOnline: data.is_online as boolean,
      rating: Number(data.rating ?? 5),
      totalDeliveries: Number(data.total_deliveries ?? 0),
      totalEarnings: Number(data.total_earnings ?? 0),
      codCollectedToday: Number(data.cod_collected_today ?? 0),
    };
  },
};
