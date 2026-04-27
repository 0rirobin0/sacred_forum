import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { ExpenseEntriesClient } from "@/components/admin/expense-entries-client";
import { requireAdminSession } from "@/lib/admin-auth";
import { getAppData } from "@/lib/live-data";

export default async function AdminExpensesPage() {
  const isLoggedIn = await requireAdminSession();

  if (!isLoggedIn) {
    redirect("/admin/login");
  }

  const { expenseEntries, summaryStats } = await getAppData();

  return (
    <AdminShell
      activePath="/admin/expenses"
      title="ব্যয় ব্যবস্থাপনা"
      description="হাজী বাড়ি জামে মসজিদ উন্নয়ন ফোরামের সকল খরচ এখানে নথিভুক্ত করুন এবং অতীতের লেনদেন পর্যবেক্ষণ করুন।"
    >
      <ExpenseEntriesClient
        initialExpenses={expenseEntries}
        initialSummary={summaryStats}
      />
    </AdminShell>
  );
}
