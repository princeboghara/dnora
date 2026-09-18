"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Package,
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Plus,
  Printer,
  Trash2,
  ExternalLink,
  Eye,
  Loader2,
  RefreshCw,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { Order, OrderStatus } from "@/types";
import { formatPrice, cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

const STATUS_TABS: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { label: "All Orders", value: "all", icon: Package },
  { label: "Processing", value: "processing", icon: Clock },
  { label: "Confirmed", value: "confirmed", icon: CheckCircle2 },
  { label: "Shipped", value: "shipped", icon: Truck },
  { label: "Delivered", value: "delivered", icon: CheckCircle2 },
  { label: "Cancelled", value: "cancelled", icon: XCircle },
];

function AdminOrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [creatingTest, setCreatingTest] = useState(false);

  // Filter & Search states
  const initialStatus = searchParams.get("status") || "all";
  const [activeTab, setActiveTab] = useState(initialStatus);
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  // Delete modal state
  const [deleteModalOrder, setDeleteModalOrder] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== "all") params.set("status", activeTab);
      if (appliedSearch.trim()) params.set("search", appliedSearch.trim());
      params.set("limit", "50");

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders(data.orders || []);
        setTotal(data.total || 0);
      } else {
        showToast(data.error || "Failed to load orders", "error");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      showToast("Network error while fetching orders", "error");
    } finally {
      setLoading(false);
    }
  }, [activeTab, appliedSearch, showToast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    const params = new URLSearchParams(window.location.search);
    if (val === "all") {
      params.delete("status");
    } else {
      params.set("status", val);
    }
    router.replace(`/admin/orders?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(searchQuery);
  };

  const handleCreateTestOrder = async () => {
    setCreatingTest(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ createTestOrder: true }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Test order ${data.order.order_number} created successfully!`, "success");
        fetchOrders();
      } else {
        showToast(data.error || "Failed to create test order", "error");
      }
    } catch {
      showToast("Failed to create test order", "error");
    } finally {
      setCreatingTest(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!deleteModalOrder) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/orders/${deleteModalOrder.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Order ${deleteModalOrder.order_number} deleted successfully`, "success");
        setDeleteModalOrder(null);
        fetchOrders();
      } else {
        showToast(data.error || "Failed to delete order", "error");
      }
    } catch {
      showToast("Failed to delete order", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Status badge styling helper
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "processing":
        return "bg-[#FFF9E6] text-[#B7791F] border-[#FBD38D]";
      case "confirmed":
        return "bg-[#EBF8FF] text-[#2B6CB0] border-[#BEE3F8]";
      case "shipped":
        return "bg-[#F3E8FF] text-[#6B46C1] border-[#D6BCFA]";
      case "delivered":
        return "bg-[#F0FFF4] text-[#2F855A] border-[#9AE6B4]";
      case "cancelled":
        return "bg-[#FFF5F5] text-[#C53030] border-[#FEB2B2]";
      default:
        return "bg-[#EDF2F7] text-[#4A5568] border-[#CBD5E0]";
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "paid":
        return "text-[#2F855A] bg-[#F0FFF4] border-[#9AE6B4]";
      case "pending":
        return "text-[#B7791F] bg-[#FFF9E6] border-[#FBD38D]";
      case "failed":
        return "text-[#C53030] bg-[#FFF5F5] border-[#FEB2B2]";
      case "refunded":
        return "text-[#4A5568] bg-[#EDF2F7] border-[#CBD5E0]";
      default:
        return "text-[#4A5568] bg-[#EDF2F7] border-[#CBD5E0]";
    }
  };

  // Calculate local stats
  const processingCount = orders.filter((o) => o.status === "processing").length;
  const deliveredCount = orders.filter((o) => o.status === "delivered").length;
  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E5DE]">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-[#0E0E0E] font-semibold block mb-1">
            Order Fulfillment
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0E0E0E] tracking-tight">
            Client Acquisitions & Orders
          </h1>
          <p className="text-xs text-[#73706A] mt-1">
            Track customer orders, manage white-glove dispatch, and generate certified PDF tax invoices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="p-2.5 bg-white border border-[#E8E5DE] rounded-sm hover:bg-[#F5F3EF] text-[#73706A] transition-colors"
            title="Refresh Orders"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>

          <button
            onClick={handleCreateTestOrder}
            disabled={creatingTest}
            className="px-4 py-2.5 bg-[#0E0E0E] text-[#FAF9F6] text-xs font-semibold uppercase tracking-[0.16em] rounded-sm hover:bg-[#262626] transition-all shadow-xs flex items-center gap-2 disabled:opacity-50"
          >
            {creatingTest ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#0E0E0E]" />
            ) : (
              <Plus className="w-4 h-4 text-[#0E0E0E]" />
            )}
            <span>Create Test Order</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-sm border border-[#E8E5DE] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#73706A]">
              Total Orders
            </span>
            <div className="w-8 h-8 rounded-full bg-[#FAF9F6] border border-[#E8E5DE] flex items-center justify-center text-[#0E0E0E]">
              <Package className="w-4 h-4 text-[#0E0E0E]" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0E0E0E]">
              {total}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-sm border border-[#E8E5DE] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#B7791F]">
              Action Needed
            </span>
            <div className="w-8 h-8 rounded-full bg-[#FFF9E6] border border-[#FBD38D] flex items-center justify-center text-[#B7791F]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-heading font-extrabold text-[#B7791F]">
              {processingCount}
            </span>
            <span className="text-[11px] text-[#73706A] ml-2 font-medium">Processing</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-sm border border-[#E8E5DE] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#2F855A]">
              Delivered
            </span>
            <div className="w-8 h-8 rounded-full bg-[#F0FFF4] border border-[#9AE6B4] flex items-center justify-center text-[#2F855A]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-heading font-extrabold text-[#2F855A]">
              {deliveredCount}
            </span>
            <span className="text-[11px] text-[#73706A] ml-2 font-medium">Fulfilled</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-sm border border-[#E8E5DE] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0E0E0E]">
              Total Volume
            </span>
            <div className="w-8 h-8 rounded-full bg-[#FAF9F6] border border-[#E8E5DE] flex items-center justify-center text-[#0E0E0E]">
              <TrendingUp className="w-4 h-4 text-[#0E0E0E]" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-heading font-extrabold text-[#0E0E0E]">
              {formatPrice(totalRevenue)}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="bg-white rounded-sm border border-[#E8E5DE] p-4 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {STATUS_TABS.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => handleTabChange(tab.value)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-sm whitespace-nowrap transition-colors",
                    isActive
                      ? "bg-[#0E0E0E] text-[#FAF9F6]"
                      : "bg-[#FAF9F6] text-[#73706A] hover:bg-[#F5F3EF] hover:text-[#0E0E0E]"
                  )}
                >
                  <TabIcon className={cn("w-3.5 h-3.5", isActive ? "text-[#0E0E0E]" : "text-[#73706A]")} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-[#73706A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search order #, customer, email..."
              className="w-full pl-9 pr-3 py-2 bg-[#FAF9F6] border border-[#E8E5DE] rounded-sm text-xs text-[#0E0E0E] placeholder-[#73706A] focus:outline-none focus:border-[#0E0E0E]"
            />
          </form>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-sm border border-[#E8E5DE] overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#0E0E0E]" />
            <span className="text-xs uppercase tracking-widest text-[#73706A] mt-3">
              Loading client orders...
            </span>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center px-4">
            <div className="w-16 h-16 bg-[#FAF9F6] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#E8E5DE]">
              <Package className="w-8 h-8 text-[#73706A]" />
            </div>
            <h3 className="text-base font-heading font-bold text-[#0E0E0E] mb-1">
              No orders found
            </h3>
            <p className="text-xs text-[#73706A] max-w-sm mx-auto mb-6">
              {appliedSearch
                ? `No orders matching "${appliedSearch}". Try clearing your search query.`
                : "There are currently no orders in this category. Click below to generate a test order."}
            </p>
            <button
              onClick={handleCreateTestOrder}
              disabled={creatingTest}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0E0E0E] text-[#FAF9F6] text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#262626] transition-colors"
            >
              <Plus className="w-4 h-4 text-[#0E0E0E]" />
              <span>Create First Test Order</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F6] border-b border-[#E8E5DE] text-[11px] uppercase tracking-wider font-semibold text-[#73706A]">
                <tr>
                  <th className="py-3.5 px-4">Order Ref</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Items</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Fulfillment</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5DE]">
                {orders.map((order) => {
                  const orderDate = new Date(order.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });
                  const itemsCount = (order.items || []).reduce((acc, it) => acc + (it.quantity || 1), 0);

                  return (
                    <tr key={order.id} className="hover:bg-[#FCFBF9] transition-colors">
                      {/* Order Number */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-mono font-bold text-[#0E0E0E] hover:text-[#73706A] transition-colors"
                        >
                          {order.order_number}
                        </Link>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#0E0E0E]">{order.customer_name}</div>
                        <div className="text-[11px] text-[#73706A]">{order.customer_email}</div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-[#73706A]">
                        {orderDate}
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-medium text-[#0E0E0E]">
                          {itemsCount} {itemsCount === 1 ? "item" : "items"}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-semibold text-[#0E0E0E]">
                        {formatPrice(order.total_amount)}
                      </td>

                      {/* Payment Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={cn(
                            "px-2 py-0.5 border rounded-full text-[10px] font-semibold uppercase tracking-wider",
                            getPaymentBadge(order.payment_status)
                          )}
                        >
                          {order.payment_status}
                        </span>
                      </td>

                      {/* Fulfillment Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 border rounded-full text-[10px] font-semibold uppercase tracking-wider",
                            getStatusBadge(order.status)
                          )}
                        >
                          {order.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Invoice Button */}
                          <Link
                            href={`/admin/orders/${order.id}/invoice`}
                            className="p-1.5 text-[#73706A] hover:text-[#0E0E0E] hover:bg-[#FAF9F6] border border-transparent hover:border-[#E8E5DE] rounded-sm transition-colors"
                            title="Generate & Print Invoice (PDF)"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </Link>

                          {/* View Button */}
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="p-1.5 text-[#73706A] hover:text-[#0E0E0E] hover:bg-[#FAF9F6] border border-transparent hover:border-[#E8E5DE] rounded-sm transition-colors"
                            title="View Order Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          {/* Delete Button */}
                          <button
                            onClick={() => setDeleteModalOrder(order)}
                            className="p-1.5 text-[#73706A] hover:text-[#C53030] hover:bg-[#FCF0F0] border border-transparent hover:border-[#F5C2C2] rounded-sm transition-colors"
                            title="Delete Order"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-sm border border-[#E8E5DE] p-6 max-w-md w-full shadow-lg space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FCF0F0] border border-[#F5C2C2] flex items-center justify-center shrink-0 text-[#C53030]">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-heading font-bold text-[#0E0E0E]">
                  Delete Order {deleteModalOrder.order_number}?
                </h3>
                <p className="text-xs text-[#73706A] mt-1 leading-relaxed">
                  Are you sure you want to permanently remove this acquisition record for{" "}
                  <strong className="text-[#0E0E0E]">{deleteModalOrder.customer_name}</strong>? All
                  associated order items and history will be deleted. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOrder(null)}
                disabled={isDeleting}
                className="px-4 py-2 border border-[#E8E5DE] text-xs font-semibold text-[#73706A] hover:bg-[#FAF9F6] rounded-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteOrder}
                disabled={isDeleting}
                className="px-4 py-2 bg-[#C53030] hover:bg-[#9B2C2C] text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Order</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#0E0E0E]" />
          <span className="text-xs uppercase tracking-widest text-[#73706A] mt-3">
            Loading client orders...
          </span>
        </div>
      }
    >
      <AdminOrdersContent />
    </Suspense>
  );
}

