"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Sparkles } from "lucide-react";
import { InstagramIcon } from "@/components/ui/InstagramIcon";
import { DEFAULT_STORE_SETTINGS } from "@/lib/seed/catalog-data";

function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 012.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 01-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.43 1.03 2.6c.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.11-.23-.17-.48-.3z" />
    </svg>
  );
}

export function Footer() {
  const whatsappNumber = DEFAULT_STORE_SETTINGS.concierge_phone.replace(/[^0-9]/g, "") || "919999999999";

  return (
    <footer className="bg-[#111111] text-[#E8E2D9] pt-12 pb-10 border-t border-[#262626]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Main Grid: Brand Story, Boutique Links, Maison, and Socials */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 pb-10 border-b border-[#262626] text-xs">
          {/* Col 1: Brand Atelier */}
          <div className="space-y-3.5">
            <Link href="/" className="inline-block group">
              <img
                src="/images/logo/dnora-logo-gold.png"
                alt="DNORA"
                className="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
            <p className="font-sans text-[11px] tracking-[0.2em] text-[#C5A880] uppercase font-medium">
              Luxury Handbags &amp; Lifestyle Accessories
            </p>
            <p className="text-xs text-[#A89F91] leading-relaxed font-light">
              DNORA brings effortless modern luxury to everyday fashion. Signature silhouettes, rich textures, and bespoke hardware crafted with artisanal precision.
            </p>
            <div className="flex items-center gap-4 pt-1 text-[10px] text-[#C5A880] tracking-wider uppercase font-medium">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Genuine Quality
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Handcrafted
              </span>
            </div>
          </div>

          {/* Col 2: Boutique Collections */}
          <div className="space-y-3">
            <h4 className="font-sans text-xs uppercase tracking-[0.25em] text-[#F5F2EB] font-semibold">
              Boutique Collections
            </h4>
            <ul className="space-y-2 text-[#A89F91]">
              <li>
                <Link href="/shop/handbags" className="hover:text-[#C5A880] transition-colors">
                  All Handbags
                </Link>
              </li>
              <li>
                <Link href="/shop/tote-bags" className="hover:text-[#C5A880] transition-colors">
                  Tote &amp; Bowling Bags
                </Link>
              </li>
              <li>
                <Link href="/shop/crossbody-bags" className="hover:text-[#C5A880] transition-colors">
                  Crossbody &amp; Sling Bags
                </Link>
              </li>
              <li>
                <Link href="/shop/bucket-bags" className="hover:text-[#C5A880] transition-colors">
                  Bucket Bags
                </Link>
              </li>
              <li>
                <Link href="/shop?filter=bestselling" className="hover:text-[#C5A880] transition-colors">
                  Best Sellers
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: The Maison */}
          <div className="space-y-3">
            <h4 className="font-sans text-xs uppercase tracking-[0.25em] text-[#F5F2EB] font-semibold">
              The Maison
            </h4>
            <ul className="space-y-2 text-[#A89F91]">
              <li>
                <Link href="/about" className="hover:text-[#C5A880] transition-colors">
                  Atelier Heritage
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#C5A880] transition-colors">
                  Contact Concierge
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#C5A880] transition-colors">
                  Shipping &amp; Care Advisory
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-[#C5A880] transition-colors">
                  Private Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Connect & Social Channels */}
          <div className="space-y-4">
            <h4 className="font-sans text-xs uppercase tracking-[0.25em] text-[#F5F2EB] font-semibold">
              Connect With DNORA
            </h4>
            <p className="text-xs text-[#A89F91] font-light">
              Discover our latest creations, runway styling, and live concierge support.
            </p>

            {/* Social Buttons: Instagram, Facebook, WhatsApp */}
            <div className="flex items-center gap-3 pt-1">
              {/* Instagram Button */}
              <a
                href="https://www.instagram.com/dnora_lifestyle/?utm_source=ig_web_button_share_sheet"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#1A1918] border border-[#333333] hover:border-[#C5A880] text-[#E8E2D9] hover:text-[#C5A880] flex items-center justify-center transition-all shadow-xs hover:scale-105 group"
                title="Follow DNORA on Instagram"
                aria-label="Instagram Profile"
              >
                <InstagramIcon className="w-4 h-4 text-[#C5A880] group-hover:scale-110 transition-transform" />
              </a>

              {/* Facebook Button */}
              <a
                href="https://facebook.com/dnora.lifestyle"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#1A1918] border border-[#333333] hover:border-[#1877F2] text-[#E8E2D9] hover:text-[#1877F2] flex items-center justify-center transition-all shadow-xs hover:scale-105 group"
                title="Visit DNORA on Facebook"
                aria-label="Facebook Page"
              >
                <FacebookIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </a>

              {/* WhatsApp Button */}
              <a
                href={`https://wa.me/${whatsappNumber}?text=Hello%20DNORA%20Concierge`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#1A1918] border border-[#333333] hover:border-[#25D366] text-[#E8E2D9] hover:text-[#25D366] flex items-center justify-center transition-all shadow-xs hover:scale-105 group"
                title="Chat with Concierge on WhatsApp"
                aria-label="WhatsApp Concierge"
              >
                <WhatsAppIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </a>
            </div>

            <div className="pt-2 text-[11px] text-[#A89F91]">
              <span className="block text-[#C5A880] font-mono font-medium">
                Concierge: {DEFAULT_STORE_SETTINGS.concierge_phone}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#7A746B]">
          <p>© {new Date().getFullYear()} D&apos;NORA Atelier Private Limited. All rights reserved.</p>
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
