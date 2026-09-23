import {
  Product,
  HeroBanner,
  ProductCategory,
  CustomerReview,
  SeenOnYouVideo,
  AdminDashboardStats,
  Order,
  OrderItem,
  HomepageConfig,
  AnnouncementConfig,
  AnnouncementItem,
  CircularCollectionItem,
} from "@/types";
import { db } from "@/lib/db";
import { slugify } from "../utils";
import { SEED_PRODUCTS } from "./seed-data";


class DataStore {
  // HERO BANNERS
  async getHeroBanners(includeDrafts: boolean = false): Promise<HeroBanner[]> {
    try {
      let query = `SELECT * FROM public.hero_banners`;
      if (!includeDrafts) {
        query += ` WHERE status = 'published' AND is_active = true AND (start_date IS NULL OR start_date <= now()) AND (end_date IS NULL OR end_date >= now())`;
      }
      query += ` ORDER BY sort_order ASC, created_at DESC`;
      const res = await db.query(query);
      return res.rows.map((row) => ({
        ...row,
        duration_seconds: Number(row.duration_seconds || 5),
        sort_order: Number(row.sort_order || 0),
        is_active: Boolean(row.is_active),
      }));
    } catch (err) {
      console.error("Error fetching hero banners from database:", err);
      return [];
    }
  }

  async getHeroBannerById(id: string): Promise<HeroBanner | null> {
    try {
      const res = await db.query(`SELECT * FROM public.hero_banners WHERE id = $1 LIMIT 1`, [id]);
      if (res.rows.length === 0) return null;
      const row = res.rows[0];
      return {
        ...row,
        duration_seconds: Number(row.duration_seconds || 5),
        sort_order: Number(row.sort_order || 0),
        is_active: Boolean(row.is_active),
      };
    } catch (err) {
      console.error("Error fetching hero banner by ID:", err);
      return null;
    }
  }

  async createHeroBanner(data: Omit<HeroBanner, "id" | "created_at" | "updated_at">): Promise<HeroBanner> {
    const res = await db.query(
      `INSERT INTO public.hero_banners 
        (title, heading, subtitle, media_type, cloudinary_public_id, media_url, tablet_media_url, mobile_media_url, button_text, button_link, duration_seconds, sort_order, is_active, status, text_alignment, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       RETURNING *`,
      [
        data.title,
        data.heading || null,
        data.subtitle || null,
        data.media_type,
        data.cloudinary_public_id || null,
        data.media_url,
        data.tablet_media_url || null,
        data.mobile_media_url || null,
        data.button_text ?? null,
        data.button_link || "/shop",
        data.duration_seconds || 5,
        data.sort_order || 0,
        data.is_active ?? true,
        data.status || "draft",
        data.text_alignment || "left",
        data.start_date || null,
        data.end_date || null,
      ]
    );
    return res.rows[0];
  }

  async updateHeroBanner(id: string, updates: Partial<HeroBanner>): Promise<HeroBanner | null> {
    const fields: string[] = [];
    const values: (string | number | boolean | null)[] = [];
    let i = 1;

    for (const [key, val] of Object.entries(updates)) {
      if (key !== "id" && key !== "created_at" && val !== undefined) {
        fields.push(`${key} = $${i}`);
        values.push(val);
        i++;
      }
    }

    if (fields.length === 0) return this.getHeroBannerById(id);

    fields.push(`updated_at = now()`);
    values.push(id);

    const res = await db.query(
      `UPDATE public.hero_banners SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`,
      values
    );
    return res.rows[0] || null;
  }

  async deleteHeroBanner(id: string): Promise<boolean> {
    try {
      const res = await db.query(`DELETE FROM public.hero_banners WHERE id = $1`, [id]);
      return (res.rowCount ?? 0) > 0;
    } catch {
      return false;
    }
  }

  async setHeroPublishStatus(id: string, status: "published" | "draft" | "archived"): Promise<HeroBanner | null> {
    return this.updateHeroBanner(id, {
      status,
      is_active: status === "published",
    });
  }

