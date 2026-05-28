"use server";

import { revalidatePath } from "next/cache";

import { firebasePush } from "@/lib/firebase-server";
import { getAppData } from "@/lib/live-data";

type FundRequestInput = {
  memberId: string;
  amount: number;
  month: string;
  year: string;
  note?: string;
};

type MemberRequestInput = {
  name: string;
  mobile: string;
  address: string;
  note?: string;
};

function nowIsoDate() {
  return new Date().toISOString();
}

function buildEntryDate(month: string, year: string) {
  const monthIndex = Number(month) - 1;
  const yearNumber = Number(year);
  if (Number.isNaN(monthIndex) || Number.isNaN(yearNumber)) {
    return nowIsoDate();
  }
  return new Date(yearNumber, monthIndex, 1).toISOString();
}

function normalizeMonthValue(value: string) {
  const normalized = value.padStart(2, "0");
  return /^(0[1-9]|1[0-2])$/.test(normalized) ? normalized : "";
}

function normalizeYearValue(value: string) {
  return /^\d{4}$/.test(value) ? value : "";
}

export async function createFundRequestAction(input: FundRequestInput) {
  const { members } = await getAppData();
  const member = members.find((entry) => entry.id === input.memberId && entry.status === "active");

  if (!member) {
    throw new Error("সদস্য তালিকা থেকে বৈধ সদস্য নির্বাচন করুন।");
  }

  if (!input.amount || input.amount < 100) {
    throw new Error("ফান্ডের পরিমাণ কমপক্ষে ১০০ টাকা হতে হবে।");
  }

  const month = normalizeMonthValue(input.month);
  const year = normalizeYearValue(input.year);

  if (!month || !year) {
    throw new Error("মাস এবং বছর নির্বাচন করুন।");
  }

  const submittedDate = buildEntryDate(month, year);

  await firebasePush("fundEntries", {
    memberId: member.id,
    memberName: member.name,
    memberMobile: member.mobile,
    amount: input.amount,
    month,
    year,
    submittedDate,
    paymentMethod: "bKash",
    note: input.note?.trim() || "",
    status: "pending",
  });

  revalidatePath("/");
  revalidatePath("/add-fund");
  revalidatePath("/fund-history");
  revalidatePath("/admin");
  revalidatePath("/admin/approvals");
}

export async function createMemberRequestAction(input: MemberRequestInput) {
  const { members, memberRequests } = await getAppData();
  const normalizedMobile = input.mobile.trim();

  if (!input.name.trim() || !normalizedMobile || !input.address.trim()) {
    throw new Error("নাম, মোবাইল নম্বর এবং ঠিকানা পূরণ করা আবশ্যক।");
  }

  const mobileExists =
    members.some((member) => member.mobile === normalizedMobile) ||
    memberRequests.some(
      (request) => request.mobile === normalizedMobile && request.status === "pending",
    );

  if (mobileExists) {
    throw new Error("এই মোবাইল নম্বর দিয়ে ইতোমধ্যে সদস্য বা আবেদন রয়েছে।");
  }

  await firebasePush("memberRequests", {
    name: input.name.trim(),
    mobile: normalizedMobile,
    address: input.address.trim(),
    note: input.note?.trim() || "",
    submittedDate: nowIsoDate(),
    status: "pending",
  });

  revalidatePath("/");
  revalidatePath("/new-member");
  revalidatePath("/members");
  revalidatePath("/admin");
  revalidatePath("/admin/approvals");
}
