"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BellRing, Eraser, Save } from "lucide-react";

import {
  clearBreakingNewsAction,
  upsertBreakingNewsAction,
} from "@/app/actions/admin-actions";
import type { BreakingNews } from "@/lib/types";

type AdminBreakingNewsClientProps = {
  initialBreakingNews: BreakingNews | null;
};

export function AdminBreakingNewsClient({
  initialBreakingNews,
}: AdminBreakingNewsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState(initialBreakingNews?.message ?? "");
  const [isActive, setIsActive] = useState(initialBreakingNews?.isActive ?? true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function saveBreakingNews(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess(null);
    setError(null);

    startTransition(async () => {
      try {
        await upsertBreakingNewsAction({
          message,
          isActive,
        });
        setSuccess(
          isActive
            ? "Breaking news is now live on the homepage."
            : "Breaking news was saved as inactive.",
        );
        router.refresh();
      } catch (actionError) {
        setError(
          actionError instanceof Error
            ? actionError.message
            : "Breaking news could not be saved.",
        );
      }
    });
  }

  function clearBreakingNews() {
    setSuccess(null);
    setError(null);

    startTransition(async () => {
      try {
        await clearBreakingNewsAction();
        setMessage("");
        setIsActive(true);
        setSuccess("Breaking news has been cleared.");
        router.refresh();
      } catch (actionError) {
        setError(
          actionError instanceof Error
            ? actionError.message
            : "Breaking news could not be cleared.",
        );
      }
    });
  }

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-[#ffd978] p-5 shadow-[0_20px_40px_rgba(217,174,53,0.18)] sm:p-6 md:p-5 lg:p-8">
      <div className="absolute -bottom-5 -right-5 text-[#e3bc5d] opacity-40">
        <BellRing className="size-20 sm:size-24 lg:size-28" />
      </div>

      <form onSubmit={saveBreakingNews} className="relative space-y-5">
        <div>
          <h3 className="headline-display text-lg font-extrabold text-primary sm:text-xl lg:text-2xl">
            Breaking news
          </h3>
          <p className="mt-3 text-sm text-primary/75 sm:text-base lg:mt-4">
            Update the homepage marquee with one urgent message for everyone.
          </p>
        </div>

        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={4}
          placeholder="Write the urgent notice that should scroll on the homepage."
          className="w-full rounded-[1.4rem] border border-primary/10 bg-white/80 px-4 py-4 text-base text-primary outline-none placeholder:text-primary/40"
        />

        <label className="flex items-center gap-3 rounded-[1.25rem] bg-white/55 px-4 py-3 text-sm font-semibold text-primary">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            className="size-4 rounded border-primary/30 text-primary"
          />
          Show this breaking news on the homepage
        </label>

        {success ? (
          <div className="rounded-[1.25rem] bg-primary/10 px-4 py-3 text-sm text-primary">
            {success}
          </div>
        ) : null}
        {error ? (
          <div className="rounded-[1.25rem] bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center gap-3 rounded-[1.35rem] bg-primary px-5 py-4 text-base font-bold text-white shadow-[0_12px_24px_rgba(0,56,32,0.16)] disabled:opacity-60 lg:px-6"
          >
            <Save className="size-5" />
            {isPending ? "Saving..." : "Save breaking news"}
          </button>

          <button
            type="button"
            onClick={clearBreakingNews}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-3 rounded-[1.35rem] border border-primary/20 bg-white/65 px-5 py-4 text-base font-bold text-primary disabled:opacity-60 lg:px-6"
          >
            <Eraser className="size-5" />
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}
