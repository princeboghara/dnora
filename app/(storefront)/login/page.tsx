"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Lock, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/account";
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const queryError = searchParams.get("error");
  const [error, setError] = useState<string | null>(queryError || null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid credentials.");
      }

      showToast("Welcome back to DNORA", "success");
      const target = data.redirectTo || redirectPath;
      router.push(target);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-[#FAF9F6]">
      <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-sm border border-[#E8E5DE] shadow-sm">
        {/* Header */}
        <div className="text-center">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#C5A880] font-semibold block mb-2">
            Client Portal
          </span>
          <h1 className="text-3xl font-heading font-extrabold text-[#0E0E0E] tracking-tight">
            Sign In to DNORA
          </h1>
          <p className="mt-2 text-xs text-[#73706A]">
            Access your curated orders, saved addresses, and VIP concierge.
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3 bg-[#FCF0F0] border border-[#F5C2C2] text-xs text-[#C53030] rounded-sm flex items-center">
            <span>{error}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        <div>
          <a
            href="/api/auth/google"
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[#E8E5DE] rounded-sm text-xs font-semibold uppercase tracking-widest text-[#0E0E0E] hover:bg-[#F5F3EF] transition-all bg-white shadow-xs"
          >
            {/* Google SVG Icon */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </a>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-[#E8E5DE] w-full" />
          <span className="bg-white px-3 text-[10px] uppercase tracking-widest text-[#73706A] shrink-0">
            or sign in with email
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-[11px] uppercase tracking-widest font-semibold text-[#0E0E0E] mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#73706A]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="eleanor.vance@example.com"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#D5D2CA] rounded-sm text-sm text-[#0E0E0E] placeholder-[#73706A] focus:outline-none focus:border-[#0E0E0E] focus:ring-1 focus:ring-[#0E0E0E] transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="block text-[11px] uppercase tracking-widest font-semibold text-[#0E0E0E]"
              >
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#73706A]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#D5D2CA] rounded-sm text-sm text-[#0E0E0E] placeholder-[#73706A] focus:outline-none focus:border-[#0E0E0E] focus:ring-1 focus:ring-[#0E0E0E] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-[#0E0E0E] text-[#FAF9F6] text-xs font-semibold uppercase tracking-[0.2em] rounded-sm hover:bg-[#262626] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block animate-pulse">Authenticating...</span>
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Register prompt */}
        <div className="text-center pt-2">
          <p className="text-xs text-[#73706A]">
            Don&apos;t have an account?{" "}
            <Link
              href={`/register${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`}
              className="font-semibold text-[#0E0E0E] underline hover:text-[#C5A880] transition-colors"
            >
              Create an account
            </Link>
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] text-[#73706A]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />
          <span>256-bit encrypted secure session</span>
        </div>
      </div>
    </div>
  );
}
