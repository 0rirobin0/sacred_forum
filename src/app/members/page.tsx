import { AdminMembersClient } from "@/components/admin/admin-members-client";
import { PublicShell } from "@/components/public-shell";
import { getAppData } from "@/lib/live-data";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const { members } = await getAppData();

  return (
    <PublicShell activePath="/members">
      <section className="container-shell pb-24 pt-12">
        <span className="section-kicker">Member Directory</span>
        <h1 className="headline-display text-5xl font-black text-primary">সদস্য তালিকা</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground bengali-copy">
          নাম, মোবাইল নম্বর, যোগদানের তারিখ এবং মোট অবদানসহ সম্মানিত সদস্যদের পরিচিতি।
        </p>

        <div className="mt-8">
          <AdminMembersClient members={members} readOnly />
        </div>
      </section>
    </PublicShell>
  );
}
