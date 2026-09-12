"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Check, Heart } from "lucide-react";
import { InstagramIcon } from "@/components/ui/InstagramIcon";
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16 py-12 border-b border-[#262626] text-xs">
          {/* Boutique Collections */}
          <div className="space-y-4">
            <h4 className="font-sans text-xs uppercase tracking-[0.25em] text-[#F5F2EB] font-semibold">
              Boutique Collections
            </h4>
            <ul className="space-y-2.5 text-[#A89F91]">
              <li>
                <Link href="/shop/handbags" className="hover:text-[#C5A880] transition-colors">
                  All Handbags
                </Link>
              </li>
              <li>
                <Link href="/shop/tote-bags" className="hover:text-[#C5A880] transition-colors">
                  Tote & Bowling Bags
                </Link>
              </li>
              <li>
                <Link href="/shop/sling-bags" className="hover:text-[#C5A880] transition-colors">
                  Sling & Crossbody Bags
                </Link>
              </li>
              <li>
                <Link href="/shop/perfumes" className="hover:text-[#C5A880] transition-colors">
                  Artisanal Fragrances
                </Link>
              </li>
              <li>
                <Link href="/shop?filter=bestselling" className="hover:text-[#C5A880] transition-colors">
                  Best Sellers
                </Link>
              </li>
            </ul>
          </div>

          {/* The Maison */}
          <div className="space-y-4">
            <h4 className="font-sans text-xs uppercase tracking-[0.25em] text-[#F5F2EB] font-semibold">
              The Maison
            </h4>
            <ul className="space-y-2.5 text-[#A89F91]">
              <li>
                <Link href="/about" className="hover:text-[#C5A880] transition-colors">
                  Atelier Heritage & Craft
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#C5A880] transition-colors">
                  Contact Concierge
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#C5A880] transition-colors">
                  Complimentary Shipping & Care Guide
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-[#C5A880] transition-colors">
                  Private Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Concierge & Support */}
          <div className="space-y-4">
            <h4 className="font-sans text-xs uppercase tracking-[0.25em] text-[#F5F2EB] font-semibold">
              Client Concierge
            </h4>
            <ul className="space-y-2.5 text-[#A89F91]">
              <li className="flex items-center gap-2">
                <span className="text-[#F5F2EB] font-medium">Direct Line:</span>
                <span className="text-[#C5A880]">{DEFAULT_STORE_SETTINGS.concierge_phone}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#F5F2EB] font-medium">Email:</span>
                <a href={`mailto:${DEFAULT_STORE_SETTINGS.contact_email}`} className="hover:text-[#C5A880] transition-colors">
                  {DEFAULT_STORE_SETTINGS.contact_email}
                </a>
              </li>
              <li className="pt-2">
                <a
                  href="https://www.instagram.com/dnora_lifestyle/?utm_source=ig_web_button_share_sheet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#1A1918] border border-[#333333] text-[#E8E2D9] hover:text-[#C5A880] hover:border-[#C5A880]/60 transition-all duration-300 group"
                >
                  <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-[#FD1D1D] via-[#E1306C] to-[#833AB4] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
                    <InstagramIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <span className="block text-[11px] font-semibold tracking-wider text-[#F5F2EB] group-hover:text-[#C5A880]">
                      @dnora_lifestyle
                    </span>
                    <span className="block text-[9px] uppercase tracking-widest text-[#7A746B]">
                      Follow on Instagram
                    </span>
                  </div>
                </a>
              </li>
              <li className="text-[11px] text-[#736A5E] pt-1 leading-relaxed">
                White-glove concierge available Monday to Saturday, 10:00 AM – 7:00 PM IST.
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#7A746B]">
          <div className="flex items-center gap-3">
            <p>© {new Date().getFullYear()} D&apos;NORA Atelier Private Limited. All rights reserved.</p>
            <a
              href="https://www.instagram.com/dnora_lifestyle/?utm_source=ig_web_button_share_sheet"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#A89F91] hover:text-[#C5A880] transition-colors p-1"
              aria-label="DNORA Official Instagram"
              title="Follow @dnora_lifestyle on Instagram"
            >
              <InstagramIcon className="w-4 h-4" />
            </a>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 text-[#9E9382]">
            <span>Complimentary Pan-India Delivery</span>
            <span>•</span>
            <span>100% Genuine Handcrafted Leather</span>
            <span>•</span>
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
