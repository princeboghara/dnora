import { db } from "@/lib/db";
import { Product, ProductStatus } from "@/types";

export class AdminCatalogService {
  /**
   * Retrieves products for the admin panel with full details, variants, and filters.
   */
  async getProducts(params?: {
    status?: ProductStatus | "all";
    categoryId?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ products: Product[]; total: number }> {
    try {
      const conditions: string[] = [];
      const values: (string | number)[] = [];
      let idx = 1;

      if (params?.status && params.status !== "all") {
        conditions.push(`p.status = $${idx++}`);
        values.push(params.status);
      }

      if (params?.categoryId) {
        conditions.push(`p.category_id = $${idx++}`);
        values.push(params.categoryId);
      }

      if (params?.search && params.search.trim()) {
        const term = `%${params.search.trim()}%`;
        conditions.push(`(p.name ILIKE $${idx} OR p.description ILIKE $${idx} OR p.sku ILIKE $${idx})`);
        values.push(term);
        idx++;
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

      const countRes = await db.query(`SELECT COUNT(*) FROM public.products p ${whereClause}`, values);
      const total = parseInt(countRes.rows[0]?.count || "0", 10);

      const limit = params?.limit || 20;
      const offset = params?.offset || 0;

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
        ${whereClause}
        GROUP BY p.id
        ORDER BY p.created_at DESC
        LIMIT $${idx++} OFFSET $${idx++}
      `;

      values.push(limit, offset);
      const result = await db.query(query, values);
      return { products: result.rows as Product[], total };
    } catch (err) {
      console.error("Error retrieving admin products:", err);
      return { products: [], total: 0 };
    }
  }

  /**
   * Retrieves a single product by its unique UUID ID.
   */
  async getProductById(id: string): Promise<Product | null> {
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
        WHERE p.id = $1
        GROUP BY p.id
        LIMIT 1
      `;
      const result = await db.query(query, [id]);
      return (result.rows[0] as Product) || null;
    } catch (err) {
      console.error(`Error retrieving product by ID (${id}):`, err);
      return null;
    }
  }

  /**
   * Toggles product status between active and draft.
   */
  async toggleProductStatus(id: string): Promise<Product> {
    const product = await this.getProductById(id);
    if (!product) throw new Error("Product not found");
    const newStatus: ProductStatus = product.status === "active" ? "draft" : "active";
    const res = await db.query(
      "UPDATE public.products SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [newStatus, id]
    );
    return res.rows[0] as Product;
  }
}

export const adminCatalogService = new AdminCatalogService();
