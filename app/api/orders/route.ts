import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/data/store";
import { getUserSession } from "@/lib/auth/user-session";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { formData, items, subtotal } = body;

    if (!formData || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Invalid order payload. Missing customer information or items." },
        { status: 400 }
      );
    }

    // Check if user is logged in
    const session = await getUserSession();

    const orderNumber = `DN-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const orderData = {
      order_number: orderNumber,
      user_id: session?.id || null,
      customer_name: `${formData.firstName || ""} ${formData.lastName || ""}`.trim() || "Guest Customer",
      customer_email: formData.email,
      customer_phone: formData.phone || null,
      total_amount: Number(subtotal || 0),
      status: "processing" as const,
      payment_status: formData.paymentMethod === "cod" ? ("pending" as const) : ("paid" as const),
      payment_method: formData.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment / Card",
      shipping_address: {
        full_name: `${formData.firstName || ""} ${formData.lastName || ""}`.trim(),
        phone: formData.phone || "",
        address_line1: formData.address || "",
        city: formData.city || "",
        state: formData.state || "Gujarat",
        postal_code: formData.postalCode || "",
        country: "India",
      },
      notes: formData.specialInstructions || (formData.giftWrap ? "Complimentary luxury gift wrapping requested." : null),
    };

    const orderItems = items.map((it: {
      product: { id?: string; name: string; slug?: string; price: number; images?: { secure_url?: string }[] };
      quantity: number;
      selectedVariant?: { name?: string; color_hex?: string };
    }) => ({
      product_id: it.product?.id || null,
      product_name: it.product?.name || "DNORA Luxury Handbag",
      product_slug: it.product?.slug || null,
      price: Number(it.product?.price || 0),
      quantity: Number(it.quantity || 1),
      image_url: it.product?.images?.[0]?.secure_url || null,
      attributes: it.selectedVariant ? { variant: it.selectedVariant.name } : undefined,
    }));

    const createdOrder = await store.createOrder(orderData, orderItems);

    return NextResponse.json({
      success: true,
      order: createdOrder,
      orderNumber: createdOrder.order_number,
    });
  } catch (err: unknown) {
    console.error("Error creating storefront order:", err);
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
