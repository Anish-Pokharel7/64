export type ComboItem = {
  id: string;
  foodId: string;
  foodName: string;
  quantity: number;
};

export type ComboOption = {
  id: string;
  groupName: string;
  optionLabel: string;
  priceAdjustment: number;
};

export type ComboSet = {
  id: string;
  name: string;
  description?: string;
  image: string;
  price: number;
  originalPrice: number;
  items?: ComboItem[];
  options?: ComboOption[];
};
