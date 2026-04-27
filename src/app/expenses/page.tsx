import { PublicShell } from "@/components/public-shell";
import { formatCurrency, formatDate } from "@/lib/format";
import { getAppData } from "@/lib/live-data";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const { expenseEntries, summaryStats } = await getAppData();
  return (
    <PublicShell activePath="/expenses">
      <section className="container-shell pb-24 pt-12">
        <span className="section-kicker">Expense Transparency</span>
        <h1 className="headline-display text-5xl font-black text-primary">
          খরচের বিবরণ
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground bengali-copy">
          সকল ব্যয় রিয়েল-টাইম ব্যালেন্সে প্রভাব ফেলে এবং প্রকাশ্যে দৃশ্যমান থাকে।
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="card-soft p-6">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">
              মোট খরচ
            </p>
            <p className="mt-4 headline-display text-4xl font-black text-primary">
              {formatCurrency(summaryStats.totalExpense)}
            </p>
          </div>
          <div className="card-soft p-6">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">
              এই মাসের খরচ
            </p>
            <p className="mt-4 headline-display text-4xl font-black text-primary">
              {formatCurrency(summaryStats.thisMonthExpense)}
            </p>
          </div>
          <div className="card-soft p-6">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">
              বর্তমান ব্যালেন্স
            </p>
            <p className="mt-4 headline-display text-4xl font-black text-primary">
              {formatCurrency(summaryStats.currentBalance)}
            </p>
          </div>
        </div>

        <div className="mt-10 card-soft p-7">
          <div className="space-y-4">
            {expenseEntries.map((expense) => (
              <div
                key={expense.id}
                className="flex flex-col gap-3 rounded-[1.5rem] border border-border/70 bg-muted/50 p-5 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-lg font-bold text-primary bengali-copy">
                    {expense.description}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground bengali-copy">
                    {expense.category ?? "অন্যান্য"} • {expense.addedBy}
                  </p>
                </div>
                <div className="md:text-right">
                  <p className="headline-display text-2xl font-bold text-destructive">
                    {formatCurrency(expense.amount)}
                  </p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-secondary">
                    {formatDate(expense.date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
