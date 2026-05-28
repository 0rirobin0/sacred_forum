import type {
  ActivityItem,
  BreakingNews,
  ExpenseEntry,
  FundEntry,
  Member,
  MemberRequest,
  MonthlyPoint,
  SummaryStats,
} from "@/lib/types";
import { firebaseGet } from "@/lib/firebase-server";

type RecordMap<T extends { id?: string }> = Record<string, T | null> | null;

export type AppData = {
  members: Member[];
  fundEntries: FundEntry[];
  expenseEntries: ExpenseEntry[];
  memberRequests: MemberRequest[];
  breakingNews: BreakingNews | null;
  summaryStats: SummaryStats;
  monthlyTrend: MonthlyPoint[];
  recentActivities: ActivityItem[];
  topContributors: Member[];
};

type FundEntryRecord = FundEntry & {
  createdAt?: string | number;
};

type ExpenseEntryRecord = ExpenseEntry & {
  createdAt?: string | number;
};

type MemberRequestRecord = MemberRequest & {
  createdAt?: string | number;
};

type MemberRecord = Omit<Member, "totalContribution"> & {
  totalContribution?: number;
  createdAt?: string | number;
};

type BreakingNewsRecord = Partial<BreakingNews> & {
  createdAt?: string | number;
};

function toArray<T extends { id?: string }>(collection: RecordMap<T>): T[] {
  if (!collection) return [];

  return Object.entries(collection)
    .map(([key, value]) => {
      if (!value) return null;
      return {
        ...value,
        id: value.id ?? key,
      } as T;
    })
    .filter((value): value is T => Boolean(value));
}

function dateValue(value?: string) {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getMonthKey(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getFundEntryMonthKey(entry: FundEntry) {
  if (entry.year && entry.month) {
    return `${entry.year}-${entry.month}`;
  }

  return getMonthKey(entry.approvedDate ?? entry.submittedDate);
}

function buildMonthlyTrend(
  approvedFunds: FundEntry[],
  expenses: ExpenseEntry[],
): MonthlyPoint[] {
  const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });
  const today = new Date();

  return Array.from({ length: 5 }).map((_, index) => {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - (4 - index), 1);
    const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;

    const collection = approvedFunds
      .filter((entry) => getFundEntryMonthKey(entry) === monthKey)
      .reduce((sum, entry) => sum + entry.amount, 0);

    const expense = expenses
      .filter((entry) => getMonthKey(entry.date) === monthKey)
      .reduce((sum, entry) => sum + entry.amount, 0);

    return {
      month: monthFormatter.format(monthDate).toUpperCase(),
      collection,
      expense,
    };
  });
}

function buildRecentActivities(
  approvedFunds: FundEntry[],
  expenses: ExpenseEntry[],
  memberRequests: MemberRequest[],
): ActivityItem[] {
  const fundActivities: ActivityItem[] = approvedFunds.map((entry) => ({
    id: `fund-${entry.id}`,
    type: "fund",
    title: `${entry.memberName} ফান্ড জমা দিয়েছেন`,
    subtitle: `${entry.paymentMethod} • অনুমোদিত`,
    amount: entry.amount,
    date: entry.approvedDate ?? entry.submittedDate,
    status: "approved",
  }));

  const expenseActivities: ActivityItem[] = expenses.map((entry) => ({
    id: `expense-${entry.id}`,
    type: "expense",
    title: entry.description,
    subtitle: entry.category ?? "অন্যান্য",
    amount: entry.amount,
    date: entry.date,
    status: "live",
  }));

  const memberActivities: ActivityItem[] = memberRequests.map((entry) => ({
    id: `member-${entry.id}`,
    type: "member",
    title: `${entry.name} নতুন সদস্য হওয়ার আবেদন করেছেন`,
    subtitle: entry.status === "pending" ? "যাচাইয়ের অপেক্ষায়" : entry.status,
    date: entry.submittedDate,
    status: entry.status,
  }));

  return [...fundActivities, ...expenseActivities, ...memberActivities]
    .sort((a, b) => dateValue(b.date) - dateValue(a.date))
    .slice(0, 8);
}

