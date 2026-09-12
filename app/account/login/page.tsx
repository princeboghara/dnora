"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck, Sparkles, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    const result = await signIn(email, password);
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error || "Invalid email or password. Please verify your credentials.");
      return;
    }

    if (email.includes("admin")) {
      router.push("/admin");
    } else {
      router.push("/account");
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsGoogleLoading(true);
    const res = await signInWithGoogle();
    setIsGoogleLoading(false);
    if (!res.success) {
      setErrorMessage(res.error || "Unable to complete Google sign in. Please try again.");
    } else {
      router.push("/account");
    }
  };

  const handleQuickDemoCustomer = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    await signIn("devika.rathore@heritage.in", "secret");
    setIsSubmitting(false);
    router.push("/account");
  };

  const handleQuickDemoAdmin = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    await signIn("superadmin@dnora.luxury", "secret");
    setIsSubmitting(false);
    router.push("/admin");
  };

  return (
    <div className="py-16 sm:py-24 max-w-md mx-auto px-4 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold">
          Private Client Access
        </span>
        <h1 className="font-sans text-2xl sm:text-3xl text-[#111111] uppercase tracking-[0.12em] font-light">
          Member Sign In
        </h1>
        <p className="text-xs text-[#6E6A64]">
          Access your private acquisitions, saved addresses, and atelier privileges.
        </p>
      </div>

      <div className="bg-[#FAF7F2] border border-[#E8E2D9] p-8 space-y-6 shadow-sm">
        {/* Continue with Google Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || isSubmitting}
          className="w-full py-3 px-4 bg-[#FBF9F5] hover:bg-[#FFFFFF] border border-[#D5CDC0] hover:border-[#111111] text-[#111111] text-xs uppercase tracking-widest font-semibold transition-all flex items-center justify-center gap-3 shadow-xs"
        >
          {isGoogleLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#C5A880]" />
              <span>Connecting to Google...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
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
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-[#E8E2D9] w-full" />
          <span className="bg-[#FAF7F2] px-3 text-[10px] uppercase tracking-widest text-[#8C7A6B] whitespace-nowrap">
            or with email
          </span>
          <div className="border-t border-[#E8E2D9] w-full" />
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3 bg-[#FDF2F2] border border-[#F8B4B4] text-[#991B1B] text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patron@dnora.luxury"
                className="w-full p-3 bg-[#FBF9F5] border border-[#D5CDC0] focus:outline-none focus:border-[#111111]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">
                Password
              </label>
              <a href="#" className="text-[10px] text-[#8C7A6B] hover:underline">
                Forgot?
              </a>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full p-3 pr-10 bg-[#FBF9F5] border border-[#D5CDC0] focus:outline-none focus:border-[#111111]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7A6B] hover:text-[#111111]"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isGoogleLoading}
            className="w-full py-3.5 bg-[#141414] hover:bg-[#C5A880] hover:text-[#111111] text-[#F5F2EB] text-xs uppercase tracking-[0.25em] font-medium transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <span>Enter Atelier</span>
            )}
          </button>
        </form>

        {/* Quick Demo Access Helpers */}
        <div className="pt-4 border-t border-[#E8E2D9] space-y-2">
          <span className="text-[10px] uppercase tracking-widest text-[#8C7A6B] block text-center">
            One-Click Testing Accounts
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleQuickDemoCustomer}
              className="py-2.5 px-2 bg-[#FBF9F5] hover:bg-[#EAE4D9] border border-[#D5CDC0] text-[10px] uppercase tracking-wider text-[#111111] transition-colors"
            >
              VIP Patron Login
            </button>
            <button
              type="button"
              onClick={handleQuickDemoAdmin}
              className="py-2.5 px-2 bg-[#141414] text-[#C5A880] hover:bg-[#262626] border border-[#C5A880]/40 text-[10px] uppercase tracking-wider font-semibold transition-colors"
            >
              Super Admin Login
            </button>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-[#8C7A6B]">
        <span>New to the Atelier? </span>
        <Link href="/account/register" className="text-[#111111] font-semibold underline hover:text-[#C5A880]">
          Create an Account
        </Link>
      </div>
    </div>
  );
}

