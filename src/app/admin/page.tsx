import Link from "next/link";
import { redirect } from "next/navigation";
import { CircleDollarSign, Sparkles, UserPlus2 } from "lucide-react";

import { AdminBreakingNewsClient } from "@/components/admin/admin-breaking-news-client";
import { AdminShell } from "@/components/admin/admin-shell";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const pendingFunds = fundEntries.filter((entry) => entry.status === "pending");
  const pendingMembers = memberRequests.filter((entry) => entry.status === "pending");
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

  const notificationCount =
    summaryStats.pendingFundRequests + summaryStats.newMemberRequests;

  return (
    <AdminShell
      activePath="/admin"
      title="হাজী বাড়ি জামে মসজিদ উন্নয়ন ফোরাম"
      description={`অ্যাডমিন ড্যাশবোর্ড • আজ ${formatDate(new Date().toISOString())}`}
      notificationCount={notificationCount}
    >
      <section className="grid gap-4 md:grid-cols-2 lg:gap-6 xl:grid-cols-3">
        <StatCard
          title="মোট তহবিল ব্যালেন্স"
          value={formatCurrency(summaryStats.currentBalance)}
          description="সর্বশেষ অনুমোদিত জমা থেকে হালনাগাদ ব্যালেন্স"
          icon={CircleDollarSign}
          tone="primary"
        />
        <StatCard
          title="পেন্ডিং ফান্ড অনুরোধ"
          value={`${summaryStats.pendingFundRequests}টি`}
          description="অগ্রাধিকার অনুযায়ী যাচাই করুন"
          icon={Sparkles}
          tone="accent"
        />
        <StatCard
          title="নতুন সদস্য আবেদন"
          value={`${summaryStats.newMemberRequests} জন`}
          description="সদস্য যাচাইয়ের জন্য প্রস্তুত"
          icon={UserPlus2}
        />
      </section>

      <section className="mt-6 grid gap-4 lg:mt-8 lg:gap-6 xl:grid-cols-[1.2fr_0.55fr]">
        <Card className="rounded-[2.4rem]">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>মাসিক আয় ও ব্যয়</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground bengali-copy">
                  চলতি বছরের প্রতিটি মাসের সারাংশ।
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <span className="size-3 rounded-full bg-primary" /> আয়
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="size-3 rounded-full bg-secondary" /> ব্যয়
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-120 md:min-w-140">
                <div className="grid grid-cols-[84px_1fr] gap-3">
                  <div className="relative h-80 pb-11 sm:h-90">
                    <div className="absolute inset-0 flex flex-col justify-between">
                      {yAxisTicks.map((tickValue) => (
                        <p
                          key={tickValue}
                          className="text-sm font-semibold text-muted-foreground"
                        >
                          ৳{compactNumber.format(tickValue)}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="relative h-80 min-w-0 border-b border-l border-border pb-11 sm:h-90">
                    <div className="absolute inset-0 flex flex-col justify-between">
                      {yAxisTicks.map((tickValue) => (
                        <div key={tickValue} className="border-t border-border/60" />
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
                          <div
                            key={item.month}
                            className="flex min-w-15.5 flex-col items-center gap-2 sm:min-w-18"
                          >
                            <div className="flex items-end gap-2 sm:gap-3">
                              <div className="flex flex-col items-center gap-2">
                                <Badge variant="default">
                                  আয় ৳{compactNumber.format(item.collection)}
                                </Badge>
                                <div
                                  className="w-5 rounded-t-[0.8rem] bg-primary sm:w-7"
                                  style={{ height: `${collectionHeight}px` }}
                                />
                              </div>

                              <div className="flex flex-col items-center gap-2">
                                <Badge variant="secondary">
                                  ব্যয় ৳{compactNumber.format(item.expense)}
                                </Badge>
                                <div
                                  className="w-5 rounded-t-[0.8rem] bg-secondary sm:w-7"
                                  style={{ height: `${expenseHeight}px` }}
                                />
                              </div>
                            </div>

                            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground">
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
          </CardContent>
        </Card>

        <div className="space-y-4 lg:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>সর্বোচ্চ অবদানকারী</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {topContributors.map((member, index) => (
                <div key={member.id} className="flex items-center gap-4">
                  <div className="relative">
                    <div className="flex size-14 items-center justify-center rounded-full bg-primary text-base font-bold text-white">
                      {member.name.slice(0, 1)}
                    </div>
                    <div className="absolute bottom-0 right-0 flex size-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                      {index + 1}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold text-foreground bengali-copy">
                      {member.name}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground bengali-copy">
                      {formatCurrency(member.totalContribution)} প্রদান করেছেন
                    </p>
                  </div>
                </div>
              ))}
              <Link
                href="/admin/members"
                className="inline-flex w-full items-center justify-center rounded-xl border border-border/70 px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
              >
                সদস্য তালিকা দেখুন
              </Link>
            </CardContent>
          </Card>

          <AdminBreakingNewsClient initialBreakingNews={breakingNews} />
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:mt-8 lg:gap-6 xl:grid-cols-[1.2fr_0.55fr]">
        <Card className="rounded-[2.4rem]">
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>কুইক কিউ</CardTitle>
              <Badge variant="accent">আজ {formatDate(new Date().toISOString())}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Badge variant="default">ফান্ড রিকোয়েস্ট {pendingFunds.length}টি</Badge>
              <Badge variant="secondary">সদস্য আবেদন {pendingMembers.length}টি</Badge>
              <Badge variant="default" >সর্বমোট {notificationCount}টি</Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                href="/admin/approvals"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                অনুমোদন প্যানেল
              </Link>
              <Link
                href="/admin/notifications"
                className="inline-flex items-center justify-center rounded-xl border border-border/70 px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
              >
                নোটিফিকেশন দেখুন
              </Link>
              <Link
                href="/admin/expenses"
                className="inline-flex items-center justify-center rounded-xl border border-border/70 px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
              >
                খরচ আপডেট করুন
              </Link>
              <Link
                href="/admin/members"
                className="inline-flex items-center justify-center rounded-xl border border-border/70 px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
              >
                সদস্য তালিকা
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>সাপ্তাহিক ফোকাস</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground bengali-copy">
            <p>• নতুন সদস্যদের যাচাই ও যোগাযোগ নিশ্চিত করুন।</p>
            <p>• যেসব ফান্ড অনুরোধ ৭ দিনের বেশি বাকি, দ্রুত সিদ্ধান্ত নিন।</p>
            <p>• খরচ আপডেটের সময় রশিদ নম্বর সংরক্ষণ করুন।</p>
          </CardContent>
        </Card>
      </section>
    </AdminShell>
  );
}
