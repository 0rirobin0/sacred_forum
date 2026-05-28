"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Bolt,
  ChartColumnBig,
  Pencil,
  Hammer,
  Plus,
  Printer,
  Save,
  Sparkles,
  Trash2,
  User,
  Wrench,
} from "lucide-react";

import { deleteExpenseAction, upsertExpenseAction } from "@/app/actions/admin-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/format";
import type { ExpenseEntry, SummaryStats } from "@/lib/types";

type ExpenseEntriesClientProps = {
  initialExpenses: ExpenseEntry[];
  initialSummary: SummaryStats;
};

type DraftExpense = {
  description: string;
  amount: string;
  date: string;
  category: string;
};

const categoryOptions = [
  "মেরামত ও রক্ষণাবেক্ষণ",
  "ইউটিলিটি বিল",
  "ইমাম ও মোয়াজ্জিন ভাতা",
  "নির্মাণ সামগ্রী",
  "অন্যান্য",
];

function expenseIcon(category?: string) {
  switch (category) {
    case "মেরামত ও রক্ষণাবেক্ষণ":
      return Hammer;
    case "ইউটিলিটি বিল":
      return Bolt;
    case "ইমাম ও মোয়াজ্জিন ভাতা":
      return User;
    case "নির্মাণ সামগ্রী":
      return Wrench;
    default:
      return Sparkles;
  }
}

