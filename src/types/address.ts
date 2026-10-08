export type Address = {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  area: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
};
