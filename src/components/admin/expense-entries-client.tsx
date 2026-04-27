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
      <section className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <div className="rounded-[2rem] bg-white p-5 shadow-[0_24px_50px_rgba(0,0,0,0.05)] sm:p-6 lg:p-7">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-white">
              <Plus className="size-6" />
            </div>
            <h2 className="headline-display text-xl font-extrabold text-primary sm:text-2xl lg:text-3xl">
              নতুন খরচ যোগ করুন
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-sm font-bold text-primary/70 bengali-copy">
                খরচের বিবরণ
              </label>
              <input
                value={draft.description}
                onChange={(event) => updateDraft("description", event.target.value)}
                placeholder="উদা: বৈদ্যুতিক ফ্যান মেরামত"
                className="w-full border-0 border-b-2 border-[#d7d1c6] bg-transparent px-1 py-4 text-base text-primary outline-none placeholder:text-primary/45 focus:border-secondary sm:text-lg"
              />
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              <div className="space-y-3">
                <label className="text-sm font-bold text-primary/70 bengali-copy">
                  পরিমাণ (টাকা)
                </label>
                <input
                  value={draft.amount}
                  onChange={(event) => updateDraft("amount", event.target.value)}
                  type="number"
                  min={1}
                  placeholder="৳ ০.০০"
                  className="w-full border-0 border-b-2 border-[#d7d1c6] bg-transparent px-1 py-4 text-base text-primary outline-none placeholder:text-primary/45 focus:border-secondary sm:text-lg"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-primary/70 bengali-copy">
                  তারিখ
                </label>
                <input
                  value={draft.date}
                  onChange={(event) => updateDraft("date", event.target.value)}
                  type="date"
                  className="w-full border-0 border-b-2 border-[#d7d1c6] bg-transparent px-1 py-4 text-base text-primary outline-none focus:border-secondary sm:text-lg"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-primary/70 bengali-copy">
                বিভাগ
              </label>
              <select
                value={draft.category}
                onChange={(event) => updateDraft("category", event.target.value)}
                className="w-full appearance-none border-0 border-b-2 border-[#d7d1c6] bg-transparent px-1 py-4 text-base text-primary outline-none focus:border-secondary sm:text-lg"
              >
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-center gap-3 rounded-[1.4rem] bg-primary px-6 py-4 text-base font-bold text-white shadow-[0_18px_36px_rgba(0,56,32,0.18)] sm:py-5 sm:text-lg"
            >
              <Save className="size-6" />
              {isPending ? "সংরক্ষণ হচ্ছে..." : editingId ? "আপডেট করুন" : "সংরক্ষণ করুন"}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setDraft({
                    description: "",
                    amount: "",
                    date: "",
                    category: categoryOptions[0],
                  });
                }}
                className="w-full rounded-[1.4rem] border border-primary/15 px-6 py-4 text-base font-bold text-primary sm:py-5 sm:text-lg"
              >
                বাতিল
              </button>
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
        </div>

        <div className="rounded-[2rem] bg-[#f1ede4] p-5 shadow-[0_20px_40px_rgba(0,0,0,0.04)] sm:p-6 lg:p-7">
          <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <h2 className="headline-display text-xl font-extrabold text-primary sm:text-2xl lg:text-3xl">
              সাম্প্রতিক খরচসমূহ
            </h2>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-full bg-[#e6e0d6] px-4 py-2 text-sm font-bold text-primary bengali-copy sm:px-5 sm:py-2.5 sm:text-base"
              >
                এই মাস
              </button>
              <button
                type="button"
                className="rounded-full bg-[#e6e0d6] px-4 py-2 text-sm font-bold text-primary bengali-copy sm:px-5 sm:py-2.5 sm:text-base"
              >
                পিডিএফ ডাউনলোড
              </button>
            </div>
          </div>

          <div className="mb-5">
            <input
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder="খরচের শিরোনাম বা তারিখ দিয়ে খুঁজুন..."
              className="w-full rounded-[1.35rem] border border-[#e2ddd3] bg-white px-5 py-4 text-base text-primary outline-none placeholder:text-primary/40"
            />
          </div>

          <div className="space-y-4">
            {filteredExpenses.map((expense) => {
              const Icon = expenseIcon(expense.category);

              return (
                <div
                  key={expense.id}
                  className="flex flex-col gap-4 rounded-[1.6rem] bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.04)] md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-center gap-5">
                    <div className="flex size-16 items-center justify-center rounded-full bg-[#ece7dd] text-secondary">
                      <Icon className="size-7" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-primary bengali-copy sm:text-lg">
                        {expense.description}
                      </h3>
                      <p className="mt-1 text-sm text-primary/50 bengali-copy sm:text-base">
                        {expense.category} • {formatDate(expense.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="headline-display text-2xl font-extrabold text-[#c62828] sm:text-3xl">
                      {formatCurrency(expense.amount)}
                    </p>
                    <div className="mt-3 flex justify-start gap-2 md:justify-end">
                      <button
                        type="button"
                        onClick={() => editExpense(expense)}
                        className="flex size-10 items-center justify-center rounded-xl bg-primary text-white"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeExpense(expense.id)}
                        className="flex size-10 items-center justify-center rounded-xl bg-[#ffd7d5] text-[#c62828]"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="relative overflow-hidden rounded-[2rem] bg-primary p-5 text-white shadow-[0_20px_40px_rgba(0,56,32,0.16)] sm:p-6 lg:p-7">
          <div className="absolute -bottom-6 -right-3 opacity-10">
            <ChartColumnBig className="size-28" />
          </div>
          <p className="text-sm text-white/75 bengali-copy sm:text-base">মোট খরচ (এই মাস)</p>
          <p className="mt-4 headline-display text-3xl font-extrabold sm:text-4xl lg:mt-5 lg:text-5xl">
            {formatCurrency(thisMonthTotal)}
          </p>
        </div>

        <div className="rounded-[2rem] bg-[#ffd978] p-5 shadow-[0_20px_40px_rgba(217,174,53,0.18)] sm:p-6 lg:p-7">
          <p className="text-sm text-primary/70 bengali-copy sm:text-base">বাজেট অবশিষ্ট</p>
          <p className="mt-4 headline-display text-3xl font-extrabold text-primary sm:text-4xl lg:mt-5 lg:text-5xl">
            {formatCurrency(remainingBudget)}
          </p>
        </div>

        <div className="rounded-[2rem] bg-[#ebe7de] p-5 shadow-[0_20px_40px_rgba(0,0,0,0.05)] sm:p-6 lg:p-7">
          <div className="flex items-center gap-5">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary text-white sm:size-16">
              <Printer className="size-6 sm:size-8" />
            </div>
            <div>
              <p className="text-sm text-primary/70 bengali-copy sm:text-base">মোট লেনদেন</p>
              <p className="mt-2 headline-display text-3xl font-extrabold text-primary sm:text-4xl">
                {expenses.length}টি
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
