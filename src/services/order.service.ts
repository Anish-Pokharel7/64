import { Order, PaymentMethod } from '@models/order';
import { CartItem } from '@models/cart';
import { mockOrders } from '@mock/orders';
import { supabase } from '@api/supabase';

const MOCK_DELAY = 600;

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

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mapOrder(data: Record<string, unknown>): Order {
  const addressData = data.addresses as Record<string, unknown> | null;
  const restaurantData = data.restaurants as Record<string, unknown> | null;
  const items = Array.isArray(data.order_items) ? data.order_items as Record<string, unknown>[] : [];

  return {
    id: data.id as string,
    orderNumber: (data.order_number as string) ?? '',
    restaurantId: (data.restaurant_id as string) ?? '',
    restaurantName: (restaurantData?.name as string) ?? '',
    restaurantImage: (restaurantData?.image as string) ?? '',
    items: items.map((item) => ({
      id: item.id as string,
      foodId: (item.food_id as string) ?? (item.combo_id as string) ?? '',
      name: (item.product_name as string) ?? (item.name as string) ?? '',
      quantity: Number(item.quantity),
      unitPrice: Number(item.unit_price),
      image: (item.image as string) ?? '',
      subtotal: Number(item.subtotal ?? Number(item.unit_price) * Number(item.quantity)),
    })),
    subtotal: Number(data.subtotal),
    deliveryFee: Number(data.delivery_fee),
    serviceFee: Number(data.service_fee ?? 0),
    tax: Number(data.tax ?? 0),
    discount: Number(data.discount ?? 0),
    total: Number(data.total),
    status: data.status as Order['status'],
    createdAt: data.created_at as string,
    deliveredAt: data.delivered_at as string | undefined,
    customerId: data.customer_id as string | undefined,
    paymentMethod: data.payment_method as PaymentMethod | undefined,
    address: addressData
      ? {
          label: addressData.label as string,
          address: addressData.address as string,
          area: addressData.area as string,
          fullName: addressData.full_name as string,
          phone: addressData.phone as string,
        }
      : (data.address as string) ?? '',
  };
}

export const orderService = {
  async getOrders(): Promise<Order[]> {
    await delay(MOCK_DELAY);
    return mockOrders;
  },

  async getActiveOrders(): Promise<Order[]> {
    await delay(MOCK_DELAY);
    return mockOrders.filter(
      (o) => o.status !== 'delivered' && o.status !== 'cancelled'
    );
  },

  async getPastOrders(): Promise<Order[]> {
    await delay(MOCK_DELAY);
    return mockOrders.filter(
      (o) => o.status === 'delivered' || o.status === 'cancelled'
    );
  },

  async getOrderById(id: string): Promise<Order | null> {
    await delay(MOCK_DELAY);
    const mockOrder = mockOrders.find((order) => order.id === id);
    if (mockOrder) return mockOrder;

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*), addresses(*), restaurants(name, image)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? mapOrder(data) : null;
  },

  async createOrder(input: CreateOrderInput): Promise<Order> {
    const firstFood = input.items.find((item) => item.productType === 'food')?.food;
    const { data, error } = await supabase
      .from('orders')
      .insert({
        customer_id: input.customerId,
        address_id: input.addressId,
        restaurant_id: firstFood?.restaurantId ?? null,
        order_number: `64D-${Date.now()}`,
        status: 'pending',
        subtotal: input.subtotal,
        delivery_fee: input.deliveryFee,
        service_fee: input.serviceFee,
        tax: input.tax,
        discount: input.discount,
        total: input.total,
        payment_method: input.paymentMethod,
        coupon_code: input.couponCode ?? null,
        customer_note: input.customerNote ?? null,
        estimated_delivery_minutes: input.estimatedDeliveryMinutes,
      })
      .select('*')
      .single();

    if (error) throw new Error(error.message);

    const { error: itemError } = await supabase.from('order_items').insert(
      input.items.map((item) => ({
        order_id: data.id,
        product_type: item.productType,
        food_id: item.food?.id ?? null,
        combo_id: item.combo?.id ?? null,
        product_name: item.food?.name ?? item.combo?.name ?? '',
        quantity: item.quantity,
        unit_price: item.unitPrice,
        subtotal: item.unitPrice * item.quantity,
        image: item.food?.image ?? item.combo?.image ?? '',
        customizations: item.customizations ?? [],
        combo_options: item.comboOptions ?? [],
        special_instructions: item.specialInstructions ?? null,
      }))
    );

    if (itemError) throw new Error(itemError.message);
    return mapOrder({
      ...data,
      order_items: input.items.map((item) => ({
        id: item.id,
        food_id: item.food?.id,
        combo_id: item.combo?.id,
        product_name: item.food?.name ?? item.combo?.name ?? '',
        quantity: item.quantity,
        unit_price: item.unitPrice,
        subtotal: item.unitPrice * item.quantity,
        image: item.food?.image ?? item.combo?.image ?? '',
      })),
    });
  },
};
