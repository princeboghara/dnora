"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  Package,
  Clock,
  Truck,
  Printer,
  ArrowRight,
  ShieldCheck,
  Check,
} from "lucide-react";
import { getOrderById } from "@/lib/services/order-service";
import { Order } from "@/types";
import { formatINR, formatDate } from "@/lib/utils";

const TIMELINE_STEPS = [
  { key: "confirmed", label: "Order Confirmed", desc: "Atelier craftsmanship allocated" },
  { key: "packed", label: "Bespoke Packaging", desc: "Gift-wrapped in keepsake box" },
  { key: "shipped", label: "Dispatched", desc: "White-glove priority transit" },
  { key: "out_for_delivery", label: "Out For Delivery", desc: "Courier arriving today" },
  { key: "delivered", label: "Delivered", desc: "Received by patron" },
];

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params?.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Launch gold & ivory celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#C5A880", "#DFCAAB", "#111111", "#FAF8F5"],
      });
    } catch {
      // Ignore
    }

    async function loadOrder() {
      if (orderId) {
        const found = await getOrderById(orderId);
        setOrder(found);
      }
      setIsLoading(false);
    }

    loadOrder();
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-xs uppercase tracking-widest text-[#8C7A6B]">
        Retrieving Atelier Acquisition Record...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-24 text-center max-w-lg mx-auto px-4 space-y-4">
        <h1 className="font-sans font-medium text-xl text-[#111111] uppercase tracking-[0.12em]">Order Record Not Located</h1>
        <p className="text-xs text-[#8C7A6B]">
          Please check your email confirmation for order details or contact our concierge.
        </p>
        <Link href="/" className="inline-block text-xs uppercase tracking-widest text-[#C5A880] underline">
          Return to Atelier Homepage &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Success Banner */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#C5A880] flex items-center justify-center mx-auto text-[#C5A880]">
          <Check className="w-8 h-8 stroke-[2.5]" />
        </div>

        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold">
            Acquisition Confirmed
          </span>
          <h1 className="font-sans text-2xl sm:text-3xl text-[#111111] uppercase tracking-[0.12em] font-medium">
            Thank You, {order.customer_name}
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6A64] max-w-md mx-auto">
            Your acquisition has been received by our atelier. An official receipt has been dispatched to <strong>{order.customer_email}</strong>.
          </p>
        </div>

        <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#FAF7F2] border border-[#E8E2D9] text-xs font-mono text-[#111111]">
          <span>Order Number:</span>
          <strong className="tracking-wider">{order.order_number}</strong>
        </div>
      </div>

      {/* Interactive Order Timeline */}
      <div className="bg-[#FAF7F2] border border-[#E8E2D9] p-6 sm:p-8 space-y-6">
        <h2 className="font-sans font-medium text-sm text-[#111111] uppercase tracking-[0.15em]">
          Fulfillment Timeline
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
          {TIMELINE_STEPS.map((step, idx) => {
            const isCompleted = true; // In confirmed state, first step is active
            const isCurrent = idx === 0;
            return (
              <div key={step.key} className="flex sm:flex-col items-center sm:items-start gap-3 text-left">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-colors flex-shrink-0 ${
                    isCurrent
                      ? "bg-[#111111] text-[#F5F2EB] border-[#111111]"
                      : "bg-[#FBF9F5] text-[#8C7A6B] border-[#D5CDC0]"
                  }`}
                >
                  0{idx + 1}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#111111] truncate">{step.label}</p>
                  <p className="text-[10px] text-[#8C7A6B] leading-tight mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Details & Summary Card */}
      <div className="bg-[#FAF7F2] border border-[#E8E2D9] p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-4">
          <h2 className="font-sans font-medium text-sm text-[#111111] uppercase tracking-[0.15em]">
            Acquisition Receipt
          </h2>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 text-xs text-[#8C7A6B] hover:text-[#111111] transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>
        </div>

        {/* Customer & Address Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-[#6E6A64]">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-[#8C7A6B] font-semibold block">
              Shipping Destination
            </span>
            <p className="font-semibold text-[#111111]">{order.shipping_address.full_name}</p>
            <p>{order.shipping_address.street}</p>
            {order.shipping_address.landmark && <p>{order.shipping_address.landmark}</p>}
            <p>
              {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.postal_code}
            </p>
            <p>Phone: {order.shipping_address.phone}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-[#8C7A6B] font-semibold block">
              Payment Method & Status
            </span>
            <p className="font-semibold text-[#111111]">{order.payment_method}</p>
            <p className="text-[#245744] font-medium">Payment Status: Authorized & Captured</p>
            <p>Date: {formatDate(order.created_at)}</p>
          </div>
        </div>

        {/* Items List */}
        <div className="divide-y divide-[#E8E2D9] border-t border-[#E8E2D9] pt-4">
          {order.items.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-14 bg-[#EFEBE4] overflow-hidden flex-shrink-0 border border-[#E8E2D9]">
                  <Image
                    src={item.product_image}
                    alt={item.product_name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-sans text-[#111111] font-medium uppercase tracking-wide text-xs">{item.product_name}</p>
                  {item.variant_title && (
                    <p className="text-[11px] text-[#8C7A6B]">{item.variant_title}</p>
                  )}
                  <p className="text-[11px] text-[#8C7A6B]">Qty: {item.quantity}</p>
                </div>
              </div>
              <span className="font-medium text-[#111111]">
                {formatINR(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="space-y-2 pt-4 border-t border-[#E8E2D9] text-xs text-[#6E6A64]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="text-[#111111]">{formatINR(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-[#245744]">
              <span>Privilege Savings ({order.coupon_code})</span>
              <span>-{formatINR(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{order.shipping_fee === 0 ? "Complimentary" : formatINR(order.shipping_fee)}</span>
          </div>
          <div className="flex justify-between">
            <span>GST (12% Included)</span>
            <span>{formatINR(order.tax)}</span>
          </div>
          <div className="flex justify-between pt-3 border-t border-[#E8E2D9] text-sm font-sans font-semibold text-[#111111]">
            <span>Total Paid</span>
            <span className="font-sans font-semibold">{formatINR(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Action Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/shop"
          className="px-8 py-3.5 bg-[#141414] text-[#F5F2EB] text-xs uppercase tracking-[0.25em] font-medium hover:bg-[#C5A880] hover:text-[#111111] transition-all"
        >
          Explore More Atelier Creations
        </Link>
        <Link
          href="/account/orders"
          className="px-8 py-3.5 bg-[#FAF7F2] border border-[#111111] text-xs uppercase tracking-[0.25em] font-medium text-[#111111] hover:bg-[#111111] hover:text-[#F5F2EB] transition-all"
        >
          Track in Your Account
        </Link>
      </div>
    </div>
  );
}
