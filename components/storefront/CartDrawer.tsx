"use client";

import React, { useEffect } from "react";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/store/cart-store";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const router = useRouter();
  const {
    isOpen,
    closeCart,
    items,
    updateQuantity,
    removeItem,
    subtotal,
    itemCount,
    freeShippingProgress,
    amountToFreeShipping,
  } = useCart();

  const handleProceedToCheckout = async () => {
    closeCart();
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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF9F6] border-l border-[#E8E5DE] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#E8E5DE] bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#0E0E0E]" />
              <h2 className="text-lg font-heading font-semibold text-[#0E0E0E] tracking-tight uppercase">
                Shopping Bag ({itemCount})
              </h2>
            </div>
            <button
              onClick={closeCart}
              aria-label="Close cart"
              className="p-1.5 rounded-lg text-[#73706A] hover:text-[#0E0E0E] hover:bg-[#F5F3EF] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Meter */}
          <div className="bg-[#F5F3EF] px-6 py-3.5 border-b border-[#E8E5DE]">
            {amountToFreeShipping === 0 ? (
              <p className="text-xs font-medium text-emerald-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Congratulations! You have unlocked Complimentary Worldwide Express Shipping.
              </p>
            ) : (
              <div>
                <p className="text-xs font-medium text-[#3A3835]">
                  Add <span className="font-bold text-[#0E0E0E]">{formatPrice(amountToFreeShipping)}</span> more for Complimentary Shipping.
                </p>
                <div className="w-full bg-[#E8E5DE] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-[#0E0E0E] h-full transition-all duration-500 rounded-full"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-[#F5F3EF] flex items-center justify-center mx-auto mb-4 text-[#A8A49C]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-heading font-medium text-[#0E0E0E] mb-2">
                  Your bag is currently empty
                </h3>
                <p className="text-sm text-[#73706A] max-w-xs mx-auto mb-6">
                  Explore our modern architectural silhouettes and artisan leather collections.
                </p>
                <button
                  onClick={closeCart}
                  className="inline-flex items-center justify-center px-6 py-3 bg-[#0E0E0E] text-[#FAF9F6] text-xs font-semibold uppercase tracking-widest hover:bg-[#2C2B29] transition-all"
                >
                  Discover Purses
                </button>
              </div>
            ) : (
              items.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-4 pb-6 border-b border-[#E8E5DE] last:border-0">
                  <div className="relative w-24 h-28 bg-[#F5F3EF] rounded overflow-hidden shrink-0 border border-[#E8E5DE]">
                    {product.images[0] && (
                      <Image
                        src={product.images[0].secure_url}
                        alt={product.images[0].alt_text || product.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/product/${product.slug}`}
                          onClick={closeCart}
                          className="text-sm font-heading font-semibold text-[#0E0E0E] hover:underline leading-tight"
                        >
                          {product.name}
                        </Link>
                        <button
                          onClick={() => removeItem(product.id)}
                          className="text-[#A8A49C] hover:text-rose-600 transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-[#73706A] mt-1">{product.sku}</p>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-[#E8E5DE] bg-white rounded">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="p-1.5 text-[#73706A] hover:text-[#0E0E0E]"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold text-[#0E0E0E]">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="p-1.5 text-[#73706A] hover:text-[#0E0E0E]"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-sm font-semibold text-[#0E0E0E]">
                        {formatPrice(product.price * quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer / Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-[#E8E5DE] bg-white space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#73706A]">Subtotal</span>
                <span className="font-heading font-semibold text-[#0E0E0E] text-base">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="text-xs text-[#73706A] leading-relaxed">
                Taxes and complimentary express duties calculated during checkout.
              </p>
              <button
                onClick={handleProceedToCheckout}
                className="w-full flex items-center justify-center gap-2 py-4 bg-[#0E0E0E] text-[#FAF9F6] text-xs font-semibold uppercase tracking-widest hover:bg-[#2C2B29] transition-all rounded shadow-md cursor-pointer active:scale-[0.99]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
