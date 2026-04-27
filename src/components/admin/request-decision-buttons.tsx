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

type RequestDecisionButtonsProps = {
  requestId: string;
  variant: "fund" | "member";
};

export function RequestDecisionButtons({
  requestId,
  variant,
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
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      <button
        type="button"
        disabled={isPending}
        onClick={() => runAction("approve")}
        className="flex size-10 items-center justify-center rounded-[1rem] bg-primary text-white disabled:opacity-60 sm:size-12"
      >
        <Check className="size-4 sm:size-5" />
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => runAction("reject")}
        className="flex size-10 items-center justify-center rounded-[1rem] bg-[#ffd7d5] text-[#c62828] disabled:opacity-60 sm:size-12"
      >
        <X className="size-4 sm:size-5" />
      </button>
    </div>
  );
}
