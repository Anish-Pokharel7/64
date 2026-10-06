export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  restaurants: {
    list: '/restaurants',
    byId: (id: string) => `/restaurants/${id}`,
    popular: '/restaurants/popular',
    nearby: '/restaurants/nearby',
    byCategory: (categoryId: string) => `/restaurants?category=${categoryId}`,
  },
  foods: {
    list: '/foods',
    byId: (id: string) => `/foods/${id}`,
    popular: '/foods/popular',
    byRestaurant: (restaurantId: string) => `/foods?restaurant=${restaurantId}`,
    search: (query: string) => `/foods/search?q=${encodeURIComponent(query)}`,
  },
  orders: {
    list: '/orders',
    byId: (id: string) => `/orders/${id}`,
    create: '/orders',
  },
  users: {
    me: '/users/me',
    update: '/users/me',
  },
  addresses: {
    list: '/addresses',
    byId: (id: string) => `/addresses/${id}`,
    create: '/addresses',
    update: (id: string) => `/addresses/${id}`,
    delete: (id: string) => `/addresses/${id}`,
  },
} as const;
