"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Megaphone,
  ImageIcon,
  Compass,
  Sliders,
  ArrowRight,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Clock,
  Eye,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [announcementsCount, setAnnouncementsCount] = useState<number | null>(null);
  const [heroesCount, setHeroesCount] = useState<number | null>(null);
  const [navItemsCount, setNavItemsCount] = useState<number | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const [annRes, heroRes, navRes] = await Promise.allSettled([
          fetch("/api/announcements").then((r) => r.json()),
          fetch("/api/heroes").then((r) => r.json()),
          fetch("/api/navigation?target=storefront").then((r) => r.json()),
        ]);

        if (annRes.status === "fulfilled" && annRes.value?.items) {
          setAnnouncementsCount(annRes.value.items.length);
        }
        if (heroRes.status === "fulfilled" && heroRes.value?.banners) {
          setHeroesCount(heroRes.value.banners.length);
        }
        if (navRes.status === "fulfilled" && navRes.value?.items) {
          setNavItemsCount(navRes.value.items.length);
        }
      } catch {
        // ignore
      }
    }

    loadStats();
  }, []);

  const SECTIONS = [
    {
      id: "announcements",
      title: "Announcement Bar",
      subtitle: "Top-level storewide ticker banner",
      description: "Manage ticker notifications, interval speed, links, and active toggle.",
      icon: Megaphone,
      href: "/admin/announcements",
      stat: announcementsCount !== null ? `${announcementsCount} Active Messages` : "Live Connected",
      color: "bg-blue-500/10 text-blue-600 border-blue-200",
    },
    {
      id: "heroes",
      title: "Hero Banner & Video Studio",
      subtitle: "High-impact visual showcase",
      description: "Control video & image slides, push transitions, and mobile square crops.",
      icon: ImageIcon,
      href: "/admin/heroes",
      stat: heroesCount !== null ? `${heroesCount} Published Slides` : "3 Loaded Slides",
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    },
    {
      id: "navigation",
      title: "Navigation Bar",
      subtitle: "Main storefront category menus",
      description: "Customize top-level tabs, mega-menu subcategories, badges, and URL destinations.",
      icon: Compass,
      href: "/admin/navigation",
      stat: navItemsCount !== null ? `${navItemsCount} Navigation Tabs` : "Live Categories",
      color: "bg-purple-500/10 text-purple-600 border-purple-200",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#090D16] to-[#161F32] rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/90 text-[10.5px] font-bold uppercase tracking-widest">
            <Sparkles className="w-3 h-3 text-[#D4AF37]" />
            <span>Storefront Presentation Hub</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Welcome to DNORA Administration Suite
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Full administrative authority over your brand’s topbar, ticker, mega-menus, and hero visual banners.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-white text-neutral-950 hover:bg-neutral-200 font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-[0.98]"
          >
            <span>Preview Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Control Module Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">
            Presentation Control Modules
          </h3>
          <span className="text-xs text-neutral-400 font-medium">
            4 Core Storefront Controllers
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.id}
                className="bg-white border border-neutral-200/80 rounded-xl p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${section.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-neutral-900 group-hover:text-black transition-colors">
                          {section.title}
                        </h4>
                        <p className="text-[11px] text-neutral-400 tracking-wider uppercase">
                          {section.subtitle}
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-700">
                      {section.stat}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 leading-relaxed mb-6">
                    {section.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-[11px] text-neutral-400 font-medium">
                    Click to configure &amp; edit live
                  </span>
                  <Link
                    href={section.href}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-900 hover:text-black uppercase tracking-wider group-hover:translate-x-0.5 transition-all"
                  >
                    <span>Manage Section</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
