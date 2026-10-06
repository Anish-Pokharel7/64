import { Food } from './food';

export type CartItem = {
  id: string;
  food: Food;
  quantity: number;
  unitPrice: number;
  notes?: string;
};

export type CartTotals = {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
};
