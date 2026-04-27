"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, CircleAlert, Copy, ShieldCheck } from "lucide-react";
import { useState } from "react";

const bkashNumber = "০১৭০৫৫২০৭৮০";
const bkashNumberAscii = "01705520780";

export function BkashCard() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(bkashNumberAscii);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-[2rem] bg-[#e11b68] p-6 text-white shadow-[0_18px_40px_rgba(225,27,104,0.28)] sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex size-16 items-center justify-center rounded-2xl border border-white/40 bg-white/10 shadow-[0_10px_18px_rgba(0,0,0,0.12)]">
          <div className="relative h-12 w-10 overflow-hidden rounded-lg bg-white shadow-[0_8px_18px_rgba(0,0,0,0.15)]">
            <Image
              src="/bkash.svg"
              alt="bKash logo"
              fill
              className="object-contain p-1.5"
            />
          </div>
        </div>
        <span className="rounded-full bg-white/15 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em]">
          Official Payment
        </span>
      </div>

      <div className="mt-8 rounded-[1.5rem] border border-white/15 bg-black/10 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-white/80 bengali-copy">বিকাশ নম্বর (পার্সোনাল)</p>
          <div className="flex items-center gap-2 rounded-full bg-emerald-400/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-100">
            <ShieldCheck className="size-3.5" />
            Verified
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <p className="headline-display text-3xl font-extrabold tracking-[0.04em] text-white sm:text-4xl">
            {bkashNumber}
          </p>
          <button
            type="button"
            onClick={handleCopy}
            className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition-colors hover:bg-white/18"
            aria-label="bKash number copy"
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-white/75 bengali-copy">
          <span className="rounded-full bg-white/10 px-3 py-1.5">Send Money</span>
          <span className="rounded-full bg-white/10 px-3 py-1.5">Personal bKash</span>
          <span className="rounded-full bg-white/10 px-3 py-1.5">Minimum ৳ 100</span>
        </div>
      </div>

      <div className="mt-6 rounded-[1.5rem] bg-white/8 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">
          Quick Steps
        </p>
        <div className="mt-3 space-y-2 text-sm text-white/85 bengali-copy">
          <p>১. bKash থেকে এই নম্বরে Send Money করুন</p>
          <p>২. টাকা পাঠানোর পর ফান্ড ফর্মে তথ্য দিন</p>
          <p>৩. এডমিন যাচাইয়ের পর আপনার অনুদান যুক্ত হবে</p>
        </div>
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-[1.5rem] border border-white/15 bg-white/8 p-4">
        <CircleAlert className="mt-0.5 size-4 shrink-0 text-white/80" />
        <p className="text-sm text-white/85 bengali-copy">
          কপি বাটন চাপলে ইংরেজি সংখ্যায় নম্বর কপি হবে, যাতে bKash অ্যাপে সরাসরি
          ব্যবহার করা সহজ হয়।
        </p>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-2xl bg-white px-6 py-4 text-sm font-bold text-[#e11b68] shadow-[0_10px_20px_rgba(0,0,0,0.08)]"
        >
          {copied ? "নম্বর কপি হয়েছে" : "নম্বর কপি করুন"}
        </button>
        <Link
          href="/add-fund"
          className="inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-4 text-sm font-bold text-primary-foreground shadow-[0_10px_20px_rgba(0,0,0,0.14)]"
        >
          ফান্ড জমা দিন
        </Link>
      </div>
    </div>
  );
}
