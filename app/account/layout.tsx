"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, Package, MapPin, Heart, LogOut, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const navItems = [
    { href: "/account", label: "Overview", icon: User },
    { href: "/account/orders", label: "My Orders & Timeline", icon: Package },
    { href: "/account/addresses", label: "Saved Addresses", icon: MapPin },
    { href: "/wishlist", label: "Curated Wishlist", icon: Heart },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="bg-[#FAF7F2] border border-[#E8E2D9] p-6 space-y-2">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#C5A880] font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Atelier Circle Patron</span>
        </div>
        <h2 className="font-sans font-medium text-lg text-[#111111] uppercase tracking-wide">{user?.fullName || "Valued Patron"}</h2>
        <p className="text-xs text-[#8C7A6B]">{user?.email || "VIP Member"}</p>
      </div>

      {/* Navigation links */}
      <nav className="space-y-1 bg-[#FAF7F2] border border-[#E8E2D9] p-2 text-xs">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 uppercase tracking-wider font-medium transition-colors ${
                isActive
                  ? "bg-[#141414] text-[#F5F2EB]"
                  : "text-[#6E6A64] hover:bg-[#EFEBE4] hover:text-[#111111]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 uppercase tracking-wider font-medium text-[#8C7A6B] hover:text-[#8B0000] hover:bg-[#FDF2F2] transition-colors text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Conclude Session (Sign Out)</span>
        </button>
      </nav>
    </div>
  );
}

function AccountLayoutInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const isAuthPage = pathname.includes("/login") || pathname.includes("/register") || pathname.includes("/forgot");

  // Protect member pages: if not authenticated and not on login/register, redirect to login
  React.useEffect(() => {
    if (!isAuthPage && !isLoading && !user) {
      router.push(`/account/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthPage, isLoading, user, pathname, router]);

  return (
    <div className="flex flex-col min-h-screen bg-[#FBF9F5]">
      <Header />
      <main className="flex-1">
        {isAuthPage ? (
          children
        ) : isLoading ? (
          <div className="py-24 max-w-md mx-auto text-center space-y-3">
            <div className="w-8 h-8 mx-auto border-2 border-[#C5A880] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs uppercase tracking-widest text-[#8C7A6B]">
              Accessing Patron Sanctuary...
            </p>
          </div>
        ) : !user ? (
          <div className="py-24 max-w-md mx-auto text-center space-y-3">
            <p className="text-xs uppercase tracking-widest text-[#8C7A6B]">
              Redirecting to Member Sign In...
            </p>
          </div>
        ) : (
          <div className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              <aside className="lg:col-span-4">
                <AccountNav />
              </aside>
              <section className="lg:col-span-8">
                {children}
              </section>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <AccountLayoutInner>{children}</AccountLayoutInner>
    </Providers>
  );
}


