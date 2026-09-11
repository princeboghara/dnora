"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await signIn(email, password);
    setIsSubmitting(false);
    if (email.includes("admin")) {
      router.push("/admin");
    } else {
      router.push("/account");
    }
  };

  const handleQuickDemoCustomer = async () => {
    setIsSubmitting(true);
    await signIn("devika.rathore@heritage.in", "secret");
    setIsSubmitting(false);
    router.push("/account");
  };

  const handleQuickDemoAdmin = async () => {
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
        <h1 className="font-serif text-3xl sm:text-4xl text-[#111111] uppercase tracking-wide font-light">
          Sign In
        </h1>
        <p className="text-xs text-[#6E6A64]">
          Access your private acquisitions, saved addresses, and atelier privileges.
        </p>
      </div>

      <div className="bg-[#FAF7F2] border border-[#E8E2D9] p-8 space-y-6 shadow-sm">
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="patron@dnora.luxury"
              className="w-full p-3 bg-[#FBF9F5] border border-[#D5CDC0] focus:outline-none focus:border-[#111111]"
            />
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
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full p-3 bg-[#FBF9F5] border border-[#D5CDC0] focus:outline-none focus:border-[#111111]"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-[#141414] hover:bg-[#C5A880] hover:text-[#111111] text-[#F5F2EB] text-xs uppercase tracking-[0.25em] font-medium transition-all"
          >
            Enter Atelier
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
