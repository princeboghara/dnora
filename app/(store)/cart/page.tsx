"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Heart,
  Tag,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "@/lib/context/cart-context";
import { useWishlist } from "@/lib/context/wishlist-context";
import { ProductCard } from "@/components/product/ProductCard";
import { INITIAL_PRODUCTS } from "@/lib/seed/catalog-data";
import { formatINR } from "@/lib/utils";

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [couponInput, setCouponInput] = useState("");
  const [couponFeedback, setCouponFeedback] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

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
    if (res.success) setCouponInput("");
  };

  const recommendedProducts = INITIAL_PRODUCTS.slice(2, 6);

  if (cart.items.length === 0) {
    return (
      <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-[#FAF7F2] border border-[#E8E2D9] flex items-center justify-center text-[#8C7A6B]">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="font-sans font-medium text-2xl sm:text-3xl text-[#111111] uppercase tracking-[0.12em]">
          Your Shopping Bag Is Empty
        </h1>
        <p className="text-xs sm:text-sm text-[#6E6A64] max-w-md mx-auto leading-relaxed">
          Discover our curated collection of handcrafted leather handbags, noble extraits, and fine jewellery.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-8 py-4 bg-[#141414] text-[#F5F2EB] text-xs uppercase tracking-[0.25em] font-medium hover:bg-[#C5A880] hover:text-[#111111] transition-all"
        >
          <span>Explore Atelier Catalog</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="mb-10 space-y-1">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B] font-semibold">
          Review Your Acquisition
        </span>
        <h1 className="font-sans text-2xl sm:text-3xl lg:text-4xl text-[#111111] font-light uppercase tracking-[0.12em]">
          Your Atelier Bag ({cart.items.reduce((s, i) => s + i.quantity, 0)})
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left Column: Items Table */}
        <div className="lg:col-span-8 space-y-6">
          {/* Free Shipping Meter */}
          <div className="p-4 bg-[#FAF7F2] border border-[#E8E2D9] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#3A3632]">
                {freeShippingNeeded > 0 ? (
                  <>
                    Add{" "}
                    <strong className="text-[#111111]">{formatINR(freeShippingNeeded)}</strong>{" "}
                    more for Complimentary White-Glove Shipping
                  </>
                ) : (
                  <span className="text-[#245744] font-medium flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Complimentary White-Glove Pan-India Shipping Unlocked!
                  </span>
                )}
              </span>
              <span className="font-mono text-[11px] text-[#8C7A6B]">
                {Math.round(freeShippingProgress)}%
              </span>
            </div>
            <div className="w-full bg-[#E8E2D9] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#C5A880] h-full transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="divide-y divide-[#E8E2D9] border-y border-[#E8E2D9]">
            {cart.items.map((item) => {
              const isLiked = isInWishlist(item.product.id);
              return (
                <div
                  key={item.id}
                  className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
                >
                  {/* Visual & Info */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative w-24 h-32 bg-[#EFEBE4] flex-shrink-0 overflow-hidden border border-[#E8E2D9]">
                      <Image
                        src={item.product.primary_image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="space-y-1 min-w-0">
                      <span className="text-[9px] uppercase tracking-widest text-[#8C7A6B]">
                        {item.product.category_slug}
                      </span>
                      <h3 className="font-sans font-medium text-xs sm:text-sm text-[#111111] line-clamp-1 uppercase tracking-wide">
                        <Link
                          href={`/product/${item.product.slug}`}
                          className="hover:text-[#9E7D4E] transition-colors"
                        >
                          {item.product.name}
                        </Link>
                      </h3>
                      {item.variant && (
                        <p className="text-xs text-[#8C7A6B]">
                          Edition: {item.variant.color_name || item.variant.size || `${item.variant.volume_ml}ml`}
                        </p>
                      )}
                      <p className="text-xs font-medium text-[#111111]">
                        {formatINR(item.price)} each
                      </p>

                      <div className="flex items-center gap-4 pt-2 text-xs">
                        <button
                          onClick={() => toggleWishlist(item.product)}
                          className="text-[#6E6A64] hover:text-[#111111] flex items-center gap-1 transition-colors"
                        >
                          <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-[#C5A880] text-[#C5A880]" : ""}`} />
                          <span>{isLiked ? "Saved in Wishlist" : "Move to Wishlist"}</span>
                        </button>
                        <span className="text-[#D5CDC0]">|</span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-[#9C9488] hover:text-[#8B0000] flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quantity & Subtotal */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4">
                    <div className="flex items-center border border-[#D5CDC0] bg-[#FAF7F2]">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2.5 py-1.5 hover:bg-[#EAE4D9] text-[#2C2926]"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 text-xs font-mono font-medium text-[#111111]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2.5 py-1.5 hover:bg-[#EAE4D9] text-[#2C2926]"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="font-sans text-base sm:text-lg font-semibold text-[#111111] tracking-tight">
                        {formatINR(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Order Summary & Coupon */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#FAF7F2] border border-[#E8E2D9] p-6 sm:p-8 space-y-6">
            <h2 className="font-sans font-medium text-base text-[#111111] uppercase tracking-[0.15em] pb-3 border-b border-[#E8E2D9]">
              Order Summary
            </h2>

            {/* Privilege Code */}
            <div>
              {cart.coupon_code ? (
                <div className="flex items-center justify-between text-xs bg-[#EAF2ED] border border-[#C2D8CA] p-3 text-[#245744]">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Code <strong>{cart.coupon_code}</strong> active</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="underline text-[11px] font-semibold hover:text-[#111111]"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Privilege Code (e.g. WELCOME10)"
                      className="flex-1 text-xs px-3 py-2.5 bg-[#FBF9F5] border border-[#D5CDC0] uppercase tracking-wider focus:outline-none focus:border-[#111111]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-[#141414] text-[#F5F2EB] text-xs uppercase tracking-widest hover:bg-[#C5A880] hover:text-[#111111] transition-all font-medium"
                    >
                      Apply
                    </button>
                  </div>
                  {couponFeedback && (
                    <p
                      className={`text-xs ${
                        couponFeedback.success ? "text-[#245744]" : "text-[#B91C1C]"
                      }`}
                    >
                      {couponFeedback.message}
                    </p>
                  )}
                </form>
              )}
            </div>

            {/* Calculations */}
            <div className="space-y-2.5 text-xs text-[#6E6A64] pt-2 border-t border-[#E8E2D9]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-[#111111] font-medium">{formatINR(cart.subtotal)}</span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-[#245744]">
                  <span>Privilege Savings</span>
                  <span>-{formatINR(cart.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
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
                <span>Estimated GST (12%)</span>
                <span>{formatINR(cart.tax)}</span>
              </div>

              <div className="flex justify-between pt-4 border-t border-[#E8E2D9] text-base font-sans font-semibold text-[#111111]">
                <span>Total Acquisition</span>
                <span className="font-sans font-semibold">{formatINR(cart.total)}</span>
              </div>
            </div>

            {/* Checkout Action */}
            <Link
              href="/checkout"
              className="w-full py-4 bg-[#141414] text-[#F5F2EB] text-xs uppercase tracking-[0.25em] font-medium hover:bg-[#C5A880] hover:text-[#111111] transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <span>Proceed To Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="space-y-2 pt-2 text-[11px] text-[#8C7A6B] text-center border-t border-[#E8E2D9]">
              <p>Complimentary White-Glove Delivery Across India</p>
              <p className="italic">All acquisitions arrive in D&apos;NORA gift packaging.</p>
            </div>
          </div>
        </div>
      </div>

      {/* You May Also Like Section */}
      <div className="mt-24 pt-16 border-t border-[#E8E2D9]">
        <div className="mb-8">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B] font-semibold">
            Atelier Recommendations
          </span>
          <h2 className="font-sans font-medium text-xl sm:text-2xl text-[#111111] uppercase tracking-[0.12em]">
            You May Also Admire
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {recommendedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
