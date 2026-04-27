"use server";

import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/admin-auth";
import {
  firebaseDelete,
  firebaseGet,
  firebasePatch,
  firebasePush,
  firebaseSet,
} from "@/lib/firebase-server";
import { getAppData } from "@/lib/live-data";
import type {
  BreakingNews,
  ExpenseEntry,
  FundEntry,
  MemberRequest,
  RequestStatus,
} from "@/lib/types";

type ExpenseInput = {
  id?: string;
  description: string;
  amount: number;
  date: string;
  category?: string;
};

type MemberInput = {
  id?: string;
  name: string;
  mobile: string;
  address: string;
  status: "active" | "inactive";
};

type ManualFundInput = {
  memberId: string;
  amount: number;
  paymentMethod: string;
  note?: string;
};

type BreakingNewsInput = {
  message: string;
  isActive: boolean;
};

function nowIsoDate() {
  return new Date().toISOString();
}

async function assertAdmin() {
  const allowed = await requireAdminSession();

  if (!allowed) {
    throw new Error("Unauthorized");
  }
}

function nextMemberId(memberIds: string[]) {
  const numericIds = memberIds
    .map((id) => Number(id.replace(/^MDF-/, "")))
    .filter((value) => Number.isFinite(value));
  const nextValue = (numericIds.length ? Math.max(...numericIds) : 0) + 1;
  return `MDF-${String(nextValue).padStart(3, "0")}`;
}

async function revalidateAdminAndPublic() {
  revalidatePath("/");
  revalidatePath("/members");
  revalidatePath("/fund-history");
  revalidatePath("/expenses");
  revalidatePath("/add-fund");
  revalidatePath("/new-member");
  revalidatePath("/admin");
  revalidatePath("/admin/expenses");
  revalidatePath("/admin/approvals");
  revalidatePath("/admin/members");
}

async function findFundEntryById(id: string) {
  const directEntry = await firebaseGet<FundEntry>(`fundEntries/${id}`);
  if (directEntry) {
    return { entry: { ...directEntry, id }, path: `fundEntries/${id}`, isLegacy: false };
  }

  const legacyEntry = await firebaseGet<FundEntry>(`fundRequests/${id}`);
  if (legacyEntry) {
    return { entry: { ...legacyEntry, id }, path: `fundRequests/${id}`, isLegacy: true };
  }

  return null;
}

export async function upsertExpenseAction(input: ExpenseInput) {
  await assertAdmin();

  if (!input.description.trim() || !input.date || !input.amount || input.amount <= 0) {
    throw new Error("খরচের বিবরণ, পরিমাণ এবং তারিখ সঠিকভাবে দিন।");
  }

  const payload: ExpenseEntry = {
    id: input.id ?? "",
    description: input.description.trim(),
    amount: input.amount,
    date: input.date,
    category: input.category?.trim() || "অন্যান্য",
    addedBy: "অ্যাডমিন",
  };

  if (input.id) {
    await firebasePatch(`expenseEntries/${input.id}`, payload);
  } else {
    await firebasePush("expenseEntries", payload);
  }

  await revalidateAdminAndPublic();
}

export async function deleteExpenseAction(id: string) {
  await assertAdmin();
  await firebaseDelete(`expenseEntries/${id}`);
  await revalidateAdminAndPublic();
}

export async function approveFundRequestAction(id: string) {
  await assertAdmin();

  const located = await findFundEntryById(id);
  if (!located) {
    throw new Error("ফান্ড রিকোয়েস্ট পাওয়া যায়নি।");
  }

  const approvedPayload = {
    ...located.entry,
    id,
    status: "approved" satisfies RequestStatus,
    approvedDate: nowIsoDate(),
  };

  await firebaseSet(`fundEntries/${id}`, approvedPayload);

  if (located.isLegacy) {
    await firebaseDelete(located.path);
  }

  await revalidateAdminAndPublic();
}

export async function rejectFundRequestAction(id: string) {
  await assertAdmin();

  const located = await findFundEntryById(id);
  if (!located) {
    throw new Error("ফান্ড রিকোয়েস্ট পাওয়া যায়নি।");
  }

  if (located.isLegacy) {
    await firebaseSet(`fundEntries/${id}`, {
      ...located.entry,
      id,
      status: "rejected" satisfies RequestStatus,
    });
    await firebaseDelete(located.path);
  } else {
    await firebasePatch(located.path, { status: "rejected" satisfies RequestStatus });
  }

  await revalidateAdminAndPublic();
}

