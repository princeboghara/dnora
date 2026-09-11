"use client";

import React, { useState } from "react";
import { PhoneCall, Mail, MapPin, Clock, Check } from "lucide-react";
import { DEFAULT_STORE_SETTINGS } from "@/lib/seed/catalog-data";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Private Atelier Consultation",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B] font-semibold">
          Personal Advisory
        </span>
        <h1 className="font-sans text-2xl sm:text-3xl lg:text-4xl text-[#111111] uppercase tracking-[0.12em] font-light">
          Client Concierge
        </h1>
        <p className="text-xs sm:text-sm text-[#6E6A64] font-light leading-relaxed">
          Our dedicated atelier advisors are at your service for bespoke commissions, size consultations, trousseau appointments, and private showings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#FAF7F2] border border-[#E8E2D9] p-6 space-y-4 text-xs">
            <h3 className="font-sans font-medium text-xs text-[#111111] uppercase tracking-[0.15em]">
              Atelier Direct Contact
            </h3>

            <div className="space-y-3 text-[#6E6A64]">
              <div className="flex items-start gap-3">
                <PhoneCall className="w-4 h-4 text-[#C5A880] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-[#111111]">Direct Advisory Hotline</p>
                  <p>{DEFAULT_STORE_SETTINGS.concierge_phone}</p>
                  <p className="text-[10px] text-[#8C7A6B]">Mon–Sat: 10:00 AM – 7:00 PM IST</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#C5A880] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-[#111111]">Electronic Inquiries</p>
                  <p>{DEFAULT_STORE_SETTINGS.contact_email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#C5A880] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-[#111111]">Flagship Atelier & Salon</p>
                  <p>The D&apos;NORA Atelier, Heritage District</p>
                  <p>Jaipur & South Mumbai, India</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-[#141414] text-[#F5F2EB] space-y-2 text-xs">
            <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-semibold">
              Bespoke Trousseau
            </span>
            <h4 className="font-sans text-sm font-medium uppercase tracking-wide">Private Bridal Showroom Bookings</h4>
            <p className="text-[#A89F91] leading-relaxed">
              We offer exclusive private salon viewings for bridal parties and fine jewellery bespoke acquisitions.
            </p>
          </div>
        </div>

        {/* Inquiries Form */}
        <div className="lg:col-span-7 bg-[#FAF7F2] border border-[#E8E2D9] p-8 sm:p-10">
          {submitted ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#EAF2ED] border border-[#245744] text-[#245744] flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="font-sans font-medium text-xl text-[#111111] uppercase tracking-wide">
                Your Message Has Been Received
              </h3>
              <p className="text-xs text-[#6E6A64] max-w-sm mx-auto">
                A dedicated D&apos;NORA client advisor will contact you within 12 business hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <h3 className="font-sans font-medium text-sm text-[#111111] uppercase tracking-[0.15em] pb-2 border-b border-[#E8E2D9]">
                Initiate Concierge Enquiry
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full p-3 bg-[#FBF9F5] border border-[#D5CDC0] focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full p-3 bg-[#FBF9F5] border border-[#D5CDC0] focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">
                    Telephone Number
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full p-3 bg-[#FBF9F5] border border-[#D5CDC0] focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">
                    Nature of Enquiry
                  </label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full p-3 bg-[#FBF9F5] border border-[#D5CDC0] focus:outline-none focus:border-[#111111]"
                  >
                    <option>Private Atelier Consultation</option>
                    <option>Bespoke Bridal Trousseau</option>
                    <option>Haute Parfumerie Commission</option>
                    <option>Order & Delivery Assistance</option>
                    <option>Press & Editorial Styling</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">
                  Your Message
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Kindly elaborate on your inquiry or preferred dates for showroom consultation..."
                  className="w-full p-3 bg-[#FBF9F5] border border-[#D5CDC0] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#141414] hover:bg-[#C5A880] hover:text-[#111111] text-[#F5F2EB] text-xs uppercase tracking-[0.25em] font-medium transition-all"
              >
                Transmit Inquiries To Atelier
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
