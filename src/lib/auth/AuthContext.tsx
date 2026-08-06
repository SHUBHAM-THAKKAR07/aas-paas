"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User } from "../db/types";
import { db } from "../db/local-db";
import { supabase } from "../supabase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isGoogleLoading: boolean;
  login: (email: string) => Promise<{ error?: string }>;
  signup: (email: string, fullName: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  /**
   * Upsert a Google-authenticated user into the local database.
   * Creates a new user if one doesn't exist, or updates existing record.
   */
  const upsertGoogleUser = useCallback(
    async (supabaseUser: {
      id: string;
      email?: string;
      user_metadata?: Record<string, unknown>;
    }) => {
      const email = supabaseUser.email || "";
      const fullName =
        (supabaseUser.user_metadata?.full_name as string) ||
        (supabaseUser.user_metadata?.name as string) ||
        "";
      const avatarUrl =
        (supabaseUser.user_metadata?.avatar_url as string) ||
        (supabaseUser.user_metadata?.picture as string) ||
        "";

      // Check if user already exists in local DB by email
      const existing = await db.getUserByEmail(email);

      if (existing) {
        // Update existing user with latest Google profile data
        const updated = await db.updateUser(existing.id, {
          full_name: fullName || existing.full_name,
          avatar_url: avatarUrl || existing.avatar_url,
          provider: "google",
        });
        if (updated) {
          localStorage.setItem("aas_paas_user_id", updated.id);
          setUser(updated);
        }
        return;
      }

      // Create new user from Google profile
      const newUser = await db.createUser({
        email,
        full_name: fullName,
        avatar_url: avatarUrl,
        bio: "",
        neighbourhood: "",
        location_radius: 5,
        neighbour_score: 50,
        provider: "google",
      });
      localStorage.setItem("aas_paas_user_id", newUser.id);
      setUser(newUser);
    },
    []
  );

  useEffect(() => {
    const initAuth = async () => {
      // 1. Restore session from localStorage (existing flow)
      const storedUserId = localStorage.getItem("aas_paas_user_id");
      if (storedUserId) {
        const u = await db.getUser(storedUserId);
        if (u) {
          setUser(u);
        } else {
          localStorage.removeItem("aas_paas_user_id");
        }
      }

      // 2. Check for active Supabase session (Google OAuth return)
      if (supabase) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          await upsertGoogleUser(session.user);
        }
      }

      setLoading(false);
    };
    initAuth();
  }, [upsertGoogleUser]);

  // Listen for Supabase auth state changes (handles post-OAuth redirect)
  useEffect(() => {
    if (!supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        await upsertGoogleUser(session.user);
      }
      if (event === "SIGNED_OUT") {
        localStorage.removeItem("aas_paas_user_id");
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [upsertGoogleUser]);

  const login = async (email: string) => {
    const u = await db.getUserByEmail(email);
    if (!u) {
      return { error: "User not found. Please sign up." };
    }
    localStorage.setItem("aas_paas_user_id", u.id);
    setUser(u);
    return {};
  };

  const signup = async (email: string, fullName: string) => {
    const existing = await db.getUserByEmail(email);
    if (existing) {
      return { error: "Email already in use." };
    }
    const newUser = await db.createUser({
      email,
      full_name: fullName,
      avatar_url: "",
      bio: "",
      neighbourhood: "Bandra West",
      location_radius: 5,
      neighbour_score: 50,
    });
    localStorage.setItem("aas_paas_user_id", newUser.id);
    setUser(newUser);
    return {};
  };

  const signInWithGoogle = async () => {
    if (!supabase) {
      return {
        error:
          "Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
      };
    }

    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setIsGoogleLoading(false);
        return { error: error.message };
      }

      // The browser will redirect — isGoogleLoading stays true until then
      return {};
    } catch (err: unknown) {
      setIsGoogleLoading(false);
      return {
        error:
          err instanceof Error
            ? err.message
            : "Failed to sign in with Google. Please try again.",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("aas_paas_user_id");
    setUser(null);

    // Also sign out of Supabase if available
    if (supabase) {
      supabase.auth.signOut().catch(() => {
        // Silent failure — local logout already succeeded
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, isGoogleLoading, login, signup, signInWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

