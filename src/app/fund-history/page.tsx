import Link from "next/link";

import { PublicShell } from "@/components/public-shell";
import { formatCurrency, formatDate } from "@/lib/format";
import { getAppData } from "@/lib/live-data";

export const dynamic = "force-dynamic";

type FundHistoryPageProps = {
  searchParams?: Promise<{
    q?: string;
    member?: string;
    status?: string;
    sort?: string;
  }>;
};

export default async function FundHistoryPage({
  searchParams,
}: FundHistoryPageProps) {
  const { fundEntries, members } = await getAppData();
  const params = await searchParams;
  const memberParam = params?.member?.trim() ?? "";
  const query = params?.q?.trim().toLowerCase() ?? "";
  const statusParam = params?.status?.trim().toLowerCase() ?? "all";
  const sortParam = params?.sort?.trim().toLowerCase() ?? "recent";
  const selectedMember = members.find((member) => member.id === memberParam);

  const approvedEntries = fundEntries.filter((entry) => entry.status === "approved");

  const statusOptions = [
    { value: "all", label: "সব স্ট্যাটাস" },
    { value: "approved", label: "অনুমোদিত" },
    { value: "pending", label: "পেন্ডিং" },
    { value: "rejected", label: "বাতিল" },
  ];

  const sortOptions = [
    { value: "recent", label: "সর্বশেষ" },
    { value: "oldest", label: "পুরনো" },
    { value: "amount-high", label: "বেশি অঙ্ক" },
    { value: "amount-low", label: "কম অঙ্ক" },
    { value: "member", label: "সদস্য নাম" },
  ];

  const dateValue = (value?: string) => {
    if (!value) return 0;
    const timestamp = new Date(value).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
  };

  const memberFilteredEntries = selectedMember
    ? fundEntries.filter((entry) => entry.memberId === selectedMember.id)
    : fundEntries;

  const statusFilteredEntries =
    statusParam === "all"
      ? memberFilteredEntries
      : memberFilteredEntries.filter((entry) => entry.status === statusParam);

  const queryFilteredEntries = statusFilteredEntries.filter((entry) => {
    if (!query) return true;

    return (
      entry.memberName.toLowerCase().includes(query) ||
      entry.memberMobile.toLowerCase().includes(query) ||
      entry.paymentMethod.toLowerCase().includes(query)
    );
  });

  const finalEntries = queryFilteredEntries.slice().sort((a, b) => {
    if (sortParam === "oldest") {
      return (
        dateValue(a.approvedDate ?? a.submittedDate) -
        dateValue(b.approvedDate ?? b.submittedDate)
      );
    }

    if (sortParam === "amount-high") {
      return b.amount - a.amount;
    }

    if (sortParam === "amount-low") {
      return a.amount - b.amount;
    }

    if (sortParam === "member") {
      return a.memberName.localeCompare(b.memberName, "bn");
    }

    return (
      dateValue(b.approvedDate ?? b.submittedDate) -
      dateValue(a.approvedDate ?? a.submittedDate)
    );
  });

  const summaryMembers = members.filter((member) => {
    const matchesQuery =
      !query ||
      member.name.toLowerCase().includes(query) ||
      member.mobile.toLowerCase().includes(query) ||
      member.id.toLowerCase().includes(query);

    const matchesMember = !selectedMember || member.id === selectedMember.id;

    return matchesQuery && matchesMember;
  });

  const searchSuggestions = Array.from(
    new Set([
      ...members.flatMap((member) => [member.name, member.mobile, member.id]),
      ...fundEntries.flatMap((entry) => [
        entry.memberName,
        entry.memberMobile,
        entry.paymentMethod,
      ]),
    ]),
  ).slice(0, 24);

  const statusBadgeStyles: Record<string, string> = {
    approved: "bg-primary/10 text-primary",
    pending: "bg-amber-100 text-amber-700",
    rejected: "bg-rose-100 text-rose-700",
  };

  const statusLabel: Record<string, string> = {
    approved: "অনুমোদিত",
    pending: "পেন্ডিং",
    rejected: "বাতিল",
  };

  return (
    <PublicShell activePath="/fund-history">
      <section className="container-shell pb-24 pt-12">
        <span className="section-kicker">Search Contribution History</span>
        <h1 className="headline-display text-5xl font-black text-primary">
          ফান্ড হিস্ট্রি
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground bengali-copy">
          অনুমোদিত জমা, সদস্যভিত্তিক সারাংশ এবং সর্বশেষ অবদানগুলো এখানে দেখুন।
        </p>

        <div className="mt-8 rounded-[1.75rem] border border-border/70 bg-card/90 p-4 shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
          <form className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              name="q"
              defaultValue={params?.q ?? ""}
              placeholder="নাম, মোবাইল নম্বর বা পেমেন্ট মেথড দিয়ে খুঁজুন..."
              list="fund-history-search-suggestions"
              className="min-w-0 flex-1 rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <select
              name="status"
              defaultValue={statusParam}
              className="rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              name="sort"
              defaultValue={sortParam}
              className="rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {selectedMember ? (
              <input type="hidden" name="member" value={selectedMember.id} />
            ) : null}
            <button
              type="submit"
              className="rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
            >
              খুঁজুন
            </button>
            {selectedMember || params?.q || statusParam !== "all" || sortParam !== "recent" ? (
              <Link
                href="/fund-history"
                className="rounded-2xl border border-primary/15 px-5 py-3 text-center text-sm font-bold text-primary"
              >
                রিসেট
              </Link>
            ) : null}
          </form>
          <datalist id="fund-history-search-suggestions">
            {searchSuggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-primary/65 bengali-copy">
            <span className="rounded-full bg-primary/8 px-3 py-1">দ্রুত খুঁজুন:</span>
            <span className="rounded-full bg-muted px-3 py-1">নাম</span>
            <span className="rounded-full bg-muted px-3 py-1">মোবাইল</span>
            <span className="rounded-full bg-muted px-3 py-1">পেমেন্ট মেথড</span>
            <span className="rounded-full bg-muted px-3 py-1">Member ID</span>
          </div>
          {selectedMember ? (
            <p className="mt-3 text-xs text-secondary bengali-copy">
              এখন দেখানো হচ্ছে: {selectedMember.name} ({selectedMember.mobile})
            </p>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground bengali-copy">
              কোনো সদস্যের নাম ক্লিক করলে তার অনুমোদিত ফান্ড হিস্ট্রি আলাদা করে দেখা যাবে।
            </p>
          )}
        </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="card-soft p-7">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">
              Member Summary
            </p>
            <div className="mt-6 space-y-4">
              {summaryMembers.map((member) => (
                <Link
                  key={member.id}
                  href={`/fund-history?member=${encodeURIComponent(member.id)}`}
                  className="block rounded-[1.5rem] bg-muted/70 p-4 transition-transform hover:-translate-y-0.5"
                >
                  <p className="text-lg font-bold text-primary bengali-copy">
                    {member.name}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{member.mobile}</p>
                  <div className="mt-3 flex items-center justify-between gap-4">
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
                      মোট অনুমোদিত জমা
                    </span>
                    <span className="headline-display text-2xl font-black text-primary">
                      {formatCurrency(member.totalContribution)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            {summaryMembers.length === 0 ? (
              <div className="mt-4 rounded-[1.5rem] bg-muted/70 p-4 text-sm text-muted-foreground bengali-copy">
                খোঁজার সাথে মিল থাকা কোনো সদস্য পাওয়া যায়নি।
              </div>
            ) : null}
          </div>

          <div className="card-soft p-7">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">
              Fund History Table
            </p>
            <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-border/70">
              <div className="grid grid-cols-[1.2fr_0.9fr_0.7fr_0.8fr] gap-4 border-b border-border/70 bg-muted/70 px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-secondary">
                <span>সদস্য</span>
                <span>পরিশোধ</span>
                <span>স্ট্যাটাস</span>
                <span className="text-right">সর্বশেষ অনুমোদন</span>
              </div>
              <div className="divide-y divide-border/70 bg-card/85">
                {finalEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="grid grid-cols-[1.2fr_0.9fr_0.7fr_0.8fr] gap-4 px-4 py-4 text-sm"
                  >
                    <div>
                      <Link
                        href={`/fund-history?member=${encodeURIComponent(entry.memberId ?? "")}`}
                        className="text-base font-bold text-primary bengali-copy hover:text-secondary"
                      >
                        {entry.memberName}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {entry.memberMobile} • {entry.paymentMethod}
                      </p>
                    </div>
                    <div>
                      <p className="headline-display text-lg font-bold text-primary">
                        {formatCurrency(entry.amount)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        জমা: {formatDate(entry.submittedDate)}
                      </p>
                    </div>
                    <div>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                          statusBadgeStyles[entry.status] ?? "bg-muted text-muted-foreground"
                        }`}
                      >
                        {statusLabel[entry.status] ?? entry.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
                        {entry.approvedDate
                          ? formatDate(entry.approvedDate)
                          : "—"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {finalEntries.length === 0 ? (
              <div className="mt-4 rounded-[1.5rem] border border-border/70 bg-card/85 p-5 text-sm text-muted-foreground bengali-copy">
                এই সদস্য বা সার্চের জন্য কোনো ফান্ড হিস্ট্রি পাওয়া যায়নি।
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
