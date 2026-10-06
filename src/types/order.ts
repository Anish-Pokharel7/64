export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type OrderItem = {
  id: string;
  foodId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  image: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  restaurantId: string;
  restaurantName: string;
  restaurantImage: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  deliveredAt?: string;
  address: string;
};
