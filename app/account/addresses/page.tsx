"use client";

import React, { useState } from "react";
import { Plus, Trash2, MapPin, Check } from "lucide-react";
import { Address } from "@/types";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "addr-1",
      full_name: "Maharani Devika Rathore",
      phone: "+91 98290 11223",
      street: "7 Umaid Heritage Enclave",
      landmark: "Circuit House Road",
      city: "Jodhpur",
      state: "Rajasthan",
      postal_code: "342006",
      country: "India",
      is_default: true,
      address_type: "shipping",
    },
    {
      id: "addr-2",
      full_name: "Devika Rathore",
      phone: "+91 98290 11223",
      street: "Penthouse 18, Worli Sea Face Towers",
      landmark: "Near Four Seasons",
      city: "Mumbai",
      state: "Maharashtra",
      postal_code: "400018",
      country: "India",
      is_default: false,
      address_type: "shipping",
    },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newAddr, setNewAddr] = useState({
    full_name: "",
    phone: "",
    street: "",
    landmark: "",
    city: "",
    state: "Delhi NCR",
    postal_code: "",
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.full_name || !newAddr.street) return;

    const added: Address = {
      id: `addr_${Date.now()}`,
      ...newAddr,
      country: "India",
      is_default: addresses.length === 0,
      address_type: "shipping",
    };

    setAddresses([...addresses, added]);
    setIsAdding(false);
    setNewAddr({
      full_name: "",
      phone: "",
      street: "",
      landmark: "",
      city: "",
      state: "Delhi NCR",
      postal_code: "",
    });
  };

  const handleSetDefault = (id: string) => {
    setAddresses(
      addresses.map((a) => ({
        ...a,
        is_default: a.id === id,
      }))
    );
  };

  const handleDelete = (id: string) => {
    setAddresses(addresses.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B] font-semibold">
            Delivery Destinations
          </span>
          <h1 className="font-serif text-3xl text-[#111111] uppercase tracking-wide font-light">
            Saved Addresses
          </h1>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-5 py-2.5 bg-[#141414] text-[#F5F2EB] text-xs uppercase tracking-widest font-medium hover:bg-[#C5A880] hover:text-[#111111] transition-all flex items-center gap-2"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Address</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-[#FAF7F2] border border-[#E8E2D9] p-6 sm:p-8 space-y-4 text-xs">
          <h3 className="font-serif text-lg text-[#111111] uppercase tracking-wider pb-2 border-b border-[#E8E2D9]">
            Add Destination Address
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">Recipient Name</label>
              <input
                type="text"
                required
                value={newAddr.full_name}
                onChange={(e) => setNewAddr({ ...newAddr, full_name: e.target.value })}
                className="w-full p-2.5 bg-[#FBF9F5] border border-[#D5CDC0]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">Contact Phone</label>
              <input
                type="tel"
                required
                value={newAddr.phone}
                onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                className="w-full p-2.5 bg-[#FBF9F5] border border-[#D5CDC0]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">Street Address</label>
            <input
              type="text"
              required
              value={newAddr.street}
              onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
              className="w-full p-2.5 bg-[#FBF9F5] border border-[#D5CDC0]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">City</label>
              <input
                type="text"
                required
                value={newAddr.city}
                onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                className="w-full p-2.5 bg-[#FBF9F5] border border-[#D5CDC0]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">State</label>
              <input
                type="text"
                required
                value={newAddr.state}
                onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                className="w-full p-2.5 bg-[#FBF9F5] border border-[#D5CDC0]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">PIN Code</label>
              <input
                type="text"
                required
                maxLength={6}
                value={newAddr.postal_code}
                onChange={(e) => setNewAddr({ ...newAddr, postal_code: e.target.value })}
                className="w-full p-2.5 bg-[#FBF9F5] border border-[#D5CDC0]"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#141414] text-[#F5F2EB] text-xs uppercase tracking-widest font-medium"
            >
              Save Address
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2.5 text-xs text-[#8C7A6B] hover:text-[#111111]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`p-6 bg-[#FAF7F2] border transition-all text-xs space-y-3 ${
              addr.is_default ? "border-[#111111] ring-1 ring-[#111111]" : "border-[#E8E2D9]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-[#111111]">{addr.full_name}</span>
              {addr.is_default ? (
                <span className="px-2.5 py-0.5 bg-[#141414] text-[#C5A880] text-[9px] uppercase tracking-widest font-bold">
                  Default
                </span>
              ) : (
                <button
                  onClick={() => handleSetDefault(addr.id)}
                  className="text-[10px] uppercase tracking-wider text-[#8C7A6B] hover:text-[#111111] underline"
                >
                  Set As Default
                </button>
              )}
            </div>

            <p className="text-[#6E6A64] leading-relaxed">
              {addr.street}
              {addr.landmark && `, Near ${addr.landmark}`}
              <br />
              {addr.city}, {addr.state} - {addr.postal_code}
              <br />
              {addr.country}
            </p>

            <p className="text-[#8C7A6B]">Phone: {addr.phone}</p>

            <div className="pt-2 border-t border-[#E8E2D9] flex justify-end">
              <button
                onClick={() => handleDelete(addr.id)}
                className="text-[#9C9488] hover:text-[#8B0000] flex items-center gap-1 transition-colors text-[11px]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
