"use server";

import { revalidatePath } from "next/cache";

import { firebasePush } from "@/lib/firebase-server";
import { getAppData } from "@/lib/live-data";

type FundRequestInput = {
  memberId: string;
  amount: number;
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

export async function createFundRequestAction(input: FundRequestInput) {
  const { members } = await getAppData();
  const member = members.find((entry) => entry.id === input.memberId && entry.status === "active");

  if (!member) {
    throw new Error("সদস্য তালিকা থেকে বৈধ সদস্য নির্বাচন করুন।");
  }

  if (!input.amount || input.amount < 100) {
    throw new Error("ফান্ডের পরিমাণ কমপক্ষে ১০০ টাকা হতে হবে।");
  }

  await firebasePush("fundEntries", {
    memberId: member.id,
    memberName: member.name,
    memberMobile: member.mobile,
    amount: input.amount,
    submittedDate: nowIsoDate(),
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
