import { supabase } from '@api/supabase';

export type CouponValidation = {
  valid: boolean;
  message: string;
  discountAmount: number;
  freeDelivery: boolean;
};

export const couponService = {
  async validateCoupon(
    code: string,
    subtotal: number,
    hasCombo: boolean,
    hasMomo: boolean,
    isFirstOrder: boolean
  ): Promise<CouponValidation> {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) {
      return { valid: false, message: 'This coupon code is invalid.', discountAmount: 0, freeDelivery: false };
    }

    const coupon = data as Record<string, unknown>;
    const expiresAt = coupon.expires_at as string | null;
    const minimumOrder = Number(coupon.minimum_order_amount ?? 0);
    const discountValue = Number(coupon.discount_value ?? 0);
    const isExpired = expiresAt ? new Date(expiresAt).getTime() <= Date.now() : false;

    if (isExpired) {
      return { valid: false, message: 'This coupon has expired.', discountAmount: 0, freeDelivery: false };
    }
    if (subtotal < minimumOrder) {
      return {
        valid: false,
        message: `Your order must be at least ${minimumOrder} to use this coupon.`,
        discountAmount: 0,
        freeDelivery: false,
      };
    }
    if (coupon.applies_to_combos === false && hasCombo) {
      return { valid: false, message: 'This coupon does not apply to combo sets.', discountAmount: 0, freeDelivery: false };
    }
    if (coupon.applies_to_momo === false && hasMomo) {
      return { valid: false, message: 'This coupon does not apply to momo items.', discountAmount: 0, freeDelivery: false };
    }
    if (coupon.first_order_only === true && !isFirstOrder) {
      return { valid: false, message: 'This coupon is only available on your first order.', discountAmount: 0, freeDelivery: false };
    }

    const discountType = coupon.discount_type as string | undefined;
    const amount = discountType === 'percentage'
      ? subtotal * discountValue / 100
      : discountValue;
    const maxDiscount = Number(coupon.maximum_discount ?? amount);
    const freeDelivery = coupon.free_delivery === true;

    return {
      valid: true,
      message: 'Coupon applied.',
      discountAmount: Math.min(amount, maxDiscount, subtotal),
      freeDelivery,
    };
  },
};
