"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, Archive, Check, ArrowDownCircle, Loader2 } from "lucide-react";
import { getProducts } from "@/lib/services/catalog-service";
import { Product } from "@/types";
import { formatINR } from "@/lib/utils";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export default function AdminInventoryPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const prods = await getProducts();
      setItems(prods);
      setIsLoading(false);
    }
    load();
  }, []);

  const handleStockAdjust = async (id: string, delta: number) => {
    const updated = items.map((p) => {
      if (p.id === id) {
        const newStock = Math.max(0, (p.stock_quantity ?? 0) + delta);
        return { ...p, stock_quantity: newStock };
      }
      return p;
    });
    setItems(updated);

    const target = updated.find((p) => p.id === id);
    if (target && isSupabaseConfigured() && supabase) {
      try {
        await supabase
          .from("products")
          .update({ stock_quantity: target.stock_quantity })
          .eq("id", id);
      } catch {
        // Fallback
      }
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold font-mono">
            Stock Control
          </span>
          <h1 className="font-sans text-2xl sm:text-3xl text-[#0F172A] uppercase tracking-[0.12em] font-bold mt-1">
            Inventory &amp; Threshold Alerts
          </h1>
        </div>
        <span className="text-xs text-[#64748B] font-mono px-3 py-1.5 rounded-xl neu-inset bg-[#F1F5F9] font-semibold">
          {items.length} Tracked SKUs
        </span>
      </div>

      <div className="rounded-3xl neu-card bg-white border border-slate-200/80 p-6 shadow-sm">
        <div className="rounded-2xl overflow-hidden border border-slate-200/80">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase tracking-widest text-[#475569] bg-[#F8FAFC] border-b border-slate-200 font-mono font-semibold">
              <tr>
                <th className="p-4">SKU Code</th>
                <th className="p-4">Product Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Available Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Quick Stock Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#0F172A]">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-[#64748B]">
                  <div className="max-w-md mx-auto space-y-2">
                    <Archive className="w-8 h-8 mx-auto text-[#C5A880]/60" />
                    <p className="text-sm font-semibold text-[#0F172A]">
                      {isLoading ? "Auditing atelier inventory..." : "No Products in Inventory"}
                    </p>
                    <p className="text-[11px] text-[#64748B]">
                      {isLoading
                        ? "Connecting to catalog database..."
                        : "The catalog currently has 0 items. Once creations are added, their inventory counts and threshold warnings will appear here."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono font-semibold text-[#C5A880]">{p.sku}</td>
                  <td className="p-4 font-sans text-[#0F172A] font-semibold">{p.name}</td>
                  <td className="p-4 uppercase text-[#64748B] font-medium">{p.category_slug}</td>
                  <td className="p-4 font-mono font-bold text-sm text-[#0F172A]">
                    {p.stock_quantity ?? 0} units
                  </td>
                  <td className="p-4">
                    {(p.stock_quantity ?? 0) <= 5 ? (
                      <span className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold uppercase flex items-center gap-1 w-fit">
                        <AlertTriangle className="w-3 h-3 text-rose-600" /> Critical Low Stock
                      </span>
                    ) : (p.stock_quantity ?? 0) <= 12 ? (
                      <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase w-fit block">
                        Low Stock Warning
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase w-fit block">
                        Optimal Stock
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleStockAdjust(p.id, -1)}
                        className="px-2.5 py-1 rounded-lg neu-btn text-[#0F172A] font-mono font-bold hover:text-red-500 cursor-pointer transition-all"
                      >
                        -1
                      </button>
                      <button
                        onClick={() => handleStockAdjust(p.id, 5)}
                        className="px-3 py-1 rounded-lg neu-btn-gold text-white text-xs font-bold cursor-pointer transition-all"
                      >
                        +5 Restock
                      </button>
                    </div>
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
