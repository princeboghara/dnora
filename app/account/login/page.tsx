"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Phone,
  CheckCircle2,
  KeyRound,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";

type AuthTab = "mobile" | "email";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInWithGoogle, signInWithPhone, verifyPhoneOtp } = useAuth();

  // Active method tab: mobile or email
  const [activeTab, setActiveTab] = useState<AuthTab>("mobile");

  // Email / Password state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Mobile / OTP state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [suggestedOtp, setSuggestedOtp] = useState<string | null>(null);

  // Loading & Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // 1. Google OAuth Authentication
  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setInfoMessage(null);
    setIsGoogleLoading(true);

    const res = await signInWithGoogle();
    setIsGoogleLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || "Unable to complete Google sign in. Please try again.");
    } else {
      if (res.notice) {
        setInfoMessage(res.notice);
      }
      setTimeout(() => {
        router.push("/account");
      }, res.notice ? 1200 : 300);
    }
  };

  // 2. Mobile Phone Number - Send OTP
  const handleSendMobileOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    const digitsOnly = phoneNumber.replace(/[^0-9]/g, "");
    if (digitsOnly.length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsSubmitting(true);
    const fullPhone = phoneNumber.startsWith("+") ? phoneNumber : `+91${digitsOnly.slice(-10)}`;
    const res = await signInWithPhone(fullPhone);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.error || "Failed to send OTP code. Please verify the mobile number.");
      return;
    }

    setOtpSent(true);
    if (res.testOtp) {
      setSuggestedOtp(res.testOtp);
      setOtpCode(res.testOtp); // Auto-fill test code for convenience
    }
  };

  // 3. Mobile Phone Number - Verify OTP
  const handleVerifyMobileOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!otpCode || otpCode.length < 4) {
      setErrorMessage("Please enter the verification code received on your mobile.");
      return;
    }

    setIsSubmitting(true);
    const digitsOnly = phoneNumber.replace(/[^0-9]/g, "");
    const fullPhone = phoneNumber.startsWith("+") ? phoneNumber : `+91${digitsOnly.slice(-10)}`;
    const res = await verifyPhoneOtp(fullPhone, otpCode);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.error || "Invalid verification code. Please try again.");
      return;
    }

    router.push("/account");
  };

  // 4. Email / Gmail & Password Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);
    setIsSubmitting(true);

    const result = await signIn(email, password);
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error || "Invalid email or password. Please check your credentials.");
      return;
    }

    if (email.toLowerCase().includes("admin")) {
      router.push("/admin");
    } else {
      router.push("/account");
    }
  };

  return (
    <div className="py-14 sm:py-20 max-w-md mx-auto px-4 space-y-7">
      {/* Header Title */}
      <div className="text-center space-y-2">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold">
          Private Client Access
        </span>
        <h1 className="font-sans text-2xl sm:text-3xl text-[#111111] uppercase tracking-[0.14em] font-light">
          Member Sign In
        </h1>
        <p className="text-xs text-[#6E6A64]">
          Access your private acquisitions, saved addresses, and atelier privileges.
        </p>
      </div>

      {/* Main Luxury Auth Card */}
      <div className="bg-[#FAF7F2] border border-[#E8E2D9] p-6 sm:p-8 space-y-6 shadow-sm rounded-xl">
        {/* Top Option: Continue with Google */}
        <div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isSubmitting}
            className="w-full py-3.5 px-4 bg-[#FBF9F5] hover:bg-[#FFFFFF] border border-[#D5CDC0] hover:border-[#111111] text-[#111111] text-xs uppercase tracking-widest font-semibold transition-all flex items-center justify-center gap-3 shadow-xs rounded-lg active:scale-[0.99] cursor-pointer"
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
        </div>

        {/* Divider with choice label */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-[#E8E2D9] w-full" />
          <span className="bg-[#FAF7F2] px-3 text-[10px] uppercase tracking-widest text-[#8C7A6B] whitespace-nowrap">
            or choose method
          </span>
          <div className="border-t border-[#E8E2D9] w-full" />
        </div>

        {/* Method Toggle Buttons: Mobile Number vs Email / Gmail */}
        <div className="grid grid-cols-2 gap-2 bg-[#F0ECE1] p-1 rounded-lg">
          <button
            type="button"
            onClick={() => {
              setActiveTab("mobile");
              setErrorMessage(null);
            }}
            className={`py-2 px-3 text-xs uppercase tracking-wider font-medium flex items-center justify-center gap-2 rounded-md transition-all ${
              activeTab === "mobile"
                ? "bg-[#141414] text-[#F5F2EB] shadow-xs"
                : "text-[#6E6A64] hover:text-[#111111]"
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Mobile OTP</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("email");
              setErrorMessage(null);
            }}
            className={`py-2 px-3 text-xs uppercase tracking-wider font-medium flex items-center justify-center gap-2 rounded-md transition-all ${
              activeTab === "email"
                ? "bg-[#141414] text-[#F5F2EB] shadow-xs"
                : "text-[#6E6A64] hover:text-[#111111]"
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email / Gmail</span>
          </button>
        </div>

        {/* Feedback Notifications */}
        {errorMessage && (
          <div className="p-3 bg-[#FDF2F2] border border-[#F8B4B4] text-[#991B1B] text-xs flex items-start gap-2 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>{errorMessage}</p>
          </div>
        )}

        {infoMessage && (
          <div className="p-3 bg-[#FEF9EE] border border-[#FDE68A] text-[#92400E] text-xs flex items-start gap-2 rounded-lg">
            <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#C5A880]" />
            <p>{infoMessage}</p>
          </div>
        )}

        {/* Method 1: Mobile Number Login (OTP) */}
        {activeTab === "mobile" && (
          <div>
            {!otpSent ? (
              <form onSubmit={handleSendMobileOtp} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#8C7A6B] block">
                    Mobile Number
                  </label>
                  <div className="flex items-center rounded-lg border border-[#D5CDC0] bg-[#FBF9F5] focus-within:border-[#111111] overflow-hidden">
                    <span className="px-3 py-3 bg-[#EFEBE4] text-[#111111] font-mono text-xs border-r border-[#D5CDC0] font-semibold">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="98765 43210"
                      className="w-full p-3 bg-transparent text-xs text-[#111111] focus:outline-none placeholder:text-[#A0988E]"
                    />
                  </div>
                  <p className="text-[10px] text-[#8C7A6B]">
                    A 6-digit verification code will be sent to your mobile phone.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#141414] hover:bg-[#C5A880] hover:text-[#111111] text-[#F5F2EB] text-xs uppercase tracking-[0.2em] font-medium transition-all flex items-center justify-center gap-2 rounded-lg cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Verification Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue with Mobile Number</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyMobileOtp} className="space-y-4 text-xs">
                <div className="p-3 bg-[#F4F0E8] border border-[#E8E2D9] rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#8C7A6B] uppercase tracking-wider block">
                      Code Sent To
                    </span>
                    <span className="font-mono font-semibold text-[#111111]">
                      {phoneNumber.startsWith("+") ? phoneNumber : `+91 ${phoneNumber}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtpCode("");
                    }}
                    className="text-[11px] text-[#9E7D4E] hover:underline flex items-center gap-1 font-medium"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Change</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">
                      Enter 6-Digit OTP
                    </label>
                    {suggestedOtp && (
                      <span className="text-[10px] text-[#C5A880] font-mono bg-[#141414] text-[#F5F2EB] px-2 py-0.5 rounded">
                        Test Code: {suggestedOtp}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="w-full p-3 bg-[#FBF9F5] border border-[#D5CDC0] focus:outline-none focus:border-[#111111] tracking-[0.4em] font-mono text-center text-sm font-semibold rounded-lg"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#141414] hover:bg-[#C5A880] hover:text-[#111111] text-[#F5F2EB] text-xs uppercase tracking-[0.2em] font-medium transition-all flex items-center justify-center gap-2 rounded-lg cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verify &amp; Enter Atelier</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Method 2: Email / Gmail Password Login */}
        {activeTab === "email" && (
          <form onSubmit={handleEmailLogin} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">
                Email / Gmail Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patron@gmail.com"
                className="w-full p-3 bg-[#FBF9F5] border border-[#D5CDC0] focus:outline-none focus:border-[#111111] rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">
                  Password
                </label>
                <Link
                  href="/account/login"
                  onClick={() => alert("Password reset link has been dispatched to your email.")}
                  className="text-[10px] text-[#8C7A6B] hover:underline"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full p-3 pr-10 bg-[#FBF9F5] border border-[#D5CDC0] focus:outline-none focus:border-[#111111] rounded-lg"
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
              className="w-full py-3.5 bg-[#141414] hover:bg-[#C5A880] hover:text-[#111111] text-[#F5F2EB] text-xs uppercase tracking-[0.2em] font-medium transition-all flex items-center justify-center gap-2 rounded-lg cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Continue with Email</span>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Footer Registration Link */}
      <div className="text-center text-xs text-[#8C7A6B]">
        <span>New to the Atelier? </span>
        <Link
          href="/account/register"
          className="text-[#111111] font-semibold underline hover:text-[#C5A880] transition-colors"
        >
          Create an Account
        </Link>
      </div>
    </div>
  );
}
