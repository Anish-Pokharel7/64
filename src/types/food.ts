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
  prepTimeMinutes?: number;
};

export type CustomizationOption = {
  id: string;
  name: string;
  priceAdjustment: number;
};

export type CustomizationGroup = {
  id: string;
  name: string;
  isRequired: boolean;
  minSelections: number;
  maxSelections: number;
  options: CustomizationOption[];
};

export type Favorite = {
  id: string;
  food: Food | null;
};
