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

  const [stats, recentProducts, heroBanners, recentOrdersData] = await Promise.all([
    store.getDashboardStats(),
    store.getAllAdminProducts(),
    store.getHeroBanners(true),
    store.getOrders({ limit: 5 }),
  ]);

  const recentOrders = recentOrdersData.orders || [];

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

      {/* Recent Client Acquisitions / Orders */}
      <div className="bg-white border border-[#E8E5DE] rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#E8E5DE]">
          <div>
            <h3 className="font-heading font-bold text-base text-[#0E0E0E]">
              Recent Client Acquisitions
            </h3>
            <p className="text-xs text-[#73706A]">Latest client orders awaiting or under fulfillment</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold uppercase tracking-wider text-[#0E0E0E] hover:text-[#73706A] flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#73706A]">
            No orders placed yet. Click{" "}
            <Link href="/admin/orders" className="text-[#0E0E0E] font-semibold underline">
              Orders Panel
            </Link>{" "}
            to create a sample test order.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase font-bold text-[#73706A] border-b border-[#E8E5DE] bg-[#FAF9F6]">
                <tr>
                  <th className="py-2.5 px-3">Order Ref</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Items</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5DE]">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#FAF9F6]">
                    <td className="py-3 px-3 font-mono font-bold text-[#0E0E0E]">{o.order_number}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-[#0E0E0E]">{o.customer_name}</div>
                      <div className="text-[11px] text-[#73706A]">{o.customer_email}</div>
                    </td>
                    <td className="py-3 px-3 text-[#73706A]">{o.items?.length || 0} items</td>
                    <td className="py-3 px-3 font-semibold text-[#0E0E0E]">{formatPrice(o.total_amount)}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 border rounded-full text-[10px] font-semibold uppercase tracking-wider">
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="text-xs font-semibold text-[#0E0E0E] hover:text-[#73706A] underline"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
              className="text-xs font-semibold uppercase tracking-wider text-[#0E0E0E] hover:text-[#73706A] flex items-center gap-1"
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
                      <span className="text-[9px] bg-[#0E0E0E] text-[#0E0E0E] px-1.5 py-0.5 rounded font-bold uppercase">
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
              className="text-xs font-semibold uppercase tracking-wider text-[#0E0E0E] hover:text-[#73706A] flex items-center gap-1"
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
