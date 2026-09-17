# DNORA — System Architecture & Component Design

This document details the architectural decisions, component graph, state boundaries, and data flow of the DNORA luxury e-commerce platform.

---

## High-Level Architecture

```mermaid
graph TD
    Client[Browser / User Device] --> CDN[Vercel Edge Network / Next.js]
    CDN --> AppRouter[Next.js App Router]
    
    subgraph Storefront [Storefront Routes: / , /shop, /product/:slug]
        AppRouter --> Layout[StorefrontLayout + CartProvider + ToastProvider]
        Layout --> Nav[Navbar + SearchModal + CartDrawer]
        Layout --> Home[HomePage 9-Section Flow]
        Layout --> Catalog[Shop Catalog Page]
        Layout --> PDP[ProductDetailPage]
    end

    subgraph AdminSuite [Admin Routes: /admin/*]
        AppRouter --> AdminMW[Admin Session Guard Middleware]
        AdminMW --> AdminLayout[AdminLayout + AdminSidebar + AdminHeader]
        AdminLayout --> Dashboard[Executive Overview Dashboard]
        AdminLayout --> HeroMgr[Hero Banner Manager + Live Simulator]
        AdminLayout --> ProdMgr[Product Manager + Flag Toggles]
    end

    subgraph APIRoutes [API Route Handlers: /api/*]
        AppRouter --> AuthAPI[/api/auth/login & logout]
        AppRouter --> HeroesAPI[/api/heroes & /api/heroes/:id/publish]
        AppRouter --> ProductsAPI[/api/products & /api/products/:id/toggle]
        AppRouter --> MediaAPI[/api/media/upload]
    end

    subgraph DataServices [Data & Media Services]
        HeroesAPI --> DataStore[DataStore Repository / Supabase Client]
        ProductsAPI --> DataStore
        MediaAPI --> CloudinarySDK[Cloudinary Node SDK]
        DataStore --> SupabasePG[(Supabase PostgreSQL + RLS)]
        CloudinarySDK --> CloudinaryStorage[(Cloudinary Media Storage)]
    end
```

---

## Directory Structure

```
dnoralifestyle/
├── app/
│   ├── (storefront)/
│   │   ├── layout.tsx                # Storefront Layout (TopBar, Navbar, CartDrawer, Footer)
│   │   ├── page.tsx                  # Luxury Homepage (9 Sections)
│   │   ├── shop/page.tsx             # Handbag Catalog with Category Tabs & Sorting
│   │   └── product/[slug]/
│   │       ├── page.tsx              # PDP Server Component (SEO metadata, specifications)
│   │       └── ProductDetailClient.tsx # PDP Client Component (Gallery, Cart Controls)
│   ├── admin/
│   │   ├── layout.tsx                # Admin Layout (Sidebar, Header, ToastProvider)
│   │   ├── page.tsx                  # Executive Dashboard Overview
│   │   ├── login/page.tsx            # Admin Authentication View
│   │   ├── heroes/page.tsx           # Hero Banner Manager with Table & Modals
│   │   └── products/page.tsx         # Product Manager with Table & Toggles
│   ├── api/
│   │   ├── auth/login/route.ts       # Admin Session Initialization
│   │   ├── auth/logout/route.ts      # Admin Session Destruction
│   │   ├── heroes/route.ts           # Hero Banner CRUD
│   │   ├── heroes/[id]/route.ts      # Hero Banner Item Manipulation
│   │   ├── heroes/[id]/publish/route.ts # Instant Publish Toggle & Revalidation
│   │   ├── products/route.ts         # Product CRUD & Filtering
│   │   ├── products/[id]/route.ts    # Product Item Manipulation
│   │   ├── products/[id]/toggle/route.ts # Best Seller & New Arrival Flags
│   │   └── media/upload/route.ts     # Cloudinary Upload with MIME & Size Inspection
│   ├── globals.css                   # Tailwind v4 Theme Tokens & Micro-interactions
│   ├── layout.tsx                    # Root Layout (Google Fonts: Plus Jakarta Sans & Inter)
│   ├── robots.ts                     # Search Engine Crawling Rules
│   └── sitemap.ts                    # Dynamic XML Sitemap Generator
├── components/
│   ├── admin/                        # Admin Dashboard & Form Primitives
│   │   ├── AdminHeader.tsx
│   │   ├── AdminSidebar.tsx
│   │   ├── HeroBannerForm.tsx
│   │   ├── HeroPreviewModal.tsx
│   │   └── ProductForm.tsx
│   ├── hero/                         # Cinematic Slider Components
│   │   └── HeroSlider.tsx
│   ├── seo/                          # Structured Data Markup
│   │   └── StructuredData.tsx
│   ├── storefront/                   # Public E-Commerce Touchpoints
│   │   ├── BestSellersSection.tsx
│   │   ├── CartDrawer.tsx
│   │   ├── CategoriesSection.tsx
│   │   ├── CustomerReviews.tsx
│   │   ├── EditorialSection.tsx
│   │   ├── Footer.tsx
│   │   ├── Navbar.tsx
│   │   ├── NewArrivalsSection.tsx
│   │   ├── ProductCard.tsx
│   │   ├── SearchModal.tsx
│   │   ├── SeenOnYouSection.tsx
│   │   └── TopBar.tsx
│   └── ui/                           # Reusable UI Primitives
│       ├── Badge.tsx
│       ├── Modal.tsx
│       └── Toast.tsx
├── lib/
│   ├── auth/session.ts               # Server-Side Admin Session Verification
│   ├── cloudinary/
│   │   ├── index.ts                  # Cloudinary Client Configuration & Uploader
│   │   └── transformations.ts        # Dynamic Image/Video Optimization URL Builders
│   ├── data/
│   │   ├── seed-data.ts              # Pre-seeded Handbags, Banners, and Reviews
│   │   └── store.ts                  # Unified Data Access Layer (Supabase + In-Memory Fallback)
│   ├── store/cart-store.tsx          # Client Shopping Bag State & LocalStorage Persistence
│   ├── supabase/
│   │   ├── admin.ts                  # Service-Role Client
│   │   ├── client.ts                 # Browser Client
│   │   ├── schema.sql                # Complete PostgreSQL Tables, Indexes & RLS
│   │   └── server.ts                 # SSR Cookie Client
│   ├── validation/
│   │   ├── hero.ts                   # Zod Schema for Hero Banners
│   │   └── product.ts                # Zod Schema for Products
│   └── utils.ts                      # Formatting & Class Utility Helpers
```

---

## State Management Boundaries

1. **Server State (Database / Store)**: Handbag inventory, category taxonomy, active hero slides, and customer testimonials are fetched on the server using Next.js Server Components.
2. **Client State (Shopping Bag)**: Managed via `CartProvider` in `lib/store/cart-store.tsx`. Tracks items, quantities, subtotal, and calculates the free worldwide shipping progress threshold ($250). Persisted to `localStorage`.
3. **Admin State**: Interactive modals, draft/publish toggles, search filters, and file upload progress states are isolated within client components using lightweight React hooks (`useState`, `useCallback`, `useRef`).
