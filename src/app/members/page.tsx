import Link from "next/link";

import { PublicShell } from "@/components/public-shell";
import { formatCurrency, formatDate } from "@/lib/format";
import { getAppData } from "@/lib/live-data";

export const dynamic = "force-dynamic";

type MembersPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const { members } = await getAppData();
  const params = await searchParams;
  const query = params?.q?.trim().toLowerCase() ?? "";

  const filteredMembers = members.filter((member) => {
    if (!query) return true;

    return (
      member.name.toLowerCase().includes(query) ||
      member.mobile.toLowerCase().includes(query) ||
      member.id.toLowerCase().includes(query)
    );
  });

  return (
    <PublicShell activePath="/members">
      <section className="container-shell pb-24 pt-12">
        <span className="section-kicker">Member Directory</span>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <h1 className="headline-display text-5xl font-black text-primary">
            সদস্য তালিকা
          </h1>
          <Link
            href="/new-member"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-[0_10px_24px_rgba(0,56,32,0.18)] hover:brightness-110 sm:mt-1"
          >
            নতুন সদস্য হোন
          </Link>
        </div>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground bengali-copy">
          নাম, মোবাইল নম্বর, যোগদানের তারিখ এবং মোট অবদানসহ সম্মানিত সদস্যদের
          পরিচিতি।
        </p>

        <div className="mt-8 rounded-[1.75rem] border border-border/70 bg-card/90 p-4 shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
          <form className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              name="q"
              defaultValue={params?.q ?? ""}
              placeholder="নাম, মোবাইল নম্বর বা Member ID দিয়ে খুঁজুন..."
              className="min-w-0 flex-1 rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
            >
              খুঁজুন
            </button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground bengali-copy">
            সদস্যের নাম ক্লিক করলে তার ফান্ড হিস্ট্রি খুলবে।
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredMembers.map((member) => (
            <Link
              key={member.id}
              href={`/fund-history?member=${encodeURIComponent(member.id)}`}
              className="card-soft block p-6 transition-transform hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="headline-display text-2xl font-bold text-primary">
                    {member.name}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{member.mobile}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  {member.status}
                </span>
              </div>
              <div className="mt-6 space-y-3 text-sm text-muted-foreground bengali-copy">
                <p>Member ID: {member.id}</p>
                <p>ঠিকানা: {member.address}</p>
                <p>যোগদানের তারিখ: {formatDate(member.joinDate)}</p>
              </div>
              <div className="mt-6 rounded-[1.5rem] bg-muted/70 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  মোট অবদান
                </p>
                <p className="mt-2 headline-display text-3xl font-black text-primary">
                  {formatCurrency(member.totalContribution)}
                </p>
                <span className="mt-4 inline-flex text-sm font-bold text-secondary">
                  ফান্ড হিস্ট্রি দেখুন
                </span>
              </div>
            </Link>
          ))}
        </div>

        {filteredMembers.length === 0 ? (
          <div className="mt-8 rounded-[1.75rem] border border-border/70 bg-card/90 p-6 text-center text-muted-foreground bengali-copy">
            কোনো সদস্য পাওয়া যায়নি। অন্য নাম বা মোবাইল নম্বর দিয়ে চেষ্টা করুন।
          </div>
        ) : null}
      </section>
    </PublicShell>
  );
}
