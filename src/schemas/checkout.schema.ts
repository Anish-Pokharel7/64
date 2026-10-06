import { z } from 'zod';

export const checkoutSchema = z.object({
  addressId: z.string().min(1, 'Please select a delivery address'),
  paymentMethod: z.enum(['cash', 'esewa', 'khalti'], {
    message: 'Select a payment method',
  }),
  notes: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
