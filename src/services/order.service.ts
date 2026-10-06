import { Order } from '@models/order';
import { mockOrders } from '@mock/orders';

const MOCK_DELAY = 600;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
    return mockOrders.find((o) => o.id === id) ?? null;
  },
};