export function ExpenseEntriesClient({
  initialExpenses,
  initialSummary,
}: ExpenseEntriesClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const expenses = initialExpenses;
  const [filter, setFilter] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftExpense>({
    description: "",
    amount: "",
    date: "",
    category: categoryOptions[0],
  });

  const filteredExpenses = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return expenses;

    return expenses.filter((expense) => {
      return (
        expense.description.toLowerCase().includes(query) ||
        expense.category?.toLowerCase().includes(query) ||
        expense.date.toLowerCase().includes(query)
      );
    });
  }, [expenses, filter]);

  const thisMonthTotal = initialSummary.thisMonthExpense;
  const remainingBudget = initialSummary.currentBalance;

  function updateDraft<K extends keyof DraftExpense>(
    key: K,
    value: DraftExpense[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    const amount = Number(draft.amount);
    if (!draft.description.trim() || !draft.date || !amount || amount <= 0) {
      setError("খরচের বিবরণ, পরিমাণ এবং তারিখ সঠিকভাবে দিন।");
      return;
    }

    startTransition(async () => {
      try {
        await upsertExpenseAction({
          id: editingId ?? undefined,
          amount,
          description: draft.description.trim(),
          category: draft.category,
          date: draft.date,
        });
        setDraft({
          description: "",
          amount: "",
          date: "",
          category: categoryOptions[0],
        });
        setEditingId(null);
        setMessage(editingId ? "খরচের তথ্য আপডেট হয়েছে।" : "নতুন খরচ যোগ হয়েছে।");
        router.refresh();
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : "খরচ সংরক্ষণ করা যায়নি।");
      }
    });
  }

  function editExpense(expense: ExpenseEntry) {
    setEditingId(expense.id);
    setDraft({
      description: expense.description,
      amount: String(expense.amount),
      date: expense.date.slice(0, 10),
      category: expense.category ?? categoryOptions[0],
    });
    setMessage(null);
    setError(null);
  }

  function removeExpense(id: string) {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      try {
        await deleteExpenseAction(id);
        if (editingId === id) {
          setEditingId(null);
          setDraft({
            description: "",
            amount: "",
            date: "",
            category: categoryOptions[0],
          });
        }
        router.refresh();
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : "খরচ ডিলিট করা যায়নি।");
      }
    });
  }

  return (
    <>
      <section className="mb-8 grid gap-6 md:grid-cols-3">
        <Card className="relative overflow-hidden bg-primary text-white">
          <div className="absolute -bottom-6 -right-3 opacity-10">
            <ChartColumnBig className="size-28" />
          </div>
          <CardHeader>
            <p className="text-sm text-white/75 bengali-copy">মোট খরচ (এই মাস)</p>
          </CardHeader>
          <CardContent>
            <p className="headline-display text-3xl font-extrabold sm:text-4xl lg:text-5xl">
              {formatCurrency(thisMonthTotal)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#ffe9a7]">
          <CardHeader>
            <p className="text-sm text-primary/70 bengali-copy">বাজেট অবশিষ্ট</p>
          </CardHeader>
          <CardContent>
            <p className="headline-display text-3xl font-extrabold text-primary sm:text-4xl lg:text-5xl">
              {formatCurrency(remainingBudget)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-5 pt-6">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary text-white sm:size-16">
              <Printer className="size-6 sm:size-8" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground bengali-copy">মোট লেনদেন</p>
              <p className="mt-2 headline-display text-3xl font-extrabold text-primary sm:text-4xl">
                {expenses.length}টি
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-white">
                <Plus className="size-6" />
              </div>
              <CardTitle className="text-xl sm:text-2xl lg:text-3xl">নতুন খরচ যোগ করুন</CardTitle>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-primary/70 bengali-copy">
                  খরচের বিবরণ
                </label>
                <Input
                  value={draft.description}
                  onChange={(event) => updateDraft("description", event.target.value)}
                  placeholder="উদা: বৈদ্যুতিক ফ্যান মেরামত"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-primary/70 bengali-copy">
                    পরিমাণ (টাকা)
                  </label>
                  <Input
                    value={draft.amount}
                    onChange={(event) => updateDraft("amount", event.target.value)}
                    type="number"
                    min={1}
                    placeholder="৳ ০.০০"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-primary/70 bengali-copy">তারিখ</label>
                  <Input
                    value={draft.date}
                    onChange={(event) => updateDraft("date", event.target.value)}
                    type="date"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-primary/70 bengali-copy">বিভাগ</label>
                <Select
                  value={draft.category}
                  onChange={(event) => updateDraft("category", event.target.value)}
                >
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
              </div>

              <Button type="submit" disabled={isPending} className="w-full gap-2">
                <Save className="size-5" />
                {isPending ? "সংরক্ষণ হচ্ছে..." : editingId ? "আপডেট করুন" : "সংরক্ষণ করুন"}
              </Button>
              {editingId ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingId(null);
                    setDraft({
                      description: "",
                      amount: "",
                      date: "",
                      category: categoryOptions[0],
                    });
                  }}
                >
                  বাতিল
                </Button>
              ) : null}
              {message ? (
                <div className="rounded-[1.25rem] bg-primary/10 px-4 py-3 text-sm text-primary bengali-copy">
                  {message}
                </div>
              ) : null}
              {error ? (
                <div className="rounded-[1.25rem] bg-destructive/10 px-4 py-3 text-sm text-destructive bengali-copy">
                  {error}
                </div>
              ) : null}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <CardTitle className="text-xl sm:text-2xl lg:text-3xl">সাম্প্রতিক খরচসমূহ</CardTitle>
              <div className="flex flex-wrap gap-3">
                <Badge variant="outline">এই মাস</Badge>
                <Badge variant="outline">পিডিএফ ডাউনলোড</Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="mb-5">
              <Input
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                placeholder="খরচের শিরোনাম বা তারিখ দিয়ে খুঁজুন..."
              />
            </div>

            <div className="space-y-4">
              {filteredExpenses.map((expense) => {
                const Icon = expenseIcon(expense.category);

                return (
                  <div
                    key={expense.id}
                    className="flex flex-col gap-4 rounded-[1.6rem] border border-border/70 bg-card p-5 shadow-[0_10px_24px_rgba(0,0,0,0.04)] md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-center gap-5">
                      <div className="flex size-14 items-center justify-center rounded-full bg-muted text-secondary">
                        <Icon className="size-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-foreground bengali-copy sm:text-lg">
                          {expense.description}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground bengali-copy sm:text-base">
                          {expense.category} • {formatDate(expense.date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="headline-display text-2xl font-extrabold text-destructive sm:text-3xl">
                        {formatCurrency(expense.amount)}
                      </p>
                      <div className="mt-3 flex justify-start gap-2 md:justify-end">
                        <Button
                          type="button"
                          size="icon"
                          onClick={() => editExpense(expense)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          onClick={() => removeExpense(expense.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
