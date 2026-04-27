"use client";

import { useMemo, useState, useTransition } from "react";
import { Banknote, CheckCheck, NotebookPen, Search } from "lucide-react";
import { useRouter } from "next/navigation";

import { createFundRequestAction } from "@/app/actions/public-actions";
import type { Member } from "@/lib/types";

type AddFundRequestFormProps = {
  members: Member[];
};

export function AddFundRequestForm({ members }: AddFundRequestFormProps) {
  const router = useRouter();
  const [memberQuery, setMemberQuery] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const results = useMemo(() => {
    const query = memberQuery.trim().toLowerCase();
    if (!query) return members;
    return members.filter(
      (member) =>
        member.name.toLowerCase().includes(query) ||
        member.mobile.toLowerCase().includes(query) ||
        member.id.toLowerCase().includes(query),
    );
  }, [members, memberQuery]);

  const selectedMember = useMemo(() => {
    const query = memberQuery.trim().toLowerCase();
    if (!query) return undefined;

    const exactMatch = members.find((member) => {
      const fullLabel = `${member.name} • ${member.mobile}`.toLowerCase();
      return (
        member.id.toLowerCase() === query ||
        member.name.toLowerCase() === query ||
        member.mobile.toLowerCase() === query ||
        fullLabel === query
      );
    });

    if (exactMatch) return exactMatch;
    if (results.length === 1) return results[0];

    return undefined;
  }, [memberQuery, members, results]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    const numericAmount = Number(amount);

    if (!selectedMember) {
      setError("সদস্য তালিকা থেকে একজন সদস্য নির্বাচন করুন।");
      return;
    }

    if (!numericAmount || numericAmount < 100) {
      setError("ফান্ডের পরিমাণ কমপক্ষে ১০০ টাকা হতে হবে।");
      return;
    }

    startTransition(async () => {
      try {
        await createFundRequestAction({
          memberId: selectedMember.id,
          amount: numericAmount,
          note,
        });
        setMemberQuery("");
        setAmount("");
        setNote("");
        setMessage("আপনার ফান্ড রিকোয়েস্ট গ্রহণ করা হয়েছে এবং এডমিন যাচাইয়ের অপেক্ষায় আছে।");
        router.refresh();
      } catch (submitError) {
        const nextError =
          submitError instanceof Error
            ? submitError.message
            : "রিকোয়েস্ট পাঠানো যায়নি। আবার চেষ্টা করুন।";
        setError(nextError);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="space-y-3">
        <label className="text-lg font-bold text-primary bengali-copy">
          সদস্য নির্বাচন
        </label>
        <div className="relative overflow-hidden rounded-[1.7rem] border border-border/60 bg-white shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
          <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-[#95a8a0]" />
          <input
            list="member-suggestions"
            value={memberQuery}
            onChange={(event) => setMemberQuery(event.target.value)}
            placeholder="উদা: আব্দুল করিম অথবা ০১৭১..."
            className="w-full border-0 bg-transparent py-5 pl-14 pr-4 text-lg text-primary outline-none placeholder:text-[#768198]"
          />
        </div>
        <datalist id="member-suggestions">
          {results.map((member) => (
            <option key={member.id} value={`${member.name} • ${member.mobile}`} />
          ))}
        </datalist>
        <p className="text-xs text-muted-foreground bengali-copy">
          নাম বা মোবাইল নম্বর টাইপ করুন, তারপর তালিকা থেকে পছন্দ করুন
        </p>
        {selectedMember ? (
          <div className="rounded-[1.25rem] bg-primary/8 px-4 py-3 text-sm text-primary bengali-copy">
            নির্বাচিত সদস্য: {selectedMember.name} ({selectedMember.mobile})
          </div>
        ) : null}
      </div>

      <div className="space-y-3">
        <label className="text-lg font-bold text-primary bengali-copy">টাকার পরিমাণ</label>
        <div className="relative overflow-hidden rounded-[1.7rem] border border-border/60 bg-white shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
          <Banknote className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-[#95a8a0]" />
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            type="number"
            min={100}
            placeholder="৳ ০০.০০"
            className="w-full border-0 bg-transparent py-5 pl-14 pr-4 text-[2rem] font-bold text-[#667085] outline-none placeholder:text-[#667085]"
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-lg font-bold text-primary bengali-copy">
          নোট (ঐচ্ছিক)
        </label>
        <div className="relative overflow-hidden rounded-[1.7rem] border border-border/60 bg-white shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
          <NotebookPen className="pointer-events-none absolute left-5 top-5 size-5 text-[#95a8a0]" />
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={4}
            placeholder="অতিরিক্ত কোনো তথ্য থাকলে এখানে লিখুন..."
            className="w-full resize-none border-0 bg-transparent py-5 pl-14 pr-4 text-lg text-[#667085] outline-none placeholder:text-[#667085]"
          />
        </div>
      </div>

      {message ? (
        <div className="rounded-[1.5rem] bg-primary/10 px-4 py-4 text-sm font-medium text-primary bengali-copy">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-[1.5rem] bg-destructive/10 px-4 py-4 text-sm font-medium text-destructive bengali-copy">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center gap-3 rounded-[1.5rem] bg-primary px-6 py-5 text-2xl font-bold text-primary-foreground shadow-[0_18px_34px_rgba(0,56,32,0.18)] transition-transform hover:scale-[0.995] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "জমা হচ্ছে..." : "অনুরোধ জমা দিন"}
        <CheckCheck className="size-6" />
      </button>
    </form>
  );
}
