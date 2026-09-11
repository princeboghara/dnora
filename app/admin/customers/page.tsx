"use client";

import React, { useState, useEffect } from "react";
import { Users, Search, Sparkles, Mail, Phone, UserCheck } from "lucide-react";
import { formatINR, formatDate } from "@/lib/utils";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { getOrders } from "@/lib/services/order-service";

interface Patron {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  tier: string;
  ordersCount: number;
  totalSpent: number;
  memberSince: string;
}

export default function AdminCustomersPage() {
  const [patrons, setPatrons] = useState<Patron[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPatrons() {
      setIsLoading(true);
      const patronMap = new Map<string, Patron>();

      // 1. Fetch from Supabase profiles if available
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false });

          if (profiles) {
            profiles.forEach((p: any) => {
              patronMap.set(p.email || p.id, {
                id: p.id,
                name: p.full_name || "Atelier Patron",
                email: p.email || "",
                phone: p.phone || "—",
                city: "—",
                tier: p.role === "super_admin" ? "Executive Administrator" : "Atelier Circle",
                ordersCount: 0,
                totalSpent: 0,
                memberSince: formatDate(p.created_at || new Date().toISOString()),
              });
            });
          }
        } catch {
          // Ignore
        }
      }

      // 2. Cross-reference orders to calculate customer stats
      try {
        const orders = await getOrders();
        orders.forEach((o) => {
          const key = o.customer_email.toLowerCase();
          const existing = patronMap.get(key);
          const city = o.shipping_address?.city
            ? `${o.shipping_address.city}, ${o.shipping_address.state || "India"}`
            : "—";

          if (existing) {
            existing.ordersCount += 1;
            existing.totalSpent += o.total;
            if (existing.city === "—") existing.city = city;
            if (existing.phone === "—") existing.phone = o.customer_phone;
          } else {
            patronMap.set(key, {
              id: `pat_${o.id}`,
              name: o.customer_name,
              email: o.customer_email,
              phone: o.customer_phone || "—",
              city,
              tier: o.total > 50000 ? "Royal Circle Patron" : "Atelier Circle",
              ordersCount: 1,
              totalSpent: o.total,
              memberSince: formatDate(o.created_at),
            });
          }
        });
      } catch {
        // Ignore
      }

      setPatrons(Array.from(patronMap.values()));
      setIsLoading(false);
    }

    loadPatrons();
  }, []);

  const filtered = patrons.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.04]">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold font-mono">
            Clientele Management
          </span>
          <h1 className="font-serif text-3xl text-[#F5F7FA] uppercase tracking-wide mt-1">
            Patrons &amp; Collectors Directory
          </h1>
        </div>
        <span className="text-xs text-[#8A95A5] font-mono px-3 py-1.5 rounded-xl neu-inset-sm">
          {patrons.length} Registered Patrons
        </span>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-[#8A95A5] absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search patrons by name, email, or city..."
          className="w-full pl-11 pr-4 py-3.5 rounded-2xl neu-inset text-xs text-[#EDEDED] placeholder:text-[#6E7B8E] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50"
        />
      </div>

      <div className="rounded-3xl neu-raised p-6">
        <div className="rounded-2xl neu-inset overflow-hidden border border-white/[0.02]">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase tracking-widest text-[#8A95A5] bg-[#12151c]/60 border-b border-white/[0.03]">
              <tr>
                <th className="p-4">Patron Name</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Residence</th>
                <th className="p-4">Privilege Tier</th>
                <th className="p-4">Orders</th>
                <th className="p-4">Lifetime Spend</th>
                <th className="p-4 text-right">Patron Since</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02] text-[#EDEDED]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-12 text-center text-[#8491A5]">
                  <div className="max-w-md mx-auto space-y-2">
                    <Users className="w-8 h-8 mx-auto text-[#C5A880]/50" />
                    <p className="text-sm font-medium text-[#FBF9F5]">
                      {isLoading ? "Loading clientele directory..." : "No Patrons Registered Yet"}
                    </p>
                    <p className="text-[11px] text-[#8491A5]">
                      {isLoading
                        ? "Querying verified profiles from Supabase..."
                        : "As clients register accounts or complete purchases, their dossiers and lifetime spending records will appear here."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-[#1A202C]/60 transition-colors">
                  <td className="p-4 font-semibold text-[#FBF9F5]">{p.name}</td>
                  <td className="p-4 text-[#8491A5]">
                    <p>{p.email}</p>
                    <p className="text-[10px]">{p.phone}</p>
                  </td>
                  <td className="p-4 text-[#8491A5]">{p.city}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 bg-[#C5A880]/20 text-[#C5A880] text-[10px] uppercase tracking-wider font-semibold border border-[#C5A880]/30">
                      {p.tier}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-medium">{p.ordersCount} acquisitions</td>
                  <td className="p-4 font-semibold text-[#FBF9F5]">
                    {formatINR(p.totalSpent)}
                  </td>
                  <td className="p-4 text-right text-[#8491A5] font-mono text-[11px]">
                    {p.memberSince}
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
