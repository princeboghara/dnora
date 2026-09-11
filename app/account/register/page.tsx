"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await signUp(email, password, fullName);
    setIsSubmitting(false);
    router.push("/account");
  };

  return (
    <div className="py-16 sm:py-24 max-w-md mx-auto px-4 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold">
          Debut Circle Invitation
        </span>
        <h1 className="font-sans text-2xl sm:text-3xl text-[#111111] uppercase tracking-[0.12em] font-light">
          Create Account
        </h1>
        <p className="text-xs text-[#6E6A64]">
          Join the D&apos;NORA circle to receive private preview invitations and debut acquisition privileges.
        </p>
      </div>

      <div className="bg-[#FAF7F2] border border-[#E8E2D9] p-8 space-y-6 shadow-sm">
        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Gayatri Devi"
              className="w-full p-3 bg-[#FBF9F5] border border-[#D5CDC0] focus:outline-none focus:border-[#111111]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="patron@domain.com"
              className="w-full p-3 bg-[#FBF9F5] border border-[#D5CDC0] focus:outline-none focus:border-[#111111]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">
              Create Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full p-3 bg-[#FBF9F5] border border-[#D5CDC0] focus:outline-none focus:border-[#111111]"
            />
          </div>

          <div className="p-3 bg-[#EAF2ED] border border-[#C2D8CA] text-[11px] text-[#245744]">
            <p className="font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Debut Privilege Included
            </p>
            <p>Use code <strong>WELCOME10</strong> upon checkout for 10% off your initial order.</p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-[#141414] hover:bg-[#C5A880] hover:text-[#111111] text-[#F5F2EB] text-xs uppercase tracking-[0.25em] font-medium transition-all"
          >
            Create Atelier Account
          </button>
        </form>
      </div>

      <div className="text-center text-xs text-[#8C7A6B]">
        <span>Already hold an account? </span>
        <Link href="/account/login" className="text-[#111111] font-semibold underline hover:text-[#C5A880]">
          Sign In
        </Link>
      </div>
    </div>
  );
}
