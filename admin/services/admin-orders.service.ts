import { db } from "@/lib/db";
import { Order } from "@/types";

export class AdminOrdersService {
  /**
   * Retrieves orders for the admin management table with pagination and filters.
   */
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

      const countRes = await db.query(`SELECT COUNT(*) FROM public.orders o ${whereClause}`, values);
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
      return { orders: res.rows as Order[], total };
    } catch (err) {
      console.error("Error retrieving admin orders:", err);
      return { orders: [], total: 0 };
    }
  }

  /**
   * Retrieves a single order with items by its UUID ID.
   */
  async getOrderById(id: string): Promise<Order | null> {
    try {
      const query = `
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
        WHERE o.id = $1
        GROUP BY o.id
        LIMIT 1
      `;
      const res = await db.query(query, [id]);
      return (res.rows[0] as Order) || null;
    } catch (err) {
      console.error(`Error retrieving order by ID (${id}):`, err);
      return null;
    }
  }

  /**
   * Updates fulfillment details, carrier, tracking number, or statuses.
   */
  async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    Object.entries(updates).forEach(([key, val]) => {
      if (key !== "id" && key !== "items" && key !== "created_at" && val !== undefined) {
        fields.push(`${key} = $${idx++}`);
        values.push(typeof val === "object" && val !== null ? JSON.stringify(val) : val);
      }
    });

    if (fields.length === 0) {
      const existing = await this.getOrderById(id);
      if (!existing) throw new Error("Order not found");
      return existing;
    }

    fields.push("updated_at = NOW()");
    values.push(id);

    const query = `
      UPDATE public.orders
      SET ${fields.join(", ")}
      WHERE id = $${idx}
      RETURNING *
    `;

    const res = await db.query(query, values);
    const updatedOrder = res.rows[0];
    const itemsRes = await db.query("SELECT * FROM public.order_items WHERE order_id = $1", [id]);
    updatedOrder.items = itemsRes.rows;
    return updatedOrder as Order;
  }

  /**
   * Permanently deletes an order and associated items.
   */
  async deleteOrder(id: string): Promise<boolean> {
    try {
      await db.query("DELETE FROM public.order_items WHERE order_id = $1", [id]);
      const res = await db.query("DELETE FROM public.orders WHERE id = $1", [id]);
      return (res.rowCount ?? 0) > 0;
    } catch (err) {
      console.error(`Error deleting order (${id}):`, err);
      return false;
    }
  }
}

export const adminOrdersService = new AdminOrdersService();
