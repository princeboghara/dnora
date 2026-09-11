import { Coupon } from "@/types";
import { INITIAL_COUPONS } from "@/lib/seed/catalog-data";

export interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  discountAmount: number;
  message: string;
}

export function validateCoupon(
  code: string,
  cartSubtotal: number
): CouponValidationResult {
  const normalized = code.trim().toUpperCase();
  const coupon = INITIAL_COUPONS.find(
    (c) => c.code.toUpperCase() === normalized && c.is_active
  );

  if (!coupon) {
    return {
      valid: false,
      discountAmount: 0,
      message: "The privilege code entered is invalid or expired.",
    };
  }

  if (cartSubtotal < coupon.min_cart_value) {
    return {
      valid: false,
      discountAmount: 0,
      message: `Privilege code ${coupon.code} requires a minimum acquisition of ₹${coupon.min_cart_value.toLocaleString("en-IN")}.`,
    };
  }

  let discount = 0;
  if (coupon.discount_type === "percentage") {
    discount = (cartSubtotal * coupon.discount_value) / 100;
    if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
      discount = coupon.max_discount_amount;
    }
  } else if (coupon.discount_type === "fixed") {
    discount = coupon.discount_value;
  }

  return {
    valid: true,
    coupon,
    discountAmount: Math.min(discount, cartSubtotal),
    message: `Privilege applied: ${coupon.description}`,
  };
}
