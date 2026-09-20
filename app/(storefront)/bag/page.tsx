"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Lock,
  RotateCcw,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useCart } from "@/lib/store/cart-store";
import { formatPrice } from "@/lib/utils";

export default function ShoppingBagPage() {
  const router = useRouter();
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    itemCount,
    freeShippingProgress,
    amountToFreeShipping,
  } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    if (couponCode.trim().toUpperCase() === "DNORA10" || couponCode.trim().toUpperCase() === "WELCOME") {
      setCouponDiscount(Math.round(subtotal * 0.1));
      setCouponApplied(true);
      setCouponError("");
    } else {
      setCouponError("Invalid promotion code. Try 'DNORA10' for 10% off.");
      setCouponDiscount(0);
      setCouponApplied(false);
    }
  };

  const handleProceedToCheckout = async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      if (data?.isAuthenticated) {
        router.push("/checkout");
      } else {
        router.push(`/login?redirect=${encodeURIComponent("/checkout")}`);
      }
    } catch {
      router.push("/checkout");
    }
  };

  const grandTotal = Math.max(0, subtotal - couponDiscount);

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-slate-900 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/shop" className="hover:text-slate-900 transition-colors">
            Collection
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold">Shopping Bag</span>
        </nav>

        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-6 border-b border-slate-200 mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
              Shopping Bag
            </h1>
            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-900 border border-slate-200">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
          </div>
          {itemCount > 0 && (
            <button
              onClick={() => clearCart()}
              className="text-xs text-slate-500 hover:text-red-600 font-medium transition-colors cursor-pointer self-start sm:self-auto"
            >
              Clear Entire Bag
            </button>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty Bag State */
          <div className="bg-white border border-slate-200 rounded-2xl p-12 sm:p-16 text-center max-w-2xl mx-auto shadow-xs">
            <div className="w-20 h-20 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-9 h-9 stroke-[1.5]" />
            </div>
            <h2 className="text-xl font-heading font-bold text-slate-900 mb-2">
              Your shopping bag is empty
            </h2>
            <p className="text-sm text-slate-500 mb-8 max-w-md mx-auto">
              Explore our curated selection of handcrafted luxury handbags, shoulder bags, and signature totes.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all active:scale-[0.98]"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* Active Cart Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Items Column (8 cols) */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-4">
              {/* Complimentary Shipping Progress Banner */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
                {amountToFreeShipping === 0 ? (
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Unlocked Complimentary Express Shipping on your order.</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-700 font-medium mb-2">
                      <span>Complimentary Express Shipping</span>
                      <span className="text-slate-900 font-bold">
                        Add {formatPrice(amountToFreeShipping)} more
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-slate-900 h-full transition-all duration-500 rounded-full"
                        style={{ width: `${freeShippingProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Items Card List */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs divide-y divide-slate-100 overflow-hidden">
                {items.map((item) => {
                  const imageSrc =
                    item.selectedVariant?.images?.[0]
                      ? typeof item.selectedVariant.images[0] === "string"
                        ? item.selectedVariant.images[0]
                        : (item.selectedVariant.images[0] as { secure_url: string }).secure_url
                      : item.product.images[0]?.secure_url || "";

                  const variantName =
                    typeof item.selectedVariant === "string"
                      ? item.selectedVariant
                      : item.selectedVariant?.name;

                  return (
                    <div
                      key={item.product.id}
                      className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      {/* Product Info & Thumbnail */}
                      <div className="flex items-center gap-4 min-w-0">
                        <Link
                          href={`/product/${item.product.slug}`}
                          className="relative w-20 h-24 sm:w-24 sm:h-28 bg-slate-50 rounded-xl overflow-hidden border border-slate-200 shrink-0 shadow-2xs group"
                        >
                          {imageSrc ? (
                            <Image
                              src={imageSrc}
                              alt={item.product.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="96px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <ShoppingBag className="w-6 h-6" />
                            </div>
                          )}
                        </Link>

                        <div className="space-y-1 min-w-0">
                          <Link
                            href={`/product/${item.product.slug}`}
                            className="text-sm sm:text-base font-heading font-bold text-slate-900 hover:text-slate-700 transition-colors line-clamp-1"
                          >
                            {item.product.name}
                          </Link>

                          {variantName && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <span>Colour:</span>
                              <span className="font-medium text-slate-700 capitalize">
                                {variantName}
                              </span>
                            </div>
                          )}

                          <div className="text-xs text-slate-500 font-mono">
                            SKU: {item.product.sku || "DNORA-ATELIER"}
                          </div>

                          <div className="sm:hidden pt-1 font-bold text-slate-900 text-sm">
                            {formatPrice(item.product.price * item.quantity)}
                          </div>
                        </div>
                      </div>

                      {/* Quantity Selector & Item Subtotal */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        {/* Stepper */}
                        <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50/70 p-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors disabled:opacity-30 cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-9 text-center text-xs font-bold text-slate-900 font-mono">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Price Desktop */}
                        <div className="hidden sm:block text-right min-w-[90px]">
                          <div className="text-sm font-bold text-slate-900">
                            {formatPrice(item.product.price * item.quantity)}
                          </div>
                          {item.quantity > 1 && (
                            <div className="text-[11px] text-slate-400">
                              {formatPrice(item.product.price)} each
                            </div>
                          )}
                        </div>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.product.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          aria-label="Remove item"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Continue Shopping Link */}
              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  <span>Continue Shopping Collection</span>
                </Link>
              </div>
            </div>

            {/* Right Summary Column (4-5 cols) */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-6">
              {/* Order Summary Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
                <h2 className="text-base font-heading font-bold text-slate-900 uppercase tracking-wide pb-3 border-b border-slate-100">
                  Order Summary
                </h2>

                <div className="space-y-3 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-900 font-mono">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-semibold text-slate-900">
                      {amountToFreeShipping === 0 ? "Complimentary" : formatPrice(25)}
                    </span>
                  </div>

                  {couponApplied && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Promo Discount (DNORA10)</span>
                      <span>-{formatPrice(couponDiscount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Estimated Duties &amp; Taxes</span>
                    <span className="text-slate-500 font-medium">Included</span>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-slate-900">Total</span>
                    <span className="text-xl font-extrabold text-slate-900 font-mono">
                      {formatPrice(grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Promo Voucher Form */}
                <form onSubmit={handleApplyCoupon} className="pt-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Promotion Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. DNORA10"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 uppercase font-mono"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {couponApplied && (
                    <p className="text-[11px] text-emerald-600 font-medium mt-1.5 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> 10% discount applied successfully!
                    </p>
                  )}
                  {couponError && (
                    <p className="text-[11px] text-red-500 mt-1.5">{couponError}</p>
                  )}
                </form>

                {/* Proceed to Checkout CTA */}
                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Proceed to Checkout</span>
                </button>

                {/* Assurance & Trust Badges */}
                <div className="pt-4 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center gap-2.5 text-[11px] text-slate-600">
                    <ShieldCheck className="w-4 h-4 text-slate-800 shrink-0" />
                    <span>100% Genuine Handcrafted Luxury Quality</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[11px] text-slate-600">
                    <RotateCcw className="w-4 h-4 text-slate-800 shrink-0" />
                    <span>Complimentary 14-Day Global Returns</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[11px] text-slate-600">
                    <Lock className="w-4 h-4 text-slate-800 shrink-0" />
                    <span>Bank-Grade 256-Bit SSL Encrypted Checkout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
