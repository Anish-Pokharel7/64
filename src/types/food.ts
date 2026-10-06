import { MenuSection } from './restaurant';

export type Food = {
  id: string;
  name: string;
  description?: string;
  price: number;
  image: string;
  restaurantId: string;
  restaurantName?: string;
  category: string;
  isPopular?: boolean;
  isVegetarian?: boolean;
  rating?: number;
  menuSection?: string;
};
