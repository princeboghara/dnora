"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="bg-[#0E0E0E] text-[#FAF9F6] border-t border-[#1C1B1A] pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 pb-16 border-b border-[#2C2B29]">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-6">
            <BrandLogo size="lg" />
            <p className="text-sm text-[#A8A49C] leading-relaxed max-w-sm">
              Architectural silhouettes, meticulous artisan leatherwork, and timeless aesthetics designed for the modern woman.
            </p>
            <div className="pt-2">
              <span className="text-xs uppercase tracking-[0.2em] text-[#C5A880] font-semibold block mb-1">
                Atelier Headquarters
              </span>
              <p className="text-xs text-[#73706A]">
                Via de&rsquo; Tornabuoni, Florence • Soho, New York
              </p>
            </div>
          </div>

          {/* Navigation Col */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FAF9F6]">
              Collections
            </h4>
            <ul className="space-y-2.5 text-sm text-[#A8A49C]">
              <li>
                <Link href="/shop" className="hover:text-[#FAF9F6] transition-colors">
                  All Handbags
                </Link>
              </li>
              <li>
                <Link href="/#categories" className="hover:text-[#FAF9F6] transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/#best-sellers" className="hover:text-[#FAF9F6] transition-colors">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link href="/#new-arrivals" className="hover:text-[#FAF9F6] transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/shop?category=shoulder-bags" className="hover:text-[#FAF9F6] transition-colors">
                  Shoulder Bags
                </Link>
              </li>
              <li>
                <Link href="/shop?category=tote-bags" className="hover:text-[#FAF9F6] transition-colors">
                  Tote Bags
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care Col */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FAF9F6]">
              Concierge
            </h4>
            <ul className="space-y-2.5 text-sm text-[#A8A49C]">
              <li>
                <Link href="/#contact" className="hover:text-[#FAF9F6] transition-colors">
                  Contact Concierge
                </Link>
              </li>
              <li>
                <Link href="/#shipping" className="hover:text-[#FAF9F6] transition-colors">
                  Complimentary Shipping
                </Link>
              </li>
              <li>
                <Link href="/#returns" className="hover:text-[#FAF9F6] transition-colors">
                  Returns &amp; Exchanges
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-[#FAF9F6] transition-colors">
                  Patron FAQ
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#C5A880] transition-colors">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Col */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FAF9F6]">
              The Gazette
            </h4>
            <p className="text-xs text-[#A8A49C] leading-relaxed">
              Receive private invitations to limited-edition bag drops and runway previews.
            </p>

            {subscribed ? (
              <div className="p-3 bg-white/10 rounded border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Thank you. You are subscribed to DNORA Private Gazette.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="w-full bg-[#1C1B1A] border border-[#2C2B29] px-4 py-3 text-xs text-white placeholder:text-[#73706A] rounded-sm focus:outline-none focus:border-[#C5A880] transition-colors"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe"
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-[#FAF9F6] text-[#0E0E0E] hover:bg-[#C5A880] text-xs font-semibold rounded-sm transition-colors flex items-center justify-center"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* Social Links */}
            <div className="pt-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#73706A] font-bold block mb-2">
                Follow Us
              </span>
              <div className="flex items-center space-x-4 text-xs text-[#A8A49C]">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Instagram
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Facebook
                </a>
                <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Pinterest
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#73706A] gap-4">
          <p>&copy; {new Date().getFullYear()} DNORA Luxury House. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <Link href="/privacy" className="hover:text-[#FAF9F6] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[#FAF9F6] transition-colors">
              Terms of Service
            </Link>
            <Link href="/refunds" className="hover:text-[#FAF9F6] transition-colors">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
