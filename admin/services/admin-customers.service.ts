import { db } from "@/lib/db";
import { AdminCustomer } from "@/types";

export class AdminCustomersService {
  /**
   * Retrieves registered customers with aggregate order counts and total spent.
   */
  async getCustomers(): Promise<AdminCustomer[]> {
    try {
      const query = `
        SELECT 
          u.id,
          u.email,
          u.full_name,
          u.phone,
          u.role,
          u.created_at,
          u.updated_at,
          COUNT(o.id)::int as total_orders,
          COALESCE(SUM(o.total_amount), 0)::numeric as total_spent,
          (
            SELECT json_build_object(
              'id', ua.id,
              'address_line1', ua.address_line1,
              'address_line2', ua.address_line2,
              'city', ua.city,
              'state', ua.state,
              'postal_code', ua.postal_code,
              'country', ua.country,
              'is_default', ua.is_default
            )
            FROM public.user_addresses ua
            WHERE ua.user_id = u.id
            ORDER BY ua.is_default DESC, ua.created_at DESC
            LIMIT 1
          ) as primary_address
        FROM public.users u
        LEFT JOIN public.orders o ON u.id = o.user_id
        GROUP BY u.id
        ORDER BY u.created_at DESC
      `;
      const res = await db.query(query);
      return res.rows.map((row) => ({
        ...row,
        total_spent: parseFloat(row.total_spent) || 0,
      })) as AdminCustomer[];
    } catch (err) {
      console.error("Error retrieving admin customers:", err);
      return [];
    }
  }

  /**
   * Retrieves customer details with all saved addresses and past orders.
   */
  async getCustomerById(id: string): Promise<AdminCustomer | null> {
    try {
      const customers = await this.getCustomers();
      const customer = customers.find((c) => c.id === id);
      if (!customer) return null;

      const addrRes = await db.query(
        "SELECT * FROM public.user_addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC",
        [id]
      );
      customer.addresses = addrRes.rows;
      return customer;
    } catch (err) {
      console.error(`Error retrieving customer by ID (${id}):`, err);
      return null;
    }
  }
}

export const adminCustomersService = new AdminCustomersService();
