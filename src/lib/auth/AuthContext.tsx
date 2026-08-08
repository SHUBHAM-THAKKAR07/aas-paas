"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { User } from "../db/types";
import { db } from "../db/local-db";
import { createClient } from "@/lib/supabase/client";

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

const LOCAL_USER_ID_KEY = "aas_paas_user_id";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [supabase] = useState(() => createClient());
  // Guards against setState after unmount (e.g. slow IndexedDB reads).
  const mountedRef = useRef(true);

  /**
   * Upsert a Google-authenticated user into the local database.
   * Creates a new user if one doesn't exist, or updates the existing record.
   * Supabase is the auth source of truth; the local DB only stores the
   * Aas-Paas profile for that authenticated identity.
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

      const existing = await db.getUserByEmail(email);

      let localUser: User | null = null;

      if (existing) {
        localUser = await db.updateUser(existing.id, {
          full_name: fullName || existing.full_name,
          avatar_url: avatarUrl || existing.avatar_url,
          provider: "google",
        });
      } else {
        localUser = await db.createUser({
          email,
          full_name: fullName,
          avatar_url: avatarUrl,
          bio: "",
          neighbourhood: "",
          location_radius: 5,
          neighbour_score: 50,
          provider: "google",
        });
      }

      if (localUser && mountedRef.current) {
        localStorage.setItem(LOCAL_USER_ID_KEY, localUser.id);
        setUser(localUser);
      }
    },
    []
  );

  const clearLocalSession = useCallback(() => {
    localStorage.removeItem(LOCAL_USER_ID_KEY);
    if (mountedRef.current) setUser(null);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Initial session restore — Supabase session takes priority, local DB is the
  // fallback for email/demo accounts that have no Supabase session.
  useEffect(() => {
    const initAuth = async () => {
      let supabaseUserId: string | null = null;

      if (supabase) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          supabaseUserId = session.user.id;
          await upsertGoogleUser(session.user);
        }
      }

      if (!mountedRef.current) return;

      // No Supabase session → restore the previously stored local user
      // (email or demo login). Re-assert it only when it differs, so a Google
      // upsert above is never overwritten by a stale local record.
      if (!supabaseUserId) {
        const storedUserId = localStorage.getItem(LOCAL_USER_ID_KEY);
        if (storedUserId) {
          const u = await db.getUser(storedUserId);
          if (u) {
            if (mountedRef.current) setUser(u);
          } else {
            localStorage.removeItem(LOCAL_USER_ID_KEY);
          }
        }
      }

      if (mountedRef.current) setLoading(false);
    };
    initAuth();
  }, [supabase, upsertGoogleUser]);

  // Live auth events. INITIAL_SESSION fires when the client restores a session
  // on load; SIGNED_IN fires on new logins (e.g. after the OAuth callback).
  useEffect(() => {
    if (!supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        await upsertGoogleUser(session.user);
      }
      if (event === "INITIAL_SESSION" && session?.user) {
        // Sync the local profile with the restored session. Idempotent.
        await upsertGoogleUser(session.user);
      }
      if (event === "SIGNED_OUT") {
        clearLocalSession();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, upsertGoogleUser, clearLocalSession]);

  const login = async (email: string) => {
    const u = await db.getUserByEmail(email);
    if (!u) {
      return { error: "User not found. Please sign up." };
    }
    localStorage.setItem(LOCAL_USER_ID_KEY, u.id);
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
    localStorage.setItem(LOCAL_USER_ID_KEY, newUser.id);
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
          redirectTo: `${window.location.origin}/auth/callback?next=/home`,
        },
      });

      if (error) {
        setIsGoogleLoading(false);
        return { error: error.message };
      }

      // The browser will redirect — isGoogleLoading stays true until then.
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
    clearLocalSession();

    // Also sign out of Supabase if available.
    if (supabase) {
      supabase.auth.signOut().catch(() => {
        // Silent failure — local logout already succeeded.
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
