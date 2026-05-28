import { redirect } from "next/navigation";

import { AdminApprovalsClient } from "@/components/admin/admin-approvals-client";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/admin-auth";
import { getAppData } from "@/lib/live-data";

export default async function AdminApprovalsPage() {
  const isLoggedIn = await requireAdminSession();

  if (!isLoggedIn) {
    redirect("/admin/login");
  }

  const { fundEntries, members, summaryStats } = await getAppData();
  const notificationCount =
    summaryStats.pendingFundRequests + summaryStats.newMemberRequests;

  return (
    <AdminShell
      activePath="/admin/approvals"
      title="অনুমোদন ব্যবস্থাপনা"
      description="ম্যানুয়াল ফান্ড এন্ট্রি এবং সাম্প্রতিক ফান্ড হিস্ট্রি এখান থেকে পরিচালনা করুন।"
      notificationCount={notificationCount}
    >
      <AdminApprovalsClient
        currentBalance={summaryStats.currentBalance}
        totalFund={summaryStats.totalFund}
        fundEntries={fundEntries}
        members={members}
      />
    </AdminShell>
  );
}
