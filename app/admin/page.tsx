"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  PackageCheck,
  Check,
} from "lucide-react";
import { getOrders, updateOrderStatus } from "@/lib/services/order-service";
import { getProducts } from "@/lib/services/catalog-service";
import { Order, OrderStatus, Product } from "@/types";
import { formatINR, formatDate } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [ordersData, productsData] = await Promise.all([
        getOrders(),
        getProducts(),
      ]);
      setOrders(ordersData);
      setProducts(productsData);
    }
    load();
  }, []);

  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const totalOrdersCount = orders.length;
  const aov = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;
  const lowStockItems = products.filter((p) => (p.stock_quantity ?? 0) <= 10);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    await updateOrderStatus(orderId, newStatus);
    setOrders(
      orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    setUpdatingId(null);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.04]">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold font-mono">
            Executive Control Tower
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#F5F7FA] uppercase tracking-wide mt-1">
            Atelier Performance Overview
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="px-4 py-2.5 rounded-xl neu-btn text-[#EDEDED] text-xs uppercase tracking-wider font-medium transition-all"
          >
            Manage Catalog
          </Link>
          <Link
            href="/admin/orders"
            className="px-4 py-2.5 rounded-xl neu-btn-gold text-xs uppercase tracking-wider font-semibold transition-all"
          >
            View All Orders
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid - Matte Black Neumorphic Raised Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Revenue */}
        <div className="p-6 rounded-2xl neu-raised space-y-3">
          <div className="flex items-center justify-between">
            <span className="uppercase tracking-widest text-[10px] text-[#8A95A5] font-mono">
              Gross Atelier Revenue
            </span>
            <div className="w-8 h-8 rounded-xl neu-inset flex items-center justify-center text-[#10B981]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-3xl font-medium text-[#F5F7FA]">
            {formatINR(totalRevenue)}
          </p>
          <p className="text-[11px] text-[#8A95A5] flex items-center gap-1">
            {totalRevenue > 0 ? (
              <span className="text-[#10B981]">+0% vs prior month</span>
            ) : (
              <span>No transactions recorded</span>
            )}
          </p>
        </div>

        {/* Orders */}
        <div className="p-6 rounded-2xl neu-raised space-y-3">
          <div className="flex items-center justify-between">
            <span className="uppercase tracking-widest text-[10px] text-[#8A95A5] font-mono">
              Total Orders
            </span>
            <div className="w-8 h-8 rounded-xl neu-inset flex items-center justify-center text-[#C5A880]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-3xl font-medium text-[#F5F7FA]">
            {totalOrdersCount}
          </p>
          <p className="text-[11px] text-[#8A95A5]">
            {orders.filter((o) => o.status === "confirmed" || o.status === "pending").length} awaiting fulfillment
          </p>
        </div>

        {/* AOV */}
        <div className="p-6 rounded-2xl neu-raised space-y-3">
          <div className="flex items-center justify-between">
            <span className="uppercase tracking-widest text-[10px] text-[#8A95A5] font-mono">
              Average Order Value
            </span>
            <div className="w-8 h-8 rounded-xl neu-inset flex items-center justify-center text-[#C5A880]">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-3xl font-medium text-[#F5F7FA]">
            {formatINR(aov)}
          </p>
          <p className="text-[11px] text-[#8A95A5]">
            {totalOrdersCount > 0 ? "Haute luxury ticket size" : "Calculated from completed orders"}
          </p>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-6 rounded-2xl neu-raised space-y-3">
          <div className="flex items-center justify-between">
            <span className="uppercase tracking-widest text-[10px] text-[#8A95A5] font-mono">
              Low Stock Threshold
            </span>
            <div className="w-8 h-8 rounded-xl neu-inset flex items-center justify-center text-[#F59E0B]">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-3xl font-medium text-[#F59E0B]">
            {lowStockItems.length} SKUs
          </p>
          <p className="text-[11px] text-[#8A95A5]">
            {products.length === 0 ? "Catalog is currently empty" : "Stock level ≤ 10 units"}
          </p>
        </div>
      </div>

      {/* Analytics Visual Section: Trajectory & Category Share */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Bars Panel */}
        <div className="lg:col-span-8 p-6 rounded-3xl neu-raised space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.04]">
            <div>
              <h3 className="font-serif text-lg text-[#F5F7FA] uppercase tracking-wider">
                Monthly Revenue Performance
              </h3>
              <p className="text-xs text-[#8A95A5]">Historical trajectory over the last 6 months (in Lakhs)</p>
            </div>
            <span className="text-xs font-mono text-[#C5A880] px-3 py-1 rounded-lg neu-inset-sm">
              FY 2025–26
            </span>
          </div>

          {totalRevenue === 0 ? (
            <div className="h-48 rounded-2xl neu-inset flex flex-col items-center justify-center text-center p-6 border border-white/[0.02]">
              <p className="text-xs font-serif uppercase tracking-widest text-[#F5F7FA]">
                No Revenue Captured in Current Period
              </p>
              <p className="text-[11px] text-[#8A95A5] mt-1 max-w-sm">
                As transactions occur through the atelier storefront, revenue bars and monthly comparisons will chart dynamically here.
              </p>
            </div>
          ) : (
            <div className="h-48 rounded-2xl neu-inset p-4 flex items-end justify-between gap-4">
              {[
                { month: "Oct", val: 0, display: "₹0" },
                { month: "Nov", val: 0, display: "₹0" },
                { month: "Dec", val: 0, display: "₹0" },
                { month: "Jan", val: 0, display: "₹0" },
                { month: "Feb", val: 0, display: "₹0" },
                { month: "Mar", val: Math.min(100, Math.round((totalRevenue / 100000) * 10)), display: formatINR(totalRevenue) },
              ].map((col) => (
                <div key={col.month} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-mono text-[#8A95A5] opacity-0 group-hover:opacity-100 transition-opacity">
                    {col.display}
                  </span>
                  <div className="w-full bg-[#121419] rounded-lg h-32 flex items-end overflow-hidden p-0.5">
                    <div
                      className="w-full bg-gradient-to-t from-[#8C6B37] to-[#C5A880] rounded-md transition-all duration-700 group-hover:brightness-125"
                      style={{ height: `${col.val}%` }}
                    />
                  </div>
                  <span className="text-[11px] uppercase tracking-wider text-[#8A95A5] font-mono">
                    {col.month}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Share Panel */}
        <div className="lg:col-span-4 p-6 rounded-3xl neu-raised space-y-4">
          <h3 className="font-serif text-lg text-[#F5F7FA] uppercase tracking-wider pb-4 border-b border-white/[0.04]">
            Revenue by Realm
          </h3>

          {totalRevenue === 0 ? (
            <div className="h-48 rounded-2xl neu-inset flex flex-col items-center justify-center text-center p-6 border border-white/[0.02]">
              <p className="text-xs font-serif uppercase tracking-widest text-[#F5F7FA]">
                No Realm Sales Recorded
              </p>
              <p className="text-[11px] text-[#8A95A5] mt-1">
                Category distribution will activate once client orders are completed.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5 text-xs">
              {[
                { name: "Handbags & Clutches", percent: 0, color: "bg-[#C5A880]" },
                { name: "Haute Parfumerie", percent: 0, color: "bg-[#10B981]" },
                { name: "Fine Jewellery", percent: 0, color: "bg-[#F59E0B]" },
                { name: "Artisanal Apparel", percent: 0, color: "bg-[#6366F1]" },
                { name: "Charms & Accessories", percent: 0, color: "bg-[#EC4899]" },
              ].map((cat) => (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex justify-between text-[#EDEDED]">
                    <span>{cat.name}</span>
                    <span className="font-mono text-[#8A95A5]">{cat.percent}%</span>
                  </div>
                  <div className="w-full neu-inset-sm h-2 rounded-full overflow-hidden p-0.5">
                    <div className={`h-full rounded-full ${cat.color}`} style={{ width: `${cat.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders Table - Neumorphic Cavity */}
      <div className="p-6 rounded-3xl neu-raised space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.04]">
          <h3 className="font-serif text-lg text-[#F5F7FA] uppercase tracking-wider">
            Recent Client Orders &amp; Status Controls
          </h3>
          <span className="text-xs text-[#8A95A5] font-mono px-3 py-1 rounded-lg neu-inset-sm">
            {orders.length} Active Orders
          </span>
        </div>

        <div className="rounded-2xl neu-inset overflow-hidden border border-white/[0.02]">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase tracking-widest text-[#8A95A5] bg-[#12151c]/60 border-b border-white/[0.03]">
              <tr>
                <th className="p-4">Order Number</th>
                <th className="p-4">Patron Name</th>
                <th className="p-4">Date</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Current Status</th>
                <th className="p-4 text-right">Fulfillment Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02] text-[#EDEDED]">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-[#8A95A5]">
                    <div className="max-w-md mx-auto space-y-2">
                      <div className="w-12 h-12 rounded-2xl neu-raised mx-auto flex items-center justify-center text-[#C5A880]/60">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-medium text-[#F5F7FA]">No client orders placed yet</p>
                      <p className="text-[11px] text-[#8A95A5]">
                        As patrons place orders in the atelier storefront, they will stream into this console in real time with end-to-end fulfillment controls.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-mono font-medium text-[#C5A880]">
                      {order.order_number}
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-[#F5F7FA]">{order.customer_name}</p>
                      <p className="text-[10px] text-[#8A95A5] font-mono">{order.customer_email}</p>
                    </td>
                    <td className="p-4 text-[#8A95A5]">{formatDate(order.created_at)}</td>
                    <td className="p-4 font-semibold text-[#F5F7FA]">
                      {formatINR(order.total)}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg neu-inset-sm text-[#10B981] text-[10px] uppercase font-bold font-mono">
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-lg text-[10px] uppercase tracking-wider font-semibold ${
                          order.status === "delivered"
                            ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30"
                            : order.status === "shipped"
                            ? "bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/30"
                            : "neu-inset-sm text-[#C5A880]"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value as OrderStatus)
                        }
                        className="rounded-xl neu-btn text-[#EDEDED] px-3 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50"
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
