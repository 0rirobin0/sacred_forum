"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BellRing, Eraser, Save } from "lucide-react";

import {
  clearBreakingNewsAction,
  upsertBreakingNewsAction,
} from "@/app/actions/admin-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
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
    <Card className="relative overflow-hidden bg-[#ffe9a7]">
      <div className="absolute -bottom-5 -right-5 text-[#e3bc5d] opacity-40">
        <BellRing className="size-20 sm:size-24 lg:size-28" />
      </div>

      <form onSubmit={saveBreakingNews} className="relative">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Breaking news</CardTitle>
              <p className="mt-2 text-sm text-primary/75">
                Update the homepage marquee with one urgent message for everyone.
              </p>
            </div>
            <Badge variant={isActive ? "accent" : "outline"}>
              {isActive ? "Live" : "Draft"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={4}
            placeholder="Write the urgent notice that should scroll on the homepage."
            className="bg-white/80"
          />

          <label className="flex items-center gap-3 rounded-[1.25rem] bg-white/60 px-4 py-3 text-sm font-semibold text-primary">
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
            <Button type="submit" disabled={isPending} className="gap-2">
              <Save className="size-5" />
              {isPending ? "Saving..." : "Save breaking news"}
            </Button>

            <Button type="button" variant="outline" onClick={clearBreakingNews} disabled={isPending}>
              <Eraser className="size-5" />
              Clear
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
