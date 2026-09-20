"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Printer,
  Trash2,
  Package,
  Truck,
  MapPin,
  Mail,
  Phone,
  User,
  CreditCard,
  FileText,
  Save,
  Loader2,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { Order, OrderStatus, PaymentStatus } from "@/types";
import { formatPrice, cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { showToast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form states for fulfillment
  const [status, setStatus] = useState<OrderStatus>("processing");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("paid");
  const [carrier, setCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        const res = await fetch(`/api/admin/orders/${resolvedParams.id}`);
        const data = await res.json();
        if (!ignore) {
          if (res.ok && data.success && data.order) {
            setOrder(data.order);
            setStatus(data.order.status || "processing");
            setPaymentStatus(data.order.payment_status || "paid");
            setCarrier(data.order.carrier || "");
            setTrackingNumber(data.order.tracking_number || "");
            setEstimatedDelivery(
              data.order.estimated_delivery
                ? new Date(data.order.estimated_delivery).toISOString().split("T")[0]
                : ""
            );
            setNotes(data.order.notes || "");
          } else {
            showToast(data.error || "Order not found", "error");
          }
        }
      } catch (err) {
        console.error("Error loading order:", err);
        if (!ignore) showToast("Network error while loading order", "error");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadData();
    return () => {
      ignore = true;
    };
  }, [resolvedParams.id, showToast]);

  const handleSaveFulfillment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${resolvedParams.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          payment_status: paymentStatus,
          carrier: carrier.trim() || null,
          tracking_number: trackingNumber.trim() || null,
          estimated_delivery: estimatedDelivery ? new Date(estimatedDelivery).toISOString() : null,
          notes: notes.trim() || null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOrder(data.order);
        showToast("Order fulfillment details updated successfully", "success");
      } else {
        showToast(data.error || "Failed to update order", "error");
      }
    } catch {
      showToast("Network error while saving order", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/orders/${resolvedParams.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Order deleted successfully", "success");
        router.push("/admin/orders");
      } else {
        showToast(data.error || "Failed to delete order", "error");
      }
    } catch {
      showToast("Network error while deleting order", "error");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0E0E0E]" />
        <span className="text-xs uppercase tracking-widest text-[#73706A] mt-3">
          Retrieving order details...
        </span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center">
        <div className="w-16 h-16 bg-[#FAF9F6] border border-[#E8E5DE] rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-[#C53030]" />
        </div>
        <h2 className="text-lg font-heading font-bold text-[#0E0E0E]">Order Not Found</h2>
        <p className="text-xs text-[#73706A] mt-1 mb-6">
          The requested order could not be located in the database.
        </p>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0E0E0E] text-[#FAF9F6] text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#262626]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </Link>
      </div>
    );
  }

  const orderDate = new Date(order.created_at).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const subtotal = (order.items || []).reduce(
    (sum, it) => sum + Number(it.price || 0) * (it.quantity || 1),
    0
  );
  const gstAmount = Math.round((subtotal * 0.18) / 1.18); // Inclusive 18% GST estimate
  const taxableSubtotal = subtotal - gstAmount;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E5DE]">
        <div className="space-y-1">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#73706A] hover:text-[#0E0E0E] transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Orders List</span>
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0E0E0E] tracking-tight">
              Order {order.order_number}
            </h1>
            <span
              className={cn(
                "px-2.5 py-0.5 border rounded-full text-[10px] font-semibold uppercase tracking-wider",
                order.status === "processing" && "bg-[#FFF9E6] text-[#B7791F] border-[#FBD38D]",
                order.status === "confirmed" && "bg-[#EBF8FF] text-[#2B6CB0] border-[#BEE3F8]",
                order.status === "shipped" && "bg-[#F3E8FF] text-[#6B46C1] border-[#D6BCFA]",
                order.status === "delivered" && "bg-[#F0FFF4] text-[#2F855A] border-[#9AE6B4]",
                order.status === "cancelled" && "bg-[#FFF5F5] text-[#C53030] border-[#FEB2B2]"
              )}
            >
              {order.status}
            </span>
          </div>
          <p className="text-xs text-[#73706A]">Placed on {orderDate}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Invoice Button */}
          <Link
            href={`/admin/orders/${order.id}/invoice`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E8E5DE] rounded-sm text-xs font-semibold uppercase tracking-wider text-[#0E0E0E] hover:bg-[#FAF9F6] shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-[#0E0E0E]" />
            <span>Generate Invoice (PDF)</span>
          </Link>

          {/* Delete Button */}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-white border border-[#F5C2C2] text-[#C53030] hover:bg-[#FCF0F0] rounded-sm text-xs font-semibold transition-colors"
            title="Delete Order"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Items & Pricing */}
        <div className="lg:col-span-8 space-y-6">
          {/* Order Items Card */}
          <div className="bg-white rounded-sm border border-[#E8E5DE] overflow-hidden shadow-xs">
            <div className="py-4 px-5 bg-[#FAF9F6] border-b border-[#E8E5DE] flex items-center justify-between">
              <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-[#0E0E0E] flex items-center gap-2">
                <Package className="w-4 h-4 text-[#0E0E0E]" />
                <span>Acquired Creations ({order.items?.length || 0})</span>
              </h3>
            </div>

            <div className="divide-y divide-[#E8E5DE]">
              {(order.items || []).map((item) => {
                const attrs = item.attributes || {};
                return (
                  <div key={item.id} className="p-5 flex items-start gap-4">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#FAF9F6] border border-[#E8E5DE] rounded-sm shrink-0 overflow-hidden relative">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.product_name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#73706A]">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-heading font-bold text-sm text-[#0E0E0E]">
                        {item.product_name}
                      </h4>
                      {item.product_slug && (
                        <Link
                          href={`/product/${item.product_slug}`}
                          target="_blank"
                          className="text-[11px] text-[#73706A] hover:text-[#73706A] inline-flex items-center gap-1 mt-0.5"
                        >
                          <span>View Product in Storefront</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}

                      {/* Attributes */}
                      {Object.keys(attrs).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {Object.entries(attrs).map(([k, v]) => (
                            <span
                              key={k}
                              className="px-2 py-0.5 bg-[#FAF9F6] border border-[#E8E5DE] text-[10px] font-medium text-[#73706A] rounded-xs"
                            >
                              <strong className="text-[#0E0E0E] capitalize">{k}:</strong> {String(v)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Price & Quantity */}
                    <div className="text-right shrink-0">
                      <div className="font-semibold text-sm text-[#0E0E0E]">
                        {formatPrice(Number(item.price) * (item.quantity || 1))}
                      </div>
                      <div className="text-[11px] text-[#73706A] mt-0.5">
                        {formatPrice(item.price)} × {item.quantity}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Financial Breakdown Card */}
          <div className="bg-white rounded-sm border border-[#E8E5DE] p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-[#0E0E0E] pb-2 border-b border-[#E8E5DE] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0E0E0E]" />
              <span>Financial Ledger</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#73706A]">
                <span>Taxable Value:</span>
                <span>{formatPrice(taxableSubtotal)}</span>
              </div>
              <div className="flex justify-between text-[#73706A]">
                <span>GST (Estimated 18%):</span>
                <span>{formatPrice(gstAmount)}</span>
              </div>
              <div className="flex justify-between text-[#73706A]">
                <span>Atelier White-Glove Delivery:</span>
                <span className="text-[#2F855A] font-medium">Complimentary</span>
              </div>
              <div className="pt-2 border-t border-[#E8E5DE] flex justify-between text-sm font-bold text-[#0E0E0E]">
                <span>Grand Total:</span>
                <span className="text-base text-[#0E0E0E] font-heading font-extrabold">
                  {formatPrice(order.total_amount)}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E8E5DE] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[#73706A]">
                <CreditCard className="w-4 h-4 text-[#0E0E0E]" />
                <span>Payment Method: <strong className="text-[#0E0E0E]">{order.payment_method}</strong></span>
              </div>
              <span
                className={cn(
                  "px-2.5 py-0.5 border rounded-full text-[10px] font-semibold uppercase tracking-wider",
                  order.payment_status === "paid" && "bg-[#F0FFF4] text-[#2F855A] border-[#9AE6B4]",
                  order.payment_status === "pending" && "bg-[#FFF9E6] text-[#B7791F] border-[#FBD38D]"
                )}
              >
                {order.payment_status}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Customer, Shipping, Fulfillment Controls */}
        <div className="lg:col-span-4 space-y-6">
          {/* Customer Card */}
          <div className="bg-white rounded-sm border border-[#E8E5DE] p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-[#0E0E0E] pb-2 border-b border-[#E8E5DE] flex items-center gap-2">
              <User className="w-4 h-4 text-[#0E0E0E]" />
              <span>Customer Details</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="font-bold text-sm text-[#0E0E0E]">{order.customer_name}</div>
              <div className="flex items-center gap-2 text-[#73706A]">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <a href={`mailto:${order.customer_email}`} className="hover:text-[#0E0E0E] underline">
                  {order.customer_email}
                </a>
              </div>
              {order.customer_phone && (
                <div className="flex items-center gap-2 text-[#73706A]">
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  <a href={`tel:${order.customer_phone}`} className="hover:text-[#0E0E0E]">
                    {order.customer_phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address Card */}
          <div className="bg-white rounded-sm border border-[#E8E5DE] p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-[#0E0E0E] pb-2 border-b border-[#E8E5DE] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#0E0E0E]" />
              <span>Shipping Destination</span>
            </h3>

            {order.shipping_address ? (
              <div className="text-xs text-[#73706A] space-y-1 leading-relaxed">
                <div className="font-semibold text-[#0E0E0E]">
                  {order.shipping_address.full_name}
                </div>
                <div>{order.shipping_address.address_line1}</div>
                {order.shipping_address.address_line2 && (
                  <div>{order.shipping_address.address_line2}</div>
                )}
                <div>
                  {order.shipping_address.city}, {order.shipping_address.state} —{" "}
                  <span className="font-mono text-[#0E0E0E]">
                    {order.shipping_address.postal_code}
                  </span>
                </div>
                <div>{order.shipping_address.country}</div>
                {order.shipping_address.phone && (
                  <div className="pt-1 text-[#0E0E0E] font-medium">
                    Phone: {order.shipping_address.phone}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-[#73706A]">No shipping address provided.</p>
            )}
          </div>

          {/* Fulfillment Manager Form */}
          <form
            onSubmit={handleSaveFulfillment}
            className="bg-white rounded-sm border border-[#E8E5DE] p-5 shadow-xs space-y-4"
          >
            <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-[#0E0E0E] pb-2 border-b border-[#E8E5DE] flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#0E0E0E]" />
              <span>Fulfillment & Dispatch</span>
            </h3>

            {/* Status Selector */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#73706A] mb-1">
                Order Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E8E5DE] rounded-sm text-xs font-semibold text-[#0E0E0E] focus:outline-none focus:border-[#0E0E0E]"
              >
                <option value="processing">Processing (In Atelier)</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped (In Transit)</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Payment Status Selector */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#73706A] mb-1">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E8E5DE] rounded-sm text-xs font-semibold text-[#0E0E0E] focus:outline-none focus:border-[#0E0E0E]"
              >
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            {/* Carrier */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#73706A] mb-1">
                Logistics Carrier
              </label>
              <input
                type="text"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                placeholder="e.g. BlueDart Express, Delhivery, DHL"
                className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E8E5DE] rounded-sm text-xs text-[#0E0E0E] placeholder-[#73706A] focus:outline-none focus:border-[#0E0E0E]"
              />
            </div>

            {/* Tracking Number */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#73706A] mb-1">
                Tracking Number
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. BD-99482910"
                className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E8E5DE] rounded-sm text-xs font-mono text-[#0E0E0E] placeholder-[#73706A] focus:outline-none focus:border-[#0E0E0E]"
              />
            </div>

            {/* Estimated Delivery Date */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#73706A] mb-1">
                Estimated Delivery
              </label>
              <input
                type="date"
                value={estimatedDelivery}
                onChange={(e) => setEstimatedDelivery(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E8E5DE] rounded-sm text-xs text-[#0E0E0E] focus:outline-none focus:border-[#0E0E0E]"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#73706A] mb-1">
                Internal Atelier Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Notes regarding bespoke requests, packaging, or customer preferences..."
                className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E8E5DE] rounded-sm text-xs text-[#0E0E0E] placeholder-[#73706A] focus:outline-none focus:border-[#0E0E0E]"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-[#0E0E0E] hover:bg-[#262626] text-[#FAF9F6] text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#0E0E0E]" />
              ) : (
                <Save className="w-4 h-4 text-[#0E0E0E]" />
              )}
              <span>Update Fulfillment</span>
            </button>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-sm border border-[#E8E5DE] p-6 max-w-md w-full shadow-lg space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FCF0F0] border border-[#F5C2C2] flex items-center justify-center shrink-0 text-[#C53030]">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-heading font-bold text-[#0E0E0E]">
                  Delete Order {order.order_number}?
                </h3>
                <p className="text-xs text-[#73706A] mt-1 leading-relaxed">
                  Are you sure you want to permanently delete this order for{" "}
                  <strong className="text-[#0E0E0E]">{order.customer_name}</strong>? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 border border-[#E8E5DE] text-xs font-semibold text-[#73706A] hover:bg-[#FAF9F6] rounded-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-[#C53030] hover:bg-[#9B2C2C] text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Order</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
