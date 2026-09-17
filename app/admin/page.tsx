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

  const [stats, recentProducts, heroBanners] = await Promise.all([
    store.getDashboardStats(),
    store.getAllAdminProducts(),
    store.getHeroBanners(true),
  ]);

  const statCards = [
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

  return (
    <div className="space-y-8">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E5DE]">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-[#C5A880] font-semibold block mb-1">
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
            <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
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

      {/* Quick Summary Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Handbags */}
        <div className="bg-white border border-[#E8E5DE] rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E8E5DE]">
            <div>
              <h3 className="font-heading font-bold text-base text-[#0E0E0E]">
                Featured Handbags
              </h3>
              <p className="text-xs text-[#73706A]">Current active catalog items</p>
            </div>
            <Link
              href="/admin/products"
              className="text-xs font-semibold uppercase tracking-wider text-[#0E0E0E] hover:text-[#C5A880] flex items-center gap-1"
            >
              <span>Manage All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#E8E5DE]">
            {recentProducts.slice(0, 4).map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-[#0E0E0E]">{p.name}</h4>
                  <p className="text-xs text-[#73706A]">
                    {p.sku} • Stock: {p.stock} units
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-[#0E0E0E]">
                    {formatPrice(p.price)}
                  </span>
                  <div className="flex items-center gap-1 mt-0.5 justify-end">
                    {p.is_best_seller && (
                      <span className="text-[9px] bg-[#0E0E0E] text-white px-1.5 py-0.5 rounded font-bold uppercase">
                        Best
                      </span>
                    )}
                    {p.is_new_arrival && (
                      <span className="text-[9px] bg-[#C5A880] text-[#0E0E0E] px-1.5 py-0.5 rounded font-bold uppercase">
                        New
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Banners Live Status */}
        <div className="bg-white border border-[#E8E5DE] rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E8E5DE]">
            <div>
              <h3 className="font-heading font-bold text-base text-[#0E0E0E]">
                Hero Banners Status
              </h3>
              <p className="text-xs text-[#73706A]">Live cinematic slider items</p>
            </div>
            <Link
              href="/admin/heroes"
              className="text-xs font-semibold uppercase tracking-wider text-[#0E0E0E] hover:text-[#C5A880] flex items-center gap-1"
            >
              <span>Manage Banners</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#E8E5DE]">
            {heroBanners.map((b) => (
              <div key={b.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-bold text-[#73706A]">
                      #{b.sort_order}
                    </span>
                    <h4 className="text-sm font-medium text-[#0E0E0E]">{b.title}</h4>
                  </div>
                  <p className="text-xs text-[#73706A]">
                    Media: <span className="uppercase font-semibold">{b.media_type}</span> • Duration: {b.duration_seconds}s
                  </p>
                </div>
                <div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      b.status === "published"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
