import { redirect } from "next/navigation";

import { AdminNotificationBatch } from "@/components/admin/admin-notification-batch";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/admin-auth";
import { getAppData } from "@/lib/live-data";

export default async function AdminNotificationsPage() {
  const isLoggedIn = await requireAdminSession();

  if (!isLoggedIn) {
    redirect("/admin/login");
  }

  const { fundEntries, memberRequests, summaryStats } = await getAppData();
  const notificationCount =
    summaryStats.pendingFundRequests + summaryStats.newMemberRequests;

  return (
    <AdminShell
      activePath="/admin/notifications"
      title="Notifications"
      description="সকল পেন্ডিং সদস্য ও ফান্ড রিকোয়েস্ট এক জায়গা থেকে দেখে দ্রুত সিদ্ধান্ত নিন।"
      notificationCount={notificationCount}
    >
      <AdminNotificationBatch
        fundEntries={fundEntries}
        memberRequests={memberRequests}
      />
    </AdminShell>
  );
}
