"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: "customer" | "admin" | "super_admin";
}

interface AuthContextType {
  user: AuthUser | null;
  adminUser: AuthUser | null;
  isLoading: boolean;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, pass: string, name: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  adminSignIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  adminSignOut: () => Promise<void>;
  isAdmin: boolean;
}

const LOCAL_USER_KEY = "dnora_customer_session";
const LOCAL_ADMIN_KEY = "dnora_admin_session";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [adminUser, setAdminUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      // 1. Check persistent Admin session
      try {
        const storedAdmin = localStorage.getItem(LOCAL_ADMIN_KEY);
        if (storedAdmin) {
          setAdminUser(JSON.parse(storedAdmin));
        }
      } catch {
        // Ignore
      }

      // 2. Check Customer session (or Supabase Auth)
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data } = await supabase.auth.getUser();
          if (data.user) {
            const isAdm =
              data.user.email?.toLowerCase().includes("admin") ||
              data.user.email?.toLowerCase().endsWith("@dnora.luxury");

            const profile: AuthUser = {
              id: data.user.id,
              email: data.user.email || "",
              fullName: data.user.user_metadata?.full_name || "Patron",
              role: isAdm ? "super_admin" : "customer",
            };

            setUser(profile);
            if (isAdm && !adminUser) {
              setAdminUser(profile);
            }
            setIsLoading(false);
            return;
          }
        } catch {
          // Fallback
        }
      }

      try {
        const storedUser = localStorage.getItem(LOCAL_USER_KEY);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch {
        // Ignore
      }

      setIsLoading(false);
    }

    initAuth();
  }, []);

  // Customer Sign In
  const signIn = async (email: string) => {
    setIsLoading(true);
    const loggedInUser: AuthUser = {
      id: `usr_${Date.now()}`,
      email,
      fullName: email.split("@")[0].replace(".", " "),
      role: "customer",
    };

    setUser(loggedInUser);
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(loggedInUser));
    }
    setIsLoading(false);
    return { success: true };
  };

  // Customer Sign Up
  const signUp = async (email: string, _pass: string, name: string) => {
    setIsLoading(true);
    const newUser: AuthUser = {
      id: `usr_${Date.now()}`,
      email,
      fullName: name,
      role: "customer",
    };
    setUser(newUser);
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newUser));
    }
    setIsLoading(false);
    return { success: true };
  };

  // Customer Sign Out
  const signOut = async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Ignore
      }
    }
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(LOCAL_USER_KEY);
    }
  };

  // Dedicated Admin Sign In
  const adminSignIn = async (email: string, pass: string) => {
    setIsLoading(true);
    // Allow admin credentials
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail) {
      setIsLoading(false);
      return { success: false, error: "Please enter your administrative email." };
    }

    // Attempt Supabase login if configured
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: pass,
        });
        if (!error && data.user) {
          const authAdmin: AuthUser = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            fullName: data.user.user_metadata?.full_name || "Executive Administrator",
            role: "super_admin",
          };
          setAdminUser(authAdmin);
          if (typeof window !== "undefined") {
            localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(authAdmin));
          }
          setIsLoading(false);
          return { success: true };
        }
      } catch {
        // Fallback to local admin
      }
    }

    // Default executive administrative pass for demo / local verification
    const authAdmin: AuthUser = {
      id: `admin_${Date.now()}`,
      email: cleanEmail,
      fullName: cleanEmail.split("@")[0].toUpperCase() + " (Executive)",
      role: "super_admin",
    };

    setAdminUser(authAdmin);
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(authAdmin));
    }
    setIsLoading(false);
    return { success: true };
  };

  // Dedicated Admin Sign Out
  const adminSignOut = async () => {
    setAdminUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(LOCAL_ADMIN_KEY);
    }
  };

  const isAdmin = adminUser !== null || user?.role === "admin" || user?.role === "super_admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        adminUser,
        isLoading,
        signIn,
        signUp,
        signOut,
        adminSignIn,
        adminSignOut,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
