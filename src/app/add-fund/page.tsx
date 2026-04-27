import { AddFundRequestForm } from "@/components/forms/add-fund-request-form";
import { PublicShell } from "@/components/public-shell";
import { History, ShieldCheck } from "lucide-react";
import { getAppData } from "@/lib/live-data";

export const dynamic = "force-dynamic";

export default async function AddFundPage() {
  const { members } = await getAppData();
  return (
    <PublicShell activePath="/add-fund">
      <section className="container-shell pb-24 pt-12 md:pt-16">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="headline-display text-5xl font-black text-primary sm:text-6xl">
            ফান্ড জমা দিন
          </h1>
          <p className="mt-4 text-xl text-secondary bengali-copy">
            বিকাশে টাকা পাঠানোর পর এই ফর্মটি পূরণ করুন
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-5xl rounded-[2.2rem] border border-border/50 bg-[#f5f1e9]/90 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.05)] sm:p-8 md:p-10">
          <AddFundRequestForm members={members.filter((member) => member.status === "active")} />
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="relative min-h-[320px] overflow-hidden rounded-[2rem] shadow-[0_18px_40px_rgba(0,0,0,0.10)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,224,141,0.28),_transparent_36%),linear-gradient(180deg,_#153f2c_0%,_#0b2418_100%)]" />
            <svg
              viewBox="0 0 800 600"
              className="absolute inset-0 h-full w-full opacity-90"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="glassGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f9edd0" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#93b39f" stopOpacity="0.08" />
                </linearGradient>
              </defs>
              <rect width="800" height="600" fill="transparent" />
              <ellipse cx="400" cy="560" rx="270" ry="28" fill="#081610" opacity="0.5" />
              <rect x="180" y="165" width="440" height="320" rx="22" fill="url(#glassGlow)" opacity="0.45" />
              <rect x="225" y="145" width="40" height="360" rx="20" fill="#e9d8aa" opacity="0.92" />
              <rect x="535" y="145" width="40" height="360" rx="20" fill="#e9d8aa" opacity="0.92" />
              <rect x="300" y="180" width="34" height="310" rx="17" fill="#d6c18a" opacity="0.88" />
              <rect x="466" y="180" width="34" height="310" rx="17" fill="#d6c18a" opacity="0.88" />
              <path d="M240 210C240 120 312 64 400 64C488 64 560 120 560 210V238H240V210Z" fill="#b79b51" opacity="0.95" />
              <path d="M260 225C260 146 322 100 400 100C478 100 540 146 540 225V238H260V225Z" fill="#1d4c34" />
              <path d="M384 78H416V160H384Z" fill="#f4e7bf" opacity="0.95" />
              <circle cx="400" cy="66" r="18" fill="#f4e7bf" opacity="0.95" />
              <path d="M338 252C338 212 366 178 400 178C434 178 462 212 462 252V415H338V252Z" fill="#122f21" opacity="0.82" />
              <path d="M360 252C360 226 378 204 400 204C422 204 440 226 440 252V390H360V252Z" fill="#7ea6b3" opacity="0.75" />
              <path d="M387 204H413V390H387Z" fill="#d9edf2" opacity="0.72" />
              <path d="M360 282H440" stroke="#d9edf2" strokeWidth="8" opacity="0.65" />
              <path d="M360 322H440" stroke="#d9edf2" strokeWidth="8" opacity="0.65" />
              <path d="M360 362H440" stroke="#d9edf2" strokeWidth="8" opacity="0.65" />
              <path d="M182 510L620 510" stroke="#f7e7bc" strokeWidth="8" opacity="0.5" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/25 to-transparent" />
            <div className="absolute inset-x-6 bottom-6 text-white">
              <p className="text-sm text-white/80 bengali-copy">
                আপনার দান আমানত হিসেবে রক্ষিত
              </p>
              <h2 className="headline-display mt-2 text-4xl font-black">
                নিরাপদ ও স্বচ্ছ লেনদেন
              </h2>
            </div>
          </div>

          <div className="space-y-8 py-3">
            <div className="flex items-start gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-accent/70 text-accent-foreground">
                <ShieldCheck className="size-6" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-primary bengali-copy">
                  নির্ভরযোগ্যতা
                </h3>
                <p className="mt-3 text-lg text-foreground/75 bengali-copy">
                  আপনার প্রতিটি অনুরোধ আমাদের এডমিন প্যানেল দ্বারা যাচাইকৃত হওয়ার
                  পর আপডেট করা হয়।
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-accent/70 text-accent-foreground">
                <History className="size-6" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-primary bengali-copy">
                  সহজ ট্র্যাকিং
                </h3>
                <p className="mt-3 text-lg text-foreground/75 bengali-copy">
                  যেকোনো সময় আপনার অতীতের সকল লেনদেনের ইতিহাস দেখে নিতে পারেন
                  ‘ফান্ড হিস্ট্রি’ থেকে।
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
