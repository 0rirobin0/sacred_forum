import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { formatCurrency, formatDate } from "@/lib/format";
import { requireAdminSession } from "@/lib/admin-auth";
import { getAppData } from "@/lib/live-data";

export const dynamic = "force-dynamic";

type FinancialAnalyticsPageProps = {
  searchParams?: Promise<{
    month?: string;
    member?: string;
    q?: string;
    status?: string;
  }>;
};

type MonthOption = {
  key: string;
  label: string;
};

function getMonthKey(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function buildMonthOptions(dates: string[]): MonthOption[] {
  const formatter = new Intl.DateTimeFormat("bn-BD", {
    month: "long",
    year: "numeric",
  });
  const uniqueMonths = new Set<string>();

  dates.forEach((date) => {
    const key = getMonthKey(date);
    if (key) uniqueMonths.add(key);
  });

  return Array.from(uniqueMonths)
    .sort((a, b) => (a > b ? -1 : 1))
    .map((key) => {
      const [year, month] = key.split("-");
      const date = new Date(Number(year), Number(month) - 1, 1);
      return {
        key,
        label: formatter.format(date),
      };
    });
}

export default async function FinancialAnalyticsPage({
  searchParams,
}: FinancialAnalyticsPageProps) {
  const isLoggedIn = await requireAdminSession();

  if (!isLoggedIn) {
    redirect("/admin/login");
  }

  const { fundEntries, members } = await getAppData();
  const params = await searchParams;
  const monthParam = params?.month?.trim() ?? "";
  const memberParam = params?.member?.trim() ?? "";
  const query = params?.q?.trim().toLowerCase() ?? "";
  const statusParam = params?.status?.trim() ?? "paid";
  const isUnpaidView = statusParam === "unpaid";

  const approvedEntries = fundEntries.filter((entry) => entry.status === "approved");
  const monthOptions = buildMonthOptions(
    approvedEntries.map((entry) => entry.approvedDate ?? entry.submittedDate),
  );
  const selectedMember = members.find((member) => member.id === memberParam) ?? null;

  const memberFilteredEntries = selectedMember
    ? approvedEntries.filter((entry) => entry.memberId === selectedMember.id)
    : approvedEntries;

  const monthFilteredEntries = monthParam
    ? memberFilteredEntries.filter(
        (entry) =>
          getMonthKey(entry.approvedDate ?? entry.submittedDate) === monthParam,
      )
    : memberFilteredEntries;

  const finalEntries = monthFilteredEntries.filter((entry) => {
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

  const paidMemberIdsForMonth = new Set(
    (monthParam ? approvedEntries : []).filter(
      (entry) => getMonthKey(entry.approvedDate ?? entry.submittedDate) === monthParam,
    ).map((entry) => entry.memberId).filter(Boolean),
  );
  const membersForUnpaidView = selectedMember ? [selectedMember] : members;
  const unpaidMembers = monthParam
    ? membersForUnpaidView.filter((member) => !paidMemberIdsForMonth.has(member.id))
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
  const hasFilters = Boolean(monthParam || memberParam || params?.q || params?.status);

  return (
    <AdminShell
      activePath="/admin/financial-analytics"
      title="ফান্ড হিস্ট্রি অ্যানালিটিকস"
      description="মাস, সদস্য ও নাম অনুসারে অনুমোদিত ফান্ড হিস্ট্রি ফিল্টার করে দেখুন।"
    >
      <section className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[2rem] border border-[#ded6c8] bg-white p-5 shadow-[0_20px_40px_rgba(0,0,0,0.05)] sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
              মোট অনুমোদিত জমা
            </p>
            <p className="mt-3 headline-display text-3xl font-extrabold text-primary">
              {formatCurrency(visibleAmount)}
            </p>
          </div>
          <div className="rounded-[2rem] border border-[#ded6c8] bg-white p-5 shadow-[0_20px_40px_rgba(0,0,0,0.05)] sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
              মোট ট্রানজাকশন
            </p>
            <p className="mt-3 headline-display text-3xl font-extrabold text-primary">
              {isUnpaidView ? 0 : visibleCount}টি
            </p>
          </div>
          <div className="rounded-[2rem] border border-[#ded6c8] bg-white p-5 shadow-[0_20px_40px_rgba(0,0,0,0.05)] sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
              সদস্য সংখ্যা
            </p>
            <p className="mt-3 headline-display text-3xl font-extrabold text-primary">
              {visibleMemberCount} জন
            </p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#ded6c8] bg-white p-5 shadow-[0_20px_40px_rgba(0,0,0,0.05)] sm:p-6 lg:p-7">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">
              Filter Controls
            </p>
            <h3 className="mt-2 headline-display text-xl font-extrabold text-primary sm:text-2xl">
              ফিল্টার
            </h3>
          </div>

          <form className="grid gap-4 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70">
                মাস নির্বাচন
              </label>
              <select
                name="month"
                defaultValue={monthParam}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none"
              >
                <option value="">সব মাস</option>
                {monthOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70">
                সদস্য নির্বাচন
              </label>
              <select
                name="member"
                defaultValue={selectedMember?.id ?? ""}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none"
              >
                <option value="">সব সদস্য</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.mobile})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70">
                পেমেন্ট স্ট্যাটাস
              </label>
              <select
                name="status"
                defaultValue={statusParam}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none"
              >
                <option value="paid">Paid Members</option>
                <option value="unpaid">Unpaid Members</option>
              </select>
              {isUnpaidView && !monthParam ? (
                <p className="text-xs text-secondary bengali-copy">
                  আনপেইড তালিকা দেখতে মাস নির্বাচন করুন।
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70">
                নাম বা পেমেন্ট মেথড
              </label>
              <input
                type="text"
                name="q"
                defaultValue={params?.q ?? ""}
                placeholder="নাম, মোবাইল নম্বর বা পেমেন্ট মেথড লিখুন..."
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:col-span-4">
              <button
                type="submit"
                className="rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground sm:min-w-40"
              >
                ফিল্টার করুন
              </button>
              {hasFilters ? (
                <Link
                  href="/admin/financial-analytics"
                  className="rounded-2xl border border-primary/20 px-5 py-3 text-center text-sm font-bold text-primary sm:min-w-32"
                >
                  রিসেট
                </Link>
              ) : null}
            </div>
          </form>
        </div>

        <div className="rounded-[2rem] border border-[#ded6c8] bg-[#f1ede4] p-5 shadow-[0_20px_40px_rgba(0,0,0,0.04)] sm:p-6 lg:p-7">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">
                {isUnpaidView ? "Unpaid Member Table" : "Approved Fund History"}
              </p>
              <h3 className="headline-display text-xl font-extrabold text-primary sm:text-2xl">
                সদস্যভিত্তিক ফান্ড হিস্ট্রি
              </h3>
            </div>
            <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-primary">
              {visibleCount}টি
            </span>
          </div>

          <div className="admin-table-wrap">
            {isUnpaidView ? (
              <table className="admin-table min-w-[860px]">
                <thead>
                  <tr className="text-left text-xs font-bold uppercase tracking-[0.18em] text-primary/60">
                    <th className="px-4">সদস্য</th>
                    <th className="px-4">মোবাইল</th>
                    <th className="px-4">Member ID</th>
                    <th className="px-4">ঠিকানা</th>
                    <th className="px-4">জয়েন তারিখ</th>
                    <th className="px-4">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUnpaidMembers.map((member) => (
                    <tr
                      key={member.id}
                      className="bg-white shadow-[0_10px_24px_rgba(0,0,0,0.04)]"
                    >
                      <td className="rounded-l-[1.25rem] px-4 py-4 font-bold text-primary bengali-copy">
                        {member.name}
                      </td>
                      <td className="px-4 py-4 text-sm text-primary/65">{member.mobile}</td>
                      <td className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em] text-secondary">
                        {member.id}
                      </td>
                      <td className="px-4 py-4 text-sm text-primary/70 bengali-copy">
                        {member.address}
                      </td>
                      <td className="px-4 py-4 text-sm text-primary/70">
                        {formatDate(member.joinDate)}
                      </td>
                      <td className="rounded-r-[1.25rem] px-4 py-4 text-sm font-semibold text-primary/80">
                        Unpaid
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="admin-table min-w-[980px]">
                <thead>
                  <tr className="text-left text-xs font-bold uppercase tracking-[0.18em] text-primary/60">
                    <th className="px-4">সদস্য</th>
                    <th className="px-4">মোবাইল</th>
                    <th className="px-4">Member ID</th>
                    <th className="px-4">তারিখ</th>
                    <th className="px-4">পেমেন্ট মেথড</th>
                    <th className="px-4">নোট</th>
                    <th className="px-4 text-right">পরিমাণ</th>
                  </tr>
                </thead>
                <tbody>
                  {finalEntries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="bg-white shadow-[0_10px_24px_rgba(0,0,0,0.04)]"
                    >
                      <td className="rounded-l-[1.25rem] px-4 py-4 font-bold text-primary bengali-copy">
                        {entry.memberName}
                      </td>
                      <td className="px-4 py-4 text-sm text-primary/65">{entry.memberMobile}</td>
                      <td className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em] text-secondary">
                        {entry.memberId || "-"}
                      </td>
                      <td className="px-4 py-4 text-sm text-primary/70">
                        {formatDate(entry.approvedDate ?? entry.submittedDate)}
                      </td>
                      <td className="px-4 py-4 text-sm text-primary/70">
                        {entry.paymentMethod}
                      </td>
                      <td className="px-4 py-4 text-sm text-primary/60 bengali-copy">
                        {entry.note || "-"}
                      </td>
                      <td className="rounded-r-[1.25rem] px-4 py-4 text-right text-base font-bold text-primary">
                        {formatCurrency(entry.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {isUnpaidView ? (
            filteredUnpaidMembers.length === 0 ? (
              <div className="mt-4 rounded-[1.5rem] bg-white/70 p-5 text-sm text-primary/60 bengali-copy">
                {monthParam
                  ? "নির্বাচিত মাসে সব সদস্য পেমেন্ট করেছেন।"
                  : "আনপেইড তালিকা দেখতে মাস নির্বাচন করুন।"}
              </div>
            ) : null
          ) : finalEntries.length === 0 ? (
            <div className="mt-4 rounded-[1.5rem] bg-white/70 p-5 text-sm text-primary/60 bengali-copy">
              নির্বাচিত ফিল্টারের জন্য কোনো ফান্ড হিস্ট্রি পাওয়া যায়নি।
            </div>
          ) : null}
        </div>
      </section>
    </AdminShell>
  );
}
