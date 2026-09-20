import { db } from "@/lib/db";
import { Product, ProductCategory } from "@/types";

export class StorefrontCatalogService {
  /**
   * Retrieves active storefront products with optional category or flag filters.
   */
  async getActiveProducts(params?: {
    categoryId?: string;
    categorySlug?: string;
    featured?: boolean;
    bestSeller?: boolean;
    newArrival?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Product[]> {
    try {
      const conditions: string[] = ["p.status = 'active'"];
      const values: (string | number | boolean)[] = [];
      let idx = 1;

      if (params?.categoryId) {
        conditions.push(`p.category_id = $${idx++}`);
        values.push(params.categoryId);
      }

      if (params?.categorySlug) {
        conditions.push(`c.slug = $${idx++}`);
        values.push(params.categorySlug);
      }

      if (params?.featured !== undefined) {
        conditions.push(`p.is_featured = $${idx++}`);
        values.push(params.featured);
      }

      if (params?.bestSeller !== undefined) {
        conditions.push(`p.is_best_seller = $${idx++}`);
        values.push(params.bestSeller);
      }

      if (params?.newArrival !== undefined) {
        conditions.push(`p.is_new_arrival = $${idx++}`);
        values.push(params.newArrival);
      }

      if (params?.search && params.search.trim()) {
        const term = `%${params.search.trim()}%`;
        conditions.push(`(p.name ILIKE $${idx} OR p.description ILIKE $${idx} OR p.sku ILIKE $${idx})`);
        values.push(term);
        idx++;
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
      const limitClause = params?.limit ? `LIMIT $${idx++} OFFSET $${idx++}` : "";
      if (params?.limit) {
        values.push(params.limit);
        values.push(params?.offset || 0);
      }

      const query = `
        SELECT 
          p.*,
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'id', pi.id,
                'cloudinary_public_id', pi.cloudinary_public_id,
                'secure_url', pi.secure_url,
                'alt_text', pi.alt_text,
                'sort_order', pi.sort_order
              )
            ) FILTER (WHERE pi.id IS NOT NULL),
            '[]'
          ) as images,
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'id', pcv.id,
                'name', pcv.name,
                'color_hex', pcv.color_hex,
                'price_adjustment', pcv.price_adjustment,
                'inventory_quantity', pcv.inventory_quantity,
                'is_active', pcv.is_active,
                'sort_order', pcv.sort_order,
                'images', COALESCE(pcv.images, '[]'::jsonb)
              )
            ) FILTER (WHERE pcv.id IS NOT NULL),
            '[]'
          ) as color_variants
        FROM public.products p
        LEFT JOIN public.categories c ON p.category_id = c.id
        LEFT JOIN public.product_images pi ON p.id = pi.product_id
        LEFT JOIN public.product_color_variants pcv ON p.id = pcv.product_id
        ${whereClause}
        GROUP BY p.id
        ORDER BY p.created_at DESC
        ${limitClause}
      `;

      const result = await db.query(query, values);
      return result.rows as Product[];
    } catch (err) {
      console.error("Error retrieving active storefront products:", err);
      return [];
    }
  }

  /**
   * Retrieves a single active product by its URL slug.
   */
  async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const query = `
        SELECT 
          p.*,
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'id', pi.id,
                'cloudinary_public_id', pi.cloudinary_public_id,
                'secure_url', pi.secure_url,
                'alt_text', pi.alt_text,
                'sort_order', pi.sort_order
              )
            ) FILTER (WHERE pi.id IS NOT NULL),
            '[]'
          ) as images,
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'id', pcv.id,
                'name', pcv.name,
                'color_hex', pcv.color_hex,
                'price_adjustment', pcv.price_adjustment,
                'inventory_quantity', pcv.inventory_quantity,
                'is_active', pcv.is_active,
                'sort_order', pcv.sort_order,
                'images', COALESCE(pcv.images, '[]'::jsonb)
              )
            ) FILTER (WHERE pcv.id IS NOT NULL),
            '[]'
          ) as color_variants
        FROM public.products p
        LEFT JOIN public.product_images pi ON p.id = pi.product_id
        LEFT JOIN public.product_color_variants pcv ON p.id = pcv.product_id
        WHERE p.slug = $1
        GROUP BY p.id
        LIMIT 1
      `;
      const result = await db.query(query, [slug]);
      return (result.rows[0] as Product) || null;
    } catch (err) {
      console.error(`Error retrieving product by slug (${slug}):`, err);
      return null;
    }
  }

  /**
   * Retrieves all product categories ordered by name.
   */
  async getCategories(): Promise<ProductCategory[]> {
    try {
      const result = await db.query("SELECT * FROM public.categories ORDER BY name ASC");
      return result.rows as ProductCategory[];
    } catch (err) {
      console.error("Error retrieving product categories:", err);
      return [];
    }
  }

  /**
   * Retrieves a single category by slug.
   */
  async getCategoryBySlug(slug: string): Promise<ProductCategory | null> {
    try {
      const result = await db.query("SELECT * FROM public.categories WHERE slug = $1 LIMIT 1", [slug]);
      return (result.rows[0] as ProductCategory) || null;
    } catch (err) {
      console.error(`Error retrieving category by slug (${slug}):`, err);
      return null;
    }
  }
}

export const storefrontCatalog = new StorefrontCatalogService();
