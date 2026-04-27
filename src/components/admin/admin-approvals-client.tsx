"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CircleDollarSign, UserPlus2 } from "lucide-react";

import { createManualFundEntryAction } from "@/app/actions/admin-actions";
import { RequestDecisionButtons } from "@/components/admin/request-decision-buttons";
import { formatCurrency, formatDate } from "@/lib/format";
import type { FundEntry, Member, MemberRequest } from "@/lib/types";

type AdminApprovalsClientProps = {
  fundEntries: FundEntry[];
  memberRequests: MemberRequest[];
  members: Member[];
};

export function AdminApprovalsClient({
  fundEntries,
  memberRequests,
  members,
}: AdminApprovalsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [manualFund, setManualFund] = useState({
    memberId: members[0]?.id ?? "",
    amount: "",
    paymentMethod: "Cash",
    note: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const pendingFunds = fundEntries.filter((entry) => entry.status === "pending");
  const pendingMembers = memberRequests.filter((entry) => entry.status === "pending");

  function submitManualFund(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    startTransition(async () => {
      try {
        await createManualFundEntryAction({
          memberId: manualFund.memberId,
          amount: Number(manualFund.amount),
          paymentMethod: manualFund.paymentMethod,
          note: manualFund.note,
        });
        setManualFund((current) => ({
          ...current,
          amount: "",
          note: "",
        }));
        setMessage("ম্যানুয়াল ফান্ড এন্ট্রি সফলভাবে যুক্ত হয়েছে।");
        router.refresh();
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : "কাজটি সম্পন্ন হয়নি।");
      }
    });
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <div className="space-y-6">
        <div className="rounded-[2rem] bg-white p-5 shadow-[0_20px_40px_rgba(0,0,0,0.05)] sm:p-6 lg:p-7">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-white">
              <CircleDollarSign className="size-6" />
            </div>
            <h3 className="headline-display text-xl font-extrabold text-primary sm:text-2xl lg:text-3xl">
              ম্যানুয়াল ফান্ড এন্ট্রি
            </h3>
          </div>

          <form onSubmit={submitManualFund} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-primary/70 bengali-copy">সদস্য</label>
              <select
                value={manualFund.memberId}
                onChange={(event) =>
                  setManualFund((current) => ({ ...current, memberId: event.target.value }))
                }
                className="w-full rounded-2xl border border-border bg-background px-4 py-4 outline-none"
              >
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} - {member.mobile}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-primary/70 bengali-copy">পরিমাণ</label>
              <input
                value={manualFund.amount}
                onChange={(event) =>
                  setManualFund((current) => ({ ...current, amount: event.target.value }))
                }
                type="number"
                min={100}
                className="w-full rounded-2xl border border-border bg-background px-4 py-4 outline-none"
                placeholder="৳ ০.০০"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-primary/70 bengali-copy">পেমেন্ট মেথড</label>
              <input
                value={manualFund.paymentMethod}
                onChange={(event) =>
                  setManualFund((current) => ({
                    ...current,
                    paymentMethod: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-border bg-background px-4 py-4 outline-none"
                placeholder="Cash / bKash / Nagad"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-primary/70 bengali-copy">নোট</label>
              <textarea
                value={manualFund.note}
                onChange={(event) =>
                  setManualFund((current) => ({ ...current, note: event.target.value }))
                }
                rows={3}
                className="w-full rounded-2xl border border-border bg-background px-4 py-4 outline-none"
                placeholder="ঐচ্ছিক তথ্য"
              />
            </div>

            {message ? (
              <div className="rounded-2xl bg-primary/10 px-4 py-3 text-sm text-primary bengali-copy">
                {message}
              </div>
            ) : null}
            {error ? (
              <div className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive bengali-copy">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-[1.4rem] bg-primary px-6 py-4 text-base font-bold text-white shadow-[0_16px_30px_rgba(0,56,32,0.18)] disabled:opacity-60"
            >
              {isPending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
            </button>
          </form>
        </div>

        <div className="rounded-[2rem] bg-[#f1ede4] p-5 shadow-[0_20px_40px_rgba(0,0,0,0.04)] sm:p-6 lg:p-7">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-[#ffd978] text-primary">
              <UserPlus2 className="size-6" />
            </div>
            <h3 className="headline-display text-xl font-extrabold text-primary sm:text-2xl lg:text-3xl">
              সদস্য আবেদন
            </h3>
          </div>
          <div className="mt-6 space-y-4">
            {pendingMembers.map((request) => (
              <div key={request.id} className="rounded-[1.5rem] bg-white p-5">
                <p className="text-base font-bold text-primary bengali-copy sm:text-lg">{request.name}</p>
                <p className="mt-1 text-sm text-primary/55">{request.mobile}</p>
                <p className="mt-3 text-base text-primary/70 bengali-copy">{request.address}</p>
                {request.note ? (
                  <p className="mt-2 text-sm text-primary/60 bengali-copy">{request.note}</p>
                ) : null}
                <div className="mt-4">
                  <RequestDecisionButtons requestId={request.id} variant="member" />
                </div>
              </div>
            ))}
            {pendingMembers.length === 0 ? (
              <div className="rounded-[1.5rem] bg-white/70 p-5 text-sm text-primary/55 bengali-copy">
                নতুন কোনো সদস্য আবেদন অপেক্ষমান নেই।
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] bg-[#f1ede4] p-5 shadow-[0_20px_40px_rgba(0,0,0,0.04)] sm:p-6 lg:p-7">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="headline-display text-xl font-extrabold text-primary sm:text-2xl lg:text-3xl">
            পেন্ডিং ফান্ড রিকোয়েস্ট
          </h3>
          <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-primary">
            {pendingFunds.length}টি
          </span>
        </div>
        <div className="space-y-4">
          {pendingFunds.map((entry) => (
            <div key={entry.id} className="rounded-[1.5rem] bg-white p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-base font-bold text-primary bengali-copy sm:text-lg">{entry.memberName}</p>
                  <p className="mt-1 text-sm text-primary/55">{entry.memberMobile}</p>
                  <p className="mt-3 text-base text-primary/70 bengali-copy">
                    {entry.note || entry.paymentMethod}
                  </p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-secondary">
                    {formatDate(entry.submittedDate)}
                  </p>
                </div>
                <div className="lg:text-right">
                  <p className="headline-display text-2xl font-extrabold text-primary sm:text-3xl">
                    {formatCurrency(entry.amount)}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <RequestDecisionButtons requestId={entry.id} variant="fund" />
              </div>
            </div>
          ))}

          {pendingFunds.length === 0 ? (
            <div className="rounded-[1.5rem] bg-white/70 p-5 text-sm text-primary/55 bengali-copy">
              বর্তমানে কোনো ফান্ড রিকোয়েস্ট অপেক্ষমাণ নেই।
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
