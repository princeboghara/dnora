import { NextRequest, NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth/user-session";
import { deleteUserAddress, setDefaultAddress } from "@/lib/data/account";

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const session = await getUserSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const success = await deleteUserAddress(params.id, session.id);
  return NextResponse.json({ success });
}

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const session = await getUserSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const success = await setDefaultAddress(params.id, session.id);
  return NextResponse.json({ success });
}
