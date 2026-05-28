"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        setError(payload.message ?? "লগইন ব্যর্থ হয়েছে।");
        return;
      }

      router.push("/admin");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-bold text-primary/70">Admin Username</label>
        <Input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="admin"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-primary/70">Password</label>
        <Input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          placeholder="Secure password"
        />
      </div>

      {error ? (
        <div className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive bengali-copy">
          {error}
        </div>
      ) : null}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "লগইন হচ্ছে..." : "অ্যাডমিন প্যানেলে প্রবেশ করুন"}
      </Button>
    </form>
  );
}