export async function getAppData(): Promise<AppData> {
  const [memberMap, fundMap, legacyFundMap, expenseMap, memberRequestMap, breakingNewsRecord] =
    await Promise.all([
      firebaseGet<RecordMap<MemberRecord>>("members"),
      firebaseGet<RecordMap<FundEntryRecord>>("fundEntries"),
      firebaseGet<RecordMap<FundEntryRecord>>("fundRequests"),
      firebaseGet<RecordMap<ExpenseEntryRecord>>("expenseEntries"),
      firebaseGet<RecordMap<MemberRequestRecord>>("memberRequests"),
      firebaseGet<BreakingNewsRecord>("siteContent/breakingNews"),
    ]);

  const rawFundEntries = [
    ...toArray(fundMap),
    ...toArray(legacyFundMap).filter(
      (legacyEntry) =>
        !toArray(fundMap).some((currentEntry) => currentEntry.id === legacyEntry.id),
    ),
  ];

  const approvedFundTotals = rawFundEntries.reduce<Record<string, number>>((acc, entry) => {
    if (entry.status !== "approved" || !entry.memberId) {
      return acc;
    }

    acc[entry.memberId] = (acc[entry.memberId] ?? 0) + entry.amount;
    return acc;
  }, {});

  const members = toArray(memberMap)
    .map((member) => ({
      ...member,
      totalContribution: approvedFundTotals[member.id] ?? 0,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "bn"));

  const fundEntries = rawFundEntries.sort(
    (a, b) =>
      dateValue(b.approvedDate ?? b.submittedDate) -
      dateValue(a.approvedDate ?? a.submittedDate),
  );

  const expenseEntries = toArray(expenseMap).sort(
    (a, b) => dateValue(b.date) - dateValue(a.date),
  );

  const memberRequests = toArray(memberRequestMap).sort(
    (a, b) => dateValue(b.submittedDate) - dateValue(a.submittedDate),
  );

  const approvedFunds = fundEntries.filter((entry) => entry.status === "approved");
  const totalFund = approvedFunds.reduce((sum, entry) => sum + entry.amount, 0);
  const totalExpense = expenseEntries.reduce((sum, entry) => sum + entry.amount, 0);

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const todayKey = now.toISOString().slice(0, 10);

  const thisMonthApproved = approvedFunds.filter(
    (entry) => getFundEntryMonthKey(entry) === currentMonthKey,
  );
  const thisMonthExpenseItems = expenseEntries.filter(
    (entry) => getMonthKey(entry.date) === currentMonthKey,
  );

  const summaryStats: SummaryStats = {
    totalFund,
    totalExpense,
    currentBalance: totalFund - totalExpense,
    totalMembers: members.filter((member) => member.status === "active").length,
    pendingFundRequests: fundEntries.filter((entry) => entry.status === "pending").length,
    newMemberRequests: memberRequests.filter((entry) => entry.status === "pending").length,
    thisMonthCollection: thisMonthApproved.reduce((sum, entry) => sum + entry.amount, 0),
    thisMonthExpense: thisMonthExpenseItems.reduce((sum, entry) => sum + entry.amount, 0),
    todayCollection: approvedFunds
      .filter((entry) => (entry.approvedDate ?? entry.submittedDate).slice(0, 10) === todayKey)
      .reduce((sum, entry) => sum + entry.amount, 0),
    thisMonthTransactionCount: thisMonthApproved.length + thisMonthExpenseItems.length,
  };

  const monthlyTrend = buildMonthlyTrend(approvedFunds, expenseEntries);
  const recentActivities = buildRecentActivities(
    approvedFunds,
    expenseEntries,
    memberRequests,
  );
  const topContributors = members
    .slice()
    .sort((a, b) => b.totalContribution - a.totalContribution)
    .slice(0, 3);
  const breakingNews =
    breakingNewsRecord && breakingNewsRecord.message?.trim()
      ? {
          message: breakingNewsRecord.message.trim(),
          isActive: Boolean(breakingNewsRecord.isActive),
          updatedAt: breakingNewsRecord.updatedAt ?? "",
        }
      : null;

  return {
    members,
    fundEntries,
    expenseEntries,
    memberRequests,
    breakingNews,
    summaryStats,
    monthlyTrend,
    recentActivities,
    topContributors,
  };
}
