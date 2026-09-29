import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "all";
    const search = searchParams.get("search") || "";

    const conditions: string[] = ["p.status != 'archived'"];
    const params: unknown[] = [];
    let idx = 1;

    if (search.trim()) {
      conditions.push(`(LOWER(p.name) LIKE $${idx} OR LOWER(p.sku) LIKE $${idx})`);
      params.push(`%${search.trim().toLowerCase()}%`);
      idx++;
    }

    if (filter === "low-stock") {
      conditions.push(`p.stock > 0 AND p.stock <= 5`);
    } else if (filter === "out-of-stock") {
      conditions.push(`p.stock = 0`);
    } else if (filter === "in-stock") {
      conditions.push(`p.stock > 5`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.sku,
        p.stock,
        p.price,
        p.status,
        p.updated_at,
        (
          SELECT secure_url 
          FROM public.product_images pi 
          WHERE pi.product_id = p.id 
          ORDER BY pi.sort_order ASC 
          LIMIT 1
        ) as image_url,
        (
          SELECT c.name 
          FROM public.product_category_relations pcr
          JOIN public.product_categories c ON c.id = pcr.category_id
          WHERE pcr.product_id = p.id
          LIMIT 1
        ) as category_name
      FROM public.products p
      ${whereClause}
      ORDER BY p.stock ASC, p.name ASC
    `;

    const res = await db.query(query, params);

    // Calculate Summary Counts
    const countsRes = await db.query(`
      SELECT 
        COUNT(*) as total_skus,
        COUNT(*) FILTER (WHERE stock > 5) as in_stock,
        COUNT(*) FILTER (WHERE stock > 0 AND stock <= 5) as low_stock,
        COUNT(*) FILTER (WHERE stock = 0) as out_of_stock
      FROM public.products
      WHERE status != 'archived'
    `);

    const summary = {
      totalSkus: parseInt(countsRes.rows[0]?.total_skus || "0", 10),
      inStock: parseInt(countsRes.rows[0]?.in_stock || "0", 10),
      lowStock: parseInt(countsRes.rows[0]?.low_stock || "0", 10),
      outOfStock: parseInt(countsRes.rows[0]?.out_of_stock || "0", 10),
    };

    return NextResponse.json({
      success: true,
      products: res.rows.map((r) => ({
        ...r,
        stock: parseInt(r.stock, 10),
        price: parseFloat(r.price),
      })),
      summary,
    });
  } catch (error) {
    console.error("Error fetching stock inventory:", error);
    return NextResponse.json({ error: "Failed to fetch stock inventory" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { productId, newStock, adjustment } = body;

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    let updatedStock: number;

    if (adjustment !== undefined) {
      // Incremental change (e.g. +5 or -1)
      const res = await db.query(
        `UPDATE public.products 
         SET stock = GREATEST(0, stock + $1), updated_at = NOW() 
         WHERE id = $2 
         RETURNING stock`,
        [Number(adjustment), productId]
      );
      if (res.rowCount === 0) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      updatedStock = parseInt(res.rows[0].stock, 10);
    } else if (newStock !== undefined) {
      // Set exact stock
      const val = Math.max(0, parseInt(newStock, 10) || 0);
      const res = await db.query(
        `UPDATE public.products 
         SET stock = $1, updated_at = NOW() 
         WHERE id = $2 
         RETURNING stock`,
        [val, productId]
      );
      if (res.rowCount === 0) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      updatedStock = parseInt(res.rows[0].stock, 10);
    } else {
      return NextResponse.json({ error: "Provide newStock or adjustment" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      productId,
      stock: updatedStock,
    });
  } catch (error) {
    console.error("Error updating stock:", error);
    return NextResponse.json({ error: "Failed to update stock" }, { status: 500 });
  }
}
