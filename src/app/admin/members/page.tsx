import { redirect } from "next/navigation";

import { AdminMembersClient } from "@/components/admin/admin-members-client";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/admin-auth";
import { getAppData } from "@/lib/live-data";

export default async function AdminMembersPage() {
  const isLoggedIn = await requireAdminSession();

  if (!isLoggedIn) {
    redirect("/admin/login");
  }

  const { members, summaryStats } = await getAppData();
  const notificationCount =
    summaryStats.pendingFundRequests + summaryStats.newMemberRequests;

  return (
    <AdminShell
      activePath="/admin/members"
      title="সদস্য ব্যবস্থাপনা"
      description="সদস্য যোগ করুন, সম্পাদনা করুন, ডিলিট করুন এবং মোবাইল বা নাম দিয়ে দ্রুত খুঁজে নিন।"
      notificationCount={notificationCount}
    >
      <AdminMembersClient members={members} />
    </AdminShell>
  );
}
