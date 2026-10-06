export type MenuSection = {
  id: string;
  name: string;
  foodIds: string[];
};

export type FoodCategory = {
  id: string;
  name: string;
  icon: string;
  image?: string;
};

export type Restaurant = {
  id: string;
  name: string;
  description?: string;
  image: string;
  rating: number;
  reviewCount: number;
  deliveryTime: number;
  deliveryFee: number;
  cuisine: string[];
  isOpen: boolean;
  address?: string;
  distanceKm?: number;
  popular?: boolean;
  categoryId?: string;
};

export type RestaurantWithMenu = Restaurant & {
  menu: MenuSection[];
};
