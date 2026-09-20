import React from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Sparkles,
  Flame,
  Image as ImageIcon,
  FileEdit,
  ArrowUpRight,
  Plus,
  AlertTriangle,
  Users,
  Package,
  Megaphone,
  Layers,
  Video,
  Sliders,
  Star,
  Info,
} from "lucide-react";
import { redirect } from "next/navigation";
import { store } from "@/lib/data/store";
import { formatPrice } from "@/lib/utils";
import { verifyAdminSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await verifyAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const stats = await store.getDashboardStats();

  const statCards = [
    {
      label: "Total Orders",
      value: stats.totalOrders ?? 0,
      icon: Package,
      href: "/admin/orders",
      badge: "Acquisitions",
    },
    {
      label: "Action Needed",
      value: stats.pendingOrders ?? 0,
      icon: Package,
      href: "/admin/orders?status=processing",
      badge: "Processing",
    },
    {
      label: "Total Revenue",
      value: formatPrice(stats.totalRevenue ?? 0),
      icon: Sparkles,
      href: "/admin/orders",
      badge: "Active Volume",
    },
    {
      label: "Total Customers",
      value: stats.totalCustomers ?? 0,
      icon: Users,
      href: "/admin/customers",
      badge: "CRM Directory",
    },
    {
      label: "Total Products",
      value: stats.totalProducts,
      icon: ShoppingBag,
      href: "/admin/products",
      badge: "In Catalog",
    },
    {
      label: "Best Sellers",
      value: stats.bestSellersCount,
      icon: Flame,
      href: "/admin/products?filter=best_seller",
      badge: "Flagged",
    },
    {
      label: "New Arrivals",
      value: stats.newArrivalsCount,
      icon: Sparkles,
      href: "/admin/products?filter=new_arrival",
      badge: "Active",
    },
    {
      label: "Active Hero Banners",
      value: stats.activeHeroBanners,
      icon: ImageIcon,
      href: "/admin/heroes",
      badge: "Live on Site",
    },
    {
      label: "Draft Hero Banners",
      value: stats.draftHeroBanners,
      icon: FileEdit,
      href: "/admin/heroes",
      badge: "Unpublished",
    },
    {
      label: "Low Stock Items",
      value: stats.lowStockCount,
      icon: AlertTriangle,
      href: "/admin/products",
      badge: "< 10 units",
    },
  ];

  const customizationCards = [
    {
      title: "Announcement Bar",
      slug: "announcementbar",
      badge: "Header Ticker",
      description: "Topbar promotional messages, auto-swipe rotation & links",
      icon: Megaphone,
    },
    {
      title: "Hero Banner",
      slug: "herobanner",
      badge: "Cinematic Slides",
      description: "Full-bleed campaign slides, desktop/mobile imagery & CTAs",
      icon: Layers,
    },
    {
      title: "Best Sellers",
      slug: "bestsellers",
      badge: "Top Curation",
      description: "Trending silhouettes carousel, order priority & typography",
      icon: Flame,
    },
    {
      title: "New In",
      slug: "newin",
      badge: "Fresh Arrivals",
      description: "Latest boutique additions, seasonal launches & tags",
      icon: Sparkles,
    },
    {
      title: "Seen On You",
      slug: "seenonyou",
      badge: "9:16 Video Reels",
      description: "Vertical video styling, client reviews & tagged products",
      icon: Video,
    },
    {
      title: "Middle Banner",
      slug: "middlebanner",
      badge: "Editorial Spotlight",
      description: "Atelier craftsmanship campaign, high-resolution media & CTA",
      icon: Sliders,
    },
    {
      title: "Customer Review",
      slug: "customerreview",
      badge: "Client Feedback",
      description: "Verified testimonials, 5-star ratings & client locations",
      icon: Star,
    },
    {
      title: "Footer",
      slug: "footer",
      badge: "Maison Footer",
      description: "Brand narrative, boutique addresses, policies & social channels",
      icon: Info,
    },
    {
      title: "Categories",
      slug: "category",
      badge: "Silhouettes",
      description: "Circular category carousel, taxonomy & collection covers",
      icon: ShoppingBag,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E5DE]">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-[#0E0E0E] font-semibold block mb-1">
            Overview
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0E0E0E] tracking-tight">
            DNORA Executive Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/heroes"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E8E5DE] hover:border-[#0E0E0E] text-xs font-semibold uppercase tracking-wider text-[#0E0E0E] rounded transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Banner</span>
          </Link>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0E0E0E] hover:bg-[#2C2B29] text-xs font-semibold uppercase tracking-wider text-[#FAF9F6] rounded transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-[#0E0E0E]" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="group p-6 bg-white border border-[#E8E5DE] rounded-lg shadow-sm hover:shadow-md hover:border-[#0E0E0E] transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#73706A]">
                  {card.label}
                </span>
                <div className="p-2 rounded-md bg-[#F5F3EF] text-[#0E0E0E] group-hover:bg-[#0E0E0E] group-hover:text-[#FAF9F6] transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-heading font-extrabold text-[#0E0E0E]">
                  {card.value}
                </span>
                <span className="text-[11px] font-medium text-[#8C8983] bg-[#F5F3EF] px-2 py-0.5 rounded">
                  {card.badge}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* CUSTOMIZATION SECTION (Quick Access to All Landing Page Modules) */}
      <div className="pt-2 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E8E5DE]">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-[#0E0E0E] font-semibold block mb-0.5">
              Storefront CMS
            </span>
            <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-[#0E0E0E] tracking-tight">
              Customization
            </h2>
          </div>
          <Link
            href="/admin/customization/announcementbar"
            className="text-xs font-semibold text-[#0E0E0E] hover:text-[#73706A] inline-flex items-center gap-1.5 uppercase tracking-wider transition-colors"
          >
            <span>Open Customizer Studio</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Small Cards Grid (nanacard) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-3.5 sm:gap-4">
          {customizationCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.slug}
                href={`/admin/customization/${card.slug}`}
                className="group relative p-4 bg-white border border-[#E8E5DE] hover:border-[#0E0E0E] rounded-lg shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2 rounded-md bg-[#F5F3EF] text-[#0E0E0E] group-hover:bg-[#0E0E0E] group-hover:text-white transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C8983] bg-[#FAF9F6] px-2 py-0.5 rounded border border-[#E8E5DE]">
                    {card.badge}
                  </span>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-bold text-sm text-[#0E0E0E] group-hover:underline">
                      {card.title}
                    </h3>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#8C8983] group-hover:text-[#0E0E0E] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                  <p className="text-[11px] text-[#73706A] mt-1 line-clamp-1 leading-snug">
                    {card.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>


      {/* Quick Access Action Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/admin/homepage"
          className="group p-6 bg-white border border-[#E8E5DE] hover:border-[#0E0E0E] rounded-lg shadow-xs hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#73706A]">
              Storefront CMS
            </span>
            <h3 className="font-heading font-extrabold text-lg text-[#0E0E0E] group-hover:underline">
              Landing Page Customizer
            </h3>
            <p className="text-xs text-[#73706A]">
              Customize Topbar, Hero, Categories, Best Sellers, New In, Middle Banner, Reviews &amp; Footer.
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#FAF9F6] border border-[#E8E5DE] group-hover:bg-[#0E0E0E] group-hover:text-white flex items-center justify-center transition-colors shrink-0 ml-4">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          href="/admin/orders"
          className="group p-6 bg-white border border-[#E8E5DE] hover:border-[#0E0E0E] rounded-lg shadow-xs hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#73706A]">
              Fulfillment Operations
            </span>
            <h3 className="font-heading font-extrabold text-lg text-[#0E0E0E] group-hover:underline">
              Manage Client Orders
            </h3>
            <p className="text-xs text-[#73706A]">
              Track customer details, generate invoices, update courier tracking and fulfillment status.
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#FAF9F6] border border-[#E8E5DE] group-hover:bg-[#0E0E0E] group-hover:text-white flex items-center justify-center transition-colors shrink-0 ml-4">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </Link>
      </div>
    </div>
  );
}
