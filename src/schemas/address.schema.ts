import { z } from 'zod';

export const addressSchema = z.object({
  label: z.string().min(1, 'Label is required (e.g. Home, Office)'),
  fullName: z.string().min(2, 'Full name is required'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^9[0-9]{8,9}$/, 'Enter a valid Nepali phone number'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  area: z.string().min(1, 'Area is required'),
  landmark: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export type AddressFormData = z.infer<typeof addressSchema>;
