import { create } from 'zustand';
import { CartItem, CartItemCustomization, CartTotals } from '@models/cart';
import { Food } from '@models/food';
import { ComboOption, ComboSet } from '@models/combo';

type CartState = {
  items: CartItem[];
  appliedCouponCode: string | null;
  appliedDiscount: number;
  freeDelivery: boolean;
  addItem: (
    food: Food,
    quantity?: number,
    customizations?: CartItemCustomization[],
    specialInstructions?: string
  ) => void;
  addCombo: (combo: ComboSet, quantity?: number, comboOptions?: ComboOption[]) => void;
  applyCoupon: (code: string, discountAmount: number, freeDelivery: boolean) => void;
  removeCoupon: () => void;
  removeItem: (itemId: string) => void;
  increaseQuantity: (itemId: string) => void;
  decreaseQuantity: (itemId: string) => void;
  clearCart: () => void;
  getTotals: () => CartTotals;
  getItemCount: () => number;
};

function getFoodItemId(foodId: string, customizations?: CartItemCustomization[], specialInstructions?: string) {
  return `food:${foodId}:${JSON.stringify(customizations ?? [])}:${specialInstructions ?? ''}`;
}

function getComboItemId(comboId: string, comboOptions?: ComboOption[]) {
  return `combo:${comboId}:${JSON.stringify(comboOptions ?? [])}`;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  appliedCouponCode: null,
  appliedDiscount: 0,
  freeDelivery: false,

  addItem: (food, quantity = 1, customizations, specialInstructions) =>
    set((state) => {
      const itemId = getFoodItemId(food.id, customizations, specialInstructions);
      const existingItem = state.items.find((item) => item.id === itemId);
      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.id === itemId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      }
      const newItem: CartItem = {
        id: itemId,
        productType: 'food',
        food,
        quantity,
        unitPrice: food.price + (customizations ?? []).reduce((sum, option) => sum + option.priceAdjustment, 0),
        customizations,
        specialInstructions,
      };
      return { items: [...state.items, newItem] };
    }),

  addCombo: (combo, quantity = 1, comboOptions) =>
    set((state) => {
      const itemId = getComboItemId(combo.id, comboOptions);
      const existingItem = state.items.find((item) => item.id === itemId);
      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity: item.quantity + quantity } : item
          ),
        };
      }

      const newItem: CartItem = {
        id: itemId,
        productType: 'combo',
        combo,
        quantity,
        unitPrice: combo.price + (comboOptions ?? []).reduce((sum, option) => sum + option.priceAdjustment, 0),
        comboOptions,
      };
      return { items: [...state.items, newItem] };
    }),

  applyCoupon: (code, discountAmount, freeDelivery) =>
    set({
      appliedCouponCode: code,
      appliedDiscount: Math.max(0, discountAmount),
      freeDelivery,
    }),

  removeCoupon: () =>
    set({ appliedCouponCode: null, appliedDiscount: 0, freeDelivery: false }),

  removeItem: (itemId) =>
    set((state) => {
      const items = state.items.filter((item) => item.id !== itemId);
      return items.length === 0
        ? { items, appliedCouponCode: null, appliedDiscount: 0, freeDelivery: false }
        : { items };
    }),

  increaseQuantity: (itemId) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      ),
    })),

  decreaseQuantity: (itemId) =>
    set((state) => ({
      items: state.items
        .map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0),
    })),

  clearCart: () =>
    set({ items: [], appliedCouponCode: null, appliedDiscount: 0, freeDelivery: false }),

  getTotals: () => {
    const items = get().items;
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const deliveryFee = items.length > 0 ? 50 : 0;
    const { appliedDiscount, freeDelivery } = get();
    const serviceFee = 0;
    const tax = 0;
    const discount = Math.min(appliedDiscount, subtotal);
    const total = subtotal + (freeDelivery ? 0 : deliveryFee) + serviceFee + tax - discount;
    return { subtotal, deliveryFee, freeDelivery, serviceFee, tax, discount, total };
  },

  getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
}));
