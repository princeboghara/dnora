"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Lock,
  Mail,
  Phone,
  User,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  RotateCcw,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/account";
  const { showToast, success: toastSuccess } = useToast();

  // Step 1: Form inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Step 2: OTP verification
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(60);
  const [devHint, setDevHint] = useState<string | null>(null);

  const canResend = step === "otp" && resendCooldown <= 0;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Timer for resending OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "otp" && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendCooldown]);

  // Step 1: Request OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setDevHint(null);

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to initiate registration.");
      }

      toastSuccess("Verification code sent to your email.");
      if (data.devHint) {
        setDevHint(data.devHint);
      }
      setStep("otp");
      setResendCooldown(60);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to process registration.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and finalize registration
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid verification code.");
      }

      showToast("Account verified successfully! Welcome to DNORA.", "success");
      router.push(data.redirectTo || redirectPath);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Verification failed. Please check the code.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (!canResend || loading) return;
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to resend code.");
      }

      toastSuccess("New verification code dispatched.");
      if (data.devHint) {
        setDevHint(data.devHint);
      }
      setResendCooldown(60);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not resend verification code.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-[#FAF9F6]">
      <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-sm border border-[#E8E5DE] shadow-sm">
        {/* Header */}
        <div className="text-center">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#0E0E0E] font-semibold block mb-2">
            DNORA Atelier
          </span>
          <h1 className="text-3xl font-heading font-extrabold text-[#0E0E0E] tracking-tight">
            {step === "form" ? "Create an Account" : "Verify Your Email"}
          </h1>
          <p className="mt-2 text-xs text-[#73706A]">
            {step === "form"
              ? "Join our exclusive client registry for personalized concierge and order tracking."
              : `We sent a 6-digit one-time verification code to ${email}`}
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3 bg-[#FCF0F0] border border-[#F5C2C2] text-xs text-[#C53030] rounded-sm flex items-start gap-2">
            <span className="font-semibold block">{error}</span>
          </div>
        )}

        {/* Dev Mode OTP Display (if SMTP not configured yet) */}
        {devHint && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-xs text-amber-900 rounded-sm">
            <span className="font-bold block mb-0.5">Development Testing Mode:</span>
            {devHint}
          </div>
        )}

        {/* STEP 1: Details & Credentials Form */}
        {step === "form" && (
          <div className="space-y-6">
            {/* Google OAuth Button */}
            <div>
              <a
                href="/api/auth/google"
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[#E8E5DE] rounded-sm text-xs font-semibold uppercase tracking-widest text-[#0E0E0E] hover:bg-[#F5F3EF] transition-all bg-white shadow-xs"
              >
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
                Sign up with Google
              </a>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-[#E8E5DE] w-full" />
              <span className="bg-white px-3 text-[10px] uppercase tracking-widest text-[#73706A] shrink-0">
                or register with email
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-[11px] uppercase tracking-widest font-semibold text-[#0E0E0E] mb-1.5"
                >
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#73706A]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Eleanor Vance"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#D5D2CA] rounded-sm text-sm text-[#0E0E0E] placeholder-[#73706A] focus:outline-none focus:border-[#0E0E0E] focus:ring-1 focus:ring-[#0E0E0E] transition-all"
                  />
                </div>
              </div>

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
                <label
                  htmlFor="phone"
                  className="block text-[11px] uppercase tracking-widest font-semibold text-[#0E0E0E] mb-1.5"
                >
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#73706A]">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#D5D2CA] rounded-sm text-sm text-[#0E0E0E] placeholder-[#73706A] focus:outline-none focus:border-[#0E0E0E] focus:ring-1 focus:ring-[#0E0E0E] transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-[11px] uppercase tracking-widest font-semibold text-[#0E0E0E] mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#73706A]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
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
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Sending Verification Code...
                  </span>
                ) : (
                  <>
                    Continue to Email Verification
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: OTP Verification Screen */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="p-4 bg-[#F5F3EF] border border-[#E8E5DE] rounded-sm text-center">
              <KeyRound className="w-6 h-6 text-[#0E0E0E] mx-auto mb-2" />
              <div className="text-xs text-[#73706A] mb-1">Enter the 6-digit code sent to</div>
              <strong className="text-xs text-[#0E0E0E] break-all">{email}</strong>
            </div>

            <div>
              <label
                htmlFor="otp"
                className="block text-center text-[11px] uppercase tracking-widest font-semibold text-[#0E0E0E] mb-2"
              >
                Verification Code
              </label>
              <input
                id="otp"
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                autoFocus
                className="w-full text-center tracking-[0.4em] font-mono text-2xl font-bold py-3 bg-white border-2 border-[#D5D2CA] focus:border-[#0E0E0E] rounded-sm focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3 bg-[#0E0E0E] text-[#FAF9F6] text-xs font-semibold uppercase tracking-[0.2em] rounded-sm hover:bg-[#262626] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Verifying Code...
                </span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#0E0E0E]" />
                  Verify & Create Account
                </>
              )}
            </button>

            {/* Resend OTP & Back Options */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setStep("form");
                  setError(null);
                  setOtp("");
                }}
                className="inline-flex items-center gap-1.5 text-[#73706A] hover:text-[#0E0E0E] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Change Email / Back
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={!canResend || loading}
                className="inline-flex items-center gap-1.5 text-[#0E0E0E] hover:text-[#73706A] font-semibold disabled:text-[#A8A59E] disabled:cursor-not-allowed transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {canResend ? "Resend Code" : `Resend in ${resendCooldown}s`}
              </button>
            </div>
          </form>
        )}

        {/* Login link */}
        <div className="text-center pt-2">
          <p className="text-xs text-[#73706A]">
            Already have an account?{" "}
            <Link
              href={`/login${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`}
              className="font-semibold text-[#0E0E0E] underline hover:text-[#73706A] transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] text-[#73706A]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#0E0E0E]" />
          <span>Privacy & Personal Data Guaranteed</span>
        </div>
      </div>
    </div>
  );
}
