# DNORA — Production Deployment Guide (Vercel & Supabase)

This guide walks through deploying the DNORA luxury e-commerce platform to **Vercel** with **Supabase PostgreSQL** and **Cloudinary**.

---

## Step 1: Provision Supabase Database

1. Navigate to [Supabase](https://supabase.com) and create a new project (e.g. `dnora-production`).
2. Open the **SQL Editor** in the Supabase dashboard.
3. Paste and execute the contents of [`lib/supabase/schema.sql`](lib/supabase/schema.sql). This will create all tables, indexes, RLS policies, and seed data.
4. Obtain your API credentials from **Project Settings &gt; API**:
   - `Project URL`
   - `anon public key`
   - `service_role secret key`

---

## Step 2: Provision Cloudinary

1. Sign in to your [Cloudinary Console](https://cloudinary.com).
2. Copy your credentials from the Dashboard:
   - `Cloud Name`
   - `API Key`
   - `API Secret`
3. Ensure unsigned or authenticated uploads to `dnora/*` folders are permitted.

---

## Step 3: Deploy to Vercel

1. Push your DNORA repository to GitHub / GitLab.
2. Log into [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your DNORA repository.
4. Configure the **Environment Variables** in the Vercel deployment wizard:

| Variable Name | Value Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role secret |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |
| `NEXT_PUBLIC_SITE_URL` | Your production custom domain (e.g., `https://dnora.luxury`) |
| `ADMIN_EMAIL` | Admin login email (`admin@dnora.luxury`) |

5. Click **Deploy**. Vercel will run Turbopack compilation and generate all static pages and edge routes.

---

## Step 4: Verification & Cache Invalidation

Once deployed:
1. Visit your live domain. Verify the top bar, dual-media hero slider, category cards, Best Sellers, and Seen On You vertical videos.
2. Navigate to `/admin/login` and authenticate with administrative credentials.
3. Edit or publish a hero banner from the **Hero Banner Manager**. Verify that the change updates the live storefront instantly without redeployment (`revalidatePath('/')` ensures real-time invalidation).
