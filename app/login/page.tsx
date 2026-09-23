"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || searchParams.get("next") || "/account";
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(urlError || null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please provide both your email address and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          redirectTo,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid email or password.");
        return;
      }

      // Successful login
      router.push(data.redirectTo || redirectTo);
      router.refresh();
    } catch {
      setError("Network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    window.location.href = `/api/auth/google?next=${encodeURIComponent(redirectTo)}`;
  };

  return (
    <div className="w-full max-w-md bg-white border border-neutral-200/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-10">
      {/* Brand Header */}
      <div className="text-center space-y-2 mb-8">
        <Link href="/" className="inline-block transition-transform hover:scale-[1.02]">
          <div className="relative h-9 w-44 sm:h-10 sm:w-48 mx-auto">
            <Image
              src="/images/logo.png"
              alt="DNORA"
              fill
              sizes="200px"
              className="object-contain"
              priority
            />
          </div>
        </Link>
        <h1 className="text-xl sm:text-2xl font-serif tracking-tight text-neutral-900 pt-2">
          Client Identification
        </h1>
        <p className="text-xs text-neutral-500 font-sans tracking-wide">
          Access your private atelier, orders history, and concierge.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200/80 text-red-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {/* Google Sign In */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleLoading || loading}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-neutral-50 active:bg-neutral-100 border border-neutral-300 rounded-xl text-xs font-semibold uppercase tracking-wider text-neutral-800 shadow-2xs transition-all duration-200 cursor-pointer disabled:opacity-60"
      >
        {googleLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-neutral-600" />
        ) : (
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
        )}
        <span>Continue with Google</span>
      </button>

      {/* Divider */}
      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200" />
        </div>
        <span className="relative bg-white px-3 text-[10.5px] uppercase font-bold tracking-[0.2em] text-neutral-400">
          Or with email
        </span>
      </div>

      {/* Email + Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-[10.5px] font-bold tracking-[0.16em] uppercase text-neutral-700 mb-1.5"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="client@dnora.luxury"
            className="w-full px-3.5 py-2.5 bg-neutral-50/70 border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-black/10 focus:border-neutral-900 transition-all"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="password"
              className="block text-[10.5px] font-bold tracking-[0.16em] uppercase text-neutral-700"
            >
              Password
            </label>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 pr-10 bg-neutral-50/70 border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-black/10 focus:border-neutral-900 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer p-0.5"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full mt-2 py-3 px-4 bg-neutral-950 hover:bg-neutral-800 active:bg-black text-white rounded-xl text-xs font-bold uppercase tracking-[0.18em] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Footer navigation */}
      <div className="mt-8 pt-6 border-t border-neutral-100 text-center space-y-3">
        <p className="text-xs text-neutral-600">
          New to DNORA?{" "}
          <Link
            href={`/register?redirect=${encodeURIComponent(redirectTo)}`}
            className="font-bold text-neutral-900 hover:underline tracking-tight"
          >
            Create an account
          </Link>
        </p>

        <div className="flex items-center justify-center gap-1.5 text-[10.5px] text-neutral-400 uppercase tracking-widest font-semibold pt-2">
          <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
          <span>Secure Encrypted Client Access</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-neutral-50/50">
      <Suspense
        fallback={
          <div className="w-full max-w-md bg-white border border-neutral-200 rounded-2xl p-10 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
