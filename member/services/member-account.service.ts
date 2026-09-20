import { db } from "@/lib/db";
import { Order, UserAddress } from "@/types";

export class MemberAccountService {
  /**
   * Retrieves orders belonging to a member by their user UUID and email.
   */
  async getUserOrders(userId: string, userEmail?: string): Promise<Order[]> {
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

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
        WHERE (${isUUID ? "o.user_id = $1" : "FALSE"} ${userEmail ? "OR LOWER(o.customer_email) = LOWER($2)" : ""})
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `;

      const params = isUUID ? [userId] : ["00000000-0000-0000-0000-000000000000"];
      if (userEmail) params.push(userEmail);

      const res = await db.query(query, params);
      return res.rows as Order[];
    } catch (err) {
      console.error("Error retrieving user orders:", err);
      return [];
    }
  }

  /**
   * Retrieves member saved delivery addresses.
   */
  async getUserAddresses(userId: string): Promise<UserAddress[]> {
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
      if (!isUUID) return [];

      const query = "SELECT * FROM public.user_addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC";
      const res = await db.query(query, [userId]);
      return res.rows as UserAddress[];
    } catch (err) {
      console.error("Error retrieving user addresses:", err);
      return [];
    }
  }

  /**
   * Adds a new address to member account.
   */
  async createUserAddress(
    userId: string,
    data: Omit<UserAddress, "id" | "user_id" | "created_at">
  ): Promise<UserAddress> {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    if (!isUUID) throw new Error("Invalid user ID");

    if (data.is_default) {
      await db.query("UPDATE public.user_addresses SET is_default = false WHERE user_id = $1", [userId]);
    }

    const query = `
      INSERT INTO public.user_addresses (
        user_id, full_name, phone, address_line1, address_line2, 
        city, state, postal_code, country, is_default
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      userId,
      data.full_name,
      data.phone,
      data.address_line1,
      data.address_line2 || null,
      data.city,
      data.state,
      data.postal_code,
      data.country || "India",
      data.is_default || false,
    ];

    const res = await db.query(query, values);
    return res.rows[0] as UserAddress;
  }

  /**
   * Deletes a saved address.
   */
  async deleteUserAddress(addressId: string, userId: string): Promise<boolean> {
    try {
      const res = await db.query("DELETE FROM public.user_addresses WHERE id = $1 AND user_id = $2", [addressId, userId]);
      return (res.rowCount ?? 0) > 0;
    } catch (err) {
      console.error("Error deleting user address:", err);
      return false;
    }
  }
}

export const memberAccountService = new MemberAccountService();
