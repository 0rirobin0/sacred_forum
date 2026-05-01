"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CircleDollarSign, Plus, UserPlus2, X } from "lucide-react";

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
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);

  const pendingFunds = fundEntries.filter((entry) => entry.status === "pending");
  const pendingMembers = memberRequests.filter((entry) => entry.status === "pending");

  function openFundModal() {
    setError(null);
    setMessage(null);
    setIsFundModalOpen(true);
  }

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
        setIsFundModalOpen(false);
        router.refresh();
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : "কাজটি সম্পন্ন হয়নি।");
      }
    });
  }

  return (
    <section className="space-y-6">
      {isFundModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-[#ded6c8] bg-white p-5 shadow-[0_30px_60px_rgba(0,0,0,0.2)] sm:p-6 lg:p-7">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-white">
                  <CircleDollarSign className="size-6" />
                </div>
                <h3 className="headline-display text-xl font-extrabold text-primary sm:text-2xl lg:text-3xl">
                  ম্যানুয়াল ফান্ড এন্ট্রি
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFundModalOpen(false)}
                className="flex size-10 items-center justify-center rounded-full border border-primary/15 text-primary"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
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
                  {members.length === 0 ? (
                    <option value="">কোনো সদস্য নেই</option>
                  ) : (
                    members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} - {member.mobile}
                      </option>
                    ))
                  )}
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
                <label className="text-sm font-bold text-primary/70 bengali-copy">
                  পেমেন্ট মেথড
                </label>
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

              {error ? (
                <div className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive bengali-copy">
                  {error}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={isPending || members.length === 0}
                  className="flex-1 rounded-[1.4rem] bg-primary px-6 py-4 text-base font-bold text-white shadow-[0_16px_30px_rgba(0,56,32,0.18)] disabled:opacity-60"
                >
                  {isPending ? "সংরক্ষণ হচ্ছে..." : "ফান্ড যোগ করুন"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsFundModalOpen(false)}
                  className="rounded-[1.4rem] border border-primary/15 px-5 py-4 text-base font-bold text-primary"
                >
                  বাতিল
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <div className="rounded-[2rem] border border-[#ded6c8] bg-white p-5 shadow-[0_20px_40px_rgba(0,0,0,0.05)] sm:p-6 lg:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-white">
              <CircleDollarSign className="size-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">
                Add Fund
              </p>
              <h3 className="headline-display text-xl font-extrabold text-primary sm:text-2xl lg:text-3xl">
                ম্যানুয়াল ফান্ড এন্ট্রি
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={openFundModal}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
            disabled={members.length === 0}
          >
            <Plus className="size-4" />
            ফান্ড যোগ করুন
          </button>
        </div>

        {message ? (
          <div className="mt-5 rounded-2xl bg-primary/10 px-4 py-3 text-sm text-primary bengali-copy">
            {message}
          </div>
        ) : null}
      </div>

      <div className="rounded-[2rem] border border-[#ded6c8] bg-[#f1ede4] p-5 shadow-[0_20px_40px_rgba(0,0,0,0.04)] sm:p-6 lg:p-7">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="headline-display text-xl font-extrabold text-primary sm:text-2xl lg:text-3xl">
            পেন্ডিং ফান্ড রিকোয়েস্ট
          </h3>
          <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-primary">
            {pendingFunds.length}টি
          </span>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table min-w-[920px]">
            <thead>
              <tr className="text-left text-xs font-bold uppercase tracking-[0.18em] text-primary/60">
                <th className="px-4">সদস্য</th>
                <th className="px-4">মোবাইল</th>
                <th className="px-4">জমার তারিখ</th>
                <th className="px-4">পেমেন্ট</th>
                <th className="px-4">নোট</th>
                <th className="px-4 text-right">পরিমাণ</th>
                <th className="px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {pendingFunds.map((entry) => (
                <tr key={entry.id} className="bg-white shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
                  <td className="rounded-l-[1.25rem] px-4 py-4 font-bold text-primary bengali-copy">
                    {entry.memberName}
                  </td>
                  <td className="px-4 py-4 text-sm text-primary/65">{entry.memberMobile}</td>
                  <td className="px-4 py-4 text-sm text-primary/70">
                    {formatDate(entry.submittedDate)}
                  </td>
                  <td className="px-4 py-4 text-sm text-primary/70">{entry.paymentMethod}</td>
                  <td className="px-4 py-4 text-sm text-primary/60 bengali-copy">
                    {entry.note || "-"}
                  </td>
                  <td className="px-4 py-4 text-right text-base font-bold text-primary">
                    {formatCurrency(entry.amount)}
                  </td>
                  <td className="rounded-r-[1.25rem] px-4 py-4">
                    <div className="flex justify-end">
                      <RequestDecisionButtons requestId={entry.id} variant="fund" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pendingFunds.length === 0 ? (
          <div className="mt-4 rounded-[1.5rem] bg-white/70 p-5 text-sm text-primary/55 bengali-copy">
            বর্তমানে কোনো ফান্ড রিকোয়েস্ট অপেক্ষমাণ নেই।
          </div>
        ) : null}
      </div>

      <div className="rounded-[2rem] border border-[#ded6c8] bg-[#f1ede4] p-5 shadow-[0_20px_40px_rgba(0,0,0,0.04)] sm:p-6 lg:p-7">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-[#ffd978] text-primary">
              <UserPlus2 className="size-6" />
            </div>
            <h3 className="headline-display text-xl font-extrabold text-primary sm:text-2xl lg:text-3xl">
              সদস্য আবেদন
            </h3>
          </div>
          <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-primary">
            {pendingMembers.length}টি
          </span>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table min-w-[880px]">
            <thead>
              <tr className="text-left text-xs font-bold uppercase tracking-[0.18em] text-primary/60">
                <th className="px-4">নাম</th>
                <th className="px-4">মোবাইল</th>
                <th className="px-4">ঠিকানা</th>
                <th className="px-4">আবেদন তারিখ</th>
                <th className="px-4">নোট</th>
                <th className="px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {pendingMembers.map((request) => (
                <tr key={request.id} className="bg-white shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
                  <td className="rounded-l-[1.25rem] px-4 py-4 font-bold text-primary bengali-copy">
                    {request.name}
                  </td>
                  <td className="px-4 py-4 text-sm text-primary/65">{request.mobile}</td>
                  <td className="px-4 py-4 text-sm text-primary/70 bengali-copy">
                    {request.address}
                  </td>
                  <td className="px-4 py-4 text-sm text-primary/70">
                    {formatDate(request.submittedDate)}
                  </td>
                  <td className="px-4 py-4 text-sm text-primary/60 bengali-copy">
                    {request.note || "-"}
                  </td>
                  <td className="rounded-r-[1.25rem] px-4 py-4">
                    <div className="flex justify-end">
                      <RequestDecisionButtons requestId={request.id} variant="member" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pendingMembers.length === 0 ? (
          <div className="mt-4 rounded-[1.5rem] bg-white/70 p-5 text-sm text-primary/55 bengali-copy">
            নতুন কোনো সদস্য আবেদন অপেক্ষমান নেই।
          </div>
        ) : null}
      </div>
    </section>
  );
}
