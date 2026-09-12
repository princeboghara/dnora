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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold font-mono">
            Promotions &amp; Privileges
          </span>
          <h1 className="font-sans text-2xl sm:text-3xl text-[#0F172A] uppercase tracking-[0.12em] font-bold mt-1">
            Coupon Codes Manager
          </h1>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-5 py-2.5 rounded-xl neu-btn-gold text-white text-xs uppercase tracking-widest font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Privilege Code</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="rounded-3xl neu-card bg-white border border-slate-200/80 p-6 shadow-sm">
        <div className="rounded-2xl overflow-hidden border border-slate-200/80">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase tracking-widest text-[#475569] bg-[#F8FAFC] border-b border-slate-200 font-mono font-semibold">
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
            <tbody className="divide-y divide-slate-100 text-[#0F172A]">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-[#64748B]">
                    <div className="max-w-md mx-auto space-y-2">
                      <Tag className="w-8 h-8 mx-auto text-[#C5A880]/60" />
                      <p className="text-sm font-semibold text-[#0F172A]">
                        {isLoading ? "Retrieving coupons..." : "No Active Privilege Codes"}
                      </p>
                      <p className="text-[11px] text-[#64748B]">
                        {isLoading
                          ? "Connecting to database..."
                          : "Create exclusive promotional discounts, private client codes, or debut privileges using the \"New Privilege Code\" button above."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono font-bold text-sm text-[#C5A880]">
                      {c.code}
                    </td>
                    <td className="p-4 text-[#64748B] max-w-xs font-medium">{c.description}</td>
                    <td className="p-4 font-bold text-[#0F172A]">
                      {c.discount_type === "percentage" ? `${c.discount_value}% OFF` : `₹${c.discount_value} FLAT`}
                    </td>
                    <td className="p-4 font-mono text-[#64748B]">{formatINR(c.min_cart_value)}</td>
                    <td className="p-4 font-mono text-[#64748B]">
                      {c.times_used} / {c.usage_limit}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggle(c.id)}
                        className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold border cursor-pointer transition-all ${
                          c.is_active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {c.is_active ? "Active" : "Disabled"}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-[#64748B] hover:text-red-500 transition-colors p-1.5 rounded-lg neu-btn cursor-pointer inline-flex items-center justify-center"
                        title="Delete coupon"
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
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="neu-card bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
              <h3 className="font-sans font-bold text-sm text-[#0F172A] uppercase tracking-[0.15em]">
                Create Privilege Code
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 rounded-xl neu-btn text-[#64748B] hover:text-[#0F172A] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-[#475569] font-mono font-semibold">
                  Coupon Code (e.g. ROYAL20)
                </label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="ROYAL20"
                  className="w-full p-2.5 rounded-xl neu-inset bg-[#F1F5F9] text-[#0F172A] uppercase font-mono tracking-wider font-bold placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-[#475569] font-mono font-semibold">
                  Description
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="20% Privilege discount for Royal Circle"
                  className="w-full p-2.5 rounded-xl neu-inset bg-[#F1F5F9] text-[#0F172A] placeholder-[#94A3B8] font-medium focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-[#475569] font-mono font-semibold">
                    Type
                  </label>
                  <select
                    value={form.discount_type}
                    onChange={(e) => setForm({ ...form, discount_type: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl neu-inset bg-[#F1F5F9] text-[#0F172A] font-medium focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (₹)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-[#475569] font-mono font-semibold">
                    Discount Value
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.discount_value}
                    onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl neu-inset bg-[#F1F5F9] text-[#0F172A] font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-[#475569] font-mono font-semibold">
                    Min Order Value (₹)
                  </label>
                  <input
                    type="number"
                    value={form.min_cart_value}
                    onChange={(e) => setForm({ ...form, min_cart_value: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl neu-inset bg-[#F1F5F9] text-[#0F172A] font-mono font-medium focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-[#475569] font-mono font-semibold">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    value={form.max_discount_amount}
                    onChange={(e) => setForm({ ...form, max_discount_amount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl neu-inset bg-[#F1F5F9] text-[#0F172A] font-mono font-medium focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs uppercase font-semibold text-[#64748B] hover:text-[#0F172A] rounded-xl neu-btn cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl neu-btn-gold text-white text-xs uppercase tracking-wider font-bold cursor-pointer"
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
