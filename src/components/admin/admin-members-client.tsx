"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, UserPlus2 } from "lucide-react";

import {
  deleteMemberAction,
  upsertMemberAction,
} from "@/app/actions/admin-actions";
import { RequestDecisionButtons } from "@/components/admin/request-decision-buttons";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Member, MemberRequest } from "@/lib/types";

type AdminMembersClientProps = {
  members: Member[];
  memberRequests: MemberRequest[];
};

type MemberDraft = {
  id?: string;
  name: string;
  mobile: string;
  address: string;
  status: "active" | "inactive";
};

const emptyDraft: MemberDraft = {
  name: "",
  mobile: "",
  address: "",
  status: "active",
};

export function AdminMembersClient({
  members,
  memberRequests,
}: AdminMembersClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<MemberDraft>(emptyDraft);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pendingMemberRequests = memberRequests.filter((request) => request.status === "pending");

  const filteredMembers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return members;

    return members.filter(
      (member) =>
        member.name.toLowerCase().includes(normalized) ||
        member.mobile.toLowerCase().includes(normalized) ||
        member.id.toLowerCase().includes(normalized),
    );
  }, [members, query]);

  function saveMember(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    startTransition(async () => {
      try {
        await upsertMemberAction(draft);
        setDraft(emptyDraft);
        setMessage(draft.id ? "সদস্য তথ্য আপডেট হয়েছে।" : "নতুন সদস্য যোগ হয়েছে।");
        router.refresh();
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : "কাজটি সম্পন্ন হয়নি।");
      }
    });
  }

  function editMember(member: Member) {
    setDraft({
      id: member.id,
      name: member.name,
      mobile: member.mobile,
      address: member.address,
      status: member.status === "inactive" ? "inactive" : "active",
    });
    setMessage(null);
    setError(null);
  }

  function removeMember(id: string) {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      try {
        await deleteMemberAction(id);
        if (draft.id === id) {
          setDraft(emptyDraft);
        }
        router.refresh();
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : "ডিলিট করা যায়নি।");
      }
    });
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
      <div className="space-y-6">
        <div className="rounded-[2rem] bg-white p-5 shadow-[0_20px_40px_rgba(0,0,0,0.05)] sm:p-6 lg:p-7">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-white">
            <UserPlus2 className="size-6" />
          </div>
          <h3 className="headline-display text-xl font-extrabold text-primary sm:text-2xl lg:text-3xl">
            {draft.id ? "সদস্য তথ্য সম্পাদনা" : "নতুন সদস্য যোগ করুন"}
          </h3>
        </div>

        <form onSubmit={saveMember} className="space-y-5">
          <input
            value={draft.name}
            onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
            placeholder="সদস্যের নাম"
            className="w-full rounded-2xl border border-border bg-background px-4 py-4 outline-none"
          />
          <input
            value={draft.mobile}
            onChange={(event) =>
              setDraft((current) => ({ ...current, mobile: event.target.value }))
            }
            placeholder="মোবাইল নম্বর"
            className="w-full rounded-2xl border border-border bg-background px-4 py-4 outline-none"
          />
          <textarea
            value={draft.address}
            onChange={(event) =>
              setDraft((current) => ({ ...current, address: event.target.value }))
            }
            rows={3}
            placeholder="ঠিকানা"
            className="w-full rounded-2xl border border-border bg-background px-4 py-4 outline-none"
          />
          <select
            value={draft.status}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                status: event.target.value as "active" | "inactive",
              }))
            }
            className="w-full rounded-2xl border border-border bg-background px-4 py-4 outline-none"
          >
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select>

          {message ? (
            <div className="rounded-2xl bg-primary/10 px-4 py-3 text-sm text-primary bengali-copy">
              {message}
            </div>
          ) : null}
          {error ? (
            <div className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive bengali-copy">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-[1.4rem] bg-primary px-6 py-4 text-base font-bold text-white disabled:opacity-60"
            >
              {isPending ? "সংরক্ষণ হচ্ছে..." : draft.id ? "আপডেট করুন" : "সদস্য যোগ করুন"}
            </button>
            {draft.id ? (
              <button
                type="button"
                onClick={() => setDraft(emptyDraft)}
                className="rounded-[1.4rem] border border-primary/15 px-5 py-4 text-base font-bold text-primary"
              >
                বাতিল
              </button>
            ) : null}
          </div>
        </form>
        </div>

        <div className="rounded-[2rem] bg-[#f1ede4] p-5 shadow-[0_20px_40px_rgba(0,0,0,0.04)] sm:p-6 lg:p-7">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="headline-display bengali-copy text-xl font-extrabold text-primary sm:text-2xl lg:text-3xl">
              পেন্ডিং সদস্য আবেদন
            </h3>
            <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-primary">
              {pendingMemberRequests.length}টি
            </span>
          </div>

          <div className="space-y-4">
            {pendingMemberRequests.map((request) => (
              <div
                key={request.id}
                className="rounded-[1.5rem] bg-white p-5 shadow-[0_10px_24px_rgba(0,0,0,0.04)]"
              >
                <p className="text-base font-bold text-primary bengali-copy sm:text-lg">
                  {request.name}
                </p>
                <p className="mt-1 text-sm text-primary/55">{request.mobile}</p>
                <p className="mt-2 text-sm text-primary/70 bengali-copy">{request.address}</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-secondary">
                  {formatDate(request.submittedDate)}
                </p>
                {request.note ? (
                  <p className="mt-3 text-sm text-primary/60 bengali-copy">{request.note}</p>
                ) : null}
                <div className="mt-4">
                  <RequestDecisionButtons requestId={request.id} variant="member" />
                </div>
              </div>
            ))}

            {pendingMemberRequests.length === 0 ? (
              <div className="rounded-[1.5rem] bg-white/70 p-5 text-sm text-primary/55 bengali-copy">
                কোনো পেন্ডিং সদস্য আবেদন নেই।
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] bg-[#f1ede4] p-5 shadow-[0_20px_40px_rgba(0,0,0,0.04)] sm:p-6 lg:p-7">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="headline-display text-xl font-extrabold text-primary sm:text-2xl lg:text-3xl">
            সদস্য তালিকা
          </h3>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="নাম বা মোবাইল দিয়ে খুঁজুন..."
            className="w-full rounded-2xl border border-[#e1dbcf] bg-white px-4 py-3 text-sm outline-none sm:max-w-xs"
          />
        </div>

        <div className="space-y-4">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="rounded-[1.5rem] bg-white p-5 shadow-[0_10px_24px_rgba(0,0,0,0.04)]"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-base font-bold text-primary bengali-copy sm:text-lg">{member.name}</p>
                  <p className="mt-1 text-sm text-primary/55">{member.mobile}</p>
                  <p className="mt-2 text-sm text-primary/70 bengali-copy">{member.address}</p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-secondary">
                    {member.id} • {formatDate(member.joinDate)}
                  </p>
                  <p className="mt-3 text-base font-bold text-primary">
                    {formatCurrency(member.totalContribution)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => editMember(member)}
                    className="flex size-11 items-center justify-center rounded-[1rem] bg-primary text-white"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeMember(member.id)}
                    className="flex size-11 items-center justify-center rounded-[1rem] bg-[#ffd7d5] text-[#c62828] disabled:opacity-60"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredMembers.length === 0 ? (
            <div className="rounded-[1.5rem] bg-white/70 p-5 text-sm text-primary/55 bengali-copy">
              কোনো সদস্য পাওয়া যায়নি।
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
