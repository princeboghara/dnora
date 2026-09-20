"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Order } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Convert number to Indian words
function numberToWords(amount: number): string {
  const num = Math.floor(amount);
  if (num === 0) return "Zero Rupees Only";

  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const b = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
  ];

  function inWords(n: number): string {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "");
    if (n < 1000)
      return (
        a[Math.floor(n / 100)] +
        " Hundred" +
        (n % 100 !== 0 ? " and " + inWords(n % 100) : "")
      );
    if (n < 100000)
      return (
        inWords(Math.floor(n / 1000)) +
        " Thousand" +
        (n % 1000 !== 0 ? " " + inWords(n % 1000) : "")
      );
    if (n < 10000000)
      return (
        inWords(Math.floor(n / 100000)) +
        " Lakh" +
        (n % 100000 !== 0 ? " " + inWords(n % 100000) : "")
      );
    return (
      inWords(Math.floor(n / 10000000)) +
      " Crore" +
      (n % 10000000 !== 0 ? " " + inWords(n % 10000000) : "")
    );
  }

  return inWords(num) + " Rupees Only";
}

export default function OrderInvoicePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { showToast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/admin/orders/${resolvedParams.id}`);
        const data = await res.json();
        if (res.ok && data.success && data.order) {
          setOrder(data.order);
        } else {
          showToast(data.error || "Order not found", "error");
        }
      } catch (err) {
        console.error("Error fetching order for invoice:", err);
        showToast("Failed to load invoice data", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [resolvedParams.id, showToast]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0E0E0E]" />
        <span className="text-xs uppercase tracking-widest text-[#73706A] mt-3">
          Generating official tax invoice...
        </span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center">
        <AlertCircle className="w-8 h-8 text-[#C53030] mx-auto mb-2" />
        <h2 className="text-base font-bold text-[#0E0E0E]">Order not found</h2>
        <Link
          href="/admin/orders"
          className="text-xs text-[#0E0E0E] underline hover:text-[#0E0E0E] mt-2 inline-block"
        >
          Return to Orders
        </Link>
      </div>
    );
  }

  const invoiceDate = new Date(order.created_at).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const subtotal = (order.items || []).reduce(
    (sum, it) => sum + Number(it.price || 0) * (it.quantity || 1),
    0
  );
  // 18% GST (9% CGST + 9% SGST)
  const taxableAmount = Math.round((subtotal / 1.18) * 100) / 100;
  const totalTax = Math.round((subtotal - taxableAmount) * 100) / 100;
  const halfTax = Math.round((totalTax / 2) * 100) / 100;

  return (
    <div>
      {/* Top Action Bar (Hidden during print) */}
      <div className="print:hidden mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white border border-[#E8E5DE] rounded-sm shadow-xs">
        <Link
          href={`/admin/orders/${order.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#73706A] hover:text-[#0E0E0E] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Order Details</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0E0E0E] hover:bg-[#262626] text-[#FAF9F6] text-xs font-semibold uppercase tracking-[0.16em] rounded-sm shadow-xs transition-all"
          >
            <Printer className="w-4 h-4 text-[#0E0E0E]" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Invoice Container (A4 Portrait optimized) */}
      <div
        id="invoice-document"
        className="bg-white border border-[#E8E5DE] print:border-none p-6 sm:p-10 max-w-4xl mx-auto shadow-sm print:shadow-none text-[#0E0E0E] leading-relaxed"
      >
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-8 border-b-2 border-[#0E0E0E]">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-3xl font-extrabold tracking-[0.2em] text-[#0E0E0E]">
                DNORA
              </span>
              <span className="text-[9px] uppercase tracking-[0.3em] font-semibold text-[#0E0E0E] border-l border-[#0E0E0E] pl-2">
                Luxury Atelier
              </span>
            </div>
            <p className="text-[11px] text-[#73706A] mt-1 font-mono uppercase tracking-wider">
              Handcrafted Leather Goods & Accoutrements
            </p>
          </div>

          <div className="sm:text-right space-y-1">
            <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#0E0E0E] block">
              Official Tax Invoice
            </span>
            <div className="font-mono text-sm font-bold text-[#0E0E0E]">
              INV-{order.order_number}
            </div>
            <div className="text-xs text-[#73706A]">
              Date: <span className="text-[#0E0E0E] font-medium">{invoiceDate}</span>
            </div>
            <div className="text-xs text-[#73706A]">
              Payment Status:{" "}
              <span className="text-[#2F855A] font-bold uppercase tracking-wider">
                {order.payment_status}
              </span>
            </div>
          </div>
        </div>

        {/* Addresses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-6 border-b border-[#E8E5DE] text-xs">
          {/* Sold By */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0E0E0E] block mb-1">
              Sold By / Dispatch Atelier
            </span>
            <div className="font-bold text-[#0E0E0E]">DNORA Luxury Atelier Pvt. Ltd.</div>
            <div className="text-[#73706A]">Level 4, DNORA House, Heritage Boulevard</div>
            <div className="text-[#73706A]">Ahmedabad, Gujarat — 380015, India</div>
            <div className="text-[#73706A]">
              GSTIN: <strong className="text-[#0E0E0E]">24AABCD7890F1Z4</strong>
            </div>
            <div className="text-[#73706A]">Email: concierge@dnora.luxury</div>
          </div>

          {/* Billed & Shipped To */}
          <div className="space-y-1 sm:text-right">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0E0E0E] block mb-1">
              Billed & Shipped To
            </span>
            <div className="font-bold text-[#0E0E0E]">{order.customer_name}</div>
            {order.shipping_address ? (
              <>
                <div className="text-[#73706A]">{order.shipping_address.address_line1}</div>
                {order.shipping_address.address_line2 && (
                  <div className="text-[#73706A]">{order.shipping_address.address_line2}</div>
                )}
                <div className="text-[#73706A]">
                  {order.shipping_address.city}, {order.shipping_address.state} —{" "}
                  {order.shipping_address.postal_code}
                </div>
                <div className="text-[#73706A]">{order.shipping_address.country}</div>
              </>
            ) : (
              <div className="text-[#73706A]">Standard Customer Address</div>
            )}
            <div className="text-[#73706A] pt-1">Email: {order.customer_email}</div>
            {order.customer_phone && (
              <div className="text-[#73706A]">Phone: {order.customer_phone}</div>
            )}
          </div>
        </div>

        {/* Order Reference Details */}
        <div className="py-3 border-b border-[#E8E5DE] flex flex-wrap items-center justify-between text-xs text-[#73706A] gap-4">
          <div>
            Order Reference: <span className="font-mono font-bold text-[#0E0E0E]">{order.order_number}</span>
          </div>
          <div>
            Payment Mode: <strong className="text-[#0E0E0E]">{order.payment_method}</strong>
          </div>
          {order.tracking_number && (
            <div>
              AWB Tracking:{" "}
              <span className="font-mono font-bold text-[#0E0E0E]">
                {order.carrier ? `${order.carrier} - ` : ""}
                {order.tracking_number}
              </span>
            </div>
          )}
        </div>

        {/* Itemized Table */}
        <div className="py-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-[#0E0E0E] text-[10px] uppercase tracking-wider font-bold text-[#0E0E0E]">
                <th className="py-2.5 px-2 w-10">#</th>
                <th className="py-2.5 px-2">Description of Creation</th>
                <th className="py-2.5 px-2 text-center w-20">HSN</th>
                <th className="py-2.5 px-2 text-center w-14">Qty</th>
                <th className="py-2.5 px-2 text-right w-24">Unit Price</th>
                <th className="py-2.5 px-2 text-right w-28">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E5DE]">
              {(order.items || []).map((item, idx) => {
                const attrs = item.attributes || {};
                const lineTotal = Number(item.price) * (item.quantity || 1);
                return (
                  <tr key={item.id} className="align-top">
                    <td className="py-3 px-2 font-mono text-[#73706A]">{idx + 1}</td>
                    <td className="py-3 px-2">
                      <div className="font-bold text-[#0E0E0E]">{item.product_name}</div>
                      {Object.keys(attrs).length > 0 && (
                        <div className="text-[10px] text-[#73706A] mt-0.5">
                          {Object.entries(attrs)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(" | ")}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center font-mono text-[#73706A]">4202</td>
                    <td className="py-3 px-2 text-center font-medium text-[#0E0E0E]">{item.quantity}</td>
                    <td className="py-3 px-2 text-right text-[#73706A] font-mono">
                      {formatPrice(item.price)}
                    </td>
                    <td className="py-3 px-2 text-right font-bold text-[#0E0E0E] font-mono">
                      {formatPrice(lineTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Calculation Summary */}
        <div className="pt-4 border-t-2 border-[#0E0E0E] grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Amount in words & Seal */}
          <div className="space-y-4">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#73706A] block mb-1">
                Invoice Total in Words:
              </span>
              <p className="text-xs font-semibold text-[#0E0E0E] italic">
                {numberToWords(order.total_amount)}
              </p>
            </div>

            {/* Official Stamp Box */}
            <div className="p-3 border border-[#E8E5DE] rounded-xs bg-[#FAF9F6] text-[11px] text-[#73706A] space-y-1 inline-block">
              <div className="flex items-center gap-1.5 font-bold text-[#0E0E0E] uppercase tracking-wider text-[10px]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0E0E0E]" />
                <span>Certified Genuine DNORA Creation</span>
              </div>
              <p className="text-[10px] leading-tight">
                Authentic handcrafted luxury leather piece backed by DNORA International Warranty.
              </p>
            </div>
          </div>

          {/* Right Calculations */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-[#73706A]">
              <span>Taxable Subtotal:</span>
              <span className="font-mono text-[#0E0E0E]">{formatPrice(taxableAmount)}</span>
            </div>
            <div className="flex justify-between text-[#73706A]">
              <span>Central GST (CGST 9%):</span>
              <span className="font-mono text-[#0E0E0E]">{formatPrice(halfTax)}</span>
            </div>
            <div className="flex justify-between text-[#73706A]">
              <span>State GST (SGST 9%):</span>
              <span className="font-mono text-[#0E0E0E]">{formatPrice(halfTax)}</span>
            </div>
            <div className="flex justify-between text-[#73706A]">
              <span>Atelier Courier Dispatch:</span>
              <span className="text-[#2F855A] font-semibold">Complimentary</span>
            </div>
            <div className="pt-3 border-t-2 border-[#0E0E0E] flex justify-between text-sm font-extrabold text-[#0E0E0E]">
              <span>Grand Total:</span>
              <span className="text-base font-heading font-extrabold text-[#0E0E0E]">
                {formatPrice(order.total_amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer & Signature */}
        <div className="mt-12 pt-6 border-t border-[#E8E5DE] flex flex-col sm:flex-row justify-between items-end gap-6 text-[11px] text-[#73706A]">
          <div className="space-y-1">
            <div className="font-bold text-[#0E0E0E]">Terms & Declarations:</div>
            <p>1. All disputes are subject to Ahmedabad jurisdiction.</p>
            <p>2. Goods once sold can be exchanged within 7 days in unworn original packaging.</p>
            <p>3. This is a computer-generated tax invoice and requires no physical signature.</p>
          </div>

          <div className="text-right space-y-2 sm:min-w-[180px]">
            <div className="text-[10px] uppercase tracking-widest text-[#73706A]">
              For DNORA Luxury Atelier
            </div>
            <div className="font-heading font-bold text-base text-[#0E0E0E] italic tracking-wider py-1">
              Prince Boghara
            </div>
            <div className="text-[10px] border-t border-[#E8E5DE] pt-1 text-[#73706A]">
              Authorized Signatory
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
