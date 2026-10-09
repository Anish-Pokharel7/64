export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'DRIVER_ASSIGNED'
  | 'DRIVER_ACCEPTED'
  | 'PICKED_UP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUND_REQUESTED'
  | 'REFUNDED';

export type PaymentMethod = 'COD' | 'KHALTI' | 'ESEWA';

export type PaymentStatus = 'PENDING' | 'PAID' | 'CASH_COLLECTED' | 'REFUNDED' | 'FAILED';

export type OrderAddress = {
  label: string;
  address: string;
  area: string;
  city?: string;
  fullName: string;
  phone: string;
};

export type OrderDriver = {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
  vehicleNumber: string;
  rating: number;
};

export type OrderItemCustomization = {
  groupName: string;
  optionName: string;
  priceAdjustment: number;
};

export type OrderItemComboSelection = {
  groupName: string;
  selectedItem: string;
  priceAdjustment: number;
};

export type OrderItem = {
  id: string;
  productType: 'FOOD' | 'COMBO';
  foodId?: string;
  comboId?: string;
  name: string;
  image?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  specialInstructions?: string;
  customizations?: OrderItemCustomization[];
  comboSelections?: OrderItemComboSelection[];
};

export type OrderStatusHistoryEntry = {
  id: string;
  status: OrderStatus;
  note?: string;
  createdAt: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  customerId: string;
  driverId?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  couponCode?: string;
  customerNote?: string;
  estimatedDeliveryMinutes: number;
  address?: OrderAddress;
  driver?: OrderDriver;
  statusHistory?: OrderStatusHistoryEntry[];
  placedAt: string;
  confirmedAt?: string;
  preparingAt?: string;
  readyAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  createdAt: string;
};
