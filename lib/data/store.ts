import {
  Product,
  HeroBanner,
  ProductCategory,
  CustomerReview,
  SeenOnYouVideo,
  AdminDashboardStats,
} from "@/types";
import { db } from "@/lib/db";
import { slugify } from "../utils";

class DataStore {
  // HERO BANNERS
  async getHeroBanners(includeDrafts: boolean = false): Promise<HeroBanner[]> {
    try {
      let query = `SELECT * FROM public.hero_banners`;
      if (!includeDrafts) {
        query += ` WHERE status = 'published' AND is_active = true`;
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
        (title, subtitle, media_type, cloudinary_public_id, media_url, mobile_media_url, button_text, button_link, duration_seconds, sort_order, is_active, status, text_alignment)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        data.title,
        data.subtitle || null,
        data.media_type,
        data.cloudinary_public_id || null,
        data.media_url,
        data.mobile_media_url || null,
        data.button_text || "Explore Collection",
        data.button_link || "/shop",
        data.duration_seconds || 5,
        data.sort_order || 0,
        data.is_active ?? true,
        data.status || "draft",
        data.text_alignment || "left",
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

      if (filter?.status) {
        conditions.push(`p.status = $${idx++}`);
        params.push(filter.status);
      } else {
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
      return res.rows.map((row) => ({
        ...row,
        price: Number(row.price),
        compare_at_price: row.compare_at_price ? Number(row.compare_at_price) : null,
        stock: Number(row.stock),
      }));
    } catch (err) {
      console.error("Error fetching products from database:", err);
      return [];
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
    const res = await db.query(
      `INSERT INTO public.products 
        (name, slug, short_description, description, price, compare_at_price, sku, stock, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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

    return (await this.getProductById(prod.id))!;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
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

    if (fields.length > 0) {
      fields.push(`updated_at = now()`);
      values.push(id);
      await db.query(`UPDATE public.products SET ${fields.join(", ")} WHERE id = $${i}`, values);
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

  // REVIEWS
  async getReviews(): Promise<CustomerReview[]> {
    try {
      const res = await db.query(
        `SELECT * FROM public.customer_reviews WHERE status = 'active' ORDER BY created_at DESC`
      );
      return res.rows;
    } catch (err) {
      console.error("Error fetching reviews from database:", err);
      return [];
    }
  }

  // SEEN ON YOU
  async getSeenOnYou(): Promise<SeenOnYouVideo[]> {
    try {
      const res = await db.query(
        `SELECT * FROM public.customer_videos WHERE status = 'active' ORDER BY sort_order ASC, created_at DESC`
      );
      return res.rows;
    } catch (err) {
      console.error("Error fetching videos from database:", err);
      return [];
    }
  }

  // DASHBOARD STATS
  async getDashboardStats(): Promise<AdminDashboardStats> {
    try {
      const [totalProd, bestSellers, newArrivals, activeHeroes, draftHeroes, lowStock, totalCust] =
        await Promise.all([
          db.query(`SELECT COUNT(*) FROM public.products`),
          db.query(`SELECT COUNT(*) FROM public.product_flags WHERE is_best_seller = true`),
          db.query(`SELECT COUNT(*) FROM public.product_flags WHERE is_new_arrival = true`),
          db.query(`SELECT COUNT(*) FROM public.hero_banners WHERE status = 'published' AND is_active = true`),
          db.query(`SELECT COUNT(*) FROM public.hero_banners WHERE status = 'draft'`),
          db.query(`SELECT COUNT(*) FROM public.products WHERE stock < 10`),
          db.query(`SELECT COUNT(*) FROM public.users`),
        ]);

      return {
        totalProducts: parseInt(totalProd.rows[0].count),
        totalCustomers: parseInt(totalCust.rows[0].count),
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
        bestSellersCount: 0,
        newArrivalsCount: 0,
        activeHeroBanners: 0,
        draftHeroBanners: 0,
        lowStockCount: 0,
      };
    }
  }
}

// Export singleton instance
export const store = new DataStore();
