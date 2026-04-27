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

  const { fundEntries, memberRequests, members } = await getAppData();

  return (
    <AdminShell
      activePath="/admin/approvals"
      title="অনুমোদন ব্যবস্থাপনা"
      description="পেন্ডিং ফান্ড রিকোয়েস্ট, নতুন সদস্য আবেদন এবং ম্যানুয়াল ফান্ড এন্ট্রি এখান থেকে পরিচালনা করুন।"
    >
      <AdminApprovalsClient
        fundEntries={fundEntries}
        memberRequests={memberRequests}
        members={members}
      />
    </AdminShell>
  );
}
