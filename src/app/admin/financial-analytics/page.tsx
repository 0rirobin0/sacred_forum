import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";
import { requireAdminSession } from "@/lib/admin-auth";
import { getAppData } from "@/lib/live-data";
import type { FundEntry } from "@/lib/types";

export const dynamic = "force-dynamic";

type FinancialAnalyticsPageProps = {
  searchParams?: Promise<{
    month?: string;
    year?: string;
    member?: string;
    q?: string;
    status?: string;
  }>;
};

type MonthOption = {
  key: string;
  label: string;
};

type YearOption = {
  key: string;
  label: string;
};

type DateFilter = {
  month: string;
  year: string;
};

function getDateParts(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return {
    month: String(date.getMonth() + 1).padStart(2, "0"),
    year: String(date.getFullYear()),
  };
}

function normalizeMonthValue(value: string) {
  const normalized = value.padStart(2, "0");
  return /^(0[1-9]|1[0-2])$/.test(normalized) ? normalized : "";
}

function normalizeYearValue(value: string) {
  return /^\d{4}$/.test(value) ? value : "";
}

function getFundEntryPeriod(entry: FundEntry) {
  const month = normalizeMonthValue(entry.month ?? "");
  const year = normalizeYearValue(entry.year ?? "");
  if (month && year) {
    return { month, year };
  }

  const fallback = getDateParts(entry.approvedDate ?? entry.submittedDate);
  return fallback ?? { month: "", year: "" };
}

function getBanglaMonthName(month: number | string): string {
  const monthNames: Record<number, string> = {
    1:  "জানুয়ারি",
    2:  "ফেব্রুয়ারি",
    3:  "মার্চ",
    4:  "এপ্রিল",
    5:  "মে",
    6:  "জুন",
    7:  "জুলাই",
    8:  "আগস্ট",
    9:  "সেপ্টেম্বর",
    10: "অক্টোবর",
    11: "নভেম্বর",
    12: "ডিসেম্বর",
  };

  const num = Number(month);
  return monthNames[num] ?? "-";
}
function getLegacyYearMonth(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})$/);
  if (!match) return null;

  const year = normalizeYearValue(match[1]);
  const month = normalizeMonthValue(match[2]);

  if (!year || !month) return null;

  return { year, month };
}

function buildMonthOptions(): MonthOption[] {
  const formatter = new Intl.DateTimeFormat("bn-BD", {
    month: "long",
  });

  return Array.from({ length: 12 }, (_, index) => {
    const key = String(index + 1).padStart(2, "0");
    return {
      key,
      label: formatter.format(new Date(2000, index, 1)),
    };
  });
}

function buildYearOptions(entries: FundEntry[]): YearOption[] {
  const formatter = new Intl.NumberFormat("bn-BD");
  const uniqueYears = new Set<string>();

  entries.forEach((entry) => {
    const { year } = getFundEntryPeriod(entry);
    if (year) uniqueYears.add(year);
  });

  return Array.from(uniqueYears)
    .sort((a, b) => Number(b) - Number(a))
    .map((year) => ({
      key: year,
      label: formatter.format(Number(year)),
    }));
}

function matchesDateFilter(entry: FundEntry, filter: DateFilter) {
  const parts = getFundEntryPeriod(entry);
  if (!parts.year && !parts.month) return false;

  if (filter.year && parts.year !== filter.year) return false;
  if (filter.month && parts.month !== filter.month) return false;

  return true;
}

