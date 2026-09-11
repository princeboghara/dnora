"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Package, Truck, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { getOrders } from "@/lib/services/order-service";
import { Order } from "@/types";
import { formatINR, formatDate } from "@/lib/utils";

const TIMELINE_STEPS = ["confirmed", "packed", "shipped", "out_for_delivery", "delivered"];

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      const data = await getOrders();
      setOrders(data);
      setIsLoading(false);
    }
    fetchOrders();
  }, []);

  if (isLoading) {
    return <div className="p-12 text-center text-xs text-[#8C7A6B]">Loading Orders...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B] font-semibold">
          Acquisitions History
        </span>
        <h1 className="font-sans text-2xl sm:text-3xl text-[#111111] uppercase tracking-[0.12em] font-light">
          My Orders & Dispatch Tracking
        </h1>
      </div>

      {orders.length === 0 ? (
        <div className="bg-[#FAF7F2] border border-[#E8E2D9] p-12 text-center space-y-4">
          <Package className="w-8 h-8 text-[#8C7A6B] mx-auto" />
          <p className="font-sans font-medium text-base text-[#111111] uppercase tracking-wider">No Orders On Record</p>
          <p className="text-xs text-[#6E6A64]">You have not yet made any acquisitions from our atelier.</p>
          <Link
            href="/shop"
            className="inline-block px-6 py-2.5 bg-[#141414] text-[#F5F2EB] text-xs uppercase tracking-widest hover:bg-[#C5A880] hover:text-[#111111] transition-all"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const currentStepIdx = Math.max(
              0,
              TIMELINE_STEPS.indexOf(order.status)
            );

            return (
              <div
                key={order.id}
                className="bg-[#FAF7F2] border border-[#E8E2D9] p-6 sm:p-8 space-y-6"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#E8E2D9] gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">
                      Order Reference
                    </span>
                    <p className="font-mono font-bold text-sm text-[#111111]">
                      {order.order_number}
                    </p>
                    <p className="text-[11px] text-[#8C7A6B]">
                      Ordered on {formatDate(order.created_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 text-[10px] uppercase tracking-widest font-semibold ${
                        order.status === "delivered"
                          ? "bg-[#EAF2ED] text-[#245744]"
                          : "bg-[#141414] text-[#C5A880]"
                      }`}
                    >
                      Status: {order.status}
                    </span>
                    <span className="font-sans text-base font-semibold text-[#111111] tracking-tight">
                      {formatINR(order.total)}
                    </span>
                  </div>
                </div>

                {/* Tracking Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[#8C7A6B]">
                    <span>Fulfillment Journey</span>
                    {order.tracking_number && (
                      <span className="font-mono text-[#111111]">
                        Tracking: {order.tracking_number} ({order.courier})
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-5 gap-1 pt-1">
                    {TIMELINE_STEPS.map((step, idx) => {
                      const isComplete = idx <= currentStepIdx;
                      return (
                        <div key={step} className="space-y-1">
                          <div
                            className={`h-1.5 rounded-none ${
                              isComplete ? "bg-[#C5A880]" : "bg-[#E2DBD0]"
                            }`}
                          />
                          <span
                            className={`text-[9px] uppercase tracking-wider block truncate ${
                              isComplete ? "text-[#111111] font-semibold" : "text-[#A89F91]"
                            }`}
                          >
                            {step.replace("_", " ")}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-[#E8E2D9] pt-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="py-3 flex items-center justify-between text-xs"
                    >
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
                          <p className="font-sans text-[#111111] font-medium uppercase tracking-wide text-xs">
                            {item.product_name}
                          </p>
                          {item.variant_title && (
                            <p className="text-[11px] text-[#8C7A6B]">
                              {item.variant_title}
                            </p>
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

                {/* Address and Receipt Link */}
                <div className="pt-4 border-t border-[#E8E2D9] flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-[#8C7A6B] gap-2">
                  <p>
                    Delivery Destination: {order.shipping_address.street}, {order.shipping_address.city}
                  </p>
                  <Link
                    href={`/checkout/success/${order.order_number}`}
                    className="text-[#111111] hover:text-[#C5A880] underline font-medium"
                  >
                    View Official Receipt &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
