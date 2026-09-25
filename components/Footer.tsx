"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, MapPin, Phone, ShieldCheck, Sparkles } from "lucide-react";

export function Footer() {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    collections: false,
    clientCare: false,
    theMaison: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer aria-label="DNORA Maison Footer" className="w-full bg-[#0E0E0E] text-white">
      {/* Top Value Propositions on Desktop */}
      <div className="hidden md:block border-b border-white/10 py-5 bg-[#090909]">
        <div className="max-w-[1820px] 2xl:max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid grid-cols-4 gap-6 text-center lg:text-left">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-neutral-300" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-white">Florentine Heritage</p>
                <p className="text-[11px] text-neutral-400 font-light">Handcrafted in Florence, Italy</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-neutral-300" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-white">Vegetable-Tanned</p>
                <p className="text-[11px] text-neutral-400 font-light">100% Certified Italian Calfskin</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-neutral-300" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-white">Maison Concierge</p>
                <p className="text-[11px] text-neutral-400 font-light">Bespoke Client Styling Advice</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-neutral-300" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-white">Complimentary Delivery</p>
                <p className="text-[11px] text-neutral-400 font-light">Insured White-Glove Dispatch</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Brand Narrative */}
      <div className="py-8 sm:py-10 md:py-14">
        <div className="max-w-[1820px] 2xl:max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 sm:gap-10 items-start">
            {/* Brand Intro Column with Logo, Narrative & Atelier Information */}
            <div className="md:col-span-2 space-y-4">
              <Link href="/" className="inline-block">
                <div className="relative h-8 w-40 sm:h-10 sm:w-48 md:h-11 md:w-52">
                  <Image
                    src="/images/logo.png"
                    alt="DNORA"
                    fill
                    sizes="240px"
                    className="object-contain brightness-0 invert"
                  />
                </div>
              </Link>

              <p className="text-xs text-neutral-400 font-light leading-relaxed max-w-sm">
                Architectural silhouettes engineered with artisanal discipline. Every DNORA silhouette is hand-cut from vegetable-tanned Italian leather in Florence, Italy, sculpted for enduring elegance.
              </p>

              {/* Atelier & Concierge details for desktop richness */}
              <div className="pt-2 text-[11px] text-neutral-400 font-light space-y-1.5 border-t border-white/10 max-w-sm">
                <p>
                  <strong className="text-white/90 font-medium">Florentine Atelier:</strong> Via de&apos; Tornabuoni 14, 50123 Firenze, Italy
                </p>
                <p>
                  <strong className="text-white/90 font-medium">WhatsApp / Concierge:</strong>{" "}
                  <a
                    href="https://wa.me/919016047308"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 font-medium underline transition-colors"
                  >
                    +91 90160 47308
                  </a>
                </p>
                <p>
                  <strong className="text-white/90 font-medium">Client Concierge:</strong> Mon – Sat: 9:00 – 19:00 CET | concierge@dnora.it
                </p>
              </div>

              {/* Social Channels */}
              <div className="flex items-center gap-3 pt-2">
                {/* Instagram */}
                <a
                  href="https://www.instagram.com/dnora_lifestyle/?hl=en"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram @dnora_lifestyle"
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:border-white transition-colors"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  href="https://www.facebook.com/share/18Na18aHCQ/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook DNORA"
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:border-white transition-colors"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>

                {/* WhatsApp */}
                <a
                  href="https://wa.me/919016047308"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp +91 90160 47308"
                  title="WhatsApp: 9016047308"
                  className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 hover:text-white hover:bg-emerald-600 hover:border-emerald-600 transition-all"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                </a>

                {/* YouTube */}
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:border-white transition-colors"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 3: Collections (Collapsible on Mobile, ALWAYS OPEN on Desktop) */}
            <div className="border-b border-white/10 md:border-b-0 pb-3 md:pb-0">
              <button
                type="button"
                onClick={() => toggleSection("collections")}
                aria-expanded={openSections.collections}
                className="w-full flex items-center justify-between py-2 cursor-pointer group text-left md:pointer-events-none md:cursor-default"
              >
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white group-hover:text-neutral-200 transition-colors">
                  Collections
                </h4>
                <ChevronDown
                  className={`w-4 h-4 text-neutral-400 transition-transform duration-300 md:hidden ${
                    openSections.collections ? "rotate-180 text-white" : ""
                  }`}
                />
              </button>

              <ul
                className={`pt-2 pb-2 md:pt-3 space-y-2.5 text-xs text-neutral-400 font-light transition-all ${
                  openSections.collections ? "block" : "hidden md:block"
                }`}
              >
                <li>
                  <Link href="/category/tote-bags" className="hover:text-white transition-colors block py-0.5">
                    Tote Bags
                  </Link>
                </li>
                <li>
                  <Link href="/category/shoulder-bags" className="hover:text-white transition-colors block py-0.5">
                    Shoulder Bags
                  </Link>
                </li>
                <li>
                  <Link href="/category/crossbody-bags" className="hover:text-white transition-colors block py-0.5">
                    Crossbody Bags
                  </Link>
                </li>
                <li>
                  <Link href="/category/handbags" className="hover:text-white transition-colors block py-0.5">
                    Handbags & Satchels
                  </Link>
                </li>
                <li>
                  <Link href="/category/mini-bags" className="hover:text-white transition-colors block py-0.5">
                    Mini & Clutches
                  </Link>
                </li>
                <li>
                  <Link href="/trending-now" className="hover:text-white transition-colors block py-0.5">
                    Trending Now Lookbook
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="hover:text-white transition-colors block py-0.5 text-neutral-300 font-medium">
                    All Silhouettes →
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Client Care (Collapsible on Mobile, ALWAYS OPEN on Desktop) */}
            <div className="border-b border-white/10 md:border-b-0 pb-3 md:pb-0">
              <button
                type="button"
                onClick={() => toggleSection("clientCare")}
                aria-expanded={openSections.clientCare}
                className="w-full flex items-center justify-between py-2 cursor-pointer group text-left md:pointer-events-none md:cursor-default"
              >
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white group-hover:text-neutral-200 transition-colors">
                  Client Care
                </h4>
                <ChevronDown
                  className={`w-4 h-4 text-neutral-400 transition-transform duration-300 md:hidden ${
                    openSections.clientCare ? "rotate-180 text-white" : ""
                  }`}
                />
              </button>

              <ul
                className={`pt-2 pb-2 md:pt-3 space-y-2.5 text-xs text-neutral-400 font-light transition-all ${
                  openSections.clientCare ? "block" : "hidden md:block"
                }`}
              >
                <li>
                  <a
                    href="https://wa.me/919016047308"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-emerald-400 text-emerald-400 font-medium transition-colors flex items-center gap-1.5 py-0.5"
                  >
                    <span>WhatsApp Concierge: +91 90160 47308</span>
                  </a>
                </li>
                <li>
                  <Link href="/orders" className="hover:text-white transition-colors block py-0.5">
                    Track Your Delivery
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="hover:text-white transition-colors block py-0.5">
                    Shipping & Worldwide Customs
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="hover:text-white transition-colors block py-0.5">
                    Returns & Exchanges
                  </Link>
                </li>
                <li>
                  <Link href="/care" className="hover:text-white transition-colors block py-0.5">
                    Florentine Leather Care Guide
                  </Link>
                </li>
                <li>
                  <Link href="/authenticity" className="hover:text-white transition-colors block py-0.5">
                    Certificate of Authenticity
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-white transition-colors block py-0.5">
                    Frequently Asked Questions
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 5: The Maison (Collapsible on Mobile, ALWAYS OPEN on Desktop) */}
            <div className="border-b border-white/10 md:border-b-0 pb-3 md:pb-0">
              <button
                type="button"
                onClick={() => toggleSection("theMaison")}
                aria-expanded={openSections.theMaison}
                className="w-full flex items-center justify-between py-2 cursor-pointer group text-left md:pointer-events-none md:cursor-default"
              >
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white group-hover:text-neutral-200 transition-colors">
                  The Maison
                </h4>
                <ChevronDown
                  className={`w-4 h-4 text-neutral-400 transition-transform duration-300 md:hidden ${
                    openSections.theMaison ? "rotate-180 text-white" : ""
                  }`}
                />
              </button>

              <ul
                className={`pt-2 pb-2 md:pt-3 space-y-2.5 text-xs text-neutral-400 font-light transition-all ${
                  openSections.theMaison ? "block" : "hidden md:block"
                }`}
              >
                <li>
                  <Link href="/about" className="hover:text-white transition-colors block py-0.5">
                    Our Florentine Atelier
                  </Link>
                </li>
                <li>
                  <Link href="/sustainability" className="hover:text-white transition-colors block py-0.5">
                    Traceability & Ethical Leather
                  </Link>
                </li>
                <li>
                  <Link href="/press" className="hover:text-white transition-colors block py-0.5">
                    Editorial & Press Features
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-white transition-colors block py-0.5">
                    Artisan Apprenticeships
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors block py-0.5">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors block py-0.5">
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright & Payment Methods */}
      <div className="border-t border-white/10 py-5 bg-black">
        <div className="max-w-[1820px] 2xl:max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500 font-light">
          <p>© {new Date().getFullYear()} DNORA Luxury House. Handcrafted in Italy. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400">Accepted:</span>
            <span className="px-2 py-0.5 rounded-xs bg-white/10 text-white font-mono text-[10px]">VISA</span>
            <span className="px-2 py-0.5 rounded-xs bg-white/10 text-white font-mono text-[10px]">MASTERCARD</span>
            <span className="px-2 py-0.5 rounded-xs bg-white/10 text-white font-mono text-[10px]">AMEX</span>
            <span className="px-2 py-0.5 rounded-xs bg-white/10 text-white font-mono text-[10px]">UPI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
