"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Lock, Mail, ArrowRight, Loader2, ExternalLink } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";

export default function AdminLoginPage() {
  const router = useRouter();
  const { adminSignIn, isAdmin } = useAuth();

  const [email, setEmail] = useState("admin@dnora.luxury");
  const [password, setPassword] = useState("C+ZS7@23hUidBfH");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      router.push("/admin");
    }
  }, [isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await adminSignIn(email, password);
    setIsSubmitting(false);

    if (res.success) {
      router.push("/admin");
    } else {
      setErrorMsg(res.error || "Authentication failed. Please verify credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-[#EDEDED] flex flex-col justify-center items-center p-4 selection:bg-[#C5A880] selection:text-[#0a0c10] relative overflow-hidden font-sans">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(197,168,128,0.06),transparent_70%)] pointer-events-none" />

      {/* Neumorphic Matte Black Card */}
      <div className="w-full max-w-md neu-raised rounded-3xl p-8 sm:p-10 relative z-10 space-y-7 border border-white/[0.04]">
        {/* Brand & Security Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl neu-inset p-3 flex items-center justify-center border border-white/[0.03]">
            <Image
              src="/images/logo/dnora-d-icon.png"
              alt="D'NORA"
              width={44}
              height={44}
              className="w-full h-full object-contain"
            />
          </div>

          <div className="pt-1">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold font-mono">
              Restricted Terminal
            </span>
            <h1 className="font-sans text-2xl sm:text-3xl text-[#F5F7FA] tracking-[0.16em] uppercase font-medium mt-1">
              D&apos;NORA CONTROL
            </h1>
          </div>

          <p className="text-xs text-[#8A95A5] font-light max-w-xs mx-auto">
            Authorized personnel only. Direct access point for catalog curation, inventory, orders, and CMS.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center rounded-xl neu-inset-sm">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-[#8A95A5] font-semibold flex items-center gap-1.5 font-mono">
              <Mail className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Executive Email</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@dnora.luxury"
              className="w-full p-3.5 rounded-xl neu-inset text-[#F5F7FA] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50 transition-all font-sans"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-[#8A95A5] font-semibold flex items-center gap-1.5 font-mono">
              <Lock className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Security Passkey</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full p-3.5 rounded-xl neu-inset text-[#F5F7FA] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50 transition-all font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl neu-btn-gold font-bold uppercase tracking-[0.25em] text-xs transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Authenticate &amp; Enter</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Credentials Info */}
        <div className="pt-4 border-t border-white/[0.04] text-center space-y-3">
          <p className="text-[11px] text-[#6E7B8E] font-mono">
            Preset executive credentials prefilled for instant entry.
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl neu-btn text-xs text-[#8A95A5] hover:text-[#C5A880] uppercase tracking-wider transition-colors"
          >
            <span>Return to Public Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
