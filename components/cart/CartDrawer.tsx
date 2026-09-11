"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag } from "lucide-react";
import { useCart } from "@/lib/context/cart-context";
import { formatINR } from "@/lib/utils";

export function CartDrawer() {
  const {
    cart,
    isOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [couponFeedback, setCouponFeedback] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const freeShippingNeeded = Math.max(
    0,
    cart.free_shipping_threshold - cart.subtotal
  );
  const freeShippingProgress = Math.min(
    100,
    (cart.subtotal / cart.free_shipping_threshold) * 100
  );

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponFeedback(res);
    if (res.success) {
      setCouponInput("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#111111]/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={closeCart}
      />

      {/* Slide-out Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FBF9F5] border-l border-[#E8E2D9] shadow-2xl flex flex-col justify-between">
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-[#E8E2D9] bg-[#FAF7F2] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#C5A880]" />
              <h2 className="font-sans font-medium text-sm tracking-[0.15em] uppercase text-[#111111]">
                Your Atelier Bag ({cart.items.reduce((s, i) => s + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 text-[#8C7A6B] hover:text-[#111111] transition-colors"
              aria-label="Close Bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Complimentary Shipping Meter */}
          <div className="px-6 py-3 bg-[#F4EFE6] border-b border-[#E8E2D9] text-xs">
            {freeShippingNeeded > 0 ? (
              <p className="text-[#3A3632] mb-1.5">
                Add{" "}
                <span className="font-semibold text-[#111111]">
                  {formatINR(freeShippingNeeded)}
                </span>{" "}
                more for <span className="text-[#9E7D4E] font-medium">Complimentary White-Glove Shipping</span>
              </p>
            ) : (
              <p className="text-[#245744] font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                You have unlocked Complimentary White-Glove Delivery!
              </p>
            )}
            <div className="w-full bg-[#E5DFD4] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#C5A880] h-full transition-all duration-500 ease-out"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-[#EAE4D9]">
            {cart.items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#F4F0E8] border border-[#E2DBD0] flex items-center justify-center text-[#8C7A6B]">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <p className="font-sans font-medium text-base text-[#111111] uppercase tracking-wider">Your Shopping Bag Is Empty</p>
                  <p className="text-xs text-[#8C7A6B] max-w-xs">
                    Explore our curated collection of handcrafted luxury handbags, noble perfumes, and fine jewellery.
                  </p>
                </div>
                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 bg-[#141414] text-[#F5F2EB] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#C5A880] hover:text-[#111111] transition-all"
                >
                  <span>Explore Atelier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              cart.items.map((item) => (
                <div key={item.id} className="py-4 flex gap-4">
                  {/* Thumbnail */}
                  <div className="relative w-20 h-24 bg-[#EFEBE4] flex-shrink-0 overflow-hidden border border-[#E8E2D9]">
                    <Image
                      src={item.product.primary_image}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <Link
                          href={`/product/${item.product.slug}`}
                          onClick={closeCart}
                          className="font-sans font-medium text-xs sm:text-sm text-[#111111] hover:text-[#9E7D4E] transition-colors line-clamp-1 uppercase tracking-wide"
                        >
                          {item.product.name}
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-[#9C9488] hover:text-[#8B0000] transition-colors p-0.5"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {item.variant && (
                        <p className="text-[11px] text-[#8C7A6B] mt-0.5">
                          {item.variant.color_name || item.variant.size || `${item.variant.volume_ml}ml`}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-[#D5CDC0] bg-[#FAF7F2]">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-[#EAE4D9] text-[#2C2926] transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-mono font-medium text-[#111111]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-[#EAE4D9] text-[#2C2926] transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-medium text-[#111111]">
                          {formatINR(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer & Checkout Action */}
          {cart.items.length > 0 && (
            <div className="p-6 bg-[#FAF7F2] border-t border-[#E8E2D9] space-y-4">
              {/* Coupon Code Section */}
              <div>
                {cart.coupon_code ? (
                  <div className="flex items-center justify-between text-xs bg-[#EAF2ED] border border-[#C2D8CA] px-3 py-1.5 text-[#245744]">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3 h-3" />
                      <span>
                        Privilege <strong>{cart.coupon_code}</strong> applied (-{formatINR(cart.discount)})
                      </span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-[#245744] hover:text-[#111111] font-semibold underline text-[10px]"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Enter privilege code (e.g. WELCOME10)"
                      className="flex-1 text-xs px-3 py-2 bg-[#FBF9F5] border border-[#D5CDC0] uppercase tracking-wider focus:outline-none focus:border-[#111111]"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 bg-[#1C1B1A] text-[#F5F2EB] text-xs uppercase tracking-widest hover:bg-[#C5A880] hover:text-[#111111] transition-all"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponFeedback && !cart.coupon_code && (
                  <p
                    className={`text-[11px] mt-1.5 ${
                      couponFeedback.success ? "text-[#245744]" : "text-[#B91C1C]"
                    }`}
                  >
                    {couponFeedback.message}
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-[#6E6A64]">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-medium text-[#111111]">{formatINR(cart.subtotal)}</span>
                </div>
                {cart.discount > 0 && (
                  <div className="flex justify-between text-[#245744]">
                    <span>Atelier Privilege Discount</span>
                    <span>-{formatINR(cart.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Pan-India Shipping</span>
                  <span>
                    {cart.shipping_fee === 0 ? (
                      <span className="text-[#245744] font-medium uppercase tracking-wider text-[10px]">
                        Complimentary
                      </span>
                    ) : (
                      formatINR(cart.shipping_fee)
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (12% GST included)</span>
                  <span>{formatINR(cart.tax)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#E8E2D9] text-sm font-sans font-semibold text-[#111111]">
                  <span>Total Amount</span>
                  <span className="font-sans font-semibold">{formatINR(cart.total)}</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-2 pt-1">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#141414] text-[#F5F2EB] text-xs uppercase tracking-[0.25em] font-medium hover:bg-[#C5A880] hover:text-[#111111] transition-all shadow-md"
                >
                  <span>Proceed To Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="w-full flex items-center justify-center py-2.5 text-xs uppercase tracking-widest text-[#6E6A64] hover:text-[#111111] transition-colors underline"
                >
                  View Full Bag & Estimate
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
