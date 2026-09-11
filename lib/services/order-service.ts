import { Order, OrderStatus, PaymentStatus } from "@/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

const LOCAL_ORDERS_KEY = "dnora_atelier_orders";

export async function createOrder(order: Omit<Order, "id" | "order_number" | "created_at" | "updated_at">): Promise<Order> {
  const orderNumber = `DNR-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const now = new Date().toISOString();

  const newOrder: Order = {
    ...order,
    id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    order_number: orderNumber,
    created_at: now,
    updated_at: now,
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .insert({
          order_number: newOrder.order_number,
          customer_name: newOrder.customer_name,
          customer_email: newOrder.customer_email,
          customer_phone: newOrder.customer_phone,
          shipping_address: newOrder.shipping_address,
          status: newOrder.status,
          payment_status: newOrder.payment_status,
          payment_method: newOrder.payment_method,
          subtotal: newOrder.subtotal,
          discount: newOrder.discount,
          shipping_fee: newOrder.shipping_fee,
          tax: newOrder.tax,
          total: newOrder.total,
          coupon_code: newOrder.coupon_code,
        })
        .select()
        .single();

      if (!error && data) {
        newOrder.id = data.id;

        // Insert order items if any
        if (newOrder.items && newOrder.items.length > 0) {
          const itemsToInsert = newOrder.items.map((it) => ({
            order_id: data.id,
            product_id: it.product_id.startsWith("prod_") || it.product_id.length > 10 ? null : it.product_id,
            product_name: it.product_name,
            product_slug: it.product_slug,
            product_image: it.product_image,
            variant_title: it.variant_title || null,
            price: it.price,
            quantity: it.quantity,
          }));
          await supabase.from("order_items").insert(itemsToInsert);
        }
      }
    } catch {
      // Fallback to local storage
    }
  }

  // Always sync locally so customer and admin can immediately see it
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(LOCAL_ORDERS_KEY);
      const orders: Order[] = stored ? JSON.parse(stored) : [];
      orders.unshift(newOrder);
      localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
    } catch {
      // Ignore
    }
  }

  return newOrder;
}

export async function getOrders(): Promise<Order[]> {
  // 1. Query Supabase if configured
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          order_number: d.order_number,
          customer_name: d.customer_name,
          customer_email: d.customer_email,
          customer_phone: d.customer_phone,
          shipping_address: d.shipping_address,
          status: d.status,
          payment_status: d.payment_status,
          payment_method: d.payment_method,
          subtotal: Number(d.subtotal),
          discount: Number(d.discount || 0),
          shipping_fee: Number(d.shipping_fee || 0),
          tax: Number(d.tax || 0),
          total: Number(d.total),
          coupon_code: d.coupon_code,
          tracking_number: d.tracking_number,
          courier: d.courier,
          notes: d.notes,
          created_at: d.created_at,
          updated_at: d.updated_at,
          items: (d.order_items || []).map((item: any) => ({
            id: item.id,
            order_id: item.order_id,
            product_id: item.product_id || "",
            product_name: item.product_name,
            product_slug: item.product_slug,
            product_image: item.product_image,
            variant_title: item.variant_title,
            price: Number(item.price),
            quantity: item.quantity,
          })),
        }));
      }
    } catch {
      // Fallback
    }
  }

  // 2. Query localStorage
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(LOCAL_ORDERS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore
    }
  }

  // 3. Pristine 0 orders
  return [];
}

export async function getOrderById(idOrNumber: string): Promise<Order | null> {
  const orders = await getOrders();
  return orders.find((o) => o.id === idOrNumber || o.order_number === idOrNumber) || null;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase
        .from("orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", orderId);
    } catch {
      // Ignore
    }
  }

  if (typeof window !== "undefined") {
    try {
      const orders = await getOrders();
      const updated = orders.map((o) =>
        o.id === orderId ? { ...o, status, updated_at: new Date().toISOString() } : o
      );
      localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated));
      return true;
    } catch {
      return false;
    }
  }
  return true;
}
