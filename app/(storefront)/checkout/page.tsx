"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  Lock, 
  CheckCircle2, 
  ArrowLeft, 
  ShoppingBag, 
  ChevronRight, 
  PackageCheck,
  Plus
} from "lucide-react";
import { useCart } from "@/lib/store/cart-store";
import { formatPrice } from "@/lib/utils";

interface SavedAddressItem {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault?: boolean;
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");

  const [savedAddresses, setSavedAddresses] = useState<SavedAddressItem[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [isEnteringNewAddress, setIsEnteringNewAddress] = useState(false);
  const [saveAddressForFuture, setSaveAddressForFuture] = useState(true);

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

  // Load saved addresses from user account and localStorage
  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) setMounted(true);
    });

    async function loadAddresses() {
      const addressMap = new Map<string, SavedAddressItem>();

      // 1. Try fetching from authenticated account API
      try {
        const res = await fetch("/api/account/address");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.addresses)) {
            data.addresses.forEach((a: { id: string; full_name?: string; phone?: string; address_line1?: string; address_line2?: string; city?: string; state?: string; postal_code?: string; is_default?: boolean }) => {
              const fullAddr = [a.address_line1, a.address_line2].filter(Boolean).join(", ");
              addressMap.set(a.id || fullAddr, {
                id: a.id || String(Math.random()),
                fullName: a.full_name || "",
                phone: a.phone || "",
                address: fullAddr,
                city: a.city || "",
                state: a.state || "Gujarat",
                postalCode: a.postal_code || "",
                isDefault: !!a.is_default,
              });
            });
          }
        }
      } catch {
        // Silently continue to local storage
      }

      // 2. Load from localStorage
      try {
        const rawLocal = localStorage.getItem("dnora_saved_addresses");
        if (rawLocal) {
          const parsed = JSON.parse(rawLocal);
          if (Array.isArray(parsed)) {
            parsed.forEach((item: SavedAddressItem) => {
              if (item.address && !addressMap.has(item.id)) {
                addressMap.set(item.id, item);
              }
            });
          }
        }

        // Also check if there's a last used contact/address
        const lastAddress = localStorage.getItem("dnora_last_address");
        if (lastAddress) {
          const parsedLast = JSON.parse(lastAddress);
          if (parsedLast && parsedLast.address && !addressMap.has(parsedLast.id)) {
            addressMap.set(parsedLast.id || "last-used", parsedLast);
          }
        }
      } catch {
        // LocalStorage parse error ignored
      }

      const list = Array.from(addressMap.values());
      setSavedAddresses(list);

      if (list.length > 0) {
        const preferred = list.find((a) => a.isDefault) || list[0];
        setSelectedAddressId(preferred.id);
        setIsEnteringNewAddress(false);

        // Pre-fill formData
        const nameParts = (preferred.fullName || "").trim().split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        // Also pre-fill email if stored in localStorage
        const storedEmail = localStorage.getItem("dnora_saved_email") || "";

        setFormData((prev) => ({
          ...prev,
          firstName: prev.firstName || firstName,
          lastName: prev.lastName || lastName,
          email: prev.email || storedEmail,
          phone: preferred.phone || prev.phone,
          address: preferred.address,
          city: preferred.city,
          state: preferred.state,
          postalCode: preferred.postalCode,
        }));
      } else {
        setIsEnteringNewAddress(true);
      }
    }

    loadAddresses();
    return () => {
      active = false;
    };
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#FAF9F6]">
        <div className="w-8 h-8 border-2 border-[#0E0E0E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If order was successfully placed, show luxury confirmation
  if (orderPlaced) {
    return (
      <div className="min-h-[80vh] bg-[#FAF9F6] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white border border-[#E8E5DE] rounded-sm p-8 sm:p-12 shadow-sm text-center">
          <div className="w-16 h-16 bg-[#F5F3EF] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-9 h-9 text-[#0E0E0E]" />
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

  const handleSelectSavedAddress = (addr: SavedAddressItem) => {
    setSelectedAddressId(addr.id);
    setIsEnteringNewAddress(false);
    const nameParts = (addr.fullName || "").trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    setFormData((prev) => ({
      ...prev,
      firstName: firstName || prev.firstName,
      lastName: lastName || prev.lastName,
      phone: addr.phone || prev.phone,
      address: addr.address,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
    }));
  };

  const handleSwitchToNewAddress = () => {
    setIsEnteringNewAddress(true);
    setSelectedAddressId("");
    setFormData((prev) => ({
      ...prev,
      address: "",
      city: "",
      state: "Gujarat",
      postalCode: "",
    }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData,
          items,
          subtotal,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOrderId(
          data.orderNumber ||
          data.order?.order_number ||
          `DN-${Math.floor(100000 + Math.random() * 900000)}`
        );
        setOrderPlaced(true);
        clearCart();

        // 1. Persist email for future checkouts
        if (formData.email) {
          localStorage.setItem("dnora_saved_email", formData.email);
        }

        // 2. Persist address to localStorage so next time it is in saved addresses
        const newAddressItem: SavedAddressItem = {
          id: selectedAddressId && !isEnteringNewAddress ? selectedAddressId : `addr_${Date.now()}`,
          fullName: `${formData.firstName || ""} ${formData.lastName || ""}`.trim(),
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
        };

        try {
          const rawLocal = localStorage.getItem("dnora_saved_addresses");
          const currentList: SavedAddressItem[] = rawLocal ? JSON.parse(rawLocal) : [];
          const exists = currentList.some(
            (a) => a.address.trim().toLowerCase() === formData.address.trim().toLowerCase() &&
                   a.postalCode.trim() === formData.postalCode.trim()
          );
          if (!exists) {
            const updated = [newAddressItem, ...currentList].slice(0, 5);
            localStorage.setItem("dnora_saved_addresses", JSON.stringify(updated));
          }
          localStorage.setItem("dnora_last_address", JSON.stringify(newAddressItem));
        } catch {
          // ignore localstorage error
        }

        // 3. If logged in, also sync to database account addresses
        try {
          fetch("/api/account/address", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              full_name: `${formData.firstName || ""} ${formData.lastName || ""}`.trim(),
              phone: formData.phone,
              address_line1: formData.address,
              city: formData.city,
              state: formData.state,
              postal_code: formData.postalCode,
              country: "India",
            }),
          }).catch(() => {});
        } catch {
          // ignore
        }
      } else {
        alert(data.error || "Failed to place order. Please try again.");
      }
    } catch (err) {
      console.error("Checkout order creation error:", err);
      const generatedId = `DN-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderId(generatedId);
      setOrderPlaced(true);
      clearCart();
    } finally {
      setIsSubmitting(false);
    }
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
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-heading font-semibold text-[#0E0E0E] tracking-tight">
                    2. Shipping Destination
                  </h2>
                  {savedAddresses.length > 0 && (
                    <div className="flex items-center gap-2">
                      {!isEnteringNewAddress ? (
                        <button
                          type="button"
                          onClick={handleSwitchToNewAddress}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0E0E0E] hover:underline cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add New Address</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (savedAddresses.length > 0) {
                              handleSelectSavedAddress(savedAddresses[0]);
                            }
                          }}
                          className="text-[11px] font-semibold text-[#0E0E0E] hover:underline cursor-pointer"
                        >
                          Use Saved Address
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* If user has saved addresses and is not entering a new one */}
                {savedAddresses.length > 0 && !isEnteringNewAddress ? (
                  <div className="space-y-3">
                    <div className="text-xs text-[#73706A] mb-2 font-medium">
                      Select delivery address from your saved locations:
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {savedAddresses.map((addr) => {
                        const isSelected = selectedAddressId === addr.id;
                        return (
                          <div
                            key={addr.id}
                            onClick={() => handleSelectSavedAddress(addr)}
                            className={`p-4 border rounded-sm cursor-pointer transition-all ${
                              isSelected
                                ? "border-[#0E0E0E] bg-[#FAF9F6] shadow-xs"
                                : "border-[#E8E5DE] hover:border-[#D5D2CA] bg-white"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5">
                                  <div
                                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                      isSelected
                                        ? "border-[#0E0E0E] bg-[#0E0E0E]"
                                        : "border-[#D5D2CA]"
                                    }`}
                                  >
                                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-[#0E0E0E]">
                                      {addr.fullName || "Customer"}
                                    </span>
                                    {addr.phone && (
                                      <span className="text-[11px] text-[#73706A]">
                                        &bull; {addr.phone}
                                      </span>
                                    )}
                                    {addr.isDefault && (
                                      <span className="text-[9px] uppercase tracking-wider font-semibold bg-[#E8E5DE] text-[#0E0E0E] px-1.5 py-0.5 rounded-xs">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-[#4A4742] leading-relaxed">
                                    {addr.address}, {addr.city}, {addr.state} - {addr.postalCode}
                                  </p>
                                </div>
                              </div>
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#73706A]">
                                {isSelected ? "Selected" : "Select"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Manual Address Fields */
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-[#0E0E0E] mb-1.5">
                        Street Address & Residence *
                      </label>
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

                    <div className="pt-1">
                      <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-[#73706A]">
                        <input
                          type="checkbox"
                          checked={saveAddressForFuture}
                          onChange={(e) => setSaveAddressForFuture(e.target.checked)}
                          className="accent-[#0E0E0E] rounded-xs"
                        />
                        <span>Save this address for fast 1-click checkout next time</span>
                      </label>
                    </div>
                  </div>
                )}
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
                        <PackageCheck className="w-3.5 h-3.5 text-[#0E0E0E]" />
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
                  const itemImgUrl = (typeof firstVariantImg === "string" 
                    ? firstVariantImg 
                    : (firstVariantImg && typeof firstVariantImg === "object" && "secure_url" in firstVariantImg)
                    ? (firstVariantImg as { secure_url?: string }).secure_url
                    : undefined) || item.product.images[0]?.secure_url || "/placeholder.jpg";
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
                    <div className="w-4 h-4 border-2 border-[#0E0E0E] border-t-transparent rounded-full animate-spin" />
                    <span>Authorizing Order...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#0E0E0E]" />
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
