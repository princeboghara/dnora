"use client";

import React, { useState } from "react";
import { Check, Save, Settings, ShieldCheck } from "lucide-react";
import { DEFAULT_STORE_SETTINGS } from "@/lib/seed/catalog-data";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(DEFAULT_STORE_SETTINGS);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold font-mono">
            System &amp; Operations
          </span>
          <h1 className="font-sans text-2xl sm:text-3xl text-[#0F172A] uppercase tracking-[0.12em] font-bold mt-1">
            Store Settings &amp; Policies
          </h1>
        </div>

        {saved && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl shadow-sm">
            <Check className="w-3.5 h-3.5" /> Settings Saved
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* General Store Identity */}
        <div className="rounded-3xl neu-card bg-white border border-slate-200/80 p-6 space-y-4 shadow-sm">
          <h3 className="font-sans font-bold text-sm text-[#0F172A] uppercase tracking-[0.15em] pb-3 border-b border-slate-200/80">
            Atelier Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-[#475569] font-mono font-semibold">Brand Name</label>
              <input
                type="text"
                value={settings.brand_name}
                onChange={(e) => setSettings({ ...settings, brand_name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl neu-inset bg-[#F1F5F9] text-[#0F172A] font-medium border border-slate-200/80 focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-[#475569] font-mono font-semibold">Operating Currency</label>
              <input
                type="text"
                disabled
                value="Indian Rupee (₹ INR)"
                className="w-full px-4 py-3 rounded-xl neu-inset bg-[#F1F5F9] text-[#64748B] font-mono font-medium border border-slate-200/80 cursor-not-allowed opacity-80"
              />
            </div>
          </div>
        </div>

        {/* Shipping & Taxes */}
        <div className="rounded-3xl neu-card bg-white border border-slate-200/80 p-6 space-y-4 shadow-sm">
          <h3 className="font-sans font-bold text-sm text-[#0F172A] uppercase tracking-[0.15em] pb-3 border-b border-slate-200/80">
            Shipping &amp; Fiscal Policies
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-[#475569] font-mono font-semibold">
                Complimentary Shipping Threshold (₹)
              </label>
              <input
                type="number"
                value={settings.free_shipping_threshold}
                onChange={(e) => setSettings({ ...settings, free_shipping_threshold: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl neu-inset bg-[#F1F5F9] text-[#0F172A] font-mono font-medium border border-slate-200/80 focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-[#475569] font-mono font-semibold">
                Standard Courier Charge (₹)
              </label>
              <input
                type="number"
                value={settings.standard_shipping_fee}
                onChange={(e) => setSettings({ ...settings, standard_shipping_fee: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl neu-inset bg-[#F1F5F9] text-[#0F172A] font-mono font-medium border border-slate-200/80 focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-[#475569] font-mono font-semibold">
                Applicable GST Rate (%)
              </label>
              <input
                type="number"
                value={settings.tax_percentage}
                onChange={(e) => setSettings({ ...settings, tax_percentage: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl neu-inset bg-[#F1F5F9] text-[#0F172A] font-mono font-medium border border-slate-200/80 focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50"
              />
            </div>
          </div>
        </div>

        {/* Client Advisory Concierge */}
        <div className="rounded-3xl neu-card bg-white border border-slate-200/80 p-6 space-y-4 shadow-sm">
          <h3 className="font-sans font-bold text-sm text-[#0F172A] uppercase tracking-[0.15em] pb-3 border-b border-slate-200/80">
            Concierge Support Channels
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-[#475569] font-mono font-semibold">Inquiries Email</label>
              <input
                type="email"
                value={settings.contact_email}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl neu-inset bg-[#F1F5F9] text-[#0F172A] font-medium border border-slate-200/80 focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-[#475569] font-mono font-semibold">Advisory Telephone</label>
              <input
                type="tel"
                value={settings.concierge_phone}
                onChange={(e) => setSettings({ ...settings, concierge_phone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl neu-inset bg-[#F1F5F9] text-[#0F172A] font-medium border border-slate-200/80 focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-8 py-3.5 rounded-xl neu-btn-gold text-white text-xs uppercase tracking-[0.2em] font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>Update Store Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
