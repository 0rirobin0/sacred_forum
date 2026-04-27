import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Download,
} from "lucide-react";

import { AdminBreakingNewsClient } from "@/components/admin/admin-breaking-news-client";
import { AdminShell } from "@/components/admin/admin-shell";
import { RequestDecisionButtons } from "@/components/admin/request-decision-buttons";
import { requireAdminSession } from "@/lib/admin-auth";
import { formatCurrency, formatDate } from "@/lib/format";
import { getAppData } from "@/lib/live-data";

export default async function AdminDashboardPage() {
  const isLoggedIn = await requireAdminSession();

  if (!isLoggedIn) {
    redirect("/admin/login");
  }

  const { breakingNews, fundEntries, memberRequests, monthlyTrend, summaryStats, topContributors } =
    await getAppData();
  const pendingFunds = fundEntries.filter((entry) => entry.status === "pending").slice(0, 3);
  const latestMemberRequests = memberRequests
    .filter((entry) => entry.status === "pending")
    .slice(0, 3);
  const maxMonthlyValue = monthlyTrend.reduce((max, point) => {
    return Math.max(max, point.collection, point.expense);
  }, 0);
  const yAxisMax = maxMonthlyValue > 0 ? Math.ceil(maxMonthlyValue / 1000) * 1000 : 1000;
  const yAxisTicks = Array.from({ length: 5 }).map((_, index) => {
    return Math.round((yAxisMax * (4 - index)) / 4);
  });
  const chartBarMaxHeight = 240;
  const compactNumber = new Intl.NumberFormat("bn-BD", {
    notation: "compact",
    maximumFractionDigits: 1,
  });

  return (
    <AdminShell
      activePath="/admin"
      title="হাজী বাড়ি জামে মসজিদ উন্নয়ন ফোরাম"
      description={`অ্যাডমিন ড্যাশবোর্ড • আজ ${formatDate(new Date().toISOString())}`}
    >
      <section className="grid gap-4 md:grid-cols-2 lg:gap-6 xl:grid-cols-3">
        <div className="rounded-[2rem] bg-primary p-5 text-primary-foreground shadow-[0_24px_50px_rgba(0,56,32,0.16)] sm:p-6 md:p-5 lg:p-8">
              <p className="text-sm font-bold text-primary-foreground/70 bengali-copy sm:text-base">
                মোট তহবিল ব্যালেন্স
              </p>
              <p className="mt-4 headline-display text-2xl font-extrabold sm:text-3xl md:text-2xl lg:mt-5 lg:text-4xl">
                {formatCurrency(summaryStats.currentBalance)}
              </p>
              <p className="mt-6 text-sm text-[#90c5a5] bengali-copy sm:text-base lg:mt-8">
                ↗ গত মাস থেকে ১২% বৃদ্ধি
              </p>
            </div>

            <div className="rounded-[2rem] bg-[#f1ede4] p-5 shadow-[0_20px_40px_rgba(0,0,0,0.04)] sm:p-6 md:p-5 lg:p-8">
              <p className="text-base font-bold text-primary bengali-copy sm:text-lg">পেন্ডিং অনুরোধ</p>
              <p className="mt-4 headline-display text-2xl font-extrabold text-primary sm:text-3xl md:text-2xl lg:mt-6 lg:text-4xl">
                {summaryStats.pendingFundRequests}টি
              </p>
              <p className="mt-6 text-sm font-bold text-[#d93025] bengali-copy sm:text-base lg:mt-8">
                ! ৩টি অনুরোধ জরুরি ভিত্তিতে প্রয়োজন
              </p>
            </div>

            <div className="rounded-[2rem] bg-[#f1ede4] p-5 shadow-[0_20px_40px_rgba(0,0,0,0.04)] sm:p-6 md:p-5 lg:p-8">
              <p className="text-base font-bold text-primary bengali-copy sm:text-lg">নতুন সদস্য আবেদন</p>
              <p className="mt-4 headline-display text-2xl font-extrabold text-primary sm:text-3xl md:text-2xl lg:mt-6 lg:text-4xl">
                {summaryStats.newMemberRequests} জন
              </p>
              <p className="mt-6 text-sm font-bold text-secondary bengali-copy sm:text-base lg:mt-8">
                ↝ যাচাইকরণের অপেক্ষায়
              </p>
            </div>
      </section>

      <section className="mt-6 grid gap-4 lg:mt-8 lg:gap-6 xl:grid-cols-[1.2fr_0.55fr]">
        <div className="rounded-[2.4rem] bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,0.05)] sm:p-6 md:p-6 lg:p-10">
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="headline-display text-lg font-extrabold text-primary sm:text-xl lg:text-2xl">
                  মাসিক আয় ও ব্যয়
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-sm font-bold bengali-copy sm:text-base">
                  <div className="flex items-center gap-2">
                    <span className="size-4 rounded-full bg-primary" />
                    আয়
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-4 rounded-full bg-secondary" />
                    ব্যয়
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-120 md:min-w-140">
                  <div className="mb-4 flex items-center justify-between text-sm font-semibold text-primary/75 bengali-copy sm:text-base">
                    <p>Y-axis: টাকার পরিমাণ</p>
                    <p>X-axis: মাস</p>
                  </div>

                  <div className="grid grid-cols-[84px_1fr] gap-3">
                    <div className="relative h-80 pb-11 sm:h-90">
                      <div className="absolute inset-0 flex flex-col justify-between">
                        {yAxisTicks.map((tickValue) => (
                          <p key={tickValue} className="text-sm font-semibold text-primary/75 sm:text-base">
                            ৳{compactNumber.format(tickValue)}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="relative h-80 min-w-0 border-b border-l border-[#e2ddd2] pb-11 sm:h-90">
                      <div className="absolute inset-0 flex flex-col justify-between">
                        {yAxisTicks.map((tickValue) => (
                          <div key={tickValue} className="border-t border-[#ede8de]" />
                        ))}
                      </div>

                      <div className="relative z-10 flex h-full items-end justify-around gap-3 px-2 sm:gap-5 sm:px-4">
                        {monthlyTrend.map((item) => {
                          const collectionHeight =
                            item.collection > 0
                              ? Math.max((item.collection / yAxisMax) * chartBarMaxHeight, 14)
                              : 0;
                          const expenseHeight =
                            item.expense > 0
                              ? Math.max((item.expense / yAxisMax) * chartBarMaxHeight, 14)
                              : 0;

                          return (
                            <div key={item.month} className="flex min-w-15.5 flex-col items-center gap-2 sm:min-w-18">
                              <div className="flex items-end gap-2 sm:gap-3">
                                <div className="flex flex-col items-center gap-2">
                                  <p className="rounded-full bg-primary/8 px-2 py-0.5 text-xs font-semibold text-primary">
                                    আয় ৳{compactNumber.format(item.collection)}
                                  </p>
                                  <div
                                    className="w-5 rounded-t-[0.8rem] bg-primary sm:w-7"
                                    style={{ height: `${collectionHeight}px` }}
                                  />
                                </div>

                                <div className="flex flex-col items-center gap-2">
                                  <p className="rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-semibold text-secondary">
                                    ব্যয় ৳{compactNumber.format(item.expense)}
                                  </p>
                                  <div
                                    className="w-5 rounded-t-[0.8rem] bg-secondary sm:w-7"
                                    style={{ height: `${expenseHeight}px` }}
                                  />
                                </div>
                              </div>

                              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-primary/85 sm:text-base">
                                {item.month.slice(0, 3)}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 lg:space-y-6">
              <div className="rounded-[2rem] bg-[#f1ede4] p-5 shadow-[0_20px_40px_rgba(0,0,0,0.04)] sm:p-6 md:p-5 lg:p-7">
                <h3 className="headline-display text-lg font-extrabold text-primary sm:text-xl lg:text-2xl">
                  সর্বোচ্চ অবদানকারী
                </h3>
                <div className="mt-6 space-y-5 lg:mt-8 lg:space-y-7">
                  {topContributors.map((member, index) => (
                    <div key={member.id} className="flex items-center gap-4">
                      <div className="relative">
                        <div className="flex size-14 items-center justify-center rounded-full bg-primary text-base font-bold text-white shadow-[0_10px_24px_rgba(0,0,0,0.08)] sm:size-16 lg:size-17 lg:text-lg">
                          {member.name.slice(0, 1)}
                        </div>
                        <div className="absolute bottom-0 right-0 flex size-7 items-center justify-center rounded-full bg-[#c8a032] text-xs font-bold text-white">
                          {index + 1}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-base font-bold text-primary bengali-copy sm:text-lg">
                          {member.name}
                        </p>
                        <p className="mt-1 text-sm text-primary/65 bengali-copy sm:text-base">
                          {formatCurrency(member.totalContribution)} প্রদান করেছেন
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/admin/members"
                  className="mt-8 inline-flex w-full items-center justify-center rounded-[1.35rem] border border-primary/20 px-5 py-4 text-base font-bold text-primary hover:bg-primary hover:text-white lg:mt-10 lg:px-6"
                >
                  সদস্য তালিকা দেখুন
                </Link>
              </div>

              <AdminBreakingNewsClient initialBreakingNews={breakingNews} />
            </div>
      </section>

      <section className="mt-6 grid gap-4 lg:mt-8 lg:gap-6 xl:grid-cols-[1.2fr_0.55fr]">
        <div className="rounded-[2.4rem] bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,0.05)] sm:p-6 md:p-6 lg:p-10">
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="headline-display text-lg font-extrabold text-primary sm:text-xl lg:text-2xl">
                  পেন্ডিং ফান্ড রিকোয়েস্ট
                </h3>
                <Link href="/admin/approvals" className="text-sm font-bold text-primary bengali-copy sm:text-base lg:text-lg">
                  সবগুলো দেখুন
                </Link>
              </div>

              <div className="space-y-4 lg:hidden">
                {pendingFunds.map((entry) => (
                  <div key={entry.id} className="rounded-[1.2rem] border border-[#ece7dd] bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-base font-bold text-primary bengali-copy">
                          {entry.memberName}
                        </p>
                        <p className="mt-1 text-sm text-primary/60">{entry.memberMobile}</p>
                        <p className="mt-2 text-sm text-primary/75 bengali-copy">
                          {entry.note ?? entry.paymentMethod}
                        </p>
                      </div>
                      <p className="headline-display text-base font-extrabold text-primary">
                        {formatCurrency(entry.amount)}
                      </p>
                    </div>
                    <div className="mt-3">
                      <RequestDecisionButtons requestId={entry.id} variant="fund" />
                    </div>
                  </div>
                ))}
                {pendingFunds.length === 0 ? (
                  <div className="rounded-[1.2rem] border border-[#ece7dd] bg-white p-4 text-sm text-primary/60 bengali-copy">
                    এখন কোনো পেন্ডিং ফান্ড রিকোয়েস্ট নেই।
                  </div>
                ) : null}
              </div>

              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-160 text-left lg:min-w-185">
                  <thead className="border-b border-[#ece7dd] text-base font-bold text-primary/55 bengali-copy">
                    <tr>
                      <th className="pb-5">সদস্য</th>
                      <th className="pb-5">উদ্দেশ্য</th>
                      <th className="pb-5 text-right">পরিমাণ</th>
                      <th className="pb-5 text-center">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0ece3]">
                    {pendingFunds.map((entry) => (
                      <tr key={entry.id}>
                        <td className="py-6">
                          <div className="flex items-center gap-4">
                            <div className="flex size-11 items-center justify-center rounded-full bg-[#ece7dd] text-base font-bold text-primary">
                              {entry.memberName.slice(0, 2)}
                            </div>
                            <div>
                              <p className="text-base font-bold text-primary bengali-copy sm:text-lg">
                                {entry.memberName}
                              </p>
                              <p className="mt-1 text-sm text-primary/55 sm:text-base">
                                {entry.memberMobile}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-6 text-sm text-primary/80 bengali-copy sm:text-base">
                          {entry.note ?? entry.paymentMethod}
                        </td>
                        <td className="py-6 text-right headline-display text-lg font-extrabold text-primary sm:text-xl">
                          {formatCurrency(entry.amount)}
                        </td>
                        <td className="py-6">
                          <RequestDecisionButtons requestId={entry.id} variant="fund" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-[2rem] bg-[#f1ede4] p-5 shadow-[0_20px_40px_rgba(0,0,0,0.04)] sm:p-6 md:p-5 lg:p-7">
              <h3 className="headline-display bengali-copy text-lg font-extrabold text-primary sm:text-xl lg:text-2xl">
                সদস্য আবেদন
              </h3>
              <div className="mt-7 space-y-5">
                {latestMemberRequests.map((request) => (
                  <div key={request.id} className="rounded-[1.5rem] bg-white/65 p-5">
                    <p className="text-base font-bold text-primary bengali-copy sm:text-lg">
                      {request.name}
                    </p>
                    <p className="mt-2 text-sm text-primary/55 sm:text-base">{request.mobile}</p>
                    <p className="mt-3 text-sm text-primary/70 bengali-copy sm:text-base">
                      {request.address}
                    </p>
                    {request.note ? (
                      <p className="mt-2 text-sm text-primary/60 bengali-copy sm:text-base">
                        {request.note}
                      </p>
                    ) : null}
                    <div className="mt-4">
                      <RequestDecisionButtons requestId={request.id} variant="member" />
                    </div>
                  </div>
                ))}
                {latestMemberRequests.length === 0 ? (
                  <div className="rounded-[1.5rem] bg-white/65 p-5 text-sm text-primary/55 bengali-copy">
                    কোনো পেন্ডিং সদস্য আবেদন নেই।
                  </div>
                ) : null}
              </div>
            </div>
      </section>

      <div className="mt-8">
        <Link
          href="/admin/expenses"
          className="inline-flex w-full items-center justify-center gap-3 rounded-[1.35rem] bg-[#ffd978] px-5 py-4 text-base font-bold text-primary shadow-[0_14px_30px_rgba(0,0,0,0.12)] sm:w-auto"
        >
          <Download className="size-5" />
          খরচ ব্যবস্থাপনায় যান
        </Link>
      </div>
    </AdminShell>
  );
}
