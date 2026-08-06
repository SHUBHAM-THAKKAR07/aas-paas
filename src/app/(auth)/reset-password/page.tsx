"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setTimeout(() => {
      setMessage("Password successfully reset.");
      setIsPending(false);
      setTimeout(() => router.push("/login"), 2000);
    }, 1000);
  };

  return (
    <Card className="w-full p-6 sm:p-8">
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold font-heading">Reset password</h2>
          <p className="text-[var(--color-on-surface-variant)] mt-1">
            Enter your new password below
          </p>
        </div>

        {message && (
          <div className="p-3 text-sm text-green-700 bg-green-100 rounded-md">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="password"
            name="password"
            type="password"
            label="New password"
            placeholder="••••••••"
            required
            disabled={isPending}
          />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirm password"
            placeholder="••••••••"
            required
            disabled={isPending}
          />

          <Button type="submit" className="w-full mt-2" isLoading={isPending}>
            Update password
          </Button>
        </form>
      </div>
    </Card>
  );
}
