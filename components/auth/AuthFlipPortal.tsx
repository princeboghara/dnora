"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface AuthFlipPortalProps {
  initialMode: "login" | "register";
}

export default function AuthFlipPortal({ initialMode }: AuthFlipPortalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || searchParams.get("next") || "/account";
  const urlError = searchParams.get("error");

  const [mode, setMode] = useState<"login" | "register">(initialMode);

  // Sync mode with URL if initialMode changes
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const toggleMode = (newMode: "login" | "register") => {
    setMode(newMode);
    const params = searchParams.toString();
    const query = params ? `?${params}` : "";
    window.history.replaceState(null, "", `/${newMode}${query}`);
  };

  // --- LOGIN STATE ---
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginGoogleLoading, setLoginGoogleLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(urlError || null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginEmail || !loginPassword) {
      setLoginError("Please provide both your email address and password.");
      return;
    }

    try {
      setLoginLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail.trim(),
          password: loginPassword,
          redirectTo,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.error || "Invalid email or password.");
        return;
      }

      router.push(data.redirectTo || redirectTo);
      router.refresh();
    } catch {
      setLoginError("Network error occurred. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  // --- REGISTER STATE ---
  const [regStep, setRegStep] = useState<1 | 2>(1);
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regOtp, setRegOtp] = useState("");
  const [regDevHint, setRegDevHint] = useState<string | null>(null);
  const [regLoading, setRegLoading] = useState(false);
  const [regGoogleLoading, setRegGoogleLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccessMsg, setRegSuccessMsg] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccessMsg(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setRegError("Please fill in your name, email, and password.");
      return;
    }

    if (regPassword.length < 6) {
      setRegError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setRegLoading(true);
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName.trim(),
          email: regEmail.trim().toLowerCase(),
          phone: regPhone.trim() || undefined,
          password: regPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setRegError(data.error || "Failed to initiate registration.");
        return;
      }

      setRegStep(2);
      setRegSuccessMsg(data.message || "A 6-digit verification code has been sent to your email.");
      if (data.devHint) {
        setRegDevHint(data.devHint);
      }
    } catch {
      setRegError("Network error occurred. Please try again.");
    } finally {
      setRegLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regOtp.trim() || regOtp.trim().length !== 6) {
      setRegError("Please enter the 6-digit verification code.");
      return;
    }

    try {
      setRegLoading(true);
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: regEmail.trim().toLowerCase(),
          otp: regOtp.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setRegError(data.error || "Invalid or expired verification code.");
        return;
      }

      router.push(data.redirectTo || redirectTo);
      router.refresh();
    } catch {
      setRegError("Network error occurred during verification.");
    } finally {
      setRegLoading(false);
    }
  };

  const handleGoogleLogin = (type: "login" | "register") => {
    if (type === "login") setLoginGoogleLoading(true);
    else setRegGoogleLoading(true);
    window.location.href = `/api/auth/google?next=${encodeURIComponent(redirectTo)}`;
  };

  const isFlipped = mode === "register";

  return (
    <div className="w-full max-w-lg perspective-1200 py-6 sm:py-10">
      {/* 3D Card Flipping Container */}
      <div
        className="grid grid-cols-1 items-start transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] preserve-3d"
        style={{
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* ============================================================== */}
        {/* FRONT FACE: SIGN IN (LOGIN)                                   */}
        {/* ============================================================== */}
        <div
          className={`col-start-1 row-start-1 w-full bg-white/95 backdrop-blur-md border border-neutral-200/90 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.08),0_0_1px_1px_rgba(0,0,0,0.03)] p-7 sm:p-10 backface-hidden ${
            isFlipped ? "pointer-events-none select-none" : "pointer-events-auto"
          }`}
        >
          {/* Top Brand & Header */}
          <div className="text-center space-y-2 mb-7">
            <Link href="/" className="inline-block transition-transform hover:scale-[1.02]">
              <div className="relative h-8 w-40 sm:h-9 sm:w-44 mx-auto">
                <Image
                  src="/images/logo.png"
                  alt="DNORA"
                  fill
                  sizes="180px"
                  className="object-contain"
                  priority
                />
              </div>
            </Link>

            <div className="w-12 h-0.5 bg-gradient-to-r from-amber-400 via-amber-600 to-amber-400 mx-auto rounded-full my-2 opacity-80" />

            <h1 className="text-xl sm:text-2xl font-serif tracking-tight text-neutral-900 pt-1">
              Client Identification
            </h1>
            <p className="text-xs text-neutral-500 font-sans tracking-wide">
              Access your private atelier, orders history & bespoke concierge.
            </p>
          </div>

          {/* Error Notice */}
          {loginError && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200/80 text-red-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span className="leading-relaxed">{loginError}</span>
            </div>
          )}

          {/* Google Quick Sign In */}
          <button
            type="button"
            onClick={() => handleGoogleLogin("login")}
            disabled={loginGoogleLoading || loginLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-neutral-50 hover:bg-neutral-100 active:bg-neutral-200/80 border border-neutral-200/90 rounded-xl text-xs font-semibold uppercase tracking-wider text-neutral-800 shadow-2xs transition-all duration-200 cursor-pointer disabled:opacity-60"
          >
            {loginGoogleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-neutral-600" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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

          {/* Elegant Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <span className="relative bg-white px-3 text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-400">
              Or with email credentials
            </span>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-[10px] font-bold tracking-[0.16em] uppercase text-neutral-700 mb-1.5"
              >
                Client Email Address
              </label>
              <div className="relative">
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="client@dnora.luxury"
                  className="w-full pl-9 pr-4 py-2.5 bg-neutral-50/70 border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-black/10 focus:border-neutral-900 transition-all"
                />
                <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-[10px] font-bold tracking-[0.16em] uppercase text-neutral-700"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showLoginPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-neutral-50/70 border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-black/10 focus:border-neutral-900 transition-all"
                />
                <Lock className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer p-0.5"
                  aria-label={showLoginPassword ? "Hide password" : "Show password"}
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading || loginGoogleLoading}
              className="w-full mt-2 py-3.5 px-4 bg-neutral-950 hover:bg-black text-white rounded-xl text-xs font-bold uppercase tracking-[0.2em] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-[0.99]"
            >
              {loginLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* 3D Flip Action to Register */}
          <div className="mt-7 pt-5 border-t border-neutral-100 text-center">
            <p className="text-xs text-neutral-500 mb-2.5">
              New client to Maison DNORA?
            </p>
            <button
              type="button"
              onClick={() => toggleMode("register")}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-neutral-100/80 hover:bg-neutral-200/90 text-neutral-900 text-[11px] font-bold tracking-[0.16em] uppercase transition-all cursor-pointer group shadow-2xs"
            >
              <span>Create An Atelier Account</span>
              <RefreshCw className="w-3.5 h-3.5 text-amber-600 transition-transform group-hover:rotate-180 duration-500" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-neutral-400 uppercase tracking-widest font-semibold pt-4">
            <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
            <span>256-Bit Encrypted Client Security</span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* BACK FACE: SIGN UP (REGISTER)                                */}
        {/* ============================================================== */}
        <div
          className={`col-start-1 row-start-1 w-full bg-white/95 backdrop-blur-md border border-neutral-200/90 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.08),0_0_1px_1px_rgba(0,0,0,0.03)] p-7 sm:p-10 backface-hidden rotate-y-180 ${
            !isFlipped ? "pointer-events-none select-none" : "pointer-events-auto"
          }`}
        >
          {/* Top Brand & Header */}
          <div className="text-center space-y-2 mb-6">
            <Link href="/" className="inline-block transition-transform hover:scale-[1.02]">
              <div className="relative h-8 w-40 sm:h-9 sm:w-44 mx-auto">
                <Image
                  src="/images/logo.png"
                  alt="DNORA"
                  fill
                  sizes="180px"
                  className="object-contain"
                  priority
                />
              </div>
            </Link>

            <div className="w-12 h-0.5 bg-gradient-to-r from-amber-400 via-amber-600 to-amber-400 mx-auto rounded-full my-2 opacity-80" />

            <h1 className="text-xl sm:text-2xl font-serif tracking-tight text-neutral-900 pt-1">
              Atelier Registration
            </h1>
            <p className="text-xs text-neutral-500 font-sans tracking-wide">
              {regStep === 1
                ? "Join the Maison DNORA client collective for curated private drops."
                : "Enter the secure verification code sent to your email."}
            </p>
          </div>

          {/* Error Notice */}
          {regError && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200/80 text-red-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span className="leading-relaxed">{regError}</span>
            </div>
          )}

          {/* Success Notice */}
          {regSuccessMsg && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <span className="leading-relaxed">{regSuccessMsg}</span>
            </div>
          )}

          {/* Dev Hint if configured */}
          {regDevHint && (
            <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-mono">
              <strong>Dev Verification Code:</strong> {regDevHint}
            </div>
          )}

          {regStep === 1 ? (
            <>
              {/* Google Quick Sign Up */}
              <button
                type="button"
                onClick={() => handleGoogleLogin("register")}
                disabled={regGoogleLoading || regLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-neutral-50 hover:bg-neutral-100 active:bg-neutral-200/80 border border-neutral-200/90 rounded-xl text-xs font-semibold uppercase tracking-wider text-neutral-800 shadow-2xs transition-all duration-200 cursor-pointer disabled:opacity-60"
              >
                {regGoogleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-neutral-600" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                <span>Sign Up with Google</span>
              </button>

              {/* Divider */}
              <div className="relative my-5 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200" />
                </div>
                <span className="relative bg-white px-3 text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-400">
                  Or register with email
                </span>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleSendOtp} className="space-y-3.5">
                <div>
                  <label
                    htmlFor="reg-name"
                    className="block text-[10px] font-bold tracking-[0.16em] uppercase text-neutral-700 mb-1"
                  >
                    Full Name *
                  </label>
                  <div className="relative">
                    <input
                      id="reg-name"
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Lady Eleanor Vance"
                      className="w-full pl-9 pr-4 py-2.5 bg-neutral-50/70 border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-black/10 focus:border-neutral-900 transition-all"
                    />
                    <UserIcon className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="reg-email"
                    className="block text-[10px] font-bold tracking-[0.16em] uppercase text-neutral-700 mb-1"
                  >
                    Email Address *
                  </label>
                  <div className="relative">
                    <input
                      id="reg-email"
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="client@dnora.luxury"
                      className="w-full pl-9 pr-4 py-2.5 bg-neutral-50/70 border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-black/10 focus:border-neutral-900 transition-all"
                    />
                    <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="reg-phone"
                    className="block text-[10px] font-bold tracking-[0.16em] uppercase text-neutral-700 mb-1"
                  >
                    Contact Mobile <span className="text-neutral-400 font-normal lowercase">(optional)</span>
                  </label>
                  <div className="relative">
                    <input
                      id="reg-phone"
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-4 py-2.5 bg-neutral-50/70 border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-black/10 focus:border-neutral-900 transition-all"
                    />
                    <Phone className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="reg-password"
                    className="block text-[10px] font-bold tracking-[0.16em] uppercase text-neutral-700 mb-1"
                  >
                    Create Password *
                  </label>
                  <div className="relative">
                    <input
                      id="reg-password"
                      type={showRegPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-9 pr-10 py-2.5 bg-neutral-50/70 border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-black/10 focus:border-neutral-900 transition-all"
                    />
                    <Lock className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer p-0.5"
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={regLoading || regGoogleLoading}
                  className="w-full mt-2 py-3.5 px-4 bg-neutral-950 hover:bg-black text-white rounded-xl text-xs font-bold uppercase tracking-[0.2em] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-[0.99]"
                >
                  {regLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <span>Proceed To Verification</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* STEP 2: OTP VERIFICATION */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 text-center space-y-1">
                <p className="text-xs text-neutral-600">Verification code delivered to:</p>
                <p className="text-xs font-bold text-neutral-900 font-mono">{regEmail}</p>
              </div>

              <div>
                <label
                  htmlFor="reg-otp"
                  className="block text-[10px] font-bold tracking-[0.16em] uppercase text-neutral-700 mb-1.5 text-center"
                >
                  6-Digit Atelier Code
                </label>
                <input
                  id="reg-otp"
                  type="text"
                  maxLength={6}
                  required
                  value={regOtp}
                  onChange={(e) => setRegOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="• • • • • •"
                  className="w-full text-center tracking-[0.5em] text-lg font-mono font-bold py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-black/10 focus:border-neutral-900 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={regLoading}
                className="w-full py-3.5 px-4 bg-neutral-950 hover:bg-black text-white rounded-xl text-xs font-bold uppercase tracking-[0.2em] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-[0.99]"
              >
                {regLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <span>Confirm & Enter Atelier</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setRegStep(1)}
                  className="text-neutral-500 hover:text-black underline cursor-pointer"
                >
                  ← Edit Details
                </button>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={regLoading}
                  className="text-amber-800 hover:text-amber-950 font-semibold cursor-pointer"
                >
                  Resend Code
                </button>
              </div>
            </form>
          )}

          {/* 3D Flip Action back to Sign In */}
          <div className="mt-7 pt-5 border-t border-neutral-100 text-center">
            <p className="text-xs text-neutral-500 mb-2.5">
              Already a registered client?
            </p>
            <button
              type="button"
              onClick={() => toggleMode("login")}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-neutral-100/80 hover:bg-neutral-200/90 text-neutral-900 text-[11px] font-bold tracking-[0.16em] uppercase transition-all cursor-pointer group shadow-2xs"
            >
              <span>Sign In To Existing Account</span>
              <RefreshCw className="w-3.5 h-3.5 text-amber-600 transition-transform group-hover:-rotate-180 duration-500" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-neutral-400 uppercase tracking-widest font-semibold pt-4">
            <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
            <span>Handcrafted In Italy • Privacy Protected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
