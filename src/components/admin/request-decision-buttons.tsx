"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Check, X } from "lucide-react";

import {
  approveFundRequestAction,
  approveMemberRequestAction,
  rejectFundRequestAction,
  rejectMemberRequestAction,
} from "@/app/actions/admin-actions";
import { cn } from "@/lib/utils";

type RequestDecisionButtonsProps = {
  requestId: string;
  variant: "fund" | "member";
  showLabels?: boolean;
};

export function RequestDecisionButtons({
  requestId,
  variant,
  showLabels = false,
}: RequestDecisionButtonsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function runAction(type: "approve" | "reject") {
    startTransition(async () => {
      if (variant === "fund") {
        if (type === "approve") {
          await approveFundRequestAction(requestId);
        } else {
          await rejectFundRequestAction(requestId);
        }
      } else if (type === "approve") {
        await approveMemberRequestAction(requestId);
      } else {
        await rejectMemberRequestAction(requestId);
      }

      router.refresh();
    });
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 sm:gap-3",
        showLabels ? "justify-start" : "justify-center",
      )}
    >
      <button
        type="button"
        disabled={isPending}
        onClick={() => runAction("approve")}
        aria-label={variant === "fund" ? "Accept fund request" : "Accept member request"}
        className={cn(
          "disabled:opacity-60",
          showLabels
            ? "inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white"
            : "flex size-10 items-center justify-center rounded-[1rem] bg-primary text-white sm:size-12",
        )}
      >
        <Check className="size-4 sm:size-5" />
        {showLabels ? <span>Accept</span> : null}
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => runAction("reject")}
        aria-label={variant === "fund" ? "Decline fund request" : "Decline member request"}
        className={cn(
          "disabled:opacity-60",
          showLabels
            ? "inline-flex items-center gap-2 rounded-full bg-[#ffd7d5] px-4 py-2 text-sm font-bold text-[#c62828]"
            : "flex size-10 items-center justify-center rounded-[1rem] bg-[#ffd7d5] text-[#c62828] sm:size-12",
        )}
      >
        <X className="size-4 sm:size-5" />
        {showLabels ? <span>Decline</span> : null}
      </button>
    </div>
  );
}
