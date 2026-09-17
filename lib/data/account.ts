import { db } from "@/lib/db";
import { UserAddress, Order, OrderItem } from "@/types";

const isValidUUID = (str?: string | null): boolean =>
  Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

// USER ORDERS
export async function getUserOrders(userId: string, email?: string): Promise<Order[]> {
  try {
    const hasValidUuid = isValidUUID(userId);
    let query = "";
    let params: any[] = [];

    if (hasValidUuid && email) {
      query = `SELECT * FROM public.orders WHERE user_id = $1 OR customer_email = $2 ORDER BY created_at DESC`;
      params = [userId, email];
    } else if (hasValidUuid) {
      query = `SELECT * FROM public.orders WHERE user_id = $1 ORDER BY created_at DESC`;
      params = [userId];
    } else if (email) {
      query = `SELECT * FROM public.orders WHERE customer_email = $1 ORDER BY created_at DESC`;
      params = [email];
    } else {
      return [];
    }

    const res = await db.query(query, params);

    const orders: Order[] = [];
    for (const row of res.rows) {
      const itemsRes = await db.query(
        `SELECT * FROM public.order_items WHERE order_id = $1 ORDER BY created_at ASC`,
        [row.id]
      );
      orders.push({
        ...row,
        total_amount: Number(row.total_amount),
        items: itemsRes.rows.map((it: any) => ({
          ...it,
          price: Number(it.price),
        })),
      });
    }
    return orders;
  } catch (err) {
    console.error("Error fetching user orders from DB:", err);
    return [];
  }
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const hasValidUuid = isValidUUID(orderId);
    const res = await db.query(
      `SELECT * FROM public.orders WHERE ${hasValidUuid ? "id = $1 OR " : ""}order_number = $1 LIMIT 1`,
      [orderId]
    );
    if (res.rows.length > 0) {
      const order = res.rows[0];
      const itemsRes = await db.query(
        `SELECT * FROM public.order_items WHERE order_id = $1 ORDER BY created_at ASC`,
        [order.id]
      );
      return {
        ...order,
        total_amount: Number(order.total_amount),
        items: itemsRes.rows.map((it: any) => ({
          ...it,
          price: Number(it.price),
        })),
      };
    }
  } catch (err) {
    console.error("Error fetching order by ID from DB:", err);
  }

  return null;
}

// USER ADDRESSES
export async function getUserAddresses(userId: string): Promise<UserAddress[]> {
  try {
    if (!isValidUUID(userId)) return [];

    const res = await db.query(
      `SELECT * FROM public.user_addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC`,
      [userId]
    );
    return res.rows;
  } catch (err) {
    console.error("Error fetching addresses from DB:", err);
    return [];
  }
}

export async function createUserAddress(
  userId: string,
  data: Omit<UserAddress, "id" | "user_id" | "created_at">
): Promise<UserAddress> {
  const validUserId = isValidUUID(userId) ? userId : null;

  if (validUserId && data.is_default) {
    await db.query(
      `UPDATE public.user_addresses SET is_default = false WHERE user_id = $1`,
      [validUserId]
    );
  }

  const res = await db.query(
    `INSERT INTO public.user_addresses 
      (user_id, full_name, phone, address_line1, address_line2, city, state, postal_code, country, is_default)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      validUserId,
      data.full_name,
      data.phone,
      data.address_line1,
      data.address_line2 || null,
      data.city,
      data.state,
      data.postal_code,
      data.country || "India",
      Boolean(data.is_default),
    ]
  );

  return res.rows[0];
}

export async function deleteUserAddress(
  addressId: string,
  userId: string
): Promise<boolean> {
  try {
    if (!isValidUUID(addressId)) return false;
    const hasValidUserUuid = isValidUUID(userId);

    const res = await db.query(
      `DELETE FROM public.user_addresses WHERE id = $1 ${hasValidUserUuid ? "AND user_id = $2" : ""}`,
      hasValidUserUuid ? [addressId, userId] : [addressId]
    );
    return (res.rowCount ?? 0) > 0;
  } catch (err) {
    console.error("Error deleting address from DB:", err);
    return false;
  }
}

export async function setDefaultAddress(
  addressId: string,
  userId: string
): Promise<boolean> {
  try {
    if (!isValidUUID(addressId)) return false;
    const hasValidUserUuid = isValidUUID(userId);

    if (hasValidUserUuid) {
      await db.query(
        `UPDATE public.user_addresses SET is_default = false WHERE user_id = $1`,
        [userId]
      );
    }
    await db.query(
      `UPDATE public.user_addresses SET is_default = true WHERE id = $1`,
      [addressId]
    );
    return true;
  } catch (err) {
    console.error("Error setting default address in DB:", err);
    return false;
  }
}
