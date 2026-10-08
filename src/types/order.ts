export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'driver_assigned'
  | 'picked_up'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'cod' | 'khalti' | 'esewa';

export type OrderAddress = {
  label: string;
  address: string;
  area: string;
  fullName: string;
  phone: string;
};

export type OrderDriver = {
  name: string;
  vehicleType: string;
  vehicleNumber: string;
};

export type OrderItem = {
  id: string;
  foodId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  image: string;
  subtotal?: number;
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
  address: string | OrderAddress;
  customerId?: string;
  paymentMethod?: PaymentMethod;
  driver?: OrderDriver;
  serviceFee?: number;
  tax?: number;
};
