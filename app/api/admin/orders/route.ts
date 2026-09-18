import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/data/store";
import { verifyAdminSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;
    const limit = parseInt(searchParams.get("limit") || "25", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const { orders, total } = await store.getOrders({
      status,
      search,
      limit,
      offset,
    });

    return NextResponse.json({ success: true, orders, total });
  } catch (err: unknown) {
    console.error("Error in admin orders GET:", err);
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Support creating a luxury dummy test order directly
    if (body.createTestOrder) {
      const testOrderNumber = `DN-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
      
      const testOrder = await store.createOrder(
        {
          order_number: testOrderNumber,
          customer_name: body.customer_name || "Eleanor Vance",
          customer_email: body.customer_email || "eleanor.vance@dnora.luxury",
          customer_phone: body.customer_phone || "+91 98250 14892",
          total_amount: 24500,
          status: "processing",
          payment_status: "paid",
          payment_method: "Credit Card (HDFC Infinitia)",
          shipping_address: {
            full_name: "Eleanor Vance",
            phone: "+91 98250 14892",
            address_line1: "The Imperial Towers, Penthouse 42B",
            address_line2: "Altamount Road, Cumballa Hill",
            city: "Mumbai",
            state: "Maharashtra",
            postal_code: "400026",
            country: "India",
          },
          notes: "Complimentary luxury gift wrapping with bespoke wax seal ribbon requested.",
        },
        [
          {
            product_name: "DNORA Signature Grand Tote — Noir Black",
            product_slug: "dnora-signature-grand-tote",
            price: 18900,
            quantity: 1,
            image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80",
            attributes: { color: "Noir Black", leather: "Full-Grain Italian Calfskin", monogram: "EV" },
          },
          {
            product_name: "Atelier Signature Silk Twilly & Charm",
            product_slug: "atelier-silk-twilly-charm",
            price: 5600,
            quantity: 1,
            image_url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80",
            attributes: { pattern: "Gold Baroque Floral", finish: "Hand-rolled edge" },
          },
        ]
      );

      return NextResponse.json({ success: true, order: testOrder });
    }

    // Manual/custom order creation
    const { order, items } = body;
    if (!order || !order.customer_email || !order.customer_name || !order.total_amount) {
      return NextResponse.json(
        { error: "Invalid order data. Missing required customer or total amount fields." },
        { status: 400 }
      );
    }

    const createdOrder = await store.createOrder(order, items || []);
    return NextResponse.json({ success: true, order: createdOrder });
  } catch (err: unknown) {
    console.error("Error creating order:", err);
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