export async function approveMemberRequestAction(id: string) {
  await assertAdmin();

  const request = await firebaseGet<MemberRequest>(`memberRequests/${id}`);
  if (!request) {
    throw new Error("সদস্য আবেদন পাওয়া যায়নি।");
  }

  const { members } = await getAppData();
  if (members.some((member) => member.mobile === request.mobile)) {
    throw new Error("এই মোবাইল নম্বর দিয়ে সদস্য ইতোমধ্যে রয়েছে।");
  }

  const memberId = nextMemberId(members.map((member) => member.id));

  await firebaseSet(`members/${memberId}`, {
    id: memberId,
    name: request.name,
    mobile: request.mobile,
    address: request.address,
    joinDate: nowIsoDate(),
    status: "active",
  });

  await firebasePatch(`memberRequests/${id}`, { status: "approved" satisfies RequestStatus });
  await revalidateAdminAndPublic();
}

export async function rejectMemberRequestAction(id: string) {
  await assertAdmin();
  await firebasePatch(`memberRequests/${id}`, { status: "rejected" satisfies RequestStatus });
  await revalidateAdminAndPublic();
}

export async function upsertMemberAction(input: MemberInput) {
  await assertAdmin();

  const { members } = await getAppData();
  const normalizedMobile = input.mobile.trim();

  if (!input.name.trim() || !normalizedMobile || !input.address.trim()) {
    throw new Error("নাম, মোবাইল নম্বর এবং ঠিকানা পূরণ করা আবশ্যক।");
  }

  const duplicate = members.find(
    (member) => member.mobile === normalizedMobile && member.id !== input.id,
  );
  if (duplicate) {
    throw new Error("এই মোবাইল নম্বর দিয়ে আরেকজন সদস্য রয়েছে।");
  }

  const nextId = input.id ?? nextMemberId(members.map((member) => member.id));
  const existingMember = members.find((member) => member.id === input.id);

  await firebaseSet(`members/${nextId}`, {
    id: nextId,
    name: input.name.trim(),
    mobile: normalizedMobile,
    address: input.address.trim(),
    joinDate: existingMember?.joinDate ?? nowIsoDate(),
    status: input.status,
  });

  await revalidateAdminAndPublic();
}

export async function deleteMemberAction(id: string) {
  await assertAdmin();
  await firebaseDelete(`members/${id}`);
  await revalidateAdminAndPublic();
}

export async function createManualFundEntryAction(input: ManualFundInput) {
  await assertAdmin();

  const { members } = await getAppData();
  const member = members.find((entry) => entry.id === input.memberId);

  if (!member) {
    throw new Error("সদস্য পাওয়া যায়নি।");
  }

  if (!input.amount || input.amount < 100) {
    throw new Error("ফান্ডের পরিমাণ কমপক্ষে ১০০ টাকা হতে হবে।");
  }

  const approvedDate = nowIsoDate();

  await firebasePush("fundEntries", {
    memberId: member.id,
    memberName: member.name,
    memberMobile: member.mobile,
    amount: input.amount,
    submittedDate: approvedDate,
    approvedDate,
    paymentMethod: input.paymentMethod.trim() || "Cash",
    note: input.note?.trim() || "",
    status: "approved" satisfies RequestStatus,
  });

  await revalidateAdminAndPublic();
}

export async function upsertBreakingNewsAction(input: BreakingNewsInput) {
  await assertAdmin();

  const message = input.message.trim();

  if (!message) {
    throw new Error("Breaking news message is required.");
  }

  const payload: BreakingNews = {
    message,
    isActive: input.isActive,
    updatedAt: nowIsoDate(),
  };

  await firebaseSet("siteContent/breakingNews", payload);
  await revalidateAdminAndPublic();
}

export async function clearBreakingNewsAction() {
  await assertAdmin();
  await firebaseDelete("siteContent/breakingNews");
  await revalidateAdminAndPublic();
}
