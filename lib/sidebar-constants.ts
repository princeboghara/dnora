import { SidebarMenuItem } from "@/types";

export const DEFAULT_SIDEBAR_ITEMS: SidebarMenuItem[] = [
  {
    id: "nav-dashboard",
    label: "Dashboard",
    href: "/admin",
    icon: "LayoutDashboard",
    is_active: true,
  },
  {
    id: "nav-products",
    label: "Products",
    href: "/admin/products",
    icon: "ShoppingBag",
    is_active: true,
    submenus: [
      { id: "sub-prod-all", label: "All Products", href: "/admin/products" },
      { id: "sub-prod-bestsellers", label: "Best Sellers", href: "/admin/products?filter=best_seller" },
      { id: "sub-prod-new", label: "New Arrivals", href: "/admin/products?filter=new_arrival" },
    ],
  },
  {
    id: "nav-heroes",
    label: "Hero Banners",
    href: "/admin/heroes",
    icon: "Image",
    is_active: true,
    submenus: [
      { id: "sub-hero-all", label: "All Banners", href: "/admin/heroes" },
      { id: "sub-hero-active", label: "Live Banners", href: "/admin/heroes?filter=published" },
    ],
  },
  {
    id: "nav-customers",
    label: "Customers",
    href: "/admin/customers",
    icon: "Users",
    is_active: true,
    submenus: [
      { id: "sub-cust-all", label: "All Customers", href: "/admin/customers" },
      { id: "sub-cust-buyers", label: "Active Buyers", href: "/admin/customers?filter=buyers" },
    ],
  },
  {
    id: "nav-orders",
    label: "Orders",
    href: "/admin/customers",
    icon: "ShoppingCart",
    badge: "Soon",
    is_active: true,
  },
  {
    id: "nav-analytics",
    label: "Analytics",
    href: "/admin",
    icon: "BarChart3",
    badge: "Soon",
    is_active: true,
  },
];
