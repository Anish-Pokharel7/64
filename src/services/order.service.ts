import { supabase } from '@api/supabase';
import { Order, OrderStatus, PaymentMethod, PaymentStatus } from '@models/order';
import { CartItem } from '@models/cart';

export type CreateOrderInput = {
  customerId: string;
  addressId: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  customerNote?: string;
  estimatedDeliveryMinutes: number;
};

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
    items: items.map((item) => {
      const customizations = asRecords(item.order_item_customizations);
      const comboSelections = asRecords(item.order_item_combo_selections);
      return {
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
        customizations: customizations.map((c) => ({
          groupName: c.group_name as string,
          optionName: c.option_name as string,
          priceAdjustment: Number(c.price_adjustment),
        })),
        comboSelections: comboSelections.map((c) => ({
          groupName: c.group_name as string,
          selectedItem: c.selected_item as string,
          priceAdjustment: Number(c.price_adjustment),
        })),
      };
    }),
    subtotal: Number(data.subtotal),
    deliveryFee: Number(data.delivery_fee),
    serviceFee: Number(data.service_fee ?? 0),
    tax: Number(data.tax ?? 0),
    discount: Number(data.discount ?? 0),
    total: Number(data.total),
    status: data.status as OrderStatus,
    paymentMethod: data.payment_method as PaymentMethod,
    paymentStatus: data.payment_status as PaymentStatus,
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
  order_items(
    *,
    order_item_customizations(*),
    order_item_combo_selections(*)
  ),
  order_status_history(*)
`;

export const orderService = {
  async getOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(orderSelect)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapOrder);
  },

  async getActiveOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(orderSelect)
      .in('status', ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'DRIVER_ASSIGNED', 'DRIVER_ACCEPTED', 'PICKED_UP', 'OUT_FOR_DELIVERY'])
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapOrder);
  },

  async getPastOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(orderSelect)
      .in('status', ['DELIVERED', 'CANCELLED', 'REFUNDED'])
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

  async createOrder(input: CreateOrderInput): Promise<Order> {
    const orderNumber = `64D-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_id: input.customerId,
        address_id: input.addressId,
        status: 'PENDING',
        subtotal: input.subtotal,
        delivery_fee: input.deliveryFee,
        service_fee: input.serviceFee,
        tax: input.tax,
        discount: input.discount,
        total: input.total,
        payment_method: input.paymentMethod,
        payment_status: 'PENDING',
        coupon_code: input.couponCode ?? null,
        customer_note: input.customerNote ?? null,
        estimated_delivery_minutes: input.estimatedDeliveryMinutes,
      })
      .select('*')
      .single();

    if (orderError) throw new Error(orderError.message);

    const orderItems = input.items.map((item) => ({
      order_id: orderData.id,
      product_type: item.productType === 'food' ? 'FOOD' : 'COMBO',
      food_id: item.food?.id ?? null,
      combo_id: item.combo?.id ?? null,
      name_snapshot: item.food?.name ?? item.combo?.name ?? '',
      image_snapshot: item.food?.image ?? item.combo?.image ?? null,
      price_snapshot: item.unitPrice,
      quantity: item.quantity,
      subtotal: item.unitPrice * item.quantity,
      special_instructions: item.specialInstructions ?? null,
    }));

    const { data: insertedItems, error: itemError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select('id');

    if (itemError) throw new Error(itemError.message);

    const customizationInserts: Record<string, unknown>[] = [];
    const comboSelectionInserts: Record<string, unknown>[] = [];

    insertedItems.forEach((insertedItem, index) => {
      const cartItem = input.items[index];
      cartItem.customizations?.forEach((c) => {
        customizationInserts.push({
          order_item_id: insertedItem.id,
          group_name: c.groupName,
          option_name: c.optionName,
          price_adjustment: c.priceAdjustment,
        });
      });
      cartItem.comboOptions?.forEach((o) => {
        comboSelectionInserts.push({
          order_item_id: insertedItem.id,
          group_name: o.groupName,
          selected_item: o.optionLabel,
          price_adjustment: o.priceAdjustment,
        });
      });
    });

    if (customizationInserts.length > 0) {
      await supabase.from('order_item_customizations').insert(customizationInserts);
    }
    if (comboSelectionInserts.length > 0) {
      await supabase.from('order_item_combo_selections').insert(comboSelectionInserts);
    }

    await supabase.from('order_status_history').insert({
      order_id: orderData.id,
      status: 'PENDING',
    });

    await supabase.from('payments').insert({
      order_id: orderData.id,
      amount: input.total,
      method: input.paymentMethod,
      status: 'PENDING',
    });

    const { data: fullOrder } = await supabase
      .from('orders')
      .select(orderSelect)
      .eq('id', orderData.id)
      .maybeSingle();

    return fullOrder ? mapOrder(fullOrder) : mapOrder({ ...orderData, order_items: [] });
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

    const updates: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (timestampMap[status]) {
      updates[timestampMap[status]] = new Date().toISOString();
    }

    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId);

    if (error) throw new Error(error.message);

    await supabase.from('order_status_history').insert({
      order_id: orderId,
      status,
      note,
    });
  },
};
