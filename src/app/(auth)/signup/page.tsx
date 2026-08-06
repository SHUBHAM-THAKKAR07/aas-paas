"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Mail, Lock, MapPin, ArrowRight, ShieldCheck } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [neighbourhood, setNeighbourhood] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await signup(email, name);
      if (res.error) {
        setError(res.error);
      } else {
        router.push("/onboarding/location");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-3xl border border-outline-variant/30 bg-surface-container-lowest soft-card-shadow p-8 space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center mb-3">
            <User size={24} />
          </div>
          <h2 className="headline-lg text-on-surface font-extrabold tracking-tight">
            Join your neighbourhood
          </h2>
          <p className="body-md text-on-surface-variant">
            Create an account to participate, request verified help, and support locals.
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
            label="Full Name"
            type="text"
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<User size={18} />}
            required
          />

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
            label="Neighbourhood / Locality"
            type="text"
            placeholder="e.g. Sunrise Greens, Sector 15"
            value={neighbourhood}
            onChange={(e) => setNeighbourhood(e.target.value)}
            leftIcon={<MapPin size={18} />}
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
            Create Account
          </Button>
        </form>

        <div className="pt-4 border-t border-outline-variant/20 text-center">
          <p className="body-md text-on-surface-variant">
            Already a member?{" "}
            <Link href="/login" className="text-primary font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
