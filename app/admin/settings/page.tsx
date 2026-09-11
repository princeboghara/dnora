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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#252D3D]">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold">
            System & Operations
          </span>
          <h1 className="font-serif text-3xl text-[#FBF9F5] uppercase tracking-wide">
            Store Settings & Policies
          </h1>
        </div>

        {saved && (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 text-xs font-semibold">
            <Check className="w-3.5 h-3.5" /> Settings Saved
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* General Store Identity */}
        <div className="bg-[#13171F] border border-[#252D3D] p-6 space-y-4">
          <h3 className="font-serif text-base text-[#FBF9F5] uppercase tracking-wider pb-2 border-b border-[#252D3D]">
            Atelier Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-[#8491A5]">Brand Name</label>
              <input
                type="text"
                value={settings.brand_name}
                onChange={(e) => setSettings({ ...settings, brand_name: e.target.value })}
                className="w-full p-2.5 bg-[#1A202C] border border-[#252D3D] text-[#E4E8EE]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-[#8491A5]">Operating Currency</label>
              <input
                type="text"
                disabled
                value="Indian Rupee (₹ INR)"
                className="w-full p-2.5 bg-[#1A202C] border border-[#252D3D] text-[#8491A5]"
              />
            </div>
          </div>
        </div>

        {/* Shipping & Taxes */}
        <div className="bg-[#13171F] border border-[#252D3D] p-6 space-y-4">
          <h3 className="font-serif text-base text-[#FBF9F5] uppercase tracking-wider pb-2 border-b border-[#252D3D]">
            Shipping & Fiscal Policies
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-[#8491A5]">
                Complimentary Shipping Threshold (₹)
              </label>
              <input
                type="number"
                value={settings.free_shipping_threshold}
                onChange={(e) => setSettings({ ...settings, free_shipping_threshold: Number(e.target.value) })}
                className="w-full p-2.5 bg-[#1A202C] border border-[#252D3D] text-[#E4E8EE]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-[#8491A5]">
                Standard Courier Charge (₹)
              </label>
              <input
                type="number"
                value={settings.standard_shipping_fee}
                onChange={(e) => setSettings({ ...settings, standard_shipping_fee: Number(e.target.value) })}
                className="w-full p-2.5 bg-[#1A202C] border border-[#252D3D] text-[#E4E8EE]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-[#8491A5]">
                Applicable GST Rate (%)
              </label>
              <input
                type="number"
                value={settings.tax_percentage}
                onChange={(e) => setSettings({ ...settings, tax_percentage: Number(e.target.value) })}
                className="w-full p-2.5 bg-[#1A202C] border border-[#252D3D] text-[#E4E8EE]"
              />
            </div>
          </div>
        </div>

        {/* Client Advisory Concierge */}
        <div className="bg-[#13171F] border border-[#252D3D] p-6 space-y-4">
          <h3 className="font-serif text-base text-[#FBF9F5] uppercase tracking-wider pb-2 border-b border-[#252D3D]">
            Concierge Support Channels
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-[#8491A5]">Inquiries Email</label>
              <input
                type="email"
                value={settings.contact_email}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                className="w-full p-2.5 bg-[#1A202C] border border-[#252D3D] text-[#E4E8EE]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-[#8491A5]">Advisory Telephone</label>
              <input
                type="tel"
                value={settings.concierge_phone}
                onChange={(e) => setSettings({ ...settings, concierge_phone: e.target.value })}
                className="w-full p-2.5 bg-[#1A202C] border border-[#252D3D] text-[#E4E8EE]"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-8 py-3.5 bg-[#C5A880] text-[#111111] text-xs uppercase tracking-[0.25em] font-semibold hover:bg-[#DFCAAB] transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Update Store Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
