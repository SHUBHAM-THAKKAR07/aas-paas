"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, Building, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await login(email);
      if (res.error) {
        setError(res.error);
      } else {
        router.push("/home");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to sign in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      const res = await login("demo@aaspaas.community");
      if (res.error) {
        setError(res.error);
      } else {
        router.push("/home");
      }
    } catch (_err: unknown) {
      setError("Demo login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-3xl border border-outline-variant/30 bg-surface-container-lowest soft-card-shadow p-8 space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center mb-3">
            <Building size={24} />
          </div>
          <h2 className="headline-lg text-on-surface font-extrabold tracking-tight">
            Welcome back
          </h2>
          <p className="body-md text-on-surface-variant">
            Sign in to connect with your neighbours and discover local updates.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-error-container text-on-error-container label-md flex items-center gap-2">
            <ShieldCheck size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail size={18} />}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock size={18} />}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full hover-lift mt-2"
            isLoading={isLoading}
            rightIcon={<ArrowRight size={18} />}
          >
            Sign In
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full hover-lift"
            onClick={handleDemoLogin}
            disabled={isLoading}
          >
            Explore with Demo Account
          </Button>
        </form>

        <div className="pt-4 border-t border-outline-variant/20 text-center">
          <p className="body-md text-on-surface-variant">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary font-bold hover:underline">
              Join Aas-Paas
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
