"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  Lock, 
  CheckCircle2, 
  ArrowLeft, 
  ShoppingBag,
  ChevronRight,
  PackageCheck
} from "lucide-react";
import { useCart } from "@/lib/store/cart-store";
import { formatPrice } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "Gujarat",
    postalCode: "",
    paymentMethod: "online", // 'online' | 'cod'
    giftWrap: false,
    specialInstructions: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#FAF9F6]">
        <div className="w-8 h-8 border-2 border-[#C5A880] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If order was successfully placed, show luxury confirmation
  if (orderPlaced) {
    return (
      <div className="min-h-[80vh] bg-[#FAF9F6] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white border border-[#E8E5DE] rounded-sm p-8 sm:p-12 shadow-sm text-center">
          <div className="w-16 h-16 bg-[#F5F3EF] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-9 h-9 text-[#C5A880]" />
          </div>

          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#73706A] block mb-2">
            Order Confirmed & Secured
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-medium text-[#0E0E0E] mb-3">
            Thank You For Your Acquisition
          </h1>
          <p className="text-sm text-[#73706A] leading-relaxed max-w-md mx-auto mb-6">
            Your DNORA piece is now being prepared at our atelier. We have dispatched a confirmation receipt to{" "}
            <span className="font-medium text-[#0E0E0E]">{formData.email || "your email"}</span>.
          </p>

          <div className="bg-[#FAF9F6] border border-[#E8E5DE] p-4 rounded-sm mb-8 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-[#73706A]">Order Reference:</span>
              <span className="font-mono font-bold text-[#0E0E0E]">{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#73706A]">Delivery Mode:</span>
              <span className="font-medium text-[#0E0E0E]">Complimentary Atelier Courier (2-4 Days)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#73706A]">Payment Status:</span>
              <span className="font-bold text-[#0E0E0E] uppercase">
                {formData.paymentMethod === "cod" ? "Payable on Delivery" : "Payment Authorized"}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/shop"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#0E0E0E] hover:bg-[#2A2A2A] text-[#FAF9F6] text-xs font-semibold uppercase tracking-[0.18em] rounded-sm transition-colors"
            >
              Return to Catalog
            </Link>
            <Link
              href="/account"
              className="w-full sm:w-auto px-8 py-3.5 border border-[#0E0E0E] text-[#0E0E0E] hover:bg-[#F5F3EF] text-xs font-semibold uppercase tracking-[0.18em] rounded-sm transition-colors"
            >
              View Order in Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If cart is empty
  if (items.length === 0) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center bg-[#FAF9F6] px-4 text-center">
        <div className="w-16 h-16 bg-[#F5F3EF] rounded-full flex items-center justify-center mb-6 text-[#73706A]">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="font-heading text-2xl font-medium text-[#0E0E0E] mb-2">
          Your Shopping Bag Is Empty
        </h1>
        <p className="text-sm text-[#73706A] max-w-sm mb-6">
          Explore our signature handbag collections and add your desired creations to complete your acquisition.
        </p>
        <Link
          href="/shop"
          className="px-8 py-3.5 bg-[#0E0E0E] hover:bg-[#2A2A2A] text-[#FAF9F6] text-xs font-semibold uppercase tracking-[0.2em] rounded-sm transition-colors"
        >
          Explore Handbags
        </Link>
      </div>
    );
  }

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const generatedId = `DN-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderId(generatedId);
      setOrderPlaced(true);
      clearCart();
      setIsSubmitting(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#73706A] mb-8">
          <Link href="/shop" className="hover:text-[#0E0E0E] flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-[#D5D2CA]" />
          <span className="font-medium text-[#0E0E0E]">Express Checkout</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Delivery & Payment Details */}
          <div className="lg:col-span-7 space-y-8">
            <form onSubmit={handleSubmitOrder} id="checkout-form" className="space-y-8">
              {/* Contact Information */}
              <div className="bg-white border border-[#E8E5DE] rounded-sm p-6 sm:p-8 shadow-xs">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-heading font-semibold text-[#0E0E0E] tracking-tight">
                    1. Contact & Customer Details
                  </h2>
                  <span className="text-[10px] text-[#73706A] uppercase tracking-wider font-semibold">
                    Required
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#0E0E0E] mb-1.5">First Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="e.g. Eleanor"
                      className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#E8E5DE] rounded-sm text-xs text-[#0E0E0E] focus:outline-none focus:border-[#0E0E0E] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#0E0E0E] mb-1.5">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="e.g. Vance"
                      className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#E8E5DE] rounded-sm text-xs text-[#0E0E0E] focus:outline-none focus:border-[#0E0E0E] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#0E0E0E] mb-1.5">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="eleanor.vance@example.com"
                      className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#E8E5DE] rounded-sm text-xs text-[#0E0E0E] focus:outline-none focus:border-[#0E0E0E] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#0E0E0E] mb-1.5">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#E8E5DE] rounded-sm text-xs text-[#0E0E0E] focus:outline-none focus:border-[#0E0E0E] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white border border-[#E8E5DE] rounded-sm p-6 sm:p-8 shadow-xs">
                <h2 className="text-base font-heading font-semibold text-[#0E0E0E] tracking-tight mb-5">
                  2. Shipping Destination
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#0E0E0E] mb-1.5">Street Address & Residence *</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Apt, Suite, Villa / Street Name"
                      className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#E8E5DE] rounded-sm text-xs text-[#0E0E0E] focus:outline-none focus:border-[#0E0E0E] transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#0E0E0E] mb-1.5">City *</label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Mumbai"
                        className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#E8E5DE] rounded-sm text-xs text-[#0E0E0E] focus:outline-none focus:border-[#0E0E0E] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#0E0E0E] mb-1.5">State *</label>
                      <input
                        type="text"
                        required
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        placeholder="Maharashtra"
                        className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#E8E5DE] rounded-sm text-xs text-[#0E0E0E] focus:outline-none focus:border-[#0E0E0E] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#0E0E0E] mb-1.5">PIN Code *</label>
                      <input
                        type="text"
                        required
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        placeholder="400001"
                        className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#E8E5DE] rounded-sm text-xs text-[#0E0E0E] focus:outline-none focus:border-[#0E0E0E] transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white border border-[#E8E5DE] rounded-sm p-6 sm:p-8 shadow-xs">
                <h2 className="text-base font-heading font-semibold text-[#0E0E0E] tracking-tight mb-5">
                  3. Payment Method
                </h2>

                <div className="space-y-3">
                  <label
                    onClick={() => setFormData({ ...formData, paymentMethod: "online" })}
                    className={`flex items-start gap-4 p-4 border rounded-sm cursor-pointer transition-all ${
                      formData.paymentMethod === "online"
                        ? "border-[#0E0E0E] bg-[#FAF9F6] shadow-xs"
                        : "border-[#E8E5DE] hover:border-[#D5D2CA]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={formData.paymentMethod === "online"}
                      onChange={() => setFormData({ ...formData, paymentMethod: "online" })}
                      className="mt-1 accent-[#0E0E0E]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0E0E0E] uppercase tracking-wider">
                          Instant Online Payment (UPI / Cards / NetBanking)
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Lock className="w-3 h-3 text-[#73706A]" />
                          <span className="text-[10px] text-[#73706A] font-medium">256-bit Encrypted</span>
                        </div>
                      </div>
                      <p className="text-xs text-[#73706A] mt-1 leading-relaxed">
                        Fast and secure payment via Google Pay, PhonePe, Paytm, Credit/Debit Cards, or NetBanking.
                      </p>
                    </div>
                  </label>

                  <label
                    onClick={() => setFormData({ ...formData, paymentMethod: "cod" })}
                    className={`flex items-start gap-4 p-4 border rounded-sm cursor-pointer transition-all ${
                      formData.paymentMethod === "cod"
                        ? "border-[#0E0E0E] bg-[#FAF9F6] shadow-xs"
                        : "border-[#E8E5DE] hover:border-[#D5D2CA]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={formData.paymentMethod === "cod"}
                      onChange={() => setFormData({ ...formData, paymentMethod: "cod" })}
                      className="mt-1 accent-[#0E0E0E]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0E0E0E] uppercase tracking-wider">
                          Cash on Delivery (COD)
                        </span>
                        <PackageCheck className="w-3.5 h-3.5 text-[#C5A880]" />
                      </div>
                      <p className="text-xs text-[#73706A] mt-1 leading-relaxed">
                        Pay upon receipt of your package. Verified doorstep delivery with luxury signature packaging.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </form>
          </div>

          {/* Right Column: Order Summary & Review */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-[#E8E5DE] rounded-sm p-6 sm:p-8 shadow-xs sticky top-24 space-y-6">
              <h2 className="text-base font-heading font-semibold text-[#0E0E0E] tracking-tight pb-3 border-b border-[#E8E5DE]">
                Order Summary ({items.length} {items.length === 1 ? "Item" : "Items"})
              </h2>

              {/* Items List */}
              <div className="space-y-4 max-h-80 overflow-y-auto pr-1 divide-y divide-[#F5F3EF]">
                {items.map((item) => {
                  const firstVariantImg = item.selectedVariant?.images?.[0];
                  const itemImgUrl = typeof firstVariantImg === "string" 
                    ? firstVariantImg 
                    : (firstVariantImg && typeof firstVariantImg === "object" && "secure_url" in firstVariantImg)
                    ? (firstVariantImg as any).secure_url
                    : item.product.images[0]?.secure_url || "/placeholder.jpg";
                  const variantColor = item.selectedVariant?.color_hex || item.selectedVariant?.hex || "#0E0E0E";

                  return (
                    <div key={`${item.product.id}-${item.selectedVariant?.name || item.selectedColor || "default"}`} className="pt-3 first:pt-0 flex items-center gap-4">
                      <div className="relative w-16 h-20 bg-[#F5F3EF] rounded-xs overflow-hidden shrink-0 border border-[#E8E5DE]">
                        <Image
                          src={itemImgUrl}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-medium text-[#0E0E0E] truncate">
                          {item.product.name}
                        </h3>
                        {(item.selectedVariant || item.selectedColor) && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-black/20"
                              style={{ backgroundColor: variantColor }}
                            />
                            <span className="text-[11px] text-[#73706A]">
                              {item.selectedVariant?.name || item.selectedColor}
                            </span>
                          </div>
                        )}
                        <p className="text-[11px] text-[#73706A] mt-0.5">
                          Qty: {item.quantity} × {formatPrice(item.product.price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-[#0E0E0E]">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Cost Breakdown */}
              <div className="border-t border-[#E8E5DE] pt-4 space-y-2.5 text-xs">
                <div className="flex justify-between text-[#73706A]">
                  <span>Subtotal</span>
                  <span className="text-[#0E0E0E] font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#73706A]">
                  <span>Express Courier & Packaging</span>
                  <span className="text-emerald-700 font-medium">Complimentary</span>
                </div>
                <div className="flex justify-between text-[#73706A]">
                  <span>Duties & GST</span>
                  <span className="text-[#0E0E0E] font-medium">Included</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#0E0E0E] pt-2 border-t border-[#E8E5DE]">
                  <span>Total Due</span>
                  <span className="font-heading text-base">{formatPrice(subtotal)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full py-4 bg-[#0E0E0E] hover:bg-[#2A2A2A] text-[#FAF9F6] text-xs font-semibold uppercase tracking-[0.2em] rounded-sm transition-all shadow-md active:scale-[0.99] disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#C5A880] border-t-transparent rounded-full animate-spin" />
                    <span>Authorizing Order...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
                    <span>Complete Acquisition</span>
                  </>
                )}
              </button>

              {/* Trust Badges */}
              <div className="pt-2 border-t border-[#F5F3EF] grid grid-cols-2 gap-3 text-[10px] text-[#73706A]">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#0E0E0E]" />
                  <span>Insured Express Shipping</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#0E0E0E]" />
                  <span>100% Genuine Handcrafted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
