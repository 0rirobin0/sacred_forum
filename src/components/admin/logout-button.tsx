"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

type LogoutButtonProps = {
  className?: string;
  label?: string;
};

export function LogoutButton({
  className = "rounded-full border border-primary/15 px-4 py-2 text-sm font-bold text-primary hover:border-secondary hover:text-secondary disabled:opacity-60",
  label = "Logout",
}: LogoutButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() =>
        startTransition(async () => {
          await fetch("/api/admin/logout", { method: "POST" });
          router.push("/admin/login");
          router.refresh();
        })
      }
      disabled={isPending}
      className={className}
    >
      {isPending ? "লগআউট..." : label}
    </button>
  );
}
