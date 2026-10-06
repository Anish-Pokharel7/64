import { create } from 'zustand';
import { CartItem, CartTotals } from '@models/cart';
import { Food } from '@models/food';

type CartState = {
  items: CartItem[];
  addItem: (food: Food, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  increaseQuantity: (itemId: string) => void;
  decreaseQuantity: (itemId: string) => void;
  clearCart: () => void;
  getTotals: () => CartTotals;
  getItemCount: () => number;
};

function generateCartItemId(food: Food): string {
  return `${food.id}`;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (food, quantity = 1) =>
    set((state) => {
      const existingItem = state.items.find((item) => item.food.id === food.id);
      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.food.id === food.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      }
      const newItem: CartItem = {
        id: generateCartItemId(food),
        food,
        quantity,
        unitPrice: food.price,
      };
      return { items: [...state.items, newItem] };
    }),

  removeItem: (itemId) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== itemId),
    })),

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

  clearCart: () => set({ items: [] }),

  getTotals: () => {
    const items = get().items;
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const deliveryFee = items.length > 0 ? 50 : 0;
    const discount = 0;
    const total = subtotal + deliveryFee - discount;
    return { subtotal, deliveryFee, discount, total };
  },

  getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
}));
