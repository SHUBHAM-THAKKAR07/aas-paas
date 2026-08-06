"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "../db/types";
import { db } from "../db/local-db";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<{ error?: string }>;
  signup: (email: string, fullName: string) => Promise<{ error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedUserId = localStorage.getItem("aas_paas_user_id");
      if (storedUserId) {
        const u = await db.getUser(storedUserId);
        if (u) {
          setUser(u);
        } else {
          localStorage.removeItem("aas_paas_user_id");
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

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

  const logout = () => {
    localStorage.removeItem("aas_paas_user_id");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
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
