import Image from "next/image";
import Link from "next/link";
import {
  BadgeAlert,
  ArrowRight,
  BanknoteArrowDown,
  CircleDollarSign,
  Coins,
  HandCoins,
  UserPlus2,
  Users,
  Wallet,
} from "lucide-react";

import { BkashCard } from "@/components/home/bkash-card";
import { PublicShell } from "@/components/public-shell";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency } from "@/lib/format";
import { getAppData } from "@/lib/live-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { breakingNews, recentActivities, summaryStats } = await getAppData();
  const latestFunds = recentActivities.filter((activity) => activity.type === "fund");
  const latestExpenses = recentActivities.filter((activity) => activity.type === "expense");
  const shouldShowBreakingNews = Boolean(
    breakingNews?.isActive && breakingNews?.message?.trim(),
  );
  const latestTransactions = [
    ...latestExpenses.slice(0, 1),
    ...latestFunds.slice(0, 2),
  ]
    .filter((activity, index, items) => items.findIndex((item) => item.id === activity.id) === index)
    .slice(0, 3)
    .map((activity) => {
      const isExpense = activity.type === "expense";

      return {
        id: activity.id,
        title:
          activity.type === "fund"
            ? activity.title.replace(" ফান্ড জমা দিয়েছেন", "")
            : `খরচ: ${activity.title}`,
        date: activity.subtitle,
        amount: `${isExpense ? "-" : "+"}${formatCurrency(activity.amount ?? 0)}`,
        tone: isExpense ? "text-red-500" : "text-emerald-600",
        status: isExpense ? "EXPENSE" : "APPROVED",
        statusTone: isExpense ? "text-red-500" : "text-emerald-600",
      };
    });

  return (
    <PublicShell activePath="/">
      <div className="container-shell border-primary/40 lg:border-x">
      {shouldShowBreakingNews ? (
        <section className="pt-8 md:pt-10">
          <div className="overflow-hidden rounded-[1.75rem] border border-[#ffb26b]/50 bg-[linear-gradient(90deg,#fff7e8_0%,#ffe4b8_18%,#ffd17d_100%)] shadow-[0_18px_38px_rgba(191,116,8,0.16)]">
            <div className="flex flex-col gap-3 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:gap-0 lg:px-6">
              <div className="flex shrink-0 items-center gap-3 text-primary lg:pr-6">
                <div className="flex size-11 items-center justify-center rounded-full bg-primary text-white shadow-[0_10px_24px_rgba(0,56,32,0.2)]">
                  <BadgeAlert className="size-5" />
                </div>
                <div>
                  <p className="headline-display text-sm font-black uppercase tracking-[0.24em] text-primary/70">
                    Breaking News
                  </p>
                  <p className="text-sm font-semibold text-primary/75 bengali-copy">
                    Latest forum update
                  </p>
                </div>
              </div>

              <div className="relative min-w-0 overflow-hidden rounded-[1.2rem] bg-white/45 py-3 lg:flex-1">
                <div className="breaking-news-marquee">
                  <span className="breaking-news-track bengali-copy text-sm font-semibold text-primary sm:text-base">
                    <span>{breakingNews?.message}</span>
                    <span aria-hidden="true">{breakingNews?.message}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}
      <section className="pb-16 pt-12 md:pt-16 lg:pb-18 lg:pt-20">
        <div className="relative overflow-hidden rounded-[2.6rem] border border-white/60 shadow-[0_18px_40px_rgba(0,0,0,0.08)]">
          <Image
            src="/hero.png"
            alt="হাজী বাড়ি জামে মসজিদের হোমপেজ হিরো ছবি"
            width={1142}
            height={1142}
            priority
            className="h-[480px] w-full object-cover sm:h-[560px] lg:h-[680px]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,25,14,0.8)_0%,rgba(0,56,32,0.58)_34%,rgba(0,56,32,0.16)_62%,rgba(0,0,0,0.08)_100%)]" />
          <div className="absolute inset-0 flex items-end p-6 sm:p-8 lg:items-center lg:p-12">
            <div className="max-w-3xl space-y-6 text-white">
              <span className="inline-flex items-center rounded-full bg-white/14 px-4 py-2 text-xs font-bold text-white bengali-copy backdrop-blur-sm">
                ✦ স্বাগতম ফোরামে
              </span>
              <div className="space-y-5">
                <h1 className="headline-display max-w-4xl text-4xl font-extrabold leading-tight text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.35)] sm:text-5xl md:text-5xl lg:text-6xl">
                  আসসালামু আলাইকুম
                </h1>
                <p className="max-w-2xl text-base text-white/88 bengali-copy sm:text-lg">
                  হাজী বাড়ি জামে মসজিদ উন্নয়ন ফোরামের ডিজিটাল প্ল্যাটফর্মে আপনাকে
                  স্বাগতম। আমরা স্বচ্ছতা ও নিষ্ঠার সাথে মসজিদের উন্নয়নে কাজ করে
                  যাচ্ছি।
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                <Link
                  href="/add-fund"
                  className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-secondary px-7 py-4 text-base font-bold text-secondary-foreground shadow-[0_14px_30px_rgba(116,91,4,0.28)] hover:-translate-y-px sm:w-auto"
                >
                  <HandCoins className="size-5" />
                  ফান্ড জমা দিন
                </Link>
                <Link
                  href="/new-member"
                  className="inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-white/25 bg-white/10 px-7 py-4 text-base font-bold text-white backdrop-blur-sm sm:w-auto"
                >
                  <UserPlus2 className="size-5" />
                  নতুন সদস্য হোন
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-8 md:pb-9 lg:pb-10">
        <div className="mb-6">
          <h2 className="headline-display text-3xl font-extrabold text-primary sm:text-4xl">ফান্ড সারাংশ</h2>
          <p className="mt-2 text-sm text-muted-foreground bengali-copy">
            মসজিদ উন্নয়ন তহবিলের রিয়েল-টাইম আপডেট
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="মোট জমা"
            value={formatCurrency(summaryStats.totalFund)}
            description=""
            icon={CircleDollarSign}
          />
          <StatCard
            title="মোট খরচ"
            value={formatCurrency(summaryStats.totalExpense)}
            description=""
            icon={BanknoteArrowDown}
            tone="accent"
          />
          <StatCard
            title="বর্তমান ব্যালেন্স"
            value={formatCurrency(summaryStats.currentBalance)}
            description=""
            icon={Wallet}
            tone="primary"
          />
          <StatCard
            title="মোট সদস্য"
            value={`${summaryStats.totalMembers} জন`}
            description=""
            icon={Users}
          />
        </div>
      </section>

      <section className="grid gap-5 pb-10 lg:gap-6 lg:pb-12 lg:grid-cols-[0.9fr_1.1fr]">
        <BkashCard />

        <div className="rounded-[2rem] bg-muted/55 p-5 shadow-[0_14px_30px_rgba(0,0,0,0.05)] sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="headline-display flex items-center gap-2 text-2xl font-bold text-primary sm:text-3xl">
              <ArrowRight className="size-5 rotate-180 text-secondary" />
              সাম্প্রতিক লেনদেন
            </h2>
            <Link href="/fund-history" className="text-sm font-semibold text-primary sm:text-base">
              সবগুলো দেখুন
            </Link>
          </div>
          <p className="mb-4 text-sm text-muted-foreground bengali-copy">
            এখানে সাম্প্রতিক জমা এবং খরচ দুটোই দেখানো হচ্ছে।
          </p>
          <div className="space-y-4">
            {latestTransactions.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-[1.5rem] bg-white p-5 shadow-[0_10px_22px_rgba(0,0,0,0.04)] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex size-11 items-center justify-center rounded-full ${
                      item.status === "PAID" ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    <ArrowRight className={`size-4 ${item.status === "PAID" ? "-rotate-45" : "rotate-45"}`} />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-primary bengali-copy sm:text-lg">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground bengali-copy">{item.date}</p>
                  </div>
                </div>
                <div className="sm:text-right">
                  <p className={`headline-display text-xl font-bold sm:text-2xl ${item.tone}`}>{item.amount}</p>
                  <p className={`mt-1 text-xs font-semibold uppercase tracking-[0.16em] ${item.statusTone}`}>
                    {item.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-14 lg:pb-16">
        <div className="overflow-hidden rounded-[2.3rem] bg-primary px-6 py-12 text-center text-primary-foreground shadow-[0_24px_50px_rgba(0,56,32,0.22)] sm:px-10 md:py-14">
          <h2 className="headline-display text-3xl font-extrabold text-white sm:text-4xl">
            সদকা জারিয়াতে অংশ নিন
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm text-primary-foreground/75 bengali-copy sm:text-base">
            আপনার সামান্য দান মসজিদের উন্নয়নে বিশাল ভূমিকা রাখতে পারে। আজই
            আমাদের ফোরামের গর্বিত সদস্য হোন অথবা এককালীন অনুদান প্রদান করুন।
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/add-fund"
              className="inline-flex items-center justify-center gap-3 rounded-2xl bg-secondary px-8 py-4 text-base font-bold text-secondary-foreground shadow-[0_14px_28px_rgba(116,91,4,0.28)]"
            >
              <Coins className="size-5" />
              ফান্ড জমা দিন
            </Link>
            <Link
              href="/new-member"
              className="inline-flex items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-8 py-4 text-base font-bold text-white"
            >
              <Users className="size-5" />
              নতুন সদস্য হোন
            </Link>
          </div>
        </div>
      </section>
      </div>
    </PublicShell>
  );
}
