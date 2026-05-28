"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CircleDollarSign, Plus, Wallet2, X } from "lucide-react";

import { createManualFundEntryAction } from "@/app/actions/admin-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, formatDate } from "@/lib/format";
import type { FundEntry, Member } from "@/lib/types";

type AdminApprovalsClientProps = {
  currentBalance: number;
  totalFund: number;
  fundEntries: FundEntry[];
  members: Member[];
};

const monthOptions = Array.from({ length: 12 }, (_, index) => {
  const key = String(index + 1).padStart(2, "0");
  const label = new Intl.DateTimeFormat("bn-BD", { month: "long" }).format(
    new Date(2000, index, 1),
  );
  return { key, label };
});

const yearOptions = (() => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, index) => {
    const year = String(currentYear - index);
    return {
      key: year,
      label: new Intl.NumberFormat("bn-BD").format(Number(year)),
    };
  });
})();

export function AdminApprovalsClient({
  currentBalance,
  totalFund,
  fundEntries,
  members,
}: AdminApprovalsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [manualFund, setManualFund] = useState({
    memberId: members[0]?.id ?? "",
    amount: "",
    month: String(new Date().getMonth() + 1).padStart(2, "0"),
    year: String(new Date().getFullYear()),
    paymentMethod: "Cash",
    note: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);

  const approvedFunds = fundEntries.filter((entry) => entry.status === "approved");
  const recentAddedFunds = approvedFunds.slice(0, 8);

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
          month: manualFund.month,
          year: manualFund.year,
          paymentMethod: manualFund.paymentMethod,
          note: manualFund.note,
        });
        setManualFund((current) => ({
          ...current,
          amount: "",
          note: "",
          month: String(new Date().getMonth() + 1).padStart(2, "0"),
          year: String(new Date().getFullYear()),
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
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-border bg-white p-5 shadow-[0_30px_60px_rgba(0,0,0,0.2)] sm:p-6 lg:p-7">
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
                className="flex size-20 items-center justify-center rounded-full border border-primary/15 text-primary"
                aria-label="Close"
              >
                <X className="size-10" />
              </button>
            </div>

            <form onSubmit={submitManualFund} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-primary/70 bengali-copy">সদস্য</label>
                <Select
                  value={manualFund.memberId}
                  onChange={(event) =>
                    setManualFund((current) => ({ ...current, memberId: event.target.value }))
                  }
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
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-primary/70 bengali-copy">পরিমাণ</label>
                <Input
                  value={manualFund.amount}
                  onChange={(event) =>
                    setManualFund((current) => ({ ...current, amount: event.target.value }))
                  }
                  type="number"
                  min={100}
                  placeholder="৳ ০.০০"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-primary/70 bengali-copy">মাস</label>
                  <Select
                    value={manualFund.month}
                    onChange={(event) =>
                      setManualFund((current) => ({ ...current, month: event.target.value }))
                    }
                  >
                    {monthOptions.map((option) => (
                      <option key={option.key} value={option.key}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-primary/70 bengali-copy">বছর</label>
                  <Select
                    value={manualFund.year}
                    onChange={(event) =>
                      setManualFund((current) => ({ ...current, year: event.target.value }))
                    }
                  >
                    {yearOptions.map((option) => (
                      <option key={option.key} value={option.key}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-primary/70 bengali-copy">
                  পেমেন্ট মেথড
                </label>
                <Input
                  value={manualFund.paymentMethod}
                  onChange={(event) =>
                    setManualFund((current) => ({
                      ...current,
                      paymentMethod: event.target.value,
                    }))
                  }
                  placeholder="Cash / bKash / Nagad"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-primary/70 bengali-copy">নোট</label>
                <Textarea
                  value={manualFund.note}
                  onChange={(event) =>
                    setManualFund((current) => ({ ...current, note: event.target.value }))
                  }
                  rows={3}
                  placeholder="ঐচ্ছিক তথ্য"
                />
              </div>

              {error ? (
                <div className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive bengali-copy">
                  {error}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="submit" disabled={isPending || members.length === 0} className="flex-1">
                  {isPending ? "সংরক্ষণ হচ্ছে..." : "ফান্ড যোগ করুন"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFundModalOpen(false)}
                >
                  বাতিল
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="bg-primary text-primary-foreground">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary-foreground/70">
                  Total Fund
                </p>
                <h3 className="mt-3 headline-display text-2xl font-extrabold sm:text-3xl lg:text-4xl">
                  {formatCurrency(totalFund)}
                </h3>
                <p className="mt-3 text-sm text-primary-foreground/75 bengali-copy sm:text-base">
                  এখন পর্যন্ত অনুমোদিত সব ফান্ডের মোট পরিমাণ।
                </p>
              </div>
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/12 text-white">
                <Wallet2 className="size-6" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Badge variant="accent" className="bg-white/15 text-white">
              বর্তমান ব্যালেন্স {formatCurrency(currentBalance)}
            </Badge>
            <Badge variant="outline" className="border-white/30 text-white">
              অনুমোদিত ফান্ড {approvedFunds.length}টি
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-white">
                  <CircleDollarSign className="size-6" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">
                    Add Fund
                  </p>
                  <CardTitle className="text-xl sm:text-2xl lg:text-3xl">
                    ম্যানুয়াল ফান্ড এন্ট্রি
                  </CardTitle>
                </div>
              </div>
              <Button type="button" onClick={openFundModal} disabled={members.length === 0}>
                <Plus className="size-4" />
                ফান্ড যোগ করুন
              </Button>
            </div>
          </CardHeader>

          {message ? (
            <CardContent>
              <div className="rounded-2xl bg-primary/10 px-4 py-3 text-sm text-primary bengali-copy">
                {message}
              </div>
            </CardContent>
          ) : null}
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">
                Fund Added History
              </p>
              <CardTitle className="mt-2 text-xl sm:text-2xl lg:text-3xl">
                সর্বশেষ ফান্ড হিস্ট্রি
              </CardTitle>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline">{approvedFunds.length}টি</Badge>
              <Link
                href="/admin/financial-analytics"
                className="rounded-full border border-primary/15 px-4 py-2 text-sm font-bold text-primary"
              >
                সব হিস্ট্রি দেখুন
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAddedFunds.map((entry) => (
              <div
                key={entry.id}
                className="rounded-[1.5rem] border border-border/70 bg-muted/30 p-4 sm:p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold text-foreground bengali-copy sm:text-lg">
                      {entry.memberName}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {entry.memberMobile} • {entry.paymentMethod}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground bengali-copy">
                      {entry.note?.trim() ? entry.note : "কোনো অতিরিক্ত নোট নেই"}
                    </p>
                  </div>
                  <div className="shrink-0 lg:text-right">
                    <p className="headline-display text-2xl font-extrabold text-foreground">
                      {formatCurrency(entry.amount)}
                    </p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-secondary">
                      {formatDate(entry.approvedDate ?? entry.submittedDate)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {recentAddedFunds.length === 0 ? (
            <div className="mt-4 rounded-[1.5rem] bg-muted/60 p-5 text-sm text-muted-foreground bengali-copy">
              এখনো কোনো অনুমোদিত বা যোগ করা ফান্ড হিস্ট্রি নেই।
            </div>
          ) : null}
        </CardContent>
      </Card>

    </section>
  );
}
