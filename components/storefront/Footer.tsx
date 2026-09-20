"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

import { HomepageConfig } from "@/types";

type SectionKey = "collection" | "policies" | "story";

interface FooterProps {
  config?: HomepageConfig["footer"];
}

export function Footer({ config }: FooterProps) {
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    collection: false,
    policies: false,
    story: false,
  });

  if (config && config.enabled === false) {
    return null;
  }

  const brandSubtitle = config?.brand_subtitle || "Artisan Handbags • Florence • New York";
  const storyText = config?.story_text || "Architectural silhouettes, meticulous artisan leatherwork, and timeless aesthetics designed for the modern woman. Handcrafted with bespoke calfskin and precision hardware.";
  const headquarters = config?.headquarters || "Atelier Headquarters: Via de' Tornabuoni, Florence • Soho, New York";
  const instagramUrl = config?.instagram_url || "https://instagram.com/dnoralifestyle";
  const facebookUrl = config?.facebook_url || "https://facebook.com/dnoralifestyle";
  const pinterestUrl = config?.pinterest_url || "https://pinterest.com/dnoralifestyle";

  const toggleSection = (key: SectionKey) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <footer className="bg-[#090D16] text-white border-t border-slate-800/80 pt-5 sm:pt-7 pb-5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Brand Logo - Centered, Compact & Elegant */}
        <div className="flex flex-col items-center justify-center text-center mb-3.5 sm:mb-4">
          <BrandLogo size="md" />
          <p className="mt-1.5 text-[11px] text-slate-400 uppercase tracking-[0.2em]">
            {brandSubtitle}
          </p>
        </div>

        {/* Collapsible Accordion Navigation (Initial state: closed) */}
        <div className="border-t border-b border-slate-800 divide-y divide-slate-800">
          {/* 1. OUR COLLECTION */}
          <div className="py-1">
            <button
              type="button"
              onClick={() => toggleSection("collection")}
              aria-expanded={openSections.collection}
              className="w-full flex items-center justify-between py-2 text-left group transition-colors focus:outline-none cursor-pointer"
            >
              <span className="text-xs sm:text-sm font-heading font-bold uppercase tracking-[0.2em] text-white group-hover:text-slate-200">
                OUR COLLECTION
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
                  openSections.collection ? "rotate-180 text-white" : ""
                }`}
              />
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openSections.collection ? "max-h-72 opacity-100 pb-4 pt-1" : "max-h-0 opacity-0"
              }`}
            >
              <ul className="space-y-2.5 text-xs text-[#A8A49C] pl-1">
                <li>
                  <Link
                    href="/category/tote-bags"
                    className="hover:text-white transition-colors block py-0.5"
                  >
                    Tote Bags
                  </Link>
                </li>
                <li>
                  <Link
                    href="/category/shoulder-bags"
                    className="hover:text-white transition-colors block py-0.5"
                  >
                    Shoulder Bags
                  </Link>
                </li>
                <li>
                  <Link
                    href="/category/crossbody-bags"
                    className="hover:text-white transition-colors block py-0.5"
                  >
                    Crossbody Bags
                  </Link>
                </li>
                <li>
                  <Link
                    href="/category/mini-bags"
                    className="hover:text-white transition-colors block py-0.5"
                  >
                    Mini Bags
                  </Link>
                </li>
                <li>
                  <Link
                    href="/category/handbags"
                    className="hover:text-white transition-colors block py-0.5"
                  >
                    Handbags
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shop"
                    className="hover:text-white transition-colors block py-0.5 font-medium text-white"
                  >
                    View All Silhouettes &rarr;
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* 2. POLICIES */}
          <div className="py-1">
            <button
              type="button"
              onClick={() => toggleSection("policies")}
              aria-expanded={openSections.policies}
              className="w-full flex items-center justify-between py-2 text-left group transition-colors focus:outline-none cursor-pointer"
            >
              <span className="text-xs sm:text-sm font-heading font-bold uppercase tracking-[0.2em] text-white group-hover:text-slate-200">
                POLICIES
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
                  openSections.policies ? "rotate-180 text-white" : ""
                }`}
              />
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openSections.policies ? "max-h-60 opacity-100 pb-3 pt-1" : "max-h-0 opacity-0"
              }`}
            >
              <ul className="space-y-2 text-xs text-slate-400 pl-1">
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-white transition-colors block py-0.5"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-white transition-colors block py-0.5"
                  >
                    Terms &amp; Conditions
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shipping"
                    className="hover:text-white transition-colors block py-0.5"
                  >
                    Shipping Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/refunds"
                    className="hover:text-white transition-colors block py-0.5"
                  >
                    Return &amp; Refund Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* 3. OUR STORY */}
          <div className="py-1">
            <button
              type="button"
              onClick={() => toggleSection("story")}
              aria-expanded={openSections.story}
              className="w-full flex items-center justify-between py-2 text-left group transition-colors focus:outline-none cursor-pointer"
            >
              <span className="text-xs sm:text-sm font-heading font-bold uppercase tracking-[0.2em] text-white group-hover:text-slate-200">
                OUR STORY
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
                  openSections.story ? "rotate-180 text-white" : ""
                }`}
              />
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openSections.story ? "max-h-60 opacity-100 pb-3 pt-1" : "max-h-0 opacity-0"
              }`}
            >
              <div className="space-y-2.5 text-xs text-slate-400 leading-relaxed pl-1 max-w-xl">
                <p>
                  {storyText}
                </p>
                <p className="text-[11px] text-slate-500">
                  {headquarters}
                </p>
                <div>
                  <Link
                    href="/shop"
                    className="hover:text-white transition-colors font-medium text-white inline-block pt-0.5"
                  >
                    Explore Atelier Catalog &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SOCIAL ICONS (Instagram, Facebook, Pinterest - Prominent & Compact) */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Instagram */}
            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-600 hover:bg-slate-800 text-slate-300 hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-sm flex items-center justify-center cursor-pointer"
              >
                <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
            )}

            {/* Facebook */}
            {facebookUrl && (
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-600 hover:bg-slate-800 text-slate-300 hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-sm flex items-center justify-center cursor-pointer"
              >
                <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
            )}

            {/* Pinterest */}
            {pinterestUrl && (
              <a
                href={pinterestUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pinterest"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-600 hover:bg-slate-800 text-slate-300 hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-sm flex items-center justify-center cursor-pointer"
              >
                <svg className="w-5 h-5 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12.001-5.367 12.001-11.987C24.017 5.367 18.644 0 12.017 0z" />
                </svg>
              </a>
            )}
          </div>

          <p className="text-[11px] text-slate-400">
            &copy; {new Date().getFullYear()} DNORA Luxury House. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
