import type { UserRole } from '@models/user';

export const ROUTES = {
  INDEX: '/',
  WELCOME: '/(auth)/welcome',
  LOGIN: '/(auth)/login',
  REGISTER: '/(auth)/register',
  FORGOT_PASSWORD: '/(auth)/forgot-password',
  HOME: '/(customer)/(tabs)/',
  SEARCH: '/(customer)/(tabs)/search',
  ORDERS: '/(customer)/(tabs)/orders',
  PROFILE: '/(customer)/(tabs)/profile',
  FOOD: '/(customer)/food/[id]',
  COMBO: '/(customer)/combo/[id]',
  CART: '/(customer)/cart',
  CHECKOUT: '/(customer)/checkout',
  ADDRESSES: '/(customer)/addresses',
  ADD_ADDRESS: '/(customer)/addresses/add',
  FAVORITES: '/(customer)/favorites',
  COUPON: '/(customer)/cupon',
  NOTIFICATIONS: '/(customer)/notification',
  SUPPORT: '/(customer)/support',
  ORDER_CONFIRMATION: '/(customer)/order-conformation/[id]',
  ORDER_TRACKING: '/(customer)/order-tracking/[id]',
  REVIEW: '/(customer)/review/[id]',
  ADMIN_HOME: '/(admin)/(tabs)/',
  DRIVER_HOME: '/(driver)/(tabs)/',
} as const;

const ADMIN_ROLES: UserRole[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'KITCHEN_MANAGER',
  'OPERATIONS_MANAGER',
  'SUPPORT_AGENT',
  'FINANCE_MANAGER',
];

export function getHomeRouteForRole(role: UserRole): string {
  if (role === 'DRIVER') return ROUTES.DRIVER_HOME;
  if (ADMIN_ROLES.includes(role)) return ROUTES.ADMIN_HOME;
  return ROUTES.HOME;
}
