import React from "react";
import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/auth/user-session";
import { getUserOrders, getUserAddresses } from "@/lib/data/account";
import { AccountClient } from "@/components/account/AccountClient";

export const metadata = {
  title: "Client Portal & Orders | DNORA Luxury Lifestyle",
  description: "Track your bespoke DNORA orders, delivery timelines, and manage saved addresses.",
};

export default async function AccountPage() {
  const session = await getUserSession();

  if (!session) {
    redirect("/login?redirect=/account");
  }

  const [orders, addresses] = await Promise.all([
    getUserOrders(session.id, session.email),
    getUserAddresses(session.id),
  ]);

  return (
    <AccountClient
      user={session}
      initialOrders={orders}
      initialAddresses={addresses}
    />
  );
}
