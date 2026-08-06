"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setTimeout(() => {
      setMessage("If an account exists, a password reset link has been sent.");
      setIsPending(false);
    }, 1000);
  };

  return (
    <Card className="w-full p-6 sm:p-8">
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold font-heading">Forgot password</h2>
          <p className="text-[var(--color-on-surface-variant)] mt-1">
            Enter your email to reset your password
          </p>
        </div>

        {message && (
          <div className="p-3 text-sm text-green-700 bg-green-100 rounded-md">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            placeholder="name@example.com"
            required
            disabled={isPending}
          />

          <Button type="submit" className="w-full mt-2" isLoading={isPending}>
            Send reset link
          </Button>
        </form>

        <div className="text-center text-sm">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-medium text-[var(--color-primary)] hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </Card>
  );
}
