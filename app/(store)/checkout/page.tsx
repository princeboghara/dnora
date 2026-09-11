"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Truck,
  CreditCard,
  Smartphone,
  Building2,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { useCart } from "@/lib/context/cart-context";
import { useAuth } from "@/lib/auth/auth-context";
import { createOrder } from "@/lib/services/order-service";
import { PaymentServiceFactory, PaymentGatewayType } from "@/lib/services/payment-service";
import { Address, OrderItem } from "@/types";
import { formatINR } from "@/lib/utils";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Assam",
  "Bihar",
  "Delhi NCR",
  "Goa",
  "Gujarat",
  "Haryana",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "West Bengal",
];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();

  // Multi-step progression
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [email, setEmail] = useState(user?.email || "devika.rathore@heritage.in");
  const [phone, setPhone] = useState("+91 98290 11223");
  const [wantsUpdates, setWantsUpdates] = useState(true);

  const [shippingAddress, setShippingAddress] = useState<Omit<Address, "id">>({
    full_name: user?.fullName || "Maharani Devika Rathore",
    phone: "+91 98290 11223",
    street: "7 Umaid Heritage Enclave",
    landmark: "Circuit House Road",
    city: "Jodhpur",
    state: "Rajasthan",
    postal_code: "342006",
    country: "India",
    is_default: true,
    address_type: "shipping",
  });

  const [deliveryMethod, setDeliveryMethod] = useState<"standard" | "express">("standard");
  const [paymentMethod, setPaymentMethod] = useState<PaymentGatewayType>("sandbox");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Delivery fee adjustments
  const shippingCharge =
    deliveryMethod === "express" ? 750 : cart.shipping_fee;
  const finalTotal = cart.subtotal - cart.discount + shippingCharge + cart.tax;

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.items.length === 0) return;

    setIsProcessing(true);
    setOrderError(null);

    try {
      // 1. Process payment via payment abstraction
      const paymentService = PaymentServiceFactory.getService(paymentMethod);
      const paymentSession = await paymentService.initiatePayment({
        orderId: `temp_${Date.now()}`,
        orderNumber: `DNR-${new Date().getFullYear()}`,
        amount: finalTotal,
        currency: "INR",
        customerName: shippingAddress.full_name,
        customerEmail: email,
        customerPhone: phone,
      });

      const verification = await paymentService.verifyPayment({
        paymentId: paymentSession.paymentId,
      });

      if (!verification.success) {
        throw new Error(verification.error || "Payment authorization unsuccessful.");
      }

      // 2. Prepare Order Items
      const orderItems: OrderItem[] = cart.items.map((i) => ({
        id: `ord_item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        order_id: "",
        product_id: i.product.id,
        product_name: i.product.name,
        product_slug: i.product.slug,
        product_image: i.product.primary_image,
        variant_id: i.variant_id,
        variant_title: i.variant
          ? i.variant.color_name || i.variant.size || `${i.variant.volume_ml}ml`
          : undefined,
        price: i.price,
        quantity: i.quantity,
      }));

      // 3. Create persistent Order in Database/Storage
      const createdOrder = await createOrder({
        customer_name: shippingAddress.full_name,
        customer_email: email,
        customer_phone: phone,
        shipping_address: {
          id: `addr_${Date.now()}`,
          ...shippingAddress,
        },
        items: orderItems,
        status: "confirmed",
        payment_status: "captured",
        payment_method:
          paymentMethod === "razorpay"
            ? "Razorpay (UPI / NetBanking)"
            : paymentMethod === "cod"
            ? "Cash On Delivery"
            : "Atelier VIP Sandbox Card",
        subtotal: cart.subtotal,
        discount: cart.discount,
        shipping_fee: shippingCharge,
        tax: cart.tax,
        total: finalTotal,
        coupon_code: cart.coupon_code,
      });

      // 4. Clear cart & redirect to success receipt
      clearCart();
      router.push(`/checkout/success/${createdOrder.order_number}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred during checkout.";
      setOrderError(message);
      setIsProcessing(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="py-24 max-w-2xl mx-auto text-center px-4 space-y-4">
        <h1 className="font-sans font-medium text-xl text-[#111111] uppercase tracking-[0.12em]">Your Bag is Empty</h1>
        <p className="text-xs text-[#8C7A6B]">Please add items to your bag before proceeding to checkout.</p>
        <Link href="/shop" className="inline-block text-xs uppercase tracking-widest text-[#C5A880] underline">
          Return to Catalog &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="py-10 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Checkout Header */}
      <div className="flex items-center justify-between pb-6 border-b border-[#E8E2D9] mb-8">
        <div>
          <Link href="/" className="font-sans text-2xl tracking-[0.25em] font-light text-[#111111] uppercase">
            D&apos;NORA
          </Link>
          <span className="text-[9px] uppercase tracking-[0.3em] text-[#8C7A6B] block">
            Atelier Secure Checkout
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#245744]">
          <Lock className="w-3.5 h-3.5" />
          <span className="text-[11px] uppercase tracking-wider font-semibold">
            256-Bit SSL Encryption
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left Column: Multi-Step Form */}
        <div className="lg:col-span-7 space-y-8">
          {/* Step Indicator */}
          <div className="flex items-center justify-between text-xs pb-4 border-b border-[#E8E2D9] uppercase tracking-widest text-[#8C7A6B]">
            <span className={currentStep >= 1 ? "text-[#111111] font-semibold" : ""}>
              1. Contact
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#D5CDC0]" />
            <span className={currentStep >= 2 ? "text-[#111111] font-semibold" : ""}>
              2. Shipping
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#D5CDC0]" />
            <span className={currentStep >= 3 ? "text-[#111111] font-semibold" : ""}>
              3. Delivery
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#D5CDC0]" />
            <span className={currentStep >= 4 ? "text-[#111111] font-semibold" : ""}>
              4. Payment
            </span>
          </div>

          <form onSubmit={handleCompleteOrder} className="space-y-8">
            {/* Step 1: Contact Information */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-sans font-medium text-sm text-[#111111] uppercase tracking-[0.15em]">
                  1. Contact Information
                </h2>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs text-[#C5A880] underline font-medium"
                  >
                    Edit
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">
                    Email Address (For Invoicing)
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 bg-[#FAF7F2] border border-[#D5CDC0] focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">
                    Indian Mobile Number (For WhatsApp / SMS Tracking)
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-3 bg-[#FAF7F2] border border-[#D5CDC0] focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-[#6E6A64] cursor-pointer">
                <input
                  type="checkbox"
                  checked={wantsUpdates}
                  onChange={(e) => setWantsUpdates(e.target.checked)}
                  className="accent-[#111111]"
                />
                <span>Send complimentary white-glove dispatch alerts via WhatsApp & SMS</span>
              </label>

              {currentStep === 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 bg-[#141414] text-[#F5F2EB] text-xs uppercase tracking-widest font-medium hover:bg-[#C5A880] hover:text-[#111111] transition-all"
                >
                  Continue to Shipping Address &rarr;
                </button>
              )}
            </div>

            {/* Step 2: Shipping Address */}
            <div className={`space-y-4 pt-6 border-t border-[#E8E2D9] ${currentStep < 2 ? "opacity-40 pointer-events-none" : ""}`}>
              <div className="flex items-center justify-between">
                <h2 className="font-sans font-medium text-sm text-[#111111] uppercase tracking-[0.15em]">
                  2. Shipping Destination
                </h2>
                {currentStep > 2 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-xs text-[#C5A880] underline font-medium"
                  >
                    Edit
                  </button>
                )}
              </div>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">
                    Full Recipient Name
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.full_name}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, full_name: e.target.value })}
                    className="w-full p-3 bg-[#FAF7F2] border border-[#D5CDC0] focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">
                    Address (House / Villa / Suite / Street)
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.street}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                    className="w-full p-3 bg-[#FAF7F2] border border-[#D5CDC0] focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.landmark}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, landmark: e.target.value })}
                    placeholder="Near Palace Gates / Opposite Club"
                    className="w-full p-3 bg-[#FAF7F2] border border-[#D5CDC0] focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      className="w-full p-3 bg-[#FAF7F2] border border-[#D5CDC0] focus:outline-none focus:border-[#111111]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">
                      State
                    </label>
                    <select
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      className="w-full p-3 bg-[#FAF7F2] border border-[#D5CDC0] focus:outline-none focus:border-[#111111]"
                    >
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">
                      Postal PIN Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={shippingAddress.postal_code}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, postal_code: e.target.value })}
                      className="w-full p-3 bg-[#FAF7F2] border border-[#D5CDC0] focus:outline-none focus:border-[#111111]"
                    />
                  </div>
                </div>
              </div>

              {currentStep === 2 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-3 bg-[#141414] text-[#F5F2EB] text-xs uppercase tracking-widest font-medium hover:bg-[#C5A880] hover:text-[#111111] transition-all"
                >
                  Continue to Delivery Method &rarr;
                </button>
              )}
            </div>

            {/* Step 3: Delivery Options */}
            <div className={`space-y-4 pt-6 border-t border-[#E8E2D9] ${currentStep < 3 ? "opacity-40 pointer-events-none" : ""}`}>
              <div className="flex items-center justify-between">
                <h2 className="font-sans font-medium text-sm text-[#111111] uppercase tracking-[0.15em]">
                  3. Delivery Protocol
                </h2>
                {currentStep > 3 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="text-xs text-[#C5A880] underline font-medium"
                  >
                    Edit
                  </button>
                )}
              </div>

              <div className="space-y-3 text-xs">
                <label className={`block p-4 border transition-all cursor-pointer ${deliveryMethod === "standard" ? "border-[#111111] bg-[#FAF7F2]" : "border-[#E8E2D9]"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="delivery"
                        checked={deliveryMethod === "standard"}
                        onChange={() => setDeliveryMethod("standard")}
                        className="accent-[#111111]"
                      />
                      <div>
                        <p className="font-semibold text-[#111111]">
                          White-Glove Standard Transit (3–5 Business Days)
                        </p>
                        <p className="text-[11px] text-[#8C7A6B]">
                          Insured courier in signature keepsake packaging
                        </p>
                      </div>
                    </div>
                    <span className="font-medium text-[#245744]">
                      {cart.shipping_fee === 0 ? "Complimentary" : formatINR(cart.shipping_fee)}
                    </span>
                  </div>
                </label>

                <label className={`block p-4 border transition-all cursor-pointer ${deliveryMethod === "express" ? "border-[#111111] bg-[#FAF7F2]" : "border-[#E8E2D9]"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="delivery"
                        checked={deliveryMethod === "express"}
                        onChange={() => setDeliveryMethod("express")}
                        className="accent-[#111111]"
                      />
                      <div>
                        <p className="font-semibold text-[#111111]">
                          Priority Next-Flight Express Air (24–48 Hours)
                        </p>
                        <p className="text-[11px] text-[#8C7A6B]">
                          Dedicated courier dispatch with live tracking
                        </p>
                      </div>
                    </div>
                    <span className="font-medium text-[#111111]">₹750</span>
                  </div>
                </label>
              </div>

              {currentStep === 3 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-6 py-3 bg-[#141414] text-[#F5F2EB] text-xs uppercase tracking-widest font-medium hover:bg-[#C5A880] hover:text-[#111111] transition-all"
                >
                  Continue to Payment &rarr;
                </button>
              )}
            </div>

            {/* Step 4: Payment Gateway */}
            <div className={`space-y-4 pt-6 border-t border-[#E8E2D9] ${currentStep < 4 ? "opacity-40 pointer-events-none" : ""}`}>
              <h2 className="font-sans font-medium text-sm text-[#111111] uppercase tracking-[0.15em]">
                4. Payment Method
              </h2>

              <div className="space-y-3 text-xs">
                {/* Instant Sandbox VIP Mode */}
                <label className={`block p-4 border transition-all cursor-pointer ${paymentMethod === "sandbox" ? "border-[#111111] bg-[#FAF7F2]" : "border-[#E8E2D9]"}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "sandbox"}
                      onChange={() => setPaymentMethod("sandbox")}
                      className="accent-[#111111]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-[#111111]">
                          Atelier VIP Sandbox Test Card (Instant Approval)
                        </p>
                        <span className="text-[10px] uppercase tracking-widest bg-[#C5A880] text-[#111111] px-2 py-0.5 font-bold">
                          Recommended
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8C7A6B] mt-0.5">
                        Test and verify complete order pipeline instantly without real debit.
                      </p>
                    </div>
                  </div>
                </label>

                {/* Razorpay UPI */}
                <label className={`block p-4 border transition-all cursor-pointer ${paymentMethod === "razorpay" ? "border-[#111111] bg-[#FAF7F2]" : "border-[#E8E2D9]"}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "razorpay"}
                      onChange={() => setPaymentMethod("razorpay")}
                      className="accent-[#111111]"
                    />
                    <div>
                      <p className="font-semibold text-[#111111]">
                        Razorpay Secure (UPI, GPay, PhonePe, Cards, NetBanking)
                      </p>
                      <p className="text-[11px] text-[#8C7A6B]">
                        Zero transaction surcharges. 100% RBI Compliant.
                      </p>
                    </div>
                  </div>
                </label>

                {/* Cash on Delivery */}
                <label className={`block p-4 border transition-all cursor-pointer ${paymentMethod === "cod" ? "border-[#111111] bg-[#FAF7F2]" : "border-[#E8E2D9]"}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="accent-[#111111]"
                    />
                    <div>
                      <p className="font-semibold text-[#111111]">
                        Cash / Card On Delivery (White-Glove Courier Handover)
                      </p>
                      <p className="text-[11px] text-[#8C7A6B]">
                        Pay via cash, UPI, or card upon in-person delivery.
                      </p>
                    </div>
                  </div>
                </label>
              </div>

              {orderError && (
                <div className="p-3 bg-[#FDF2F2] border border-[#F87171] text-xs text-[#B91C1C]">
                  {orderError}
                </div>
              )}

              {/* Complete Order CTA */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 bg-[#141414] hover:bg-[#C5A880] hover:text-[#111111] text-[#F5F2EB] text-xs uppercase tracking-[0.25em] font-medium transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span>Authorizing Atelier Acquisition...</span>
                  ) : (
                    <>
                      <span>Complete Order ({formatINR(finalTotal)})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Order Summary & Review */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#FAF7F2] border border-[#E8E2D9] p-6 sm:p-8 space-y-6 sticky top-24">
            <h3 className="font-sans font-medium text-sm text-[#111111] uppercase tracking-[0.15em] pb-3 border-b border-[#E8E2D9]">
              Your Bag Items ({cart.items.reduce((s, i) => s + i.quantity, 0)})
            </h3>

            {/* Items list */}
            <div className="divide-y divide-[#E8E2D9] max-h-72 overflow-y-auto pr-2">
              {cart.items.map((item) => (
                <div key={item.id} className="py-3 flex gap-3 items-center justify-between text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-14 h-16 bg-[#EFEBE4] flex-shrink-0 border border-[#E8E2D9]">
                      <Image
                        src={item.product.primary_image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-sans text-[#111111] line-clamp-1 font-medium uppercase tracking-wide text-xs">{item.product.name}</p>
                      <p className="text-[11px] text-[#8C7A6B]">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-medium text-[#111111]">
                    {formatINR(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-2 pt-4 border-t border-[#E8E2D9] text-xs text-[#6E6A64]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-[#111111] font-medium">{formatINR(cart.subtotal)}</span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-[#245744]">
                  <span>Privilege ({cart.coupon_code})</span>
                  <span>-{formatINR(cart.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {shippingCharge === 0 ? (
                    <span className="text-[#245744] font-medium uppercase tracking-wider text-[10px]">
                      Complimentary
                    </span>
                  ) : (
                    formatINR(shippingCharge)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>GST (12% Included)</span>
                <span>{formatINR(cart.tax)}</span>
              </div>

              <div className="flex justify-between pt-4 border-t border-[#E8E2D9] text-base font-sans font-semibold text-[#111111]">
                <span>Total Amount</span>
                <span className="font-sans font-semibold">{formatINR(finalTotal)}</span>
              </div>
            </div>

            <div className="text-[11px] text-[#8C7A6B] space-y-1.5 pt-2 border-t border-[#E8E2D9]">
              <p className="flex items-center gap-1.5 text-[#245744] font-medium">
                <ShieldCheck className="w-4 h-4" /> 100% Discretion & Authenticity Guaranteed
              </p>
              <p>Complimentary insurance during transit.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
