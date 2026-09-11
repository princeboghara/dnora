"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ShoppingCart, Clock, CheckCircle2, ChevronRight, X } from "lucide-react";
import { getOrders, updateOrderStatus } from "@/lib/services/order-service";
import { Order, OrderStatus } from "@/types";
import { formatINR, formatDate } from "@/lib/utils";

const STATUS_TABS: { label: string; value: string }[] = [
  { label: "All Orders", value: "all" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Packed", value: "packed" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedTab, setSelectedTab] = useState("all");
  const [search, setSearch] = useState("");
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  useEffect(() => {
    async function load() {
      const all = await getOrders();
      setOrders(all);
    }
    load();
  }, []);

  const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
    await updateOrderStatus(orderId, status);
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, status } : o)));
    if (activeOrder && activeOrder.id === orderId) {
      setActiveOrder({ ...activeOrder, status });
    }
  };

  const filtered = orders.filter((o) => {
    const matchesTab = selectedTab === "all" || o.status === selectedTab;
    const matchesSearch =
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.04]">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold font-mono">
            Order Fulfillment Pipeline
          </span>
          <h1 className="font-serif text-3xl text-[#F5F7FA] uppercase tracking-wide mt-1">
            Patron Orders &amp; Workflow
          </h1>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="space-y-4">
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {STATUS_TABS.map((tab) => {
            const count =
              tab.value === "all"
                ? orders.length
                : orders.filter((o) => o.status === tab.value).length;
            const isSelected = selectedTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setSelectedTab(tab.value)}
                className={`px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "neu-inset text-[#C5A880] font-semibold border-b-2 border-[#C5A880]"
                    : "neu-btn text-[#8A95A5] hover:text-[#EDEDED]"
                }`}
              >
                {tab.label} ({count})
              </button>
            );
          })}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-[#8A95A5] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order number (e.g. DNR-2026), patron name, email..."
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl neu-inset text-xs text-[#EDEDED] placeholder:text-[#6E7B8E] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50"
          />
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="rounded-3xl neu-raised p-6">
        <div className="rounded-2xl neu-inset overflow-hidden border border-white/[0.02]">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase tracking-widest text-[#8A95A5] bg-[#12151c]/60 border-b border-white/[0.03]">
              <tr>
                <th className="p-4">Order Ref</th>
                <th className="p-4">Patron</th>
                <th className="p-4">Creations</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Fulfillment Status</th>
                <th className="p-4">Workflow Transition</th>
                <th className="p-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252D3D] text-[#E4E8EE]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-[#8491A5]">
                    <div className="max-w-md mx-auto space-y-2">
                      <ShoppingCart className="w-8 h-8 mx-auto text-[#C5A880]/50" />
                      <p className="text-sm font-medium text-[#FBF9F5]">
                        {orders.length === 0 ? "No Client Orders Placed Yet" : "No orders matching tab selection"}
                      </p>
                      <p className="text-[11px] text-[#8491A5]">
                        {orders.length === 0
                          ? "As patrons complete purchases in the atelier storefront, orders will stream into this pipeline with end-to-end fulfillment controls."
                          : "Try selecting a different status tab or clearing your search term."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-[#1A202C]/60 transition-colors">
                    <td className="p-4 font-mono font-medium text-[#C5A880]">
                      {order.order_number}
                      <span className="block text-[10px] text-[#8491A5] font-sans">
                        {formatDate(order.created_at)}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-[#FBF9F5]">{order.customer_name}</p>
                      <p className="text-[10px] text-[#8491A5]">{order.customer_phone}</p>
                    </td>
                    <td className="p-4 text-[#8491A5]">
                      {order.items.length} item{order.items.length > 1 ? "s" : ""}
                    </td>
                    <td className="p-4 font-semibold text-[#FBF9F5]">
                      {formatINR(order.total)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold ${
                          order.status === "delivered"
                            ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30"
                            : order.status === "shipped"
                            ? "bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/30"
                            : "bg-[#C5A880]/20 text-[#C5A880] border border-[#C5A880]/30"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusUpdate(order.id, e.target.value as OrderStatus)
                        }
                        className="bg-[#1A202C] border border-[#252D3D] text-[#E4E8EE] px-2.5 py-1 text-[11px] focus:outline-none focus:border-[#C5A880]"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="packed">Packed</option>
                        <option value="shipped">Shipped</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setActiveOrder(order)}
                        className="text-[#C5A880] hover:text-[#DFCAAB] text-[11px] underline font-medium"
                      >
                        Inspect &rarr;
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Inspect Modal */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="neu-raised rounded-3xl border border-white/[0.04] p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto text-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.04]">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-mono">
                  Atelier Acquisition Detail
                </span>
                <h3 className="font-mono text-lg text-[#F5F7FA]">
                  {activeOrder.order_number}
                </h3>
              </div>
              <button
                onClick={() => setActiveOrder(null)}
                className="p-2 rounded-xl neu-btn text-[#8A95A5] hover:text-[#F5F7FA]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Patron & Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl neu-inset border border-white/[0.02]">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-[#8491A5]">
                  Patron Information
                </span>
                <p className="font-semibold text-[#FBF9F5]">{activeOrder.customer_name}</p>
                <p className="text-[#8491A5]">{activeOrder.customer_email}</p>
                <p className="text-[#8491A5]">{activeOrder.customer_phone}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-[#8491A5]">
                  Shipping Destination
                </span>
                <p className="text-[#E4E8EE]">{activeOrder.shipping_address.street}</p>
                <p className="text-[#8491A5]">
                  {activeOrder.shipping_address.city}, {activeOrder.shipping_address.state} - {activeOrder.shipping_address.postal_code}
                </p>
                <p className="text-[#8491A5]">Method: {activeOrder.payment_method}</p>
              </div>
            </div>

            {/* Creations */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase tracking-widest text-[#8491A5]">
                Order Items ({activeOrder.items.length})
              </span>
              <div className="divide-y divide-[#252D3D] border border-[#252D3D]">
                {activeOrder.items.map((item) => (
                  <div key={item.id} className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-14 bg-[#1A202C] overflow-hidden flex-shrink-0 border border-[#252D3D]">
                        <Image
                          src={item.product_image}
                          alt={item.product_name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-serif text-[#FBF9F5] font-medium">{item.product_name}</p>
                        {item.variant_title && (
                          <p className="text-[10px] text-[#8491A5]">{item.variant_title}</p>
                        )}
                        <p className="text-[10px] text-[#8491A5]">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-[#FBF9F5]">
                      {formatINR(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-1.5 p-4 bg-[#1A202C] border border-[#252D3D] text-[#8491A5]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-[#E4E8EE]">{formatINR(activeOrder.subtotal)}</span>
              </div>
              {activeOrder.discount > 0 && (
                <div className="flex justify-between text-[#10B981]">
                  <span>Privilege ({activeOrder.coupon_code})</span>
                  <span>-{formatINR(activeOrder.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{activeOrder.shipping_fee === 0 ? "Complimentary" : formatINR(activeOrder.shipping_fee)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (12%)</span>
                <span>{formatINR(activeOrder.tax)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#252D3D] text-sm font-bold text-[#FBF9F5]">
                <span>Total Amount Paid</span>
                <span className="text-[#C5A880]">{formatINR(activeOrder.total)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setActiveOrder(null)}
                className="px-5 py-2.5 bg-[#1A202C] hover:bg-[#252D3D] text-[#E4E8EE] text-xs uppercase tracking-wider"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
