export type MemberStatus = "active" | "inactive" | "pending";
export type RequestStatus = "pending" | "approved" | "rejected";
export type ActivityType = "fund" | "expense" | "member";

export type Member = {
  id: string;
  name: string;
  mobile: string;
  address: string;
  joinDate: string;
  status: MemberStatus;
  totalContribution: number;
};

export type FundEntry = {
  id: string;
  memberId?: string;
  memberName: string;
  memberMobile: string;
  amount: number;
  submittedDate: string;
  approvedDate?: string;
  paymentMethod: string;
  note?: string;
  status: RequestStatus;
};

export type ExpenseEntry = {
  id: string;
  amount: number;
  description: string;
  category?: string;
  date: string;
  addedBy: string;
};

export type MemberRequest = {
  id: string;
  name: string;
  mobile: string;
  address: string;
  note?: string;
  submittedDate: string;
  status: RequestStatus;
};

export type Hadith = {
  arabic?: string;
  bengali: string;
  source: string;
};

export type BreakingNews = {
  message: string;
  isActive: boolean;
  updatedAt: string;
};

export type ActivityItem = {
  id: string;
  type: ActivityType;
  title: string;
  subtitle: string;
  amount?: number;
  date: string;
  status?: RequestStatus | "live";
};

export type SummaryStats = {
  totalFund: number;
  totalExpense: number;
  currentBalance: number;
  totalMembers: number;
  pendingFundRequests: number;
  newMemberRequests: number;
  thisMonthCollection: number;
  thisMonthExpense: number;
  todayCollection: number;
  thisMonthTransactionCount: number;
};

export type MonthlyPoint = {
  month: string;
  collection: number;
  expense: number;
};
