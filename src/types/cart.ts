import { Food } from './food';
import { ComboOption, ComboSet } from './combo';

export type CartItemCustomization = {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  priceAdjustment: number;
};

export type CartItem = {
  id: string;
  productType: 'food' | 'combo';
  food?: Food;
  combo?: ComboSet;
  quantity: number;
  unitPrice: number;
  customizations?: CartItemCustomization[];
  comboOptions?: ComboOption[];
  specialInstructions?: string;
};

export type CartTotals = {
  subtotal: number;
  deliveryFee: number;
  freeDelivery: boolean;
  serviceFee: number;
  tax: number;
  discount: number;
  total: number;
};
