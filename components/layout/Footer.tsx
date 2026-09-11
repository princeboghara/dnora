"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Check, Heart } from "lucide-react";
import { DEFAULT_STORE_SETTINGS } from "@/lib/seed/catalog-data";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-[#111111] text-[#E8E2D9] pt-16 pb-12 border-t border-[#262626]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Newsletter & Atelier Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-[#262626]">
          {/* Brand Philosophy */}
          <div className="lg:col-span-6 space-y-4">
            <Link href="/" className="inline-block group">
              <img
                src="/images/logo/dnora-logo-gold.png"
                alt="DNORA"
                className="h-8 sm:h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
            <p className="font-sans text-xs tracking-[0.2em] text-[#C5A880] uppercase font-medium">
              Luxury Handbags & Lifestyle Accessories
            </p>
            <p className="text-xs text-[#A89F91] leading-relaxed max-w-md">
              DNORA brings effortless modern luxury to everyday fashion. Thoughtfully designed with signature silhouettes, rich textures, and bespoke hardware to accompany the contemporary woman on every journey.
            </p>
            <div className="flex items-center gap-6 pt-2 text-[11px] text-[#C5A880] tracking-widest uppercase font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Genuine Quality
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Crafted With Precision
              </span>
            </div>
          </div>

          {/* Newsletter Box */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-4">
            <div className="space-y-1">
              <h3 className="font-sans font-medium text-lg text-[#F5F2EB] tracking-[0.1em] uppercase">
                Join The DNORA VIP Circle
              </h3>
              <p className="text-xs text-[#A89F91]">
                Be the first to explore new handbag releases and get an extra 10% off with coupon code <strong className="text-[#C5A880]">DNORA10</strong>.
              </p>
            </div>

            {subscribed ? (
              <div className="flex items-center gap-2 p-3 bg-[#1A261F] border border-[#2B4734] text-[#A3D9B5] text-xs">
                <Check className="w-4 h-4" />
                <span>Thank you. Your exclusive 10% coupon code is DNORA10.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex max-w-md">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="flex-1 px-4 py-3 bg-[#1A1918] border border-[#333333] text-xs text-[#F5F2EB] placeholder:text-[#7A746B] focus:outline-none focus:border-[#C5A880]"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#C5A880] text-[#111111] text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#DFCAAB] transition-colors flex items-center gap-1.5"
                >
                  <span>Join</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Links Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b border-[#262626] text-xs">
          {/* Shop */}
          <div className="space-y-3">
            <h4 className="font-sans text-xs uppercase tracking-[0.2em] text-[#F5F2EB] font-semibold">
              Handbags & Totes
            </h4>
            <ul className="space-y-2 text-[#A89F91]">
              <li>
                <Link href="/shop/handbags" className="hover:text-[#C5A880] transition-colors">
                  Shoulder Bags
                </Link>
              </li>
              <li>
                <Link href="/shop/tote-bags" className="hover:text-[#C5A880] transition-colors">
                  Tote Bags
                </Link>
              </li>
              <li>
                <Link href="/shop/sling-bags" className="hover:text-[#C5A880] transition-colors">
                  Crossbody Slings
                </Link>
              </li>
              <li>
                <Link href="/shop/satchels" className="hover:text-[#C5A880] transition-colors">
                  Structured Satchels
                </Link>
              </li>
              <li>
                <Link href="/shop/clutches" className="hover:text-[#C5A880] transition-colors">
                  Clutches & Wristlets
                </Link>
              </li>
              <li>
                <Link href="/shop/backpacks" className="hover:text-[#C5A880] transition-colors">
                  Women&apos;s Backpacks
                </Link>
              </li>
            </ul>
          </div>

          {/* Collections */}
          <div className="space-y-3">
            <h4 className="font-sans text-xs uppercase tracking-[0.2em] text-[#F5F2EB] font-semibold">
              Curated Edits
            </h4>
            <ul className="space-y-2 text-[#A89F91]">
              <li>
                <Link href="/shop?collection=everyday-luxury" className="hover:text-[#C5A880] transition-colors">
                  The Everyday Luxury Edit
                </Link>
              </li>
              <li>
                <Link href="/shop?collection=bridal-edit" className="hover:text-[#C5A880] transition-colors">
                  The Royal Trousseau & Bridal
                </Link>
              </li>
              <li>
                <Link href="/shop?collection=summer-edit" className="hover:text-[#C5A880] transition-colors">
                  Summer Solstice & Resort
                </Link>
              </li>
              <li>
                <Link href="/shop?collection=evening-collection" className="hover:text-[#C5A880] transition-colors">
                  Nocturne Evening Glamour
                </Link>
              </li>
              <li>
                <Link href="/shop?filter=new" className="hover:text-[#C5A880] transition-colors">
                  Debut Arrivals
                </Link>
              </li>
            </ul>
          </div>

          {/* Atelier Heritage */}
          <div className="space-y-3">
            <h4 className="font-sans text-xs uppercase tracking-[0.2em] text-[#F5F2EB] font-semibold">
              The Maison
            </h4>
            <ul className="space-y-2 text-[#A89F91]">
              <li>
                <Link href="/about" className="hover:text-[#C5A880] transition-colors">
                  Atelier Heritage
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#C5A880] transition-colors">
                  Artisanal Craftsmanship
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#C5A880] transition-colors">
                  Sustainable Luxury
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#C5A880] transition-colors">
                  Press & Media Enquiries
                </Link>
              </li>
            </ul>
          </div>

          {/* Concierge & Care */}
          <div className="space-y-3">
            <h4 className="font-sans text-xs uppercase tracking-[0.2em] text-[#F5F2EB] font-semibold">
              Client Concierge
            </h4>
            <ul className="space-y-2 text-[#A89F91]">
              <li>
                <span className="text-[#F5F2EB]">Direct Line:</span> {DEFAULT_STORE_SETTINGS.concierge_phone}
              </li>
              <li>
                <span className="text-[#F5F2EB]">Email:</span> {DEFAULT_STORE_SETTINGS.contact_email}
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#C5A880] transition-colors">
                  Complimentary Shipping & Returns
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#C5A880] transition-colors">
                  Leather & Jewellery Care Guide
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-[#C5A880] transition-colors">
                  Track Your Order
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#7A746B]">
          <p>© {new Date().getFullYear()} D&apos;NORA Atelier Private Limited. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Complimentary Pan-India Shipping</span>
            <span>•</span>
            <span>Razorpay 256-Bit SSL Secure</span>
            <span>•</span>
            <span>Hallmarked Authenticity</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
