# DNORA — Modern Luxury Handbags & Leather Goods E-Commerce

DNORA is a production-ready, highly polished, modern e-commerce platform crafted for a luxury women's purse brand. Handcrafted from an editorial fashion perspective, it balances minimalist aesthetics with scalable full-stack architecture.

---

## Brand & Aesthetic Principles

- **Minimalist Luxury**: Meticulous whitespace, restrained neutral palette (Alabaster, Ivory, Warm Sand, Charcoal, Obsidian, and Champagne Gold accents).
- **Typography**: Strictly modern geometric sans-serifs (**Plus Jakarta Sans** for editorial headlines and **Inter** for readable body and pricing). Zero traditional serifs (no Times New Roman, Garamond, Georgia, or Baskerville).
- **Dual-Media Cinematic Hero Slider**: Seamlessly cycles between high-resolution photography (with configurable countdown timers) and auto-playing muted fashion loop videos (advancing upon video completion).
- **Responsive Architecture**: Art-directed viewports across mobile (375px), tablet (768px), laptop (1024px), desktop (1440px), and ultrawide screens.

---

## Key Features

### Public Luxury Storefront
1. **Top Bar**: Rotating luxury announcements (complimentary shipping meter, collection announcements).
2. **Sticky Navigation**: Minimalist header with DNORA logo mark, quick search overlay trigger, admin portal link, and slide-over bag trigger with live counter.
3. **Hero Slider**: Dual-media engine supporting both images and videos, art-directed mobile media, transparent `<` and `>` controls, and progress bar pagination.
4. **Categories**: Editorial cards for Shoulder Bags, Tote Bags, Crossbody Bags, Handbags, and Mini Bags with subtle hover zoom.
5. **Best Sellers**: Merchandised product grid with live stock status, wishlist toggles, and Quick Add to Bag.
6. **Editorial Storytelling**: Asymmetrical fashion layout featuring Florence atelier photography and craftsmanship pillars.
7. **New Arrivals**: Merchandised collection highlighted with luxury tags.
8. **Seen On You**: 9:16 vertical video reel with hover autoplay, mute controls, and direct purse tags.
9. **Customer Reviews**: Testimonial showcase with verified buyer badges and star ratings.
10. **Interactive Bag Drawer**: Slide-over cart with free shipping meter, quantity controls, subtotal calculations, and checkout button.

### Executive Admin Suite
- **Secure Authentication**: Role-based access control with server-side session verification.
- **Executive Dashboard**: Real-time metrics (Total Products, Best Sellers, New Arrivals, Active Heroes, Draft Heroes, Low Stock Alerts).
- **Hero Banner Manager**:
  - Upload high-res images or videos to Cloudinary (`dnora/heroes/`).
  - Desktop & Mobile live simulator modal.
  - One-click Publish / Unpublish with instant storefront revalidation.
  - Image duration timer and text alignment controls.
- **Product Manager**:
  - Multi-image Cloudinary upload (`dnora/products/`).
  - Instant toggles for **Best Seller** and **New Arrival** placement.
  - Category assignment, SKU generation, inventory tracking, price comparison.
  - Search, status filtering, and edit/delete actions.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router with Turbopack) |
| **Language** | TypeScript (Strict Mode) |
| **Styling** | Tailwind CSS v4 + Custom Design Tokens |
| **Icons** | Lucide React |
| **Validation** | Zod v4 |
| **Forms** | React Hook Form |
| **Database** | Supabase PostgreSQL + Row Level Security (RLS) |
| **Authentication** | Supabase Auth + Secure Server-Side Session Cookies |
| **Media Hosting** | Cloudinary (with automated format & quality negotiation) |
| **Deployment Target** | Vercel |

---

## Quick Start (Local Development)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-org/dnoralifestyle.git
cd dnoralifestyle
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

The application is pre-configured with a resilient in-memory repository fallback. Even without live Supabase and Cloudinary API credentials, all storefront pages, the cart drawer, search modal, admin login, hero manager, and product manager work out-of-the-box!

To connect live services:
- Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from your Supabase project.
- Execute `lib/supabase/schema.sql` in the Supabase SQL Editor.
- Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Admin Access
Navigate to [http://localhost:3000/admin/login](http://localhost:3000/admin/login):
- **Email**: `admin@dnora.luxury`
- **Password**: `dnora2026!`

---

## Project Documentation Index

- [ARCHITECTURE.md](ARCHITECTURE.md) — Technical architecture, state management, and component breakdown.
- [DATABASE.md](DATABASE.md) — PostgreSQL schema, foreign keys, indexes, and RLS policies.
- [CLOUDINARY.md](CLOUDINARY.md) — Media folder structure, upload endpoints, and transformation presets.
- [SECURITY.md](SECURITY.md) — RLS policies, admin authorization gates, and MIME validation.
- [DEPLOYMENT.md](DEPLOYMENT.md) — Vercel production deployment and environment configuration.
- [DESIGN.md](DESIGN.md) — Color tokens, typography rules, spacing scales, and micro-interactions.
