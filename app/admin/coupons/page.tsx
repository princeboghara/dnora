"use client";

import React, { useState, useEffect } from "react";
import { Plus, Tag, Trash2, Check, X } from "lucide-react";
import { Coupon } from "@/types";
import { formatINR } from "@/lib/utils";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState({
    code: "",
    description: "",
    discount_type: "percentage" as "percentage" | "fixed",
    discount_value: 10,
    min_cart_value: 5000,
    max_discount_amount: 5000,
  });

  useEffect(() => {
    async function loadCoupons() {
      setIsLoading(true);
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data } = await supabase
            .from("coupons")
            .select("*")
            .order("created_at", { ascending: false });

          if (data && data.length > 0) {
            setCoupons(
              data.map((c: any) => ({
                id: c.id,
                code: c.code,
                description: c.description || "Atelier promotional privilege",
                discount_type: c.discount_type,
                discount_value: Number(c.discount_value),
                min_cart_value: Number(c.min_cart_value || 0),
                max_discount_amount: c.max_discount_amount ? Number(c.max_discount_amount) : undefined,
                start_date: c.start_date,
                end_date: c.end_date,
                usage_limit: c.usage_limit || 100,
                times_used: c.times_used || 0,
                is_active: c.is_active ?? true,
              }))
            );
          } else {
            setCoupons([]);
          }
        } catch {
          setCoupons([]);
        }
      } else {
        setCoupons([]);
      }
      setIsLoading(false);
    }

    loadCoupons();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code) return;

    const newCoupon: Coupon = {
      id: `coup_${Date.now()}`,
      code: form.code.toUpperCase().trim(),
      description: form.description || "Atelier promotional privilege",
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      min_cart_value: Number(form.min_cart_value),
      max_discount_amount: form.discount_type === "percentage" ? Number(form.max_discount_amount) : undefined,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      usage_limit: 500,
      times_used: 0,
      is_active: true,
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from("coupons")
          .insert({
            code: newCoupon.code,
            description: newCoupon.description,
            discount_type: newCoupon.discount_type,
            discount_value: newCoupon.discount_value,
            min_cart_value: newCoupon.min_cart_value,
            max_discount_amount: newCoupon.max_discount_amount || null,
            end_date: newCoupon.end_date,
            usage_limit: newCoupon.usage_limit,
            is_active: true,
          })
          .select()
          .single();

        if (!error && data) {
          newCoupon.id = data.id;
        }
      } catch {
        // Fallback
      }
    }

    setCoupons([newCoupon, ...coupons]);
    setIsCreateOpen(false);
    setForm({
      code: "",
      description: "",
      discount_type: "percentage",
      discount_value: 10,
      min_cart_value: 5000,
      max_discount_amount: 5000,
    });
  };

  const handleToggle = async (id: string) => {
    const target = coupons.find((c) => c.id === id);
    if (!target) return;
    const nextState = !target.is_active;

    setCoupons(
      coupons.map((c) => (c.id === id ? { ...c, is_active: nextState } : c))
    );

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from("coupons").update({ is_active: nextState }).eq("id", id);
      } catch {
        // Ignore
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this privilege coupon code?")) {
      setCoupons(coupons.filter((c) => c.id !== id));
      if (isSupabaseConfigured() && supabase) {
        try {
          await supabase.from("coupons").delete().eq("id", id);
        } catch {
          // Ignore
        }
      }
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#252D3D]">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold">
            Promotions &amp; Privileges
          </span>
          <h1 className="font-serif text-3xl text-[#FBF9F5] uppercase tracking-wide">
            Coupon Codes Manager
          </h1>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-5 py-2.5 bg-[#C5A880] text-[#111111] text-xs uppercase tracking-widest font-semibold hover:bg-[#DFCAAB] transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Privilege Code</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-[#13171F] border border-[#252D3D] overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="text-[10px] uppercase tracking-widest text-[#8491A5] bg-[#1A202C] border-b border-[#252D3D]">
            <tr>
              <th className="p-4">Code</th>
              <th className="p-4">Description</th>
              <th className="p-4">Discount</th>
              <th className="p-4">Min. Cart Value</th>
              <th className="p-4">Usage (Times)</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#252D3D] text-[#E4E8EE]">
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-12 text-center text-[#8491A5]">
                  <div className="max-w-md mx-auto space-y-2">
                    <Tag className="w-8 h-8 mx-auto text-[#C5A880]/50" />
                    <p className="text-sm font-medium text-[#FBF9F5]">
                      {isLoading ? "Retrieving coupons..." : "No Active Privilege Codes"}
                    </p>
                    <p className="text-[11px] text-[#8491A5]">
                      {isLoading
                        ? "Connecting to database..."
                        : "Create exclusive promotional discounts, private client codes, or debut privileges using the \"New Privilege Code\" button above."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              coupons.map((c) => (
                <tr key={c.id} className="hover:bg-[#1A202C]/60 transition-colors">
                  <td className="p-4 font-mono font-bold text-sm text-[#C5A880]">
                    {c.code}
                  </td>
                  <td className="p-4 text-[#8491A5] max-w-xs">{c.description}</td>
                  <td className="p-4 font-semibold text-[#FBF9F5]">
                    {c.discount_type === "percentage" ? `${c.discount_value}% OFF` : `₹${c.discount_value} FLAT`}
                  </td>
                  <td className="p-4 font-mono text-[#8491A5]">{formatINR(c.min_cart_value)}</td>
                  <td className="p-4 font-mono text-[#8491A5]">
                    {c.times_used} / {c.usage_limit}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggle(c.id)}
                      className={`px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-semibold border cursor-pointer ${
                        c.is_active
                          ? "bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30"
                          : "bg-[#8491A5]/20 text-[#8491A5] border-[#8491A5]/30"
                      }`}
                    >
                      {c.is_active ? "Active" : "Disabled"}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-[#8491A5] hover:text-[#EF4444] transition-colors p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#13171F] border border-[#252D3D] p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#252D3D]">
              <h3 className="font-serif text-lg text-[#FBF9F5] uppercase tracking-wider">
                Create Privilege Code
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-[#8491A5] hover:text-[#FBF9F5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-[#8491A5] font-semibold">
                  Coupon Code (e.g. ROYAL20)
                </label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="ROYAL20"
                  className="w-full p-2.5 bg-[#1A202C] border border-[#252D3D] text-[#FBF9F5] uppercase font-mono tracking-wider focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-[#8491A5] font-semibold">
                  Description
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="20% Privilege discount for Royal Circle"
                  className="w-full p-2.5 bg-[#1A202C] border border-[#252D3D] text-[#FBF9F5] focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-[#8491A5] font-semibold">
                    Type
                  </label>
                  <select
                    value={form.discount_type}
                    onChange={(e) => setForm({ ...form, discount_type: e.target.value as any })}
                    className="w-full p-2.5 bg-[#1A202C] border border-[#252D3D] text-[#FBF9F5] focus:outline-none focus:border-[#C5A880]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (₹)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-[#8491A5] font-semibold">
                    Discount Value
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.discount_value}
                    onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })}
                    className="w-full p-2.5 bg-[#1A202C] border border-[#252D3D] text-[#FBF9F5] focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-[#8491A5] font-semibold">
                    Min Order Value (₹)
                  </label>
                  <input
                    type="number"
                    value={form.min_cart_value}
                    onChange={(e) => setForm({ ...form, min_cart_value: Number(e.target.value) })}
                    className="w-full p-2.5 bg-[#1A202C] border border-[#252D3D] text-[#FBF9F5] focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-[#8491A5] font-semibold">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    value={form.max_discount_amount}
                    onChange={(e) => setForm({ ...form, max_discount_amount: Number(e.target.value) })}
                    className="w-full p-2.5 bg-[#1A202C] border border-[#252D3D] text-[#FBF9F5] focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#252D3D]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs uppercase text-[#8491A5] hover:text-[#FBF9F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C5A880] text-[#111111] text-xs uppercase font-semibold hover:bg-[#DFCAAB]"
                >
                  Publish Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
