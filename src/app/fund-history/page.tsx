import Link from "next/link";

import { PublicShell } from "@/components/public-shell";
import { formatCurrency, formatDate } from "@/lib/format";
import { getAppData } from "@/lib/live-data";

export const dynamic = "force-dynamic";

type FundHistoryPageProps = {
  searchParams?: Promise<{
    q?: string;
    member?: string;
  }>;
};

export default async function FundHistoryPage({
  searchParams,
}: FundHistoryPageProps) {
  const { fundEntries, members } = await getAppData();
  const params = await searchParams;
  const memberParam = params?.member?.trim() ?? "";
  const query = params?.q?.trim().toLowerCase() ?? "";
  const selectedMember = members.find((member) => member.id === memberParam);

  const approvedEntries = fundEntries.filter((entry) => entry.status === "approved");

  const memberFilteredEntries = selectedMember
    ? approvedEntries.filter((entry) => entry.memberId === selectedMember.id)
    : approvedEntries;

  const finalEntries = memberFilteredEntries.filter((entry) => {
    if (!query) return true;

    return (
      entry.memberName.toLowerCase().includes(query) ||
      entry.memberMobile.toLowerCase().includes(query) ||
      entry.paymentMethod.toLowerCase().includes(query)
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
      ...approvedEntries.flatMap((entry) => [entry.memberName, entry.memberMobile, entry.paymentMethod]),
    ]),
  ).slice(0, 24);

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
            {selectedMember ? (
              <input type="hidden" name="member" value={selectedMember.id} />
            ) : null}
            <button
              type="submit"
              className="rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
            >
              খুঁজুন
            </button>
            {selectedMember || params?.q ? (
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
              Approved Transactions
            </p>
            <div className="mt-6 space-y-4">
              {finalEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex flex-col gap-3 rounded-[1.5rem] border border-border/70 bg-card/85 p-5 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <Link
                      href={`/fund-history?member=${encodeURIComponent(entry.memberId ?? "")}`}
                      className="text-lg font-bold text-primary bengali-copy hover:text-secondary"
                    >
                      {entry.memberName}
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {entry.memberMobile} • {entry.paymentMethod}
                    </p>
                  </div>
                  <div className="md:text-right">
                    <p className="headline-display text-2xl font-bold text-primary">
                      {formatCurrency(entry.amount)}
                    </p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-secondary">
                      {formatDate(entry.approvedDate ?? entry.submittedDate)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {finalEntries.length === 0 ? (
              <div className="mt-4 rounded-[1.5rem] border border-border/70 bg-card/85 p-5 text-sm text-muted-foreground bengali-copy">
                এই সদস্য বা সার্চের জন্য কোনো অনুমোদিত ফান্ড হিস্ট্রি পাওয়া যায়নি।
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
