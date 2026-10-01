"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Search, ChevronDown, Package, User as UserIcon, Phone, Mail } from "lucide-react";
import { NavCategory } from "./types";

interface TopBarMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
  navCategories: NavCategory[];
  mobileAccordion: string | null;
  setMobileAccordion: (id: string | null) => void;
  conciergePhone?: string;
  conciergeEmail?: string;
}

export function TopBarMobileDrawer({
  isOpen,
  onClose,
  onOpenSearch,
  navCategories,
  mobileAccordion,
  setMobileAccordion,
  conciergePhone,
  conciergeEmail,
}: TopBarMobileDrawerProps) {
  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? "visible pointer-events-auto" : "invisible pointer-events-none delay-300"
      }`}
    >
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ease-in-out cursor-pointer ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex pr-10">
        <div
          className={`w-screen max-w-sm sm:max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200">
            <Link href="/" onClick={onClose} className="relative h-7 w-28">
              <Image
                src="/images/logo.png"
                alt="DNORA"
                fill
                className="object-contain"
              />
            </Link>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Search input trigger */}
          <div className="px-6 py-4 border-b border-neutral-100 bg-[#f4f4f5]">
            <button
              type="button"
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between px-3 py-2 bg-white border border-neutral-200 rounded text-xs text-neutral-400 tracking-wider uppercase cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-neutral-500" />
                <span>Search Maison...</span>
              </span>
              <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest">
                OPEN
              </span>
            </button>
          </div>

          {/* Navigation Categories Accordion */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-neutral-100">
            {navCategories.map((cat) => {
              const hasSubs = !!(cat.subcategories && cat.subcategories.length > 0);
              const isExpanded = mobileAccordion === cat.id;

              return (
                <div key={cat.id} className="py-3">
                  <div className="flex items-center justify-between">
                    <Link
                      href={cat.href}
                      onClick={onClose}
                      className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-900 hover:text-black"
                    >
                      {cat.label}
                    </Link>
                    {hasSubs && (
                      <button
                        type="button"
                        onClick={() => setMobileAccordion(isExpanded ? null : cat.id)}
                        className="p-1 text-neutral-400 hover:text-black cursor-pointer"
                        aria-label={`Toggle ${cat.label}`}
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {hasSubs && isExpanded && (
                    <div className="mt-3 pl-3 border-l-2 border-neutral-900 space-y-4 pt-1 animate-in fade-in duration-150">
                      {cat.subcategories!.map((group, groupIdx) => (
                        <div key={groupIdx} className="space-y-2">
                          <span className="text-[9.5px] uppercase tracking-[0.18em] font-bold text-neutral-400 block">
                            {group.title}
                          </span>
                          <ul className="space-y-2">
                            {group.items.map((sub, sIdx) => (
                              <li key={sIdx}>
                                <Link
                                  href={sub.href}
                                  onClick={onClose}
                                  className="text-xs text-neutral-700 hover:text-black block"
                                >
                                  {sub.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Member Services & Concierge Footer */}
          <div className="p-6 border-t border-neutral-200 bg-[#f4f4f5] space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/account?tab=orders"
                onClick={onClose}
                className="flex items-center gap-2 p-2.5 bg-white border border-neutral-200 rounded text-xs font-semibold uppercase tracking-wider text-neutral-800 hover:border-black transition-colors"
              >
                <Package className="w-3.5 h-3.5 text-neutral-500" />
                <span>Track Order</span>
              </Link>
              <Link
                href="/account"
                onClick={onClose}
                className="flex items-center gap-2 p-2.5 bg-white border border-neutral-200 rounded text-xs font-semibold uppercase tracking-wider text-neutral-800 hover:border-black transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5 text-neutral-500" />
                <span>Client Portal</span>
              </Link>
            </div>

            <div className="text-[11px] text-neutral-500 space-y-1">
              <p className="flex items-center gap-1.5 font-medium">
                <Phone className="w-3 h-3 text-neutral-400" />
                <span>VIP Concierge: {conciergePhone || "+39 02 8901 3450"}</span>
              </p>
              <p className="flex items-center gap-1.5 font-medium">
                <Mail className="w-3 h-3 text-neutral-400" />
                <span>{conciergeEmail || "concierge@dnora.luxury"}</span>
              </p>
            </div>

            <p className="text-[9.5px] uppercase font-bold tracking-[0.2em] text-neutral-400 text-center pt-2">
              FLORENCE • MILAN • MUMBAI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