export default async function FinancialAnalyticsPage({
  searchParams,
}: FinancialAnalyticsPageProps) {
  const isLoggedIn = await requireAdminSession();

  if (!isLoggedIn) {
    redirect("/admin/login");
  }

  const { fundEntries, members, summaryStats } = await getAppData();
  const notificationCount =
    summaryStats.pendingFundRequests + summaryStats.newMemberRequests;
  const params = await searchParams;
  const rawMonthParam = params?.month?.trim() ?? "";
  const rawYearParam = params?.year?.trim() ?? "";
  const legacyYearMonth = getLegacyYearMonth(rawMonthParam);
  const monthParam = normalizeMonthValue(legacyYearMonth?.month ?? rawMonthParam);
  const yearParam = normalizeYearValue(rawYearParam || legacyYearMonth?.year || "");
  const memberParam = params?.member?.trim() ?? "";
  const query = params?.q?.trim().toLowerCase() ?? "";
  const statusParam = params?.status?.trim() ?? "paid";
  const isUnpaidView = statusParam === "unpaid";
  const hasDateFilter = Boolean(monthParam || yearParam);
  const dateFilter = {
    month: monthParam,
    year: yearParam,
  };

  const approvedEntries = fundEntries.filter((entry) => entry.status === "approved");
  const monthOptions = buildMonthOptions();
  const yearOptions = buildYearOptions(approvedEntries);
  const selectedMember = members.find((member) => member.id === memberParam) ?? null;

  const dateFilteredEntries = approvedEntries.filter((entry) =>
    matchesDateFilter(entry, dateFilter),
  );

  const memberFilteredEntries = selectedMember
    ? dateFilteredEntries.filter((entry) => entry.memberId === selectedMember.id)
    : dateFilteredEntries;

  const finalEntries = memberFilteredEntries.filter((entry) => {
    if (!query) return true;

    return (
      entry.memberName.toLowerCase().includes(query) ||
      entry.memberMobile.toLowerCase().includes(query) ||
      entry.memberId?.toLowerCase().includes(query) ||
      entry.note?.toLowerCase().includes(query) ||
      entry.paymentMethod.toLowerCase().includes(query)
    );
  });

  const totalAmount = finalEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const uniqueMembers = new Set(
    finalEntries.map((entry) => entry.memberId ?? entry.memberMobile),
  ).size;

  const paidMemberIdsForPeriod = new Set(
    (hasDateFilter ? dateFilteredEntries : []).flatMap((entry) =>
      entry.memberId ? [entry.memberId] : [],
    ),
  );
  const membersForUnpaidView = selectedMember ? [selectedMember] : members;
  const unpaidMembers = hasDateFilter
    ? membersForUnpaidView.filter((member) => !paidMemberIdsForPeriod.has(member.id))
    : [];
  const filteredUnpaidMembers = unpaidMembers.filter((member) => {
    if (!query) return true;

    return (
      member.name.toLowerCase().includes(query) ||
      member.mobile.toLowerCase().includes(query) ||
      member.id.toLowerCase().includes(query)
    );
  });
  const visibleAmount = isUnpaidView ? 0 : totalAmount;
  const visibleCount = isUnpaidView ? filteredUnpaidMembers.length : finalEntries.length;
  const visibleMemberCount = isUnpaidView ? filteredUnpaidMembers.length : uniqueMembers;
  const hasFilters = Boolean(monthParam || yearParam || memberParam || query || params?.status);

  return (
    <AdminShell
      activePath="/admin/financial-analytics"
      title="ফান্ড হিস্ট্রি অ্যানালিটিকস"
      description="মাস, বছর, সদস্য ও নাম অনুসারে অনুমোদিত ফান্ড হিস্ট্রি ফিল্টার করে দেখুন।"
      notificationCount={notificationCount}
    >
      <section className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
                মোট অনুমোদিত জমা
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="headline-display text-3xl font-extrabold text-primary">
                {formatCurrency(visibleAmount)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
                মোট ট্রানজাকশন
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="headline-display text-3xl font-extrabold text-primary">
                {isUnpaidView ? 0 : visibleCount}টি
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
                সদস্য সংখ্যা
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="headline-display text-3xl font-extrabold text-primary">
                {visibleMemberCount} জন
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">
                Filter Controls
              </p>
              <CardTitle className="mt-2 text-xl sm:text-2xl">ফিল্টার</CardTitle>
            </div>
          </CardHeader>

          <CardContent>
            <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70">
                  মাস নির্বাচন
                </label>
                <Select name="month" defaultValue={monthParam}>
                  <option value="">সব মাস</option>
                  {monthOptions.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70">
                  বছর নির্বাচন
                </label>
                <Select name="year" defaultValue={yearParam}>
                  <option value="">সব বছর</option>
                  {yearOptions.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70">
                  সদস্য নির্বাচন
                </label>
                <Select name="member" defaultValue={selectedMember?.id ?? ""}>
                  <option value="">সব সদস্য</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.mobile})
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70">
                  পেমেন্ট স্ট্যাটাস
                </label>
                <Select name="status" defaultValue={statusParam}>
                  <option value="paid">Paid Members</option>
                  <option value="unpaid">Unpaid Members</option>
                </Select>
                {isUnpaidView && !hasDateFilter ? (
                  <p className="text-xs text-secondary bengali-copy">
                    আনপেইড তালিকা দেখতে মাস বা বছর নির্বাচন করুন।
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70">
                  নাম বা পেমেন্ট মেথড
                </label>
                <Input
                  type="text"
                  name="q"
                  defaultValue={params?.q ?? ""}
                  placeholder="নাম, মোবাইল নম্বর বা পেমেন্ট মেথড লিখুন..."
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row md:col-span-2 xl:col-span-5">
                <Button type="submit" className="sm:min-w-40">
                  ফিল্টার করুন
                </Button>
                {hasFilters ? (
                  <Link href="/admin/financial-analytics" className="sm:min-w-32">
                    <Button type="button" variant="outline" className="w-full">
                      রিসেট
                    </Button>
                  </Link>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">
                  {isUnpaidView ? "Unpaid Member Table" : "Approved Fund History"}
                </p>
                <CardTitle className="text-xl sm:text-2xl">সদস্যভিত্তিক ফান্ড হিস্ট্রি</CardTitle>
              </div>
              <Badge variant="outline">{visibleCount}টি</Badge>
            </div>
          </CardHeader>

          <CardContent>
            {isUnpaidView ? (
              <Table className="min-w-215">
                <TableHeader>
                  <TableRow>
                    <TableHead>সদস্য</TableHead>
                    <TableHead>মোবাইল</TableHead>
                    <TableHead>Member ID</TableHead>
                    <TableHead>ঠিকানা</TableHead>
                    <TableHead>জয়েন তারিখ</TableHead>
                    <TableHead>স্ট্যাটাস</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUnpaidMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-semibold text-foreground bengali-copy">
                        {member.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{member.mobile}</TableCell>
                      <TableCell className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
                        {member.id}
                      </TableCell>
                      <TableCell className="text-muted-foreground bengali-copy">
                        {member.address}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(member.joinDate)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Unpaid</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Table className="min-w-265">
                <TableHeader>
                  <TableRow>
                    <TableHead>সদস্য</TableHead>
                    <TableHead>মোবাইল</TableHead>
                    <TableHead>Member ID</TableHead>
                    <TableHead>অনুমোদনের তারিখ</TableHead>
                    <TableHead>পেমেন্ট মাস</TableHead>
                    <TableHead>পেমেন্ট মেথড</TableHead>
                    <TableHead>নোট</TableHead>
                    <TableHead className="text-right">পরিমাণ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {finalEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-semibold text-foreground bengali-copy">
                        {entry.memberName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{entry.memberMobile}</TableCell>
                      <TableCell className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
                        {entry.memberId || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(entry.approvedDate?? entry.submittedDate)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {entry.month && entry.year ? `${getBanglaMonthName(entry.month)} , ${entry.year}` : "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {entry.paymentMethod}
                      </TableCell>
                      <TableCell className="text-muted-foreground bengali-copy">
                        {entry.note || "-"}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-foreground">
                        {formatCurrency(entry.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {isUnpaidView ? (
              filteredUnpaidMembers.length === 0 ? (
                <div className="mt-4 rounded-[1.5rem] bg-muted/60 p-5 text-sm text-muted-foreground bengali-copy">
                  {hasDateFilter
                    ? "নির্বাচিত সময়ের জন্য সব সদস্য পেমেন্ট করেছেন।"
                    : "আনপেইড তালিকা দেখতে মাস বা বছর নির্বাচন করুন।"}
                </div>
              ) : null
            ) : finalEntries.length === 0 ? (
              <div className="mt-4 rounded-[1.5rem] bg-muted/60 p-5 text-sm text-muted-foreground bengali-copy">
                নির্বাচিত ফিল্টারের জন্য কোনো ফান্ড হিস্ট্রি পাওয়া যায়নি।
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </AdminShell>
  );
}