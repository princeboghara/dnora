"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  MapPin,
  User as UserIcon,
  LogOut,
  ExternalLink,
  CheckCircle2,
  Clock,
  Truck,
  Plus,
  Trash2,
  Star,
  Copy,
  Check,
  ChevronRight,
  Shield,
  ShoppingBag,
} from "lucide-react";
import { UserSession } from "@/lib/auth/user-session";
import { Order, UserAddress } from "@/types";
import { useToast } from "@/components/ui/Toast";

interface AccountClientProps {
  user: UserSession;
  initialOrders: Order[];
  initialAddresses: UserAddress[];
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDisplayDate(dateVal?: string | Date | null): string {
  if (!dateVal) return "";
  try {
    const d = typeof dateVal === "string" ? new Date(dateVal) : dateVal;
    if (isNaN(d.getTime())) return "";
    return `${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
  } catch {
    return "";
  }
}

export function AccountClient({
  user,
  initialOrders,
  initialAddresses,
}: AccountClientProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"orders" | "addresses" | "profile">("orders");
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [addresses, setAddresses] = useState<UserAddress[]>(initialAddresses);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(
    initialOrders[0] || null
  );

  // Address form modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [newAddress, setNewAddress] = useState({
    full_name: user.full_name || "",
    phone: user.phone || "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
    is_default: false,
  });

  const handleCopyTracking = (trackingNum: string) => {
    navigator.clipboard.writeText(trackingNum);
    setCopiedTracking(true);
    showToast("Tracking number copied to clipboard", "info");
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      showToast("Signed out safely", "info");
      router.push("/");
      router.refresh();
    } catch {
      router.push("/");
    }
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressLoading(true);

    try {
      const res = await fetch("/api/account/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddress),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save address");
      }

      showToast("Delivery address saved", "success");
      if (data.address.is_default) {
        setAddresses((prev) => [
          data.address,
          ...prev.map((a) => ({ ...a, is_default: false })),
        ]);
      } else {
        setAddresses((prev) => [data.address, ...prev]);
      }

      setShowAddressModal(false);
      setNewAddress({
        full_name: user.full_name || "",
        phone: user.phone || "",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        postal_code: "",
        country: "India",
        is_default: false,
      });
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setAddressLoading(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/account/address/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
        showToast("Address removed", "info");
      }
    } catch {
      showToast("Failed to remove address", "error");
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/account/address/${id}`, {
        method: "PATCH",
      });
      if (res.ok) {
        setAddresses((prev) =>
          prev.map((a) => ({ ...a, is_default: a.id === id }))
        );
        showToast("Default address updated", "success");
      }
    } catch {
      showToast("Failed to update default address", "error");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Top Banner / Client Welcome */}
      <div className="bg-[#0E0E0E] text-[#FAF9F6] p-6 sm:p-10 rounded-sm mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880] font-semibold">
              DNORA Privé Member
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
            <span className="text-[10px] uppercase tracking-widest text-[#A8A5A0]">
              Active Session
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-heading font-extrabold tracking-tight">
            Welcome, {user.full_name || "Valued Client"}
          </h1>
          <p className="text-xs sm:text-sm text-[#A8A5A0] mt-1 font-mono">
            {user.email}
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          {user.role === "admin" && (
            <Link
              href="/admin"
              className="px-4 py-2.5 bg-[#C5A880] text-[#0E0E0E] rounded-sm text-xs font-semibold uppercase tracking-wider hover:bg-[#B39366] transition-colors"
            >
              Admin Dashboard
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 border border-white/20 rounded-sm text-xs font-semibold uppercase tracking-wider text-white hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>

        {/* Decorative Luxury Watermark */}
        <div className="absolute right-4 bottom-[-20px] text-white/5 font-heading text-8xl font-black select-none pointer-events-none">
          DNORA
        </div>
      </div>

      {/* Main Account Portal Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <nav className="bg-white border border-[#E8E5DE] rounded-sm p-2 space-y-1">
            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center justify-between px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-sm transition-all ${
                activeTab === "orders"
                  ? "bg-[#0E0E0E] text-[#FAF9F6]"
                  : "text-[#73706A] hover:bg-[#F5F3EF] hover:text-[#0E0E0E]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4" />
                <span>Orders & Tracking</span>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full ${
                  activeTab === "orders"
                    ? "bg-white/20 text-white"
                    : "bg-[#F5F3EF] text-[#0E0E0E]"
                }`}
              >
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("addresses")}
              className={`w-full flex items-center justify-between px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-sm transition-all ${
                activeTab === "addresses"
                  ? "bg-[#0E0E0E] text-[#FAF9F6]"
                  : "text-[#73706A] hover:bg-[#F5F3EF] hover:text-[#0E0E0E]"
              }`}
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4" />
                <span>Saved Addresses</span>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full ${
                  activeTab === "addresses"
                    ? "bg-white/20 text-white"
                    : "bg-[#F5F3EF] text-[#0E0E0E]"
                }`}
              >
                {addresses.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center justify-between px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-sm transition-all ${
                activeTab === "profile"
                  ? "bg-[#0E0E0E] text-[#FAF9F6]"
                  : "text-[#73706A] hover:bg-[#F5F3EF] hover:text-[#0E0E0E]"
              }`}
            >
              <div className="flex items-center gap-3">
                <UserIcon className="w-4 h-4" />
                <span>Profile & Privé</span>
              </div>
            </button>
          </nav>

          {/* Luxury Client Support Box */}
          <div className="bg-[#FAF9F6] border border-[#E8E5DE] p-5 rounded-sm">
            <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-bold block mb-1">
              Concierge Service
            </span>
            <h4 className="text-sm font-bold text-[#0E0E0E]">
              Dedicated Client Advisor
            </h4>
            <p className="text-xs text-[#73706A] mt-1 leading-relaxed">
              Need assistance with an existing order or customized atelier tailoring?
            </p>
            <div className="mt-4 pt-3 border-t border-[#E8E5DE] text-xs font-semibold text-[#0E0E0E]">
              concierge@dnora.luxury
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {/* ================= TAB 1: ORDERS & TRACKING ================= */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#E8E5DE]">
                <div>
                  <h2 className="text-xl font-heading font-bold text-[#0E0E0E]">
                    Order Tracking & History
                  </h2>
                  <p className="text-xs text-[#73706A] mt-0.5">
                    Real-time status updates, logistics tracking, and delivery timelines.
                  </p>
                </div>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#C5A880] hover:text-[#0E0E0E] transition-colors"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Explore Silhouettes
                </Link>
              </div>

              {orders.length === 0 ? (
                <div className="bg-white border border-[#E8E5DE] p-12 text-center rounded-sm">
                  <Package className="w-12 h-12 text-[#C5A880] mx-auto mb-3 stroke-[1.5]" />
                  <h3 className="text-base font-bold text-[#0E0E0E]">No Orders Yet</h3>
                  <p className="text-xs text-[#73706A] mt-1 max-w-sm mx-auto">
                    When you order a handcrafted DNORA piece, its tracking journey and delivery timeline will appear here.
                  </p>
                  <Link
                    href="/shop"
                    className="mt-5 inline-block px-6 py-2.5 bg-[#0E0E0E] text-[#FAF9F6] text-xs font-semibold uppercase tracking-widest rounded-sm hover:bg-[#262626] transition-colors"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Order List */}
                  <div className="grid grid-cols-1 gap-4">
                    {orders.map((order) => {
                      const isSelected = selectedOrder?.id === order.id;
                      return (
                        <div
                          key={order.id}
                          className={`bg-white border rounded-sm transition-all overflow-hidden ${
                            isSelected
                              ? "border-[#0E0E0E] shadow-sm ring-1 ring-[#0E0E0E]"
                              : "border-[#E8E5DE] hover:border-[#C5A880]"
                          }`}
                        >
                          {/* Order Header Summary */}
                          <div
                            onClick={() => setSelectedOrder(order)}
                            className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer bg-white hover:bg-[#FAF9F6] transition-colors"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                <span className="font-mono font-bold text-sm text-[#0E0E0E]">
                                  {order.order_number}
                                </span>
                                <span
                                  className={`text-[10px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full ${
                                    order.status === "delivered"
                                      ? "bg-[#E6F4EA] text-[#137333]"
                                      : order.status === "shipped"
                                      ? "bg-[#E8F0FE] text-[#1A73E8]"
                                      : "bg-[#FEF7E0] text-[#B06000]"
                                  }`}
                                >
                                  {order.status}
                                </span>
                              </div>
                              <div className="text-xs text-[#73706A]">
                                Placed on {formatDisplayDate(order.created_at)}
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-6">
                              <div className="text-right">
                                <span className="text-[10px] text-[#73706A] uppercase tracking-wider block">
                                  Total
                                </span>
                                <span className="text-sm font-bold text-[#0E0E0E]">
                                  ${order.total_amount.toFixed(2)}
                                </span>
                              </div>
                              <button
                                type="button"
                                className="text-xs text-[#0E0E0E] font-semibold flex items-center gap-1 hover:text-[#C5A880]"
                              >
                                {isSelected ? "Viewing Details" : "Track Order"}
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Selected Order Tracking Detail Panel */}
                          {isSelected && (
                            <div className="border-t border-[#E8E5DE] p-5 sm:p-7 bg-[#FAF9F6] space-y-6">
                              {/* Visual Tracking Stepper */}
                              <div>
                                <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-bold block mb-4">
                                  Delivery Progress
                                </span>

                                <div className="grid grid-cols-4 gap-2 relative">
                                  {/* Step 1 */}
                                  <div className="flex flex-col items-center text-center">
                                    <div className="w-8 h-8 rounded-full bg-[#0E0E0E] text-white flex items-center justify-center text-xs font-bold mb-2">
                                      <CheckCircle2 className="w-4 h-4 text-[#C5A880]" />
                                    </div>
                                    <span className="text-[11px] font-bold text-[#0E0E0E]">
                                      Confirmed
                                    </span>
                                    <span className="text-[10px] text-[#73706A] hidden sm:block">
                                      Verified
                                    </span>
                                  </div>

                                  {/* Step 2 */}
                                  <div className="flex flex-col items-center text-center">
                                    <div className="w-8 h-8 rounded-full bg-[#0E0E0E] text-white flex items-center justify-center text-xs font-bold mb-2">
                                      <Clock className="w-4 h-4 text-[#C5A880]" />
                                    </div>
                                    <span className="text-[11px] font-bold text-[#0E0E0E]">
                                      Packaging
                                    </span>
                                    <span className="text-[10px] text-[#73706A] hidden sm:block">
                                      Atelier Handcrafted
                                    </span>
                                  </div>

                                  {/* Step 3 */}
                                  <div className="flex flex-col items-center text-center">
                                    <div
                                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-2 ${
                                        order.status === "shipped" ||
                                        order.status === "delivered"
                                          ? "bg-[#0E0E0E] text-white"
                                          : "bg-[#E8E5DE] text-[#73706A]"
                                      }`}
                                    >
                                      <Truck className="w-4 h-4 text-[#C5A880]" />
                                    </div>
                                    <span className="text-[11px] font-bold text-[#0E0E0E]">
                                      In Transit
                                    </span>
                                    <span className="text-[10px] text-[#73706A] hidden sm:block">
                                      Air Courier
                                    </span>
                                  </div>

                                  {/* Step 4 */}
                                  <div className="flex flex-col items-center text-center">
                                    <div
                                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-2 ${
                                        order.status === "delivered"
                                          ? "bg-[#137333] text-white"
                                          : "bg-[#E8E5DE] text-[#73706A]"
                                      }`}
                                    >
                                      <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                    <span className="text-[11px] font-bold text-[#0E0E0E]">
                                      Delivered
                                    </span>
                                    <span className="text-[10px] text-[#73706A] hidden sm:block">
                                      Direct to Door
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Logistics Carrier Card */}
                              {order.tracking_number && (
                                <div className="bg-white border border-[#E8E5DE] p-4 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                  <div>
                                    <span className="text-[10px] uppercase tracking-wider text-[#73706A] block">
                                      Courier & Tracking
                                    </span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-xs font-bold text-[#0E0E0E]">
                                        {order.carrier || "Blue Dart Express"}
                                      </span>
                                      <span className="text-xs font-mono text-[#73706A]">
                                        ({order.tracking_number})
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleCopyTracking(order.tracking_number!)
                                      }
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F3EF] hover:bg-[#E8E5DE] text-[#0E0E0E] text-[11px] font-semibold uppercase tracking-wider rounded-sm transition-colors"
                                    >
                                      {copiedTracking ? (
                                        <>
                                          <Check className="w-3.5 h-3.5 text-[#137333]" />
                                          Copied
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3.5 h-3.5" />
                                          Copy Number
                                        </>
                                      )}
                                    </button>

                                    {order.estimated_delivery && (
                                      <span className="text-xs text-[#73706A]">
                                        Est. Arrival:{" "}
                                        <strong className="text-[#0E0E0E]">
                                          {formatDisplayDate(order.estimated_delivery)}
                                        </strong>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Order Items */}
                              <div>
                                <span className="text-[10px] uppercase tracking-widest text-[#73706A] font-bold block mb-3">
                                  Items in Order
                                </span>
                                <div className="space-y-3">
                                  {order.items?.map((item) => (
                                    <div
                                      key={item.id}
                                      className="bg-white border border-[#E8E5DE] p-3 rounded-sm flex items-center justify-between gap-4"
                                    >
                                      <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 relative bg-[#F5F3EF] rounded-sm overflow-hidden shrink-0">
                                          {item.image_url ? (
                                            <Image
                                              src={item.image_url}
                                              alt={item.product_name}
                                              fill
                                              className="object-cover"
                                            />
                                          ) : (
                                            <Package className="w-6 h-6 text-[#73706A] m-auto" />
                                          )}
                                        </div>
                                        <div>
                                          <h4 className="text-xs font-bold text-[#0E0E0E]">
                                            {item.product_name}
                                          </h4>
                                          <span className="text-[11px] text-[#73706A]">
                                            Qty: {item.quantity} × ${Number(item.price).toFixed(2)}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="text-right font-bold text-xs text-[#0E0E0E]">
                                        ${(Number(item.price) * item.quantity).toFixed(2)}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Shipping Address Information */}
                              {order.shipping_address && (
                                <div className="bg-white border border-[#E8E5DE] p-4 rounded-sm">
                                  <span className="text-[10px] uppercase tracking-widest text-[#73706A] font-bold block mb-1">
                                    Delivery Address
                                  </span>
                                  <p className="text-xs text-[#0E0E0E] font-semibold">
                                    {order.shipping_address.full_name} ({order.shipping_address.phone})
                                  </p>
                                  <p className="text-xs text-[#73706A] mt-0.5">
                                    {order.shipping_address.address_line1}
                                    {order.shipping_address.address_line2 &&
                                      `, ${order.shipping_address.address_line2}`}
                                    , {order.shipping_address.city},{" "}
                                    {order.shipping_address.state}{" "}
                                    {order.shipping_address.postal_code},{" "}
                                    {order.shipping_address.country}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 2: SAVED ADDRESSES ================= */}
          {activeTab === "addresses" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#E8E5DE]">
                <div>
                  <h2 className="text-xl font-heading font-bold text-[#0E0E0E]">
                    Saved Delivery Addresses
                  </h2>
                  <p className="text-xs text-[#73706A] mt-0.5">
                    Manage your residences, ateliers, and primary shipping destinations.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0E0E0E] text-[#FAF9F6] text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#262626] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Address
                </button>
              </div>

              {/* Address List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="bg-white border border-[#E8E5DE] p-5 rounded-sm flex flex-col justify-between space-y-4 hover:border-[#0E0E0E] transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-[#0E0E0E]">
                          {addr.full_name}
                        </span>
                        {addr.is_default && (
                          <span className="text-[10px] uppercase tracking-wider font-bold bg-[#FAF9F6] text-[#C5A880] border border-[#C5A880]/30 px-2 py-0.5 rounded-sm">
                            Primary Address
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#73706A] leading-relaxed">
                        {addr.address_line1}
                        {addr.address_line2 && <><br />{addr.address_line2}</>}
                        <br />
                        {addr.city}, {addr.state} {addr.postal_code}
                        <br />
                        {addr.country}
                      </p>

                      <p className="text-xs font-mono text-[#73706A] mt-2">
                        Phone: {addr.phone}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#E8E5DE] flex items-center justify-between">
                      {!addr.is_default ? (
                        <button
                          type="button"
                          onClick={() => handleSetDefaultAddress(addr.id)}
                          className="text-xs text-[#C5A880] hover:text-[#0E0E0E] font-semibold uppercase tracking-wider transition-colors"
                        >
                          Set as Primary
                        </button>
                      ) : (
                        <span className="text-xs text-[#137333] font-semibold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          Default
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-xs text-[#C53030] hover:text-red-700 font-semibold p-1"
                        title="Delete Address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 3: CLIENT PROFILE ================= */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[#E8E5DE]">
                <h2 className="text-xl font-heading font-bold text-[#0E0E0E]">
                  Client Profile & Privileges
                </h2>
                <p className="text-xs text-[#73706A] mt-0.5">
                  Your credentials and security settings.
                </p>
              </div>

              <div className="bg-white border border-[#E8E5DE] p-6 sm:p-8 rounded-sm space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[#73706A] font-semibold mb-1">
                      Full Name
                    </label>
                    <div className="text-sm font-bold text-[#0E0E0E]">
                      {user.full_name || "Valued Client"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[#73706A] font-semibold mb-1">
                      Email Address
                    </label>
                    <div className="text-sm font-bold text-[#0E0E0E] font-mono">
                      {user.email}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[#73706A] font-semibold mb-1">
                      Membership Status
                    </label>
                    <div className="inline-flex items-center gap-1 text-xs font-bold text-[#C5A880]">
                      <Star className="w-3.5 h-3.5 fill-[#C5A880]" />
                      DNORA Privé Gold Tier
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[#73706A] font-semibold mb-1">
                      Session Security
                    </label>
                    <div className="inline-flex items-center gap-1 text-xs font-bold text-[#137333]">
                      <Shield className="w-3.5 h-3.5" />
                      HTTP-Only Encrypted
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#E8E5DE] flex items-center justify-between">
                  <span className="text-xs text-[#73706A]">
                    Manage authentication & devices
                  </span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-4 py-2 border border-[#0E0E0E] text-[#0E0E0E] hover:bg-[#0E0E0E] hover:text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors"
                  >
                    Sign Out Session
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Address Form Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white max-w-lg w-full p-6 sm:p-8 rounded-sm border border-[#E8E5DE] shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E5DE]">
              <h3 className="text-lg font-heading font-bold text-[#0E0E0E]">
                Add Delivery Address
              </h3>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="text-[#73706A] hover:text-[#0E0E0E] text-xs font-semibold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateAddress} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#0E0E0E] mb-1">
                    Recipient Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddress.full_name}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, full_name: e.target.value })
                    }
                    placeholder="Eleanor Vance"
                    className="w-full px-3 py-2 border border-[#D5D2CA] rounded-sm text-xs text-[#0E0E0E] focus:outline-none focus:border-[#0E0E0E]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#0E0E0E] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={newAddress.phone}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, phone: e.target.value })
                    }
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 border border-[#D5D2CA] rounded-sm text-xs text-[#0E0E0E] focus:outline-none focus:border-[#0E0E0E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#0E0E0E] mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  value={newAddress.address_line1}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, address_line1: e.target.value })
                  }
                  placeholder="Apartment, suite, unit, building, floor"
                  className="w-full px-3 py-2 border border-[#D5D2CA] rounded-sm text-xs text-[#0E0E0E] focus:outline-none focus:border-[#0E0E0E]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#0E0E0E] mb-1">
                  Apartment, Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={newAddress.address_line2}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, address_line2: e.target.value })
                  }
                  placeholder="Near Oberoi Mall"
                  className="w-full px-3 py-2 border border-[#D5D2CA] rounded-sm text-xs text-[#0E0E0E] focus:outline-none focus:border-[#0E0E0E]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#0E0E0E] mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddress.city}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, city: e.target.value })
                    }
                    placeholder="Mumbai"
                    className="w-full px-3 py-2 border border-[#D5D2CA] rounded-sm text-xs text-[#0E0E0E] focus:outline-none focus:border-[#0E0E0E]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#0E0E0E] mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddress.state}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, state: e.target.value })
                    }
                    placeholder="Maharashtra"
                    className="w-full px-3 py-2 border border-[#D5D2CA] rounded-sm text-xs text-[#0E0E0E] focus:outline-none focus:border-[#0E0E0E]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#0E0E0E] mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddress.postal_code}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, postal_code: e.target.value })
                    }
                    placeholder="400066"
                    className="w-full px-3 py-2 border border-[#D5D2CA] rounded-sm text-xs text-[#0E0E0E] focus:outline-none focus:border-[#0E0E0E]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_default"
                  checked={newAddress.is_default}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, is_default: e.target.checked })
                  }
                  className="rounded border-[#D5D2CA] text-[#0E0E0E] focus:ring-[#0E0E0E]"
                />
                <label htmlFor="is_default" className="text-xs text-[#0E0E0E]">
                  Set as my primary delivery address
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#73706A] hover:text-[#0E0E0E]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addressLoading}
                  className="px-6 py-2.5 bg-[#0E0E0E] text-[#FAF9F6] text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#262626] disabled:opacity-50"
                >
                  {addressLoading ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
