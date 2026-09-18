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
    id: "nav-orders",
    label: "Orders",
    href: "/admin/orders",
    icon: "Package",
    is_active: true,
    submenus: [
      { id: "sub-ord-all", label: "All Orders", href: "/admin/orders" },
      { id: "sub-ord-processing", label: "Processing", href: "/admin/orders?status=processing" },
      { id: "sub-ord-shipped", label: "Shipped", href: "/admin/orders?status=shipped" },
    ],
  },
  {
    id: "nav-categories",
    label: "Categories",
    href: "/admin/categories",
    icon: "Folder",
    is_active: true,
    submenus: [
      { id: "sub-cat-all", label: "All Categories", href: "/admin/categories" },
    ],
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
    id: "nav-storefront",
    label: "Store Front",
    href: "/",
    icon: "Globe",
    is_active: true,
    submenus: [
      { id: "sub-sf-announcements", label: "Announcement Bar", href: "/admin/announcements" },
      { id: "sub-sf-heroes", label: "Hero Banners", href: "/admin/heroes" },
      { id: "sub-sf-sidebar", label: "Sidebar", href: "/admin?customize=true" },
    ],
  },
];
