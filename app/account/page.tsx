"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Heart, Sparkles, ArrowRight, ShieldCheck, Clock } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useWishlist } from "@/lib/context/wishlist-context";
import { getOrders } from "@/lib/services/order-service";
import { Order } from "@/types";
import { formatINR, formatDate } from "@/lib/utils";

export default function AccountOverviewPage() {
  const { user } = useAuth();
  const { wishlistCount } = useWishlist();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    async function fetchOrders() {
      const all = await getOrders();
      setOrders(all);
    }
    fetchOrders();
  }, []);

  const recentOrder = orders[0];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-[#FAF7F2] border border-[#E8E2D9] p-6 sm:p-8 space-y-2">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold">
          Client Dashboard
        </span>
        <h1 className="font-sans text-2xl sm:text-3xl text-[#111111] uppercase tracking-[0.1em] font-light">
          Welcome, {user?.fullName || "Distinguished Patron"}
        </h1>
        <p className="text-xs text-[#6E6A64] max-w-lg leading-relaxed">
          Manage your bespoke acquisitions, track white-glove dispatches, and review your curated wishlist.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-[#FAF7F2] border border-[#E8E2D9] space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">
            Total Orders
          </span>
          <p className="font-sans text-2xl sm:text-3xl text-[#111111] font-semibold tracking-tight">{orders.length}</p>
        </div>

        <div className="p-5 bg-[#FAF7F2] border border-[#E8E2D9] space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">
            Saved In Wishlist
          </span>
          <p className="font-sans text-2xl sm:text-3xl text-[#111111] font-semibold tracking-tight">{wishlistCount}</p>
        </div>

        <div className="p-5 bg-[#FAF7F2] border border-[#E8E2D9] space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">
            Atelier Privilege Level
          </span>
          <p className="font-sans text-sm text-[#9E7D4E] font-semibold uppercase tracking-wider pt-1">
            Royal Circle Patron
          </p>
        </div>
      </div>

      {/* Recent Order Preview */}
      {recentOrder && (
        <div className="bg-[#FAF7F2] border border-[#E8E2D9] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-3">
            <h3 className="font-sans font-medium text-xs text-[#111111] uppercase tracking-[0.15em]">
              Most Recent Acquisition
            </h3>
            <Link
              href="/account/orders"
              className="text-xs text-[#111111] hover:text-[#C5A880] flex items-center gap-1 font-medium"
            >
              <span>View All ({orders.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <p className="font-mono font-semibold text-sm text-[#111111]">
                {recentOrder.order_number}
              </p>
              <p className="text-[#8C7A6B]">
                Placed on {formatDate(recentOrder.created_at)} • {recentOrder.items.length} creations
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-[#141414] text-[#C5A880] uppercase tracking-widest text-[10px] font-semibold">
                Status: {recentOrder.status}
              </span>
              <span className="font-sans text-base font-semibold text-[#111111] tracking-tight">
                {formatINR(recentOrder.total)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Concierge Box */}
      <div className="p-6 bg-[#141414] text-[#F5F2EB] border border-[#262626] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2 text-[#C5A880]">
            <ShieldCheck className="w-4 h-4" />
            <span className="font-semibold uppercase tracking-widest text-[10px]">
              Personal Atelier Advisor
            </span>
          </div>
          <p className="text-sm font-sans">Have questions regarding a bespoke commission or delivery?</p>
          <p className="text-[#A89F91]">Your dedicated concierge is available Monday to Saturday.</p>
        </div>

        <Link
          href="/contact"
          className="px-6 py-3 bg-[#C5A880] text-[#111111] text-xs uppercase tracking-widest font-semibold hover:bg-[#DFCAAB] transition-colors flex-shrink-0"
        >
          Contact Concierge
        </Link>
      </div>
    </div>
  );
}
