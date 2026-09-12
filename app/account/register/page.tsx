"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, signInWithGoogle } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please ensure both passwords match.");
      return;
    }

    setIsSubmitting(true);
    const result = await signUp(email, password, fullName);
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error || "Unable to complete registration. Please verify details.");
      return;
    }

    if (result.message && result.message.includes("check your email")) {
      setSuccessMessage(result.message);
    } else {
      router.push("/account");
    }
  };

  const handleGoogleSignUp = async () => {
    setErrorMessage(null);
    setIsGoogleLoading(true);
    const res = await signInWithGoogle();
    setIsGoogleLoading(false);
    if (!res.success) {
      setErrorMessage(res.error || "Unable to connect with Google. Please try again.");
    } else {
      router.push("/account");
    }
  };

  return (
    <div className="py-16 sm:py-24 max-w-md mx-auto px-4 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold">
          Debut Circle Invitation
        </span>
        <h1 className="font-sans text-2xl sm:text-3xl text-[#111111] uppercase tracking-[0.12em] font-light">
          Member Sign Up
        </h1>
        <p className="text-xs text-[#6E6A64]">
          Join the D&apos;NORA circle to receive private preview invitations and debut acquisition privileges.
        </p>
      </div>

      <div className="bg-[#FAF7F2] border border-[#E8E2D9] p-8 space-y-6 shadow-sm">
        {/* Continue with Google */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
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
            or register with email
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

        {/* Success Notification */}
        {successMessage && (
          <div className="p-3 bg-[#EAF2ED] border border-[#C2D8CA] text-[#245744] text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{successMessage}</p>
              <Link href="/account/login" className="underline font-bold mt-1 inline-block">
                Proceed to Sign In &rarr;
              </Link>
            </div>
          </div>
        )}

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
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
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

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">
              Confirm Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
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
            disabled={isSubmitting || isGoogleLoading}
            className="w-full py-3.5 bg-[#141414] hover:bg-[#C5A880] hover:text-[#111111] text-[#F5F2EB] text-xs uppercase tracking-[0.25em] font-medium transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Creating Member Account...</span>
              </>
            ) : (
              <span>Create Atelier Account</span>
            )}
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

