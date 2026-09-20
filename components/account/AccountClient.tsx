"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Package,
  User as UserIcon,
  ShoppingBag,
  Heart,
  LogOut,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Copy,
  Check,
  ChevronRight,
  Shield,
  Edit2,
  MapPin,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Lock,
  X,
  Loader2,
  Phone,
  Mail,
  Home,
} from "lucide-react";
import { UserSession } from "@/lib/auth/user-session";
import { Order, UserAddress, Product } from "@/types";
import { useToast } from "@/components/ui/Toast";
import { useCart } from "@/lib/store/cart-store";
import { useWishlist } from "@/lib/store/wishlist-store";
import { formatPrice } from "@/lib/utils";

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

type AccountTab = "bag" | "wishlist" | "orders" | "profile";

export function AccountClient({
  user,
  initialOrders,
  initialAddresses,
}: AccountClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const initialTabParam = searchParams.get("tab") as AccountTab;
  const [activeTab, setActiveTab] = useState<AccountTab>(
    ["bag", "wishlist", "orders", "profile"].includes(initialTabParam) ? initialTabParam : "orders"
  );

  const [currentUser, setCurrentUser] = useState<UserSession>(user);
  const [orders] = useState<Order[]>(initialOrders);
  const [addresses, setAddresses] = useState<UserAddress[]>(initialAddresses);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(initialOrders[0] || null);
  const [copiedTracking, setCopiedTracking] = useState(false);

  // Cart & Wishlist Stores
  const { items: cartItems, subtotal: cartSubtotal, itemCount: cartCount, removeItem: removeCartItem } = useCart();
  const { items: wishlistItems, removeItem: removeWishlistItem } = useWishlist();

  // Edit Name Modal State
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [profileName, setProfileName] = useState(currentUser.full_name || "");
  const [profilePhone, setProfilePhone] = useState(currentUser.phone || "");
  const [savingProfile, setSavingProfile] = useState(false);

  // Add / Edit Address Modal State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressForm, setAddressForm] = useState({
    full_name: currentUser.full_name || "",
    phone: currentUser.phone || "",
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

  // Open Edit Profile Modal
  const handleOpenEditProfile = () => {
    setProfileName(currentUser.full_name || "");
    setProfilePhone(currentUser.phone || "");
    setEditProfileModalOpen(true);
  };

  // Save Profile Name & Phone
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      showToast("Please enter your name", "error");
      return;
    }
    setSavingProfile(true);

    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: profileName.trim(),
          phone: profilePhone.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update profile");
      }

      setCurrentUser((prev) => ({
        ...prev,
        full_name: profileName.trim(),
        phone: profilePhone.trim(),
      }));

      showToast("Profile updated successfully", "success");
      setEditProfileModalOpen(false);
      router.refresh();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to update profile", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  // Open Add Address
  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      full_name: currentUser.full_name || "",
      phone: currentUser.phone || "",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "India",
      is_default: addresses.length === 0,
    });
    setShowAddressModal(true);
  };

  // Open Edit Address
  const handleOpenEditAddress = (addr: UserAddress) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      full_name: addr.full_name,
      phone: addr.phone,
      address_line1: addr.address_line1,
      address_line2: addr.address_line2 || "",
      city: addr.city,
      state: addr.state,
      postal_code: addr.postal_code,
      country: addr.country || "India",
      is_default: addr.is_default,
    });
    setShowAddressModal(true);
  };

  // Submit Add or Edit Address
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressLoading(true);

    try {
      if (editingAddressId) {
        // Edit existing address
        const res = await fetch(`/api/account/address/${editingAddressId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(addressForm),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "Failed to update address");

        setAddresses((prev) =>
          prev.map((a) => (a.id === editingAddressId ? data.address : addressForm.is_default ? { ...a, is_default: false } : a))
        );
        showToast("Address updated successfully", "success");
      } else {
        // Create new address
        const res = await fetch("/api/account/address", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(addressForm),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "Failed to save address");

        if (data.address.is_default) {
          setAddresses((prev) => [data.address, ...prev.map((a) => ({ ...a, is_default: false }))]);
        } else {
          setAddresses((prev) => [...prev, data.address]);
        }
        showToast("Address saved successfully", "success");
      }

      setShowAddressModal(false);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to save address", "error");
    } finally {
      setAddressLoading(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this address?")) return;
    try {
      const res = await fetch(`/api/account/address/${id}`, { method: "DELETE" });
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
      const res = await fetch(`/api/account/address/${id}`, { method: "PATCH" });
      if (res.ok) {
        setAddresses((prev) => prev.map((a) => ({ ...a, is_default: a.id === id })));
        showToast("Primary address updated", "success");
      }
    } catch {
      showToast("Failed to update primary address", "error");
    }
  };

  // Sidebar Submenus List (Exactly 4 submenus requested by user)
  const sidebarMenu = [
    {
      id: "bag" as const,
      label: "Shopping Bag",
      icon: ShoppingBag,
      badge: cartCount > 0 ? String(cartCount) : undefined,
    },
    {
      id: "wishlist" as const,
      label: "Wishlist",
      icon: Heart,
      badge: wishlistItems.length > 0 ? String(wishlistItems.length) : undefined,
    },
    {
      id: "orders" as const,
      label: "My Orders",
      icon: Package,
      badge: orders.length > 0 ? String(orders.length) : undefined,
    },
    {
      id: "profile" as const,
      label: "My Profile",
      icon: UserIcon,
      badge: undefined,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* ================= 1. SMALL COMPACT WELCOME BANNER ================= */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center font-bold text-base text-white shrink-0">
              {(currentUser.full_name || currentUser.email || "C").charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-heading font-bold text-white tracking-tight">
                  Welcome, {currentUser.full_name || "Client"}
                </h1>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {currentUser.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={handleOpenEditProfile}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* ================= MAIN PORTAL LAYOUT: SIDEBAR + CONTENT ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ================= ADMIN-STYLE SIDEBAR (3-4 cols) ================= */}
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-3 space-y-1">
              <div className="px-3 pt-2 pb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Member Portal
              </div>

              {sidebarMenu.map((menu) => {
                const IconComp = menu.icon;
                const isActive = activeTab === menu.id;

                return (
                  <button
                    key={menu.id}
                    type="button"
                    onClick={() => setActiveTab(menu.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                      isActive
                        ? "bg-slate-900 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComp
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? "text-white" : "text-slate-500"
                        }`}
                      />
                      <span>{menu.label}</span>
                    </div>

                    {menu.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 text-slate-800 border border-slate-200"
                        }`}
                      >
                        {menu.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              <div className="pt-3 mt-2 border-t border-slate-100 px-1">
                <Link
                  href="/shop"
                  className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    Browse Catalog
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </div>
            </div>
          </aside>

          {/* ================= CONTENT PANEL (8-9 cols) ================= */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-6">
            {/* ----------------- SUBMENU 1: SHOPPING BAG ----------------- */}
            {activeTab === "bag" && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg sm:text-xl font-heading font-bold text-slate-900">
                      Shopping Bag
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Items currently saved in your active checkout bag.
                    </p>
                  </div>
                  <Link
                    href="/bag"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-2xs"
                  >
                    <span>Full Bag Page</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {cartItems.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                      <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <p className="text-sm font-bold text-slate-900">Your bag is currently empty</p>
                    <p className="text-xs text-slate-500 mt-1 mb-4">
                      Add handcrafted handbags to your bag to view them here.
                    </p>
                    <Link
                      href="/shop"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-800 transition-colors"
                    >
                      <span>Explore Collection</span>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                      {cartItems.map((it) => (
                        <div key={it.product.id} className="p-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-14 h-16 bg-slate-50 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                              {it.product.images[0] && (
                                <Image
                                  src={it.product.images[0].secure_url}
                                  alt={it.product.name}
                                  fill
                                  className="object-cover"
                                  sizes="56px"
                                />
                              )}
                            </div>
                            <div>
                              <Link
                                href={`/product/${it.product.slug}`}
                                className="text-xs sm:text-sm font-bold text-slate-900 hover:underline line-clamp-1"
                              >
                                {it.product.name}
                              </Link>
                              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                Qty: {it.quantity} • {formatPrice(it.product.price)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-xs sm:text-sm font-bold text-slate-900">
                              {formatPrice(it.product.price * it.quantity)}
                            </div>
                            <button
                              onClick={() => removeCartItem(it.product.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-xs text-slate-500 block">Bag Subtotal</span>
                        <span className="text-base font-extrabold text-slate-900 font-mono">
                          {formatPrice(cartSubtotal)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href="/bag"
                          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-900 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
                        >
                          View Bag
                        </Link>
                        <Link
                          href="/checkout"
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-2xs"
                        >
                          Checkout
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ----------------- SUBMENU 2: WISHLIST ----------------- */}
            {activeTab === "wishlist" && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="pb-4 border-b border-slate-100">
                  <h2 className="text-lg sm:text-xl font-heading font-bold text-slate-900">
                    My Wishlist
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Saved items that you have curated for future purchase.
                  </p>
                </div>

                {wishlistItems.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Heart className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <p className="text-sm font-bold text-slate-900">Your wishlist is empty</p>
                    <p className="text-xs text-slate-500 mt-1 mb-4">
                      Click the heart icon on any handbag to save it to your wishlist.
                    </p>
                    <Link
                      href="/shop"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-800 transition-colors"
                    >
                      <span>Explore Collection</span>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {wishlistItems.map((prod: Product) => (
                      <div
                        key={prod.id}
                        className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between hover:border-slate-300 transition-all shadow-2xs group"
                      >
                        <div className="relative aspect-square w-full bg-slate-50 rounded-lg overflow-hidden mb-3 border border-slate-100">
                          {prod.images?.[0] && (
                            <Image
                              src={prod.images[0].secure_url}
                              alt={prod.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="(max-width: 640px) 100vw, 240px"
                            />
                          )}
                          <button
                            onClick={() => removeWishlistItem(prod.id)}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-red-600 shadow-xs transition-colors cursor-pointer"
                            title="Remove from wishlist"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="space-y-1">
                          <Link
                            href={`/product/${prod.slug}`}
                            className="text-xs font-bold text-slate-900 hover:underline line-clamp-1"
                          >
                            {prod.name}
                          </Link>
                          <div className="text-xs font-bold text-slate-900">
                            {formatPrice(prod.price)}
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-100">
                          <Link
                            href={`/product/${prod.slug}`}
                            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <ShoppingBag className="w-3 h-3" />
                            <span>View Product</span>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ----------------- SUBMENU 3: MY ORDERS ----------------- */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
                  <div className="pb-4 border-b border-slate-100 mb-6">
                    <h2 className="text-lg sm:text-xl font-heading font-bold text-slate-900">
                      My Orders &amp; Tracking
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Review order history, delivery milestones, and dispatch tracking details.
                    </p>
                  </div>

                  {orders.length === 0 ? (
                    <div className="py-12 text-center">
                      <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Package className="w-6 h-6 stroke-[1.5]" />
                      </div>
                      <p className="text-sm font-bold text-slate-900">No orders placed yet</p>
                      <p className="text-xs text-slate-500 mt-1 mb-4">
                        Your bespoke orders will appear here once confirmed.
                      </p>
                      <Link
                        href="/shop"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-800 transition-colors"
                      >
                        Start Shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => {
                        const isSelected = selectedOrder?.id === order.id;

                        return (
                          <div
                            key={order.id}
                            className={`bg-white border rounded-xl transition-all overflow-hidden ${
                              isSelected
                                ? "border-slate-900 ring-1 ring-slate-900 shadow-sm"
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            {/* Summary Header */}
                            <div
                              onClick={() => setSelectedOrder(order)}
                              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2.5">
                                  <span className="font-mono font-bold text-sm text-slate-900">
                                    {order.order_number}
                                  </span>
                                  <span
                                    className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                                      order.status === "delivered"
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                        : order.status === "shipped"
                                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                                        : "bg-amber-50 text-amber-700 border border-amber-200"
                                    }`}
                                  >
                                    {order.status}
                                  </span>
                                </div>
                                <div className="text-xs text-slate-500">
                                  Placed on {formatDisplayDate(order.created_at)}
                                </div>
                              </div>

                              <div className="flex items-center justify-between sm:justify-end gap-6">
                                <div className="text-right">
                                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                                    Total Amount
                                  </span>
                                  <span className="text-sm font-extrabold text-slate-900 font-mono">
                                    {formatPrice(order.total_amount)}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  className="text-xs text-slate-900 font-semibold flex items-center gap-1 hover:text-slate-600"
                                >
                                  {isSelected ? "Viewing" : "Track"}
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Details Panel */}
                            {isSelected && (
                              <div className="border-t border-slate-100 p-5 bg-slate-50/60 space-y-6">
                                {/* Tracking Stepper */}
                                <div>
                                  <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-3">
                                    Delivery Milestones
                                  </span>

                                  <div className="grid grid-cols-4 gap-2 text-center">
                                    <div className="flex flex-col items-center">
                                      <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold mb-1.5">
                                        <CheckCircle2 className="w-4 h-4" />
                                      </div>
                                      <span className="text-[11px] font-bold text-slate-900">
                                        Confirmed
                                      </span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                      <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold mb-1.5">
                                        <Clock className="w-4 h-4" />
                                      </div>
                                      <span className="text-[11px] font-bold text-slate-900">
                                        Processing
                                      </span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                      <div
                                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 ${
                                          order.status === "shipped" || order.status === "delivered"
                                            ? "bg-slate-900 text-white"
                                            : "bg-slate-200 text-slate-500"
                                        }`}
                                      >
                                        <Package className="w-4 h-4" />
                                      </div>
                                      <span className="text-[11px] font-bold text-slate-900">
                                        Shipped
                                      </span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                      <div
                                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 ${
                                          order.status === "delivered"
                                            ? "bg-emerald-600 text-white"
                                            : "bg-slate-200 text-slate-500"
                                        }`}
                                      >
                                        <Check className="w-4 h-4" />
                                      </div>
                                      <span className="text-[11px] font-bold text-slate-900">
                                        Delivered
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Items List */}
                                <div className="space-y-2 pt-2 border-t border-slate-200">
                                  <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-2">
                                    Purchased Handbags
                                  </span>
                                  {order.items?.map((item) => (
                                    <div
                                      key={item.id}
                                      className="flex items-center justify-between py-2 text-xs"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-12 bg-white rounded border border-slate-200 overflow-hidden relative shrink-0">
                                          {item.image_url && (
                                            <Image
                                              src={item.image_url}
                                              alt={item.product_name}
                                              fill
                                              className="object-cover"
                                            />
                                          )}
                                        </div>
                                        <div>
                                          <div className="font-bold text-slate-900">
                                            {item.product_name}
                                          </div>
                                          <div className="text-slate-500 font-mono text-[11px]">
                                            Qty: {item.quantity}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="font-bold text-slate-900 font-mono">
                                        {formatPrice(item.price * item.quantity)}
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {order.tracking_number && (
                                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                                    <span className="text-slate-600">
                                      Courier Tracking: <strong className="font-mono text-slate-900">{order.tracking_number}</strong>
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleCopyTracking(order.tracking_number!)}
                                      className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-900 font-semibold"
                                    >
                                      {copiedTracking ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                      <span>{copiedTracking ? "Copied" : "Copy Tracking"}</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ----------------- SUBMENU 4: MY PROFILE ----------------- */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                {/* Personal Information Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <h2 className="text-lg sm:text-xl font-heading font-bold text-slate-900">
                        My Profile
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Your account credentials, contact information, and security.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenEditProfile}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-2xs"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Name</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">
                        Full Name
                      </label>
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span>{currentUser.full_name || "Valued Client"}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">
                        Email Address
                      </label>
                      <div className="text-sm font-bold text-slate-900 font-mono flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{currentUser.email}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">
                        Phone Number
                      </label>
                      <div className="text-sm font-bold text-slate-900 font-mono flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{currentUser.phone || "Not provided"}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">
                        Session Encryption
                      </label>
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                        <Shield className="w-3.5 h-3.5" />
                        <span>Secure HTTP-Only Session</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Saved Delivery Addresses Section */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="text-base sm:text-lg font-heading font-bold text-slate-900">
                        Saved Delivery Addresses
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Manage your primary and secondary shipping destinations.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenAddAddress}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Address</span>
                    </button>
                  </div>

                  {addresses.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-xs">
                      No addresses saved yet. Click &quot;Add Address&quot; above to save your delivery location.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-xs text-slate-900">
                                {addr.full_name}
                              </span>
                              {addr.is_default && (
                                <span className="text-[9px] uppercase tracking-wider font-bold bg-slate-900 text-white px-2 py-0.5 rounded-full">
                                  Default
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-600 leading-relaxed">
                              {addr.address_line1}
                              {addr.address_line2 && <><br />{addr.address_line2}</>}
                              <br />
                              {addr.city}, {addr.state} {addr.postal_code}
                              <br />
                              {addr.country}
                            </p>

                            <p className="text-[11px] font-mono text-slate-500 mt-2">
                              Phone: {addr.phone}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {/* Edit Address Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenEditAddress(addr)}
                                className="inline-flex items-center gap-1 text-xs text-slate-700 hover:text-slate-900 font-semibold cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Edit Address</span>
                              </button>

                              {!addr.is_default && (
                                <button
                                  type="button"
                                  onClick={() => handleSetDefaultAddress(addr.id)}
                                  className="text-xs text-slate-500 hover:text-slate-900 font-medium cursor-pointer"
                                >
                                  Set as Default
                                </button>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                              title="Delete address"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ================= EDIT PROFILE MODAL (EDIT NAME) ================= */}
      {editProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white max-w-md w-full p-6 rounded-2xl border border-slate-200 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-heading font-bold text-slate-900">
                Edit Profile Information
              </h3>
              <button
                type="button"
                onClick={() => setEditProfileModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-900 transition-colors font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditProfileModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-2xs transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {savingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= ADD / EDIT ADDRESS MODAL ================= */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white max-w-lg w-full p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-heading font-bold text-slate-900">
                {editingAddressId ? "Edit Delivery Address" : "Add New Delivery Address"}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider mb-1.5">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.full_name}
                    onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })}
                    placeholder="Recipient's Name"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-900 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-900 transition-colors font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider mb-1.5">
                  Address Line 1 (Flat, House, Street) *
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.address_line1}
                  onChange={(e) => setAddressForm({ ...addressForm, address_line1: e.target.value })}
                  placeholder="Flat 4B, Signature Towers"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider mb-1.5">
                  Address Line 2 (Area, Landmark)
                </label>
                <input
                  type="text"
                  value={addressForm.address_line2}
                  onChange={(e) => setAddressForm({ ...addressForm, address_line2: e.target.value })}
                  placeholder="Near Heritage Square"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-900 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    placeholder="Mumbai"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-900 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider mb-1.5">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    placeholder="Maharashtra"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-900 transition-colors"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider mb-1.5">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.postal_code}
                    onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
                    placeholder="400001"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-900 transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_default_checkbox"
                  checked={addressForm.is_default}
                  onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                />
                <label htmlFor="is_default_checkbox" className="text-xs text-slate-700 cursor-pointer font-medium">
                  Set as my primary delivery address
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addressLoading}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-2xs transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {addressLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{editingAddressId ? "Save Address" : "Add Address"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
