"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { BrandLogo } from "@/components/ui/BrandLogo";

export default function AdminLoginPage() {
  const router = useRouter();
  const { error, success } = useToast();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Authentication failed");
      }

      success("Authenticated successfully. Welcome to DNORA Executive Suite.");
      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Incorrect admin password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0E0E] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Subtle Luxury Glow */}
      <div className="absolute w-[500px] h-[500px] bg-[#C5A880]/10 rounded-full blur-3xl pointer-events-none -top-40 -right-40" />

      <div className="max-w-md w-full space-y-8 bg-[#161514] p-8 sm:p-10 rounded-xl border border-[#2A2926] shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <BrandLogo priority size="lg" />
          </div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#C5A880] font-semibold">
            Administrative Access
          </span>
          <p className="text-xs text-[#8C8983] mt-2">
            Enter the master administrative key to access the catalog &amp; media suite.
          </p>
        </div>

        {/* Login Form (Password only) */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#FAF9F6] mb-2">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#73706A] absolute left-3 top-3.5" />
              <input
                type="password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0E0E0E] border border-[#3A3835] pl-10 pr-4 py-3 text-sm text-white rounded-md focus:outline-none focus:border-[#C5A880] transition-colors placeholder:text-[#5A5854]"
                placeholder="Enter password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[#FAF9F6] hover:bg-[#C5A880] text-[#0E0E0E] text-xs font-bold uppercase tracking-[0.2em] rounded-md transition-all shadow-md disabled:opacity-50"
          >
            <span>{loading ? "Verifying..." : "Enter Admin Suite"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <Link
            href="/"
            className="text-xs text-[#73706A] hover:text-white transition-colors"
          >
            &larr; Return to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
