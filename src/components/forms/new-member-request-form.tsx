"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createMemberRequestAction } from "@/app/actions/public-actions";

export function NewMemberRequestForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (!name.trim() || !mobile.trim() || !address.trim()) {
      setError("নাম, মোবাইল নম্বর এবং ঠিকানা পূরণ করা আবশ্যক।");
      return;
    }

    startTransition(async () => {
      try {
        await createMemberRequestAction({ name, mobile, address, note });
        setName("");
        setMobile("");
        setAddress("");
        setNote("");
        setMessage("আপনার আবেদন এডমিনের কাছে পাঠানো হয়েছে। অনুগ্রহ করে ১ বা ২ দিন অপেক্ষা করুন। নিশ্চিত হলে এডমিন আপনাকে যোগাযোগ করবেন।");
        router.refresh();
      } catch (submitError) {
        const nextError =
          submitError instanceof Error
            ? submitError.message
            : "আবেদন জমা দেওয়া যায়নি। আবার চেষ্টা করুন।";
        setError(nextError);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-bold text-primary/70">পূর্ণ নাম</label>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-2xl border border-border bg-background px-4 py-4 outline-none focus:border-primary"
          placeholder="আপনার পূর্ণ নাম লিখুন"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-bold text-primary/70">মোবাইল নম্বর</label>
        <input
          value={mobile}
          onChange={(event) => setMobile(event.target.value)}
          className="w-full rounded-2xl border border-border bg-background px-4 py-4 outline-none focus:border-primary"
          placeholder="01XXXXXXXXX"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-bold text-primary/70">ঠিকানা</label>
        <textarea
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          rows={3}
          className="w-full rounded-2xl border border-border bg-background px-4 py-4 outline-none focus:border-primary"
          placeholder="বর্তমান ঠিকানা লিখুন"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-bold text-primary/70">অতিরিক্ত নোট</label>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={4}
          className="w-full rounded-2xl border border-border bg-background px-4 py-4 outline-none focus:border-primary"
          placeholder="ঐচ্ছিক তথ্য"
        />
      </div>

      {message ? (
        <div className="rounded-2xl bg-primary/10 px-4 py-3 text-sm font-medium text-primary bengali-copy">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive bengali-copy">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-2xl bg-primary px-6 py-4 text-lg font-bold text-primary-foreground shadow-lg transition-transform hover:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "জমা হচ্ছে..." : "সদস্য হওয়ার আবেদন পাঠান"}
      </button>
    </form>
  );
}