  // CIRCULAR COLLECTIONS ("Our Collections")
  async getCircularCollections(includeInactive: boolean = false): Promise<CircularCollectionItem[]> {
    try {
      let query = `SELECT * FROM public.circular_collections`;
      if (!includeInactive) {
        query += ` WHERE is_active = true`;
      }
      query += ` ORDER BY sort_order ASC, created_at ASC`;
      const res = await db.query(query);
      return res.rows.map((row) => ({
        id: row.id,
        label: row.label,
        href: row.href,
        image: row.image,
        badge: row.badge || undefined,
        alt: row.alt || undefined,
        sort_order: Number(row.sort_order || 0),
        is_active: Boolean(row.is_active),
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));
    } catch (err) {
      console.error("Error fetching circular collections from database:", err);
      return [];
    }
  }

  async getCircularCollectionById(id: string): Promise<CircularCollectionItem | null> {
    try {
      const res = await db.query(`SELECT * FROM public.circular_collections WHERE id = $1 LIMIT 1`, [id]);
      if (res.rows.length === 0) return null;
      const row = res.rows[0];
      return {
        id: row.id,
        label: row.label,
        href: row.href,
        image: row.image,
        badge: row.badge || undefined,
        alt: row.alt || undefined,
        sort_order: Number(row.sort_order || 0),
        is_active: Boolean(row.is_active),
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
    } catch (err) {
      console.error("Error fetching circular collection by id:", err);
      return null;
    }
  }

  async createCircularCollection(data: {
    label: string;
    href: string;
    image: string;
    badge?: string;
    alt?: string;
    sort_order?: number;
    is_active?: boolean;
  }): Promise<CircularCollectionItem> {
    const res = await db.query(
      `INSERT INTO public.circular_collections (label, href, image, badge, alt, sort_order, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.label.trim(),
        data.href.trim(),
        data.image.trim(),
        data.badge?.trim() || null,
        data.alt?.trim() || null,
        data.sort_order ?? 0,
        data.is_active ?? true,
      ]
    );
    const row = res.rows[0];
    return {
      id: row.id,
      label: row.label,
      href: row.href,
      image: row.image,
      badge: row.badge || undefined,
      alt: row.alt || undefined,
      sort_order: Number(row.sort_order || 0),
      is_active: Boolean(row.is_active),
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  async updateCircularCollection(
    id: string,
    updates: Partial<{
      label: string;
      href: string;
      image: string;
      badge: string | null;
      alt: string | null;
      sort_order: number;
      is_active: boolean;
    }>
  ): Promise<CircularCollectionItem | null> {
    const fields: string[] = [];
    const values: (string | number | boolean | null)[] = [];
    let i = 1;

    for (const [key, val] of Object.entries(updates)) {
      if (val !== undefined) {
        fields.push(`${key} = $${i}`);
        values.push(val);
        i++;
      }
    }

    if (fields.length === 0) return this.getCircularCollectionById(id);

    fields.push(`updated_at = now()`);
    values.push(id);

    const res = await db.query(
      `UPDATE public.circular_collections SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`,
      values
    );
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      label: row.label,
      href: row.href,
      image: row.image,
      badge: row.badge || undefined,
      alt: row.alt || undefined,
      sort_order: Number(row.sort_order || 0),
      is_active: Boolean(row.is_active),
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  async deleteCircularCollection(id: string): Promise<boolean> {
    try {
      const res = await db.query(`DELETE FROM public.circular_collections WHERE id = $1`, [id]);
      return (res.rowCount ?? 0) > 0;
    } catch (err) {
      console.error("Error deleting circular collection:", err);
      return false;
    }
  }

  // PRODUCTS
  async getProducts(filter?: {
    status?: string;
    is_best_seller?: boolean;
    is_new_arrival?: boolean;
    category_slug?: string;
    search?: string;
  }): Promise<Product[]> {
    try {
      const conditions: string[] = ["1=1"];
      const params: (string | number | boolean)[] = [];
      let idx = 1;

      if (filter?.status && filter.status !== "all") {
        conditions.push(`p.status = $${idx++}`);
        params.push(filter.status);
      } else if (!filter?.status) {
        conditions.push(`p.status = 'active'`);
      }

      if (filter?.is_best_seller !== undefined) {
        conditions.push(`COALESCE(pf.is_best_seller, false) = $${idx++}`);
        params.push(filter.is_best_seller);
      }

      if (filter?.is_new_arrival !== undefined) {
        conditions.push(`COALESCE(pf.is_new_arrival, false) = $${idx++}`);
        params.push(filter.is_new_arrival);
      }

      if (filter?.search) {
        conditions.push(
          `(LOWER(p.name) LIKE $${idx} OR LOWER(p.short_description) LIKE $${idx} OR LOWER(p.sku) LIKE $${idx})`
        );
        params.push(`%${filter.search.toLowerCase()}%`);
        idx++;
      }

      if (filter?.category_slug) {
        conditions.push(`
          EXISTS (
            SELECT 1 FROM public.product_category_relations pcr
            JOIN public.product_categories cat ON cat.id = pcr.category_id
            WHERE pcr.product_id = p.id AND cat.slug = $${idx++}
          )
        `);
        params.push(filter.category_slug);
      }

      const sql = `
        SELECT p.*,
          COALESCE(pf.is_best_seller, false) as is_best_seller,
          COALESCE(pf.is_new_arrival, false) as is_new_arrival,
          COALESCE(pf.sort_order, 0) as sort_order,
          COALESCE(
            json_agg(
              json_build_object(
                'id', pi.id,
                'secure_url', pi.secure_url,
                'cloudinary_public_id', pi.cloudinary_public_id,
                'alt_text', pi.alt_text,
                'sort_order', pi.sort_order
              ) ORDER BY pi.sort_order ASC
            ) FILTER (WHERE pi.id IS NOT NULL),
            '[]'::json
          ) as images
        FROM public.products p
        LEFT JOIN public.product_flags pf ON pf.product_id = p.id
        LEFT JOIN public.product_images pi ON pi.product_id = p.id
        WHERE ${conditions.join(" AND ")}
        GROUP BY p.id, pf.is_best_seller, pf.is_new_arrival, pf.sort_order
        ORDER BY COALESCE(pf.sort_order, 0) ASC, p.created_at DESC
      `;

      const res = await db.query(sql, params);
      const rows = res.rows.map((row) => ({
        ...row,
        price: Number(row.price),
        compare_at_price: row.compare_at_price ? Number(row.compare_at_price) : null,
        stock: Number(row.stock),
      }));

      if (rows.length === 0) {
        let seed = [...SEED_PRODUCTS];
        if (filter?.is_best_seller !== undefined) {
          seed = seed.filter((p) => !!p.is_best_seller === filter.is_best_seller);
        }
        if (filter?.is_new_arrival !== undefined) {
          seed = seed.filter((p) => !!p.is_new_arrival === filter.is_new_arrival);
        }
        if (filter?.category_slug) {
          seed = seed.filter((p) => p.categories?.some((c: { slug?: string }) => c.slug === filter.category_slug));
        }
        return seed;
      }

      return rows;
    } catch (err) {
      console.error("Error fetching products from database:", err);
      let seed = [...SEED_PRODUCTS];
      if (filter?.is_best_seller !== undefined) {
        seed = seed.filter((p) => !!p.is_best_seller === filter.is_best_seller);
      }
      if (filter?.is_new_arrival !== undefined) {
        seed = seed.filter((p) => !!p.is_new_arrival === filter.is_new_arrival);
      }
      return seed;
    }
  }

  async getAllAdminProducts(search?: string, categorySlug?: string): Promise<Product[]> {
    return this.getProducts({
      status: undefined,
      search,
      category_slug: categorySlug,
    });
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const sql = `
        SELECT p.*,
          COALESCE(pf.is_best_seller, false) as is_best_seller,
          COALESCE(pf.is_new_arrival, false) as is_new_arrival,
          COALESCE(pf.sort_order, 0) as sort_order,
          COALESCE(
            json_agg(
              json_build_object(
                'id', pi.id,
                'secure_url', pi.secure_url,
                'cloudinary_public_id', pi.cloudinary_public_id,
                'alt_text', pi.alt_text,
                'sort_order', pi.sort_order
              ) ORDER BY pi.sort_order ASC
            ) FILTER (WHERE pi.id IS NOT NULL),
            '[]'::json
          ) as images
        FROM public.products p
        LEFT JOIN public.product_flags pf ON pf.product_id = p.id
        LEFT JOIN public.product_images pi ON pi.product_id = p.id
        WHERE p.slug = $1
        GROUP BY p.id, pf.is_best_seller, pf.is_new_arrival, pf.sort_order
        LIMIT 1
      `;
      const res = await db.query(sql, [slug]);
      if (res.rows.length === 0) return null;
      const row = res.rows[0];
      return {
        ...row,
        price: Number(row.price),
        compare_at_price: row.compare_at_price ? Number(row.compare_at_price) : null,
        stock: Number(row.stock),
      };
    } catch (err) {
      console.error("Error fetching product by slug from database:", err);
      return null;
    }
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      const sql = `
        SELECT p.*,
          COALESCE(pf.is_best_seller, false) as is_best_seller,
          COALESCE(pf.is_new_arrival, false) as is_new_arrival,
          COALESCE(pf.sort_order, 0) as sort_order,
          COALESCE(
            json_agg(
              json_build_object(
                'id', pi.id,
                'secure_url', pi.secure_url,
                'cloudinary_public_id', pi.cloudinary_public_id,
                'alt_text', pi.alt_text,
                'sort_order', pi.sort_order
              ) ORDER BY pi.sort_order ASC
            ) FILTER (WHERE pi.id IS NOT NULL),
            '[]'::json
          ) as images
        FROM public.products p
        LEFT JOIN public.product_flags pf ON pf.product_id = p.id
        LEFT JOIN public.product_images pi ON pi.product_id = p.id
        WHERE p.id = $1
        GROUP BY p.id, pf.is_best_seller, pf.is_new_arrival, pf.sort_order
        LIMIT 1
      `;
      const res = await db.query(sql, [id]);
      if (res.rows.length === 0) return null;
      const row = res.rows[0];
      return {
        ...row,
        price: Number(row.price),
        compare_at_price: row.compare_at_price ? Number(row.compare_at_price) : null,
        stock: Number(row.stock),
      };
    } catch (err) {
      console.error("Error fetching product by ID from database:", err);
      return null;
    }
  }

  async createProduct(data: Omit<Product, "id" | "created_at" | "updated_at">): Promise<Product> {
    const slug = data.slug || slugify(data.name);
    // Ensure color_variants column exists
    await db.query(`ALTER TABLE public.products ADD COLUMN IF NOT EXISTS color_variants JSONB DEFAULT '[]'::jsonb;`).catch(() => {});

    const res = await db.query(
      `INSERT INTO public.products 
        (name, slug, short_description, description, price, compare_at_price, sku, stock, status, color_variants)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        data.name,
        slug,
        data.short_description || "",
        data.description || "",
        data.price,
        data.compare_at_price || null,
        data.sku,
        data.stock || 0,
        data.status || "draft",
        JSON.stringify(data.color_variants || []),
      ]
    );
    const prod = res.rows[0];

    // Flags
    await db.query(
      `INSERT INTO public.product_flags (product_id, is_best_seller, is_new_arrival, sort_order)
       VALUES ($1, $2, $3, $4)`,
      [prod.id, !!data.is_best_seller, !!data.is_new_arrival, data.sort_order || 0]
    );

    // Images
    if (data.images && data.images.length > 0) {
      for (const img of data.images) {
        await db.query(
          `INSERT INTO public.product_images (product_id, cloudinary_public_id, secure_url, alt_text, sort_order)
           VALUES ($1, $2, $3, $4, $5)`,
          [prod.id, img.cloudinary_public_id, img.secure_url, img.alt_text, img.sort_order]
        );
      }
    }

    // Category relations
    if (data.categories && data.categories.length > 0) {
      for (const cat of data.categories) {
        if (cat.id) {
          await db.query(
            `INSERT INTO public.product_category_relations (product_id, category_id)
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING`,
            [prod.id, cat.id]
          );
        }
      }
    }

    return (await this.getProductById(prod.id))!;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    await db.query(`ALTER TABLE public.products ADD COLUMN IF NOT EXISTS color_variants JSONB DEFAULT '[]'::jsonb;`).catch(() => {});

    const fields: string[] = [];
    const values: (string | number | boolean | null)[] = [];
    let i = 1;

    if (updates.name && !updates.slug) {
      updates.slug = slugify(updates.name);
    }

    const prodCols: (keyof Product)[] = ["name", "slug", "short_description", "description", "price", "compare_at_price", "sku", "stock", "status"];
    for (const col of prodCols) {
      const val = updates[col];
      if (val !== undefined) {
        fields.push(`${col} = $${i}`);
        values.push(val as string | number | null);
        i++;
      }
    }

    if (updates.color_variants !== undefined) {
      fields.push(`color_variants = $${i}`);
      values.push(JSON.stringify(updates.color_variants || []));
      i++;
    }

    if (fields.length > 0) {
      fields.push(`updated_at = now()`);
      values.push(id);
      await db.query(`UPDATE public.products SET ${fields.join(", ")} WHERE id = $${i}`, values);
    }

    // Images
    if (updates.images !== undefined && Array.isArray(updates.images)) {
      await db.query(`DELETE FROM public.product_images WHERE product_id = $1`, [id]).catch(() => {});
      for (const img of updates.images) {
        await db.query(
          `INSERT INTO public.product_images (product_id, cloudinary_public_id, secure_url, alt_text, sort_order)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, img.cloudinary_public_id, img.secure_url, img.alt_text || "", img.sort_order || 0]
        ).catch(() => {});
      }
    }

    // Update flags
    if (updates.is_best_seller !== undefined || updates.is_new_arrival !== undefined || updates.sort_order !== undefined) {
      await db.query(
        `INSERT INTO public.product_flags (product_id, is_best_seller, is_new_arrival, sort_order)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (product_id) DO UPDATE 
         SET is_best_seller = COALESCE($2, public.product_flags.is_best_seller),
             is_new_arrival = COALESCE($3, public.product_flags.is_new_arrival),
             sort_order = COALESCE($4, public.product_flags.sort_order)`,
        [id, updates.is_best_seller ?? null, updates.is_new_arrival ?? null, updates.sort_order ?? null]
      );
    }

    // Update Category relations
    if (updates.categories !== undefined) {
      await db.query(`DELETE FROM public.product_category_relations WHERE product_id = $1`, [id]);
      if (Array.isArray(updates.categories)) {
        for (const cat of updates.categories) {
          if (cat.id) {
            await db.query(
              `INSERT INTO public.product_category_relations (product_id, category_id)
               VALUES ($1, $2)
               ON CONFLICT DO NOTHING`,
              [id, cat.id]
            );
          }
        }
      }
    }

    return this.getProductById(id);
  }

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const res = await db.query(`DELETE FROM public.products WHERE id = $1`, [id]);
      return (res.rowCount ?? 0) > 0;
    } catch {
      return false;
    }
  }

  async toggleProductFlag(id: string, flag: "is_best_seller" | "is_new_arrival"): Promise<Product | null> {
    const prod = await this.getProductById(id);
    if (!prod) return null;

    const newVal = !prod[flag];
    await db.query(
      `INSERT INTO public.product_flags (product_id, ${flag})
       VALUES ($1, $2)
       ON CONFLICT (product_id) DO UPDATE SET ${flag} = $2`,
      [id, newVal]
    );

    return this.getProductById(id);
  }

  // CATEGORIES
  async getCategories(): Promise<ProductCategory[]> {
    try {
      const res = await db.query(`SELECT * FROM public.product_categories ORDER BY created_at ASC`);
      return res.rows;
    } catch (err) {
      console.error("Error fetching categories from database:", err);
      return [];
    }
  }

  async getCategoryBySlug(slug: string): Promise<ProductCategory | null> {
    try {
      const res = await db.query(`SELECT * FROM public.product_categories WHERE slug = $1 LIMIT 1`, [slug]);
      return res.rows[0] || null;
    } catch (err) {
      console.error("Error fetching category by slug:", err);
      return null;
    }
  }

  async getCategoryById(id: string): Promise<ProductCategory | null> {
    try {
      const res = await db.query(`SELECT * FROM public.product_categories WHERE id = $1 LIMIT 1`, [id]);
      return res.rows[0] || null;
    } catch (err) {
      console.error("Error fetching category by id:", err);
      return null;
    }
  }

  async createCategory(data: {
    name: string;
    slug?: string;
    description?: string;
    image_url?: string;
  }): Promise<ProductCategory> {
    const slug = data.slug?.trim() ? slugify(data.slug) : slugify(data.name);
    const res = await db.query(
      `INSERT INTO public.product_categories (name, slug, description, image_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.name.trim(), slug, data.description || null, data.image_url || null]
    );
    return res.rows[0];
  }

  async updateCategory(
    id: string,
    data: Partial<{ name: string; slug: string; description: string; image_url: string }>
  ): Promise<ProductCategory | null> {
    const updates: string[] = [];
    const params: (string | null)[] = [];
    let idx = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${idx++}`);
      params.push(data.name.trim());
    }
    if (data.slug !== undefined) {
      updates.push(`slug = $${idx++}`);
      params.push(slugify(data.slug));
    }
    if (data.description !== undefined) {
      updates.push(`description = $${idx++}`);
      params.push(data.description || null);
    }
    if (data.image_url !== undefined) {
      updates.push(`image_url = $${idx++}`);
      params.push(data.image_url || null);
    }

    if (updates.length === 0) return this.getCategoryById(id);

    params.push(id);
    const res = await db.query(
      `UPDATE public.product_categories SET ${updates.join(", ")} WHERE id = $${idx} RETURNING *`,
      params
    );
    return res.rows[0] || null;
  }

  async deleteCategory(id: string): Promise<boolean> {
    try {
      await db.query(`DELETE FROM public.product_category_relations WHERE category_id = $1`, [id]).catch(() => {});
      const res = await db.query(`DELETE FROM public.product_categories WHERE id = $1`, [id]);
      return (res.rowCount ?? 0) > 0;
    } catch (err) {
      console.error("Error deleting category:", err);
      return false;
    }
  }

  // REVIEWS
  async getReviews(activeOnly = true): Promise<CustomerReview[]> {
    try {
      await db
        .query(
          `CREATE TABLE IF NOT EXISTS public.customer_reviews (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            customer_name TEXT NOT NULL,
            rating INTEGER NOT NULL DEFAULT 5,
            review TEXT NOT NULL,
            image_url TEXT,
            verified_purchase BOOLEAN DEFAULT true,
            product_name TEXT,
            status TEXT NOT NULL DEFAULT 'active',
            created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
          );`
        )
        .catch(() => {});

      const where = activeOnly ? "WHERE status = 'active'" : "";
      const res = await db.query(
        `SELECT * FROM public.customer_reviews ${where} ORDER BY created_at DESC`
      );
      if (res.rows.length === 0) {
        return [];
      }
      return res.rows;
    } catch (err) {
      console.error("Error fetching reviews from database:", err);
      return [];
    }
  }

  async getReviewById(id: string): Promise<CustomerReview | null> {
    try {
      const res = await db.query(`SELECT * FROM public.customer_reviews WHERE id = $1 LIMIT 1`, [id]);
      return res.rows[0] || null;
    } catch {
      return null;
    }
  }

  async createReview(data: Omit<CustomerReview, "id" | "created_at">): Promise<CustomerReview> {
    const res = await db.query(
      `INSERT INTO public.customer_reviews 
        (customer_name, rating, review, image_url, verified_purchase, product_name, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.customer_name.trim(),
        Number(data.rating) || 5,
        data.review.trim(),
        data.image_url || null,
        data.verified_purchase ?? true,
        data.product_name || null,
        data.status || "active",
      ]
    );
    return res.rows[0];
  }

  async updateReview(id: string, updates: Partial<CustomerReview>): Promise<CustomerReview | null> {
    const fields: string[] = [];
    const values: (string | number | boolean | null)[] = [];
    let i = 1;

    for (const [key, val] of Object.entries(updates)) {
      if (key !== "id" && key !== "created_at" && val !== undefined) {
        fields.push(`${key} = $${i}`);
        values.push(val);
        i++;
      }
    }

    if (fields.length === 0) return this.getReviewById(id);

    values.push(id);
    const res = await db.query(
      `UPDATE public.customer_reviews SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`,
      values
    );
    return res.rows[0] || null;
  }

  async deleteReview(id: string): Promise<boolean> {
    try {
      const res = await db.query(`DELETE FROM public.customer_reviews WHERE id = $1`, [id]);
      return (res.rowCount ?? 0) > 0;
    } catch {
      return false;
    }
  }

  // ANNOUNCEMENTS
  async getAnnouncements(activeOnly = false): Promise<AnnouncementItem[]> {
    try {
      const where = activeOnly ? "WHERE is_active = true" : "";
      const res = await db.query(
        `SELECT * FROM public.announcements ${where} ORDER BY sort_order ASC, created_at ASC`
      );
      return res.rows.map((r) => ({
        id: r.id,
        text: r.text,
        link: r.link,
        badge: r.badge,
        is_active: Boolean(r.is_active),
        sort_order: Number(r.sort_order),
      }));
    } catch (err) {
      console.error("Error fetching announcements from database:", err);
      return [];
    }
  }

  async getAnnouncementsConfig(): Promise<AnnouncementConfig> {
    try {
      const [items, cfgRes] = await Promise.all([
        this.getAnnouncements(false),
        db.query(`SELECT interval_seconds, is_active, updated_at FROM public.announcements_config WHERE id = 'default' LIMIT 1`),
      ]);
      const cfg = cfgRes.rows[0] || {};
      return {
        id: "default",
        interval_seconds: Number(cfg.interval_seconds) || 4,
        is_active: cfg.is_active !== undefined ? Boolean(cfg.is_active) : true,
        items,
        updated_at: cfg.updated_at,
      };
    } catch (err) {
      console.error("Error fetching announcements config:", err);
      return {
        id: "default",
        interval_seconds: 4,
        is_active: true,
        items: [],
      };
    }
  }

  async saveAnnouncementsConfig(config: {
    interval_seconds: number;
    is_active: boolean;
    items: AnnouncementItem[];
  }): Promise<AnnouncementConfig> {
    // 1. Sync items into public.announcements
    for (let i = 0; i < config.items.length; i++) {
      const it = config.items[i];
      const id = it.id || `ann-${Date.now()}-${i}`;
      await db.query(
        `INSERT INTO public.announcements (id, text, link, badge, is_active, sort_order, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, timezone('utc'::text, now()))
         ON CONFLICT (id) DO UPDATE SET
           text = EXCLUDED.text,
           link = EXCLUDED.link,
           badge = EXCLUDED.badge,
           is_active = EXCLUDED.is_active,
           sort_order = EXCLUDED.sort_order,
           updated_at = timezone('utc'::text, now())`,
        [id, it.text, it.link || "/shop", it.badge || null, it.is_active ?? true, it.sort_order ?? (i + 1)]
      );
    }

    // Remove deleted announcements
    const currentIds = config.items.map((it) => it.id).filter(Boolean);
    if (currentIds.length > 0) {
      await db.query(`DELETE FROM public.announcements WHERE id NOT IN (${currentIds.map((_, idx) => `$${idx + 1}`).join(", ")})`, currentIds);
    }

    // 2. Update announcements_config table
    await db.query(
      `INSERT INTO public.announcements_config (id, interval_seconds, is_active, items, updated_at)
       VALUES ('default', $1, $2, $3, timezone('utc'::text, now()))
       ON CONFLICT (id) DO UPDATE SET
         interval_seconds = EXCLUDED.interval_seconds,
         is_active = EXCLUDED.is_active,
         items = EXCLUDED.items,
         updated_at = timezone('utc'::text, now())`,
      [config.interval_seconds || 4, config.is_active ?? true, JSON.stringify(config.items)]
    );

    return this.getAnnouncementsConfig();
  }

  // MIDDLE BANNER
  async getMiddleBanner(): Promise<Record<string, unknown> | null> {
    try {
      const res = await db.query(`SELECT * FROM public.middle_banners WHERE id = 'default' LIMIT 1`);
      if (res.rows.length > 0) return res.rows[0];
      return null;
    } catch (err) {
      console.error("Error fetching middle banner:", err);
      return null;
    }
  }

  async updateMiddleBanner(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    const res = await db.query(
      `INSERT INTO public.middle_banners 
        (id, eyebrow, title, description, button_text, button_link, media_type, media_url, image_url, height, is_active, updated_at)
       VALUES ('default', $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, timezone('utc'::text, now()))
       ON CONFLICT (id) DO UPDATE SET
         eyebrow = EXCLUDED.eyebrow,
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         button_text = EXCLUDED.button_text,
         button_link = EXCLUDED.button_link,
         media_type = EXCLUDED.media_type,
         media_url = EXCLUDED.media_url,
         image_url = EXCLUDED.image_url,
         height = EXCLUDED.height,
         is_active = EXCLUDED.is_active,
         updated_at = timezone('utc'::text, now())
       RETURNING *`,
      [
        (data.eyebrow as string) || null,
        (data.title as string) || "ARCHITECTURAL LEATHER",
        (data.description as string) || null,
        (data.button_text as string) || "DISCOVER THE ATELIER",
        (data.button_link as string) || "/shop",
        (data.media_type as string) || "image",
        (data.media_url as string) || null,
        (data.image_url as string) || null,
        (data.height as string) || "55vh",
        (data.is_active as boolean) ?? (data.enabled as boolean) ?? true,
      ]
    );
    return res.rows[0];
  }

  // SEEN ON YOU
  async getSeenOnYou(): Promise<SeenOnYouVideo[]> {
    try {
      await db
        .query(
          `CREATE TABLE IF NOT EXISTS public.customer_videos (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            customer_name TEXT NOT NULL,
            video_url TEXT NOT NULL,
            thumbnail_url TEXT,
            cloudinary_public_id TEXT,
            caption TEXT,
            product_name TEXT,
            product_slug TEXT,
            status TEXT NOT NULL DEFAULT 'active',
            sort_order INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
          );`
        )
        .catch(() => {});

      await db.query(`ALTER TABLE public.customer_videos ALTER COLUMN caption DROP NOT NULL;`).catch(() => {});

      const res = await db.query(
        `SELECT * FROM public.customer_videos WHERE status = 'active' ORDER BY sort_order ASC, created_at DESC`
      );
      if (res.rows.length === 0) {
        return [];
      }
      return res.rows;
    } catch (err) {
      console.error("Error fetching videos from database:", err);
      return [];
    }
  }

  // DASHBOARD STATS
  async getDashboardStats(): Promise<AdminDashboardStats> {
    try {
      const [
        totalProd,
        bestSellers,
        newArrivals,
        activeHeroes,
        draftHeroes,
        lowStock,
        totalCust,
        totalOrd,
        totalRev,
        pendingOrd,
      ] = await Promise.all([
        db.query(`SELECT COUNT(*) FROM public.products`),
        db.query(`SELECT COUNT(*) FROM public.product_flags WHERE is_best_seller = true`),
        db.query(`SELECT COUNT(*) FROM public.product_flags WHERE is_new_arrival = true`),
        db.query(`SELECT COUNT(*) FROM public.hero_banners WHERE status = 'published' AND is_active = true`),
        db.query(`SELECT COUNT(*) FROM public.hero_banners WHERE status = 'draft'`),
        db.query(`SELECT COUNT(*) FROM public.products WHERE stock < 10`),
        db.query(`SELECT COUNT(*) FROM public.users`),
        db.query(`SELECT COUNT(*) FROM public.orders`),
        db.query(`SELECT COALESCE(SUM(total_amount), 0) FROM public.orders WHERE status != 'cancelled'`),
        db.query(`SELECT COUNT(*) FROM public.orders WHERE status = 'processing'`),
      ]);

      return {
        totalProducts: parseInt(totalProd.rows[0].count),
        totalCustomers: parseInt(totalCust.rows[0].count),
        totalOrders: parseInt(totalOrd.rows[0].count),
        totalRevenue: Number(totalRev.rows[0].coalesce || 0),
        pendingOrders: parseInt(pendingOrd.rows[0].count),
        bestSellersCount: parseInt(bestSellers.rows[0].count),
        newArrivalsCount: parseInt(newArrivals.rows[0].count),
        activeHeroBanners: parseInt(activeHeroes.rows[0].count),
        draftHeroBanners: parseInt(draftHeroes.rows[0].count),
        lowStockCount: parseInt(lowStock.rows[0].count),
      };
    } catch (err) {
      console.error("Error fetching dashboard stats from database:", err);
      return {
        totalProducts: 0,
        totalCustomers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        bestSellersCount: 0,
        newArrivalsCount: 0,
        activeHeroBanners: 0,
        draftHeroBanners: 0,
        lowStockCount: 0,
      };
    }
  }

  // ==========================================
  // ORDERS MANAGEMENT
  // ==========================================
  async getOrders(params?: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ orders: Order[]; total: number }> {
    try {
      const conditions: string[] = [];
      const values: (string | number)[] = [];
      let idx = 1;

      if (params?.status && params.status !== "all") {
        conditions.push(`o.status = $${idx++}`);
        values.push(params.status);
      }

      if (params?.search && params.search.trim()) {
        const term = `%${params.search.trim()}%`;
        conditions.push(
          `(o.order_number ILIKE $${idx} OR o.customer_name ILIKE $${idx} OR o.customer_email ILIKE $${idx} OR o.customer_phone ILIKE $${idx})`
        );
        values.push(term);
        idx++;
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

      const countRes = await db.query(
        `SELECT COUNT(*) FROM public.orders o ${whereClause}`,
        values
      );
      const total = parseInt(countRes.rows[0]?.count || "0", 10);

      const limit = params?.limit || 20;
      const offset = params?.offset || 0;

      const orderQuery = `
        SELECT 
          o.*,
          COALESCE(
            json_agg(
              json_build_object(
                'id', oi.id,
                'order_id', oi.order_id,
                'product_id', oi.product_id,
                'product_name', oi.product_name,
                'product_slug', oi.product_slug,
                'price', oi.price,
                'quantity', oi.quantity,
                'image_url', oi.image_url,
                'attributes', oi.attributes,
                'created_at', oi.created_at
              )
            ) FILTER (WHERE oi.id IS NOT NULL),
            '[]'
          ) as items
        FROM public.orders o
        LEFT JOIN public.order_items oi ON o.id = oi.order_id
        ${whereClause}
        GROUP BY o.id
        ORDER BY o.created_at DESC
        LIMIT $${idx++} OFFSET $${idx++}
      `;

      values.push(limit, offset);
      const res = await db.query(orderQuery, values);

      const orders: Order[] = res.rows.map((row) => ({
        ...row,
        total_amount: Number(row.total_amount),
        shipping_address:
          typeof row.shipping_address === "string"
            ? JSON.parse(row.shipping_address)
            : row.shipping_address,
        items: (row.items || []).map((it: OrderItem) => ({
          ...it,
          price: Number(it.price),
          quantity: Number(it.quantity),
          attributes:
            typeof it.attributes === "string"
              ? JSON.parse(it.attributes)
              : it.attributes,
        })),
      }));

      return { orders, total };
    } catch (err) {
      console.error("Error fetching orders:", err);
      return { orders: [], total: 0 };
    }
  }

  async getOrderById(id: string): Promise<Order | null> {
    try {
      const orderRes = await db.query(
        `SELECT * FROM public.orders WHERE id::text = $1 OR order_number = $1 LIMIT 1`,
        [id]
      );
      if (orderRes.rows.length === 0) return null;
      const row = orderRes.rows[0];

      const itemsRes = await db.query(
        `SELECT * FROM public.order_items WHERE order_id = $1 ORDER BY created_at ASC`,
        [row.id]
      );

      return {
        ...row,
        total_amount: Number(row.total_amount),
        shipping_address:
          typeof row.shipping_address === "string"
            ? JSON.parse(row.shipping_address)
            : row.shipping_address,
        items: itemsRes.rows.map((it) => ({
          ...it,
          price: Number(it.price),
          quantity: Number(it.quantity),
          attributes:
            typeof it.attributes === "string"
              ? JSON.parse(it.attributes)
              : it.attributes,
        })),
      };
    } catch (err) {
      console.error("Error fetching order by ID:", err);
      return null;
    }
  }

  async createOrder(
    data: Omit<Order, "id" | "created_at" | "updated_at">,
    items?: Omit<OrderItem, "id" | "order_id" | "created_at">[]
  ): Promise<Order> {
    const orderNumber =
      data.order_number ||
      `DN-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const isValidUUID = (id?: string | null) =>
      Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));
    const passedUserId = isValidUUID(data.user_id) ? data.user_id : null;

    let finalUserId: string | null = null;
    if (passedUserId) {
      try {
        const userCheck = await db.query(
          `SELECT id FROM public.users WHERE id = $1 LIMIT 1`,
          [passedUserId]
        );
        if (userCheck.rows && userCheck.rows.length > 0) {
          finalUserId = userCheck.rows[0].id;
        }
      } catch (err) {
        console.warn("Could not verify user_id in public.users:", err);
      }
    }

    // Fallback: If user_id wasn't in public.users, check if customer_email matches a registered user
    if (!finalUserId && data.customer_email) {
      try {
        const emailCheck = await db.query(
          `SELECT id FROM public.users WHERE LOWER(email) = LOWER($1) LIMIT 1`,
          [data.customer_email.trim()]
        );
        if (emailCheck.rows && emailCheck.rows.length > 0) {
          finalUserId = emailCheck.rows[0].id;
        }
      } catch {
        // Safe fallback to null for guest checkout
      }
    }

    const res = await db.query(
      `INSERT INTO public.orders 
        (order_number, user_id, customer_email, customer_name, customer_phone, total_amount, status, payment_status, payment_method, shipping_address, tracking_number, carrier, estimated_delivery, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        orderNumber,
        finalUserId,
        data.customer_email,
        data.customer_name,
        data.customer_phone || null,
        data.total_amount,
        data.status || "processing",
        data.payment_status || "paid",
        data.payment_method || "card",
        JSON.stringify(data.shipping_address || {}),
        data.tracking_number || null,
        data.carrier || null,
        data.estimated_delivery || null,
        data.notes || null,
      ]
    );

    const createdOrder = res.rows[0];
    const createdItems: OrderItem[] = [];

    if (items && items.length > 0) {
      for (const item of items) {
        const itemRes = await db.query(
          `INSERT INTO public.order_items
            (order_id, product_id, product_name, product_slug, price, quantity, image_url, attributes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING *`,
          [
            createdOrder.id,
            item.product_id || null,
            item.product_name,
            item.product_slug || null,
            item.price,
            item.quantity,
            item.image_url || null,
            JSON.stringify(item.attributes || {}),
          ]
        );
        createdItems.push({
          ...itemRes.rows[0],
          price: Number(itemRes.rows[0].price),
          quantity: Number(itemRes.rows[0].quantity),
        });
      }
    }

    return {
      ...createdOrder,
      total_amount: Number(createdOrder.total_amount),
      shipping_address:
        typeof createdOrder.shipping_address === "string"
          ? JSON.parse(createdOrder.shipping_address)
          : createdOrder.shipping_address,
      items: createdItems,
    };
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
    const fields: string[] = [];
    const values: (string | number | boolean | null)[] = [];
    let i = 1;

    for (const [key, val] of Object.entries(updates)) {
      if (key !== "id" && key !== "created_at" && key !== "items" && val !== undefined) {
        if (key === "shipping_address") {
          fields.push(`${key} = $${i}`);
          values.push(JSON.stringify(val));
        } else {
          fields.push(`${key} = $${i}`);
          values.push(val as string | number | boolean | null);
        }
        i++;
      }
    }

    if (fields.length === 0) return this.getOrderById(id);

    fields.push(`updated_at = timezone('utc'::text, now())`);
    values.push(id);

    await db.query(
      `UPDATE public.orders SET ${fields.join(", ")} WHERE id = $${i} OR order_number = $${i}`,
      values
    );

    return this.getOrderById(id);
  }

  async deleteOrder(id: string): Promise<boolean> {
    try {
      const res = await db.query(
        `DELETE FROM public.orders WHERE id::text = $1 OR order_number = $1 RETURNING id`,
        [id]
      );
      return (res.rowCount ?? 0) > 0;
    } catch (err) {
      console.error("Error deleting order:", err);
      return false;
    }
  }

  // ==========================================
  // HOMEPAGE CONFIGURATION
  // ==========================================
  async getHomepageConfig(): Promise<HomepageConfig> {
    const fallback: HomepageConfig = {
      topbar: {
        enabled: true,
        text: "COMPLIMENTARY WHITE-GLOVE EXPRESS DELIVERY ON ALL LUXURY ORDERS",
        link: "/shop",
      },
      hero: {
        enabled: true,
      },
      categories: {
        enabled: true,
        title: "CATEGORIES",
        heading_color: "#0E0E0E",
        heading_font_size: "32px",
        heading_font_family: "arial-rounded",
        heading_font_weight: "800",
        card_gap: 24,
      },
      best_sellers: {
        enabled: true,
        title: "BEST SELLERS",
        view_all_link: "/shop?best_seller=true",
        view_all_text: "VIEW ALL",
        heading_color: "#0E0E0E",
        heading_font_size: "32px",
        heading_font_family: "arial-rounded",
        heading_font_weight: "800",
        card_gap: 20,
      },
      new_in: {
        enabled: true,
        title: "NEW IN",
        view_all_link: "/shop?new_arrival=true",
        view_all_text: "VIEW ALL",
        heading_color: "#0E0E0E",
        heading_font_size: "32px",
        heading_font_family: "arial-rounded",
        heading_font_weight: "800",
        card_gap: 20,
      },
      middle_banner: {
        enabled: true,
        eyebrow: "Atelier Edition • Florence",
        title: "ARCHITECTURAL LEATHER",
        description: "Sculpted with uncompromising discipline. Cut from certified full-grain Tuscan calfskin and finished with bespoke satin metal hardware.",
        button_text: "DISCOVER THE ATELIER",
        button_link: "/shop",
        image_url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1800&q=85",
      },
      seen_on_you: {
        enabled: true,
        title: "SEEN ON YOU",
        heading_color: "#0E0E0E",
        heading_font_size: "32px",
        heading_font_family: "arial-rounded",
        heading_font_weight: "800",
        card_gap: 12,
      },
      customer_reviews: {
        enabled: true,
        title: "CUSTOMER REVIEWS",
      },
      footer: {
        subtitle: "Artisan Handbags • Florence • New York",
        story_text: "Architectural silhouettes, meticulous artisan leatherwork, and timeless aesthetics designed for the modern woman. Handcrafted with bespoke calfskin and precision hardware.",
        instagram_url: "https://instagram.com/dnoralifestyle",
        facebook_url: "https://facebook.com/dnoralifestyle",
        pinterest_url: "https://pinterest.com/dnoralifestyle",
      },
    };

    try {
      const res = await db.query(`SELECT config FROM public.homepage_config WHERE id = 'default' LIMIT 1`);
      if (res.rows.length === 0) return fallback;
      const raw = res.rows[0].config;
      return typeof raw === "string" ? JSON.parse(raw) : (raw || fallback);
    } catch (err) {
      console.error("Error fetching homepage config:", err);
      return fallback;
    }
  }

  async updateHomepageConfig(config: HomepageConfig): Promise<HomepageConfig> {
    try {
      await db.query(
        `INSERT INTO public.homepage_config (id, config, updated_at)
         VALUES ('default', $1, timezone('utc'::text, now()))
         ON CONFLICT (id) DO UPDATE SET
           config = EXCLUDED.config,
           updated_at = timezone('utc'::text, now())`,
        [JSON.stringify(config)]
      );
      return config;
    } catch (err) {
      console.error("Error updating homepage config:", err);
      throw err;
    }
  }
}

// Export singleton instance
export const store = new DataStore();
