import { NextRequest, NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth/user-session";
import { createNewOrder } from "@/lib/data/orders";
import { createUserAddress } from "@/lib/data/account";

export async function POST(req: NextRequest) {
  try {
    const session = await getUserSession();
    const body = await req.json();

    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items,
      paymentMethod,
      shippingCost,
      notes,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty. Please add items to place an order." },
        { status: 400 }
      );
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.postalCode) {
      return NextResponse.json(
        { error: "Please provide a complete shipping address." },
        { status: 400 }
      );
    }

    const email = (session?.email || customerEmail || shippingAddress.email || "").toLowerCase().trim();
    if (!email) {
      return NextResponse.json(
        { error: "A valid email address is required to receive order confirmation." },
        { status: 400 }
      );
    }

    const order = await createNewOrder({
      userId: session?.id || null,
      customerName: customerName || session?.full_name || shippingAddress.fullName,
      customerEmail: email,
      customerPhone: customerPhone || session?.phone || shippingAddress.phone,
      shippingAddress: {
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        addressLine1: shippingAddress.addressLine1,
        addressLine2: shippingAddress.addressLine2 || "",
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country || "India",
      },
      items: items.map((it: any) => ({
        productId: it.product?.id || it.productId,
        productName: it.product?.name || it.productName,
        productSlug: it.product?.slug || it.productSlug,
        price: Number(it.product?.price ?? it.price ?? 0),
        quantity: Number(it.quantity || 1),
        imageUrl: it.product?.images?.[0]?.secure_url || it.imageUrl || "",
        selectedColor: it.selectedColor || it.selectedVariant?.name || it.color,
        attributes: it.attributes,
      })),
      paymentMethod: paymentMethod || "card",
      paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
      shippingCost: shippingCost || 0,
      notes: notes || undefined,
    });

    // Automatically persist address to user profile for future checkouts
    if (session?.id) {
      try {
        await createUserAddress(session.id, {
          full_name: shippingAddress.fullName,
          phone: shippingAddress.phone,
          address_line1: shippingAddress.addressLine1,
          address_line2: shippingAddress.addressLine2 || null,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postal_code: shippingAddress.postalCode,
          country: shippingAddress.country || "India",
          is_default: true,
        });
      } catch {
        // Address save non-blocking
      }
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Order creation API error:", error);
    return NextResponse.json(
      { error: "Failed to place your order. Please try again." },
      { status: 500 }
    );
  }
}
