"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, Pencil, Trash2, UserPlus2, X } from "lucide-react";

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

type PdfColumn = {
  header: string;
  width: number;
  align?: "left" | "right";
  value: (member: Member) => string;
};

type PdfCell = {
  align?: "left" | "right";
  lines: string[];
};

type PdfRow = {
  cells: PdfCell[];
  height: number;
};

const pdfColumns: PdfColumn[] = [
  { header: "নাম", width: 170, value: (member) => member.name },
  { header: "মোবাইল", width: 130, value: (member) => member.mobile },
  { header: "ঠিকানা", width: 260, value: (member) => member.address },
  { header: "Member ID", width: 105, value: (member) => member.id },
  { header: "জয়েন তারিখ", width: 140, value: (member) => formatDate(member.joinDate) },
  {
    header: "মোট জমা",
    width: 135,
    align: "right",
    value: (member) => formatCurrency(member.totalContribution),
  },
  {
    header: "স্ট্যাটাস",
    width: 90,
    value: (member) => (member.status === "inactive" ? "inactive" : "active"),
  },
];

function wrapCanvasText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];

  if (words.length === 0) return ["-"];

  words.forEach((word) => {
    const previousLine = lines[lines.length - 1];
    const nextLine = previousLine ? `${previousLine} ${word}` : word;

    if (!previousLine) {
      lines.push(word);
      return;
    }

    if (context.measureText(nextLine).width <= maxWidth) {
      lines[lines.length - 1] = nextLine;
      return;
    }

    if (context.measureText(word).width <= maxWidth) {
      lines.push(word);
      return;
    }

    let chunk = "";
    Array.from(word).forEach((character) => {
      const nextChunk = `${chunk}${character}`;
      if (context.measureText(nextChunk).width <= maxWidth || !chunk) {
        chunk = nextChunk;
        return;
      }
      lines.push(chunk);
      chunk = character;
    });
    if (chunk) lines.push(chunk);
  });

  return lines;
}

function getMemberPdfRows(members: Member[], context: CanvasRenderingContext2D): PdfRow[] {
  const cellPadding = 12;
  const lineHeight = 18;

  context.font = '500 14px "Noto Sans Bengali", "Segoe UI", Arial, sans-serif';

  return members.map((member) => {
    const cells = pdfColumns.map((column) => {
      const lines = wrapCanvasText(context, column.value(member), column.width - cellPadding * 2);
      return { align: column.align, lines };
    });
    const maxLineCount = Math.max(...cells.map((cell) => cell.lines.length));

    return {
      cells,
      height: Math.max(52, maxLineCount * lineHeight + cellPadding * 2),
    };
  });
}

function drawPdfText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: { align?: "left" | "right"; maxWidth?: number } = {},
) {
  if (options.align === "right") {
    context.fillText(text, x - context.measureText(text).width, y, options.maxWidth);
    return;
  }

  context.fillText(text, x, y, options.maxWidth);
}

function createMemberPdfCanvas(
  rows: PdfRow[],
  pageNumber: number,
  totalMembers: number,
  filteredBy: string,
) {
  const scale = 2;
  const pageWidth = 1123;
  const pageHeight = 794;
  const margin = 44;
  const tableTop = 138;
  const headerHeight = 42;

  const canvas = document.createElement("canvas");
  canvas.width = pageWidth * scale;
  canvas.height = pageHeight * scale;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas context পাওয়া যায়নি।");
  }

  context.scale(scale, scale);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, pageWidth, pageHeight);

  context.fillStyle = "#003820";
  context.font = '800 30px "Noto Sans Bengali", "Segoe UI", Arial, sans-serif';
  context.textBaseline = "top";
  context.fillText(pageNumber === 1 ? "সদস্য তালিকা" : "সদস্য তালিকা (চলমান)", margin, 34);

  context.fillStyle = "#5d655f";
  context.font = '500 13px "Noto Sans Bengali", "Segoe UI", Arial, sans-serif';
  const generatedDate = new Intl.DateTimeFormat("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
  context.fillText(`মোট সদস্য: ${totalMembers} জন`, margin, 76);
  context.fillText(`তারিখ: ${generatedDate}`, margin + 180, 76);
  if (filteredBy) {
    context.fillText(`সার্চ: ${filteredBy}`, margin + 360, 76, 430);
  }
  context.fillText(`পৃষ্ঠা ${pageNumber}`, pageWidth - margin - 72, 76);

  let x = margin;
  context.fillStyle = "#faf6ed";
  context.strokeStyle = "#d8cfbf";
  context.lineWidth = 1;
  context.fillRect(margin, tableTop, pageWidth - margin * 2, headerHeight);
  context.strokeRect(margin, tableTop, pageWidth - margin * 2, headerHeight);

  context.fillStyle = "#003820";
  context.font = '700 12px "Noto Sans Bengali", "Segoe UI", Arial, sans-serif';
  pdfColumns.forEach((column, index) => {
    if (index > 0) {
      context.beginPath();
      context.moveTo(x, tableTop);
      context.lineTo(x, tableTop + headerHeight);
      context.stroke();
    }

    drawPdfText(
      context,
      column.header,
      column.align === "right" ? x + column.width - 12 : x + 12,
      tableTop + 14,
      { align: column.align },
    );
    x += column.width;
  });

  let y = tableTop + headerHeight;
  context.font = '500 14px "Noto Sans Bengali", "Segoe UI", Arial, sans-serif';

  rows.forEach((row, rowIndex) => {
    const rowFill = rowIndex % 2 === 0 ? "#ffffff" : "#fbf8f1";
    context.fillStyle = rowFill;
    context.fillRect(margin, y, pageWidth - margin * 2, row.height);
    context.strokeStyle = "#ebe3d5";
    context.strokeRect(margin, y, pageWidth - margin * 2, row.height);

    x = margin;
    row.cells.forEach((cell, cellIndex) => {
      const column = pdfColumns[cellIndex];

      if (cellIndex > 0) {
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x, y + row.height);
        context.stroke();
      }

      context.fillStyle = cellIndex === 0 ? "#003820" : "#33443b";
      context.font =
        cellIndex === 0
          ? '700 14px "Noto Sans Bengali", "Segoe UI", Arial, sans-serif'
          : '500 14px "Noto Sans Bengali", "Segoe UI", Arial, sans-serif';

      cell.lines.forEach((line, lineIndex) => {
        drawPdfText(
          context,
          line,
          cell.align === "right" ? x + column.width - 12 : x + 12,
          y + 12 + lineIndex * 18,
          { align: cell.align, maxWidth: column.width - 24 },
        );
      });
      x += column.width;
    });

    y += row.height;
  });

  return canvas;
}

function createMemberPdfCanvases(members: Member[], filteredBy: string) {
  const measureCanvas = document.createElement("canvas");
  const measureContext = measureCanvas.getContext("2d");
  if (!measureContext) {
    throw new Error("Canvas context পাওয়া যায়নি।");
  }

  const allRows = getMemberPdfRows(members, measureContext);
  const pageHeight = 794;
  const tableTop = 138;
  const headerHeight = 42;
  const bottomMargin = 44;
  const maxContentBottom = pageHeight - bottomMargin;
  const canvases: HTMLCanvasElement[] = [];
  let pageRows: PdfRow[] = [];
  let y = tableTop + headerHeight;

  allRows.forEach((row) => {
    if (pageRows.length > 0 && y + row.height > maxContentBottom) {
      canvases.push(createMemberPdfCanvas(pageRows, canvases.length + 1, members.length, filteredBy));
      pageRows = [];
      y = tableTop + headerHeight;
    }

    pageRows.push(row);
    y += row.height;
  });

  if (pageRows.length > 0) {
    canvases.push(createMemberPdfCanvas(pageRows, canvases.length + 1, members.length, filteredBy));
  }

  return canvases;
}

async function getCanvasPngBytes(canvas: HTMLCanvasElement) {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((nextBlob) => {
      if (nextBlob) {
        resolve(nextBlob);
        return;
      }
      reject(new Error("PDF image তৈরি করা যায়নি।"));
    }, "image/png");
  });

  return new Uint8Array(await blob.arrayBuffer());
}

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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
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
        setIsFormOpen(false);
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
    setIsFormOpen(true);
    setMessage(null);
    setError(null);
  }

  function openNewMemberModal() {
    setDraft(emptyDraft);
    setIsFormOpen(true);
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

  async function exportMemberListPdf() {
    setMessage(null);
    setError(null);

    if (filteredMembers.length === 0) {
      setError("PDF export করার জন্য কোনো সদস্য পাওয়া যায়নি।");
      return;
    }

    setIsExporting(true);

    try {
      const { PDFDocument } = await import("pdf-lib");
      const pdfDocument = await PDFDocument.create();
      const pageWidth = 841.89;
      const pageHeight = 595.28;
      const canvases = createMemberPdfCanvases(filteredMembers, query.trim());

      for (const canvas of canvases) {
        const pngBytes = await getCanvasPngBytes(canvas);
        const image = await pdfDocument.embedPng(pngBytes);
        const page = pdfDocument.addPage([pageWidth, pageHeight]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: pageWidth,
          height: pageHeight,
        });
      }

      const pdfBytes = await pdfDocument.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateStamp = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `member-list-${dateStamp}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setMessage("মেম্বার লিস্ট PDF তৈরি হয়েছে।");
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "PDF export করা যায়নি।");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <section className="space-y-6">
      {isFormOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-[#ded6c8] bg-white p-5 shadow-[0_30px_60px_rgba(0,0,0,0.2)] sm:p-6 lg:p-7">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-white">
                  <UserPlus2 className="size-6" />
                </div>
                <h3 className="headline-display text-xl font-extrabold text-primary sm:text-2xl lg:text-3xl">
                  {draft.id ? "সদস্য তথ্য সম্পাদনা" : "নতুন সদস্য যোগ করুন"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="flex size-10 items-center justify-center rounded-full border border-primary/15 text-primary"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
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
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-[1.4rem] border border-primary/15 px-5 py-4 text-base font-bold text-primary"
                >
                  বাতিল
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <div className="rounded-[2rem] border border-[#ded6c8] bg-[#f1ede4] p-5 shadow-[0_20px_40px_rgba(0,0,0,0.04)] sm:p-6 lg:p-7">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="headline-display bengali-copy text-xl font-extrabold text-primary sm:text-2xl lg:text-3xl">
            পেন্ডিং সদস্য আবেদন
          </h3>
          <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-primary">
            {pendingMemberRequests.length}টি
          </span>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table min-w-[860px]">
            <thead>
              <tr className="text-left text-xs font-bold uppercase tracking-[0.18em] text-primary/60">
                <th className="px-4">নাম</th>
                <th className="px-4">মোবাইল</th>
                <th className="px-4">ঠিকানা</th>
                <th className="px-4">আবেদন তারিখ</th>
                <th className="px-4">নোট</th>
                <th className="px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {pendingMemberRequests.map((request) => (
                <tr key={request.id} className="bg-white shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
                  <td className="rounded-l-[1.25rem] px-4 py-4 font-bold text-primary bengali-copy">
                    {request.name}
                  </td>
                  <td className="px-4 py-4 text-sm text-primary/65">{request.mobile}</td>
                  <td className="px-4 py-4 text-sm text-primary/70 bengali-copy">
                    {request.address}
                  </td>
                  <td className="px-4 py-4 text-sm text-primary/70">
                    {formatDate(request.submittedDate)}
                  </td>
                  <td className="px-4 py-4 text-sm text-primary/60 bengali-copy">
                    {request.note || "-"}
                  </td>
                  <td className="rounded-r-[1.25rem] px-4 py-4">
                    <div className="flex justify-end">
                      <RequestDecisionButtons requestId={request.id} variant="member" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pendingMemberRequests.length === 0 ? (
          <div className="mt-4 rounded-[1.5rem] bg-white/70 p-5 text-sm text-primary/55 bengali-copy">
            কোনো পেন্ডিং সদস্য আবেদন নেই।
          </div>
        ) : null}
      </div>

      <div className="rounded-[2rem] border border-[#ded6c8] bg-[#f1ede4] p-5 shadow-[0_20px_40px_rgba(0,0,0,0.04)] sm:p-6 lg:p-7">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="headline-display text-xl font-extrabold text-primary sm:text-2xl lg:text-3xl">
              সদস্য তালিকা
            </h3>
            <button
              type="button"
              onClick={openNewMemberModal}
              className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-white sm:text-sm"
            >
              নতুন সদস্য যোগ করুন
            </button>
            <button
              type="button"
              onClick={exportMemberListPdf}
              disabled={isExporting || filteredMembers.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-white px-4 py-2 text-xs font-bold text-primary transition-colors hover:border-primary hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
            >
              <Download className="size-4" />
              {isExporting ? "PDF তৈরি হচ্ছে..." : "PDF Export"}
            </button>
          </div>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="নাম বা মোবাইল দিয়ে খুঁজুন..."
            className="w-full rounded-2xl border border-[#e1dbcf] bg-white px-4 py-3 text-sm outline-none sm:max-w-xs"
          />
        </div>

        {message ? (
          <div className="mb-4 rounded-2xl border border-primary/15 bg-primary/10 px-4 py-3 text-sm text-primary bengali-copy">
            {message}
          </div>
        ) : null}
        {error ? (
          <div className="mb-4 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive bengali-copy">
            {error}
          </div>
        ) : null}

        <div className="admin-table-wrap">
          <table className="admin-table min-w-[980px]">
            <thead>
              <tr className="text-left text-xs font-bold uppercase tracking-[0.18em] text-primary/60">
                <th className="px-4">নাম</th>
                <th className="px-4">মোবাইল</th>
                <th className="px-4">ঠিকানা</th>
                <th className="px-4">Member ID</th>
                <th className="px-4">জয়েন তারিখ</th>
                <th className="px-4">মোট জমা</th>
                <th className="px-4">স্ট্যাটাস</th>
                <th className="px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id} className="bg-white shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
                  <td className="rounded-l-[1.25rem] px-4 py-4 font-bold text-primary bengali-copy">
                    {member.name}
                  </td>
                  <td className="px-4 py-4 text-sm text-primary/65">{member.mobile}</td>
                  <td className="px-4 py-4 text-sm text-primary/70 bengali-copy">{member.address}</td>
                  <td className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em] text-secondary">
                    {member.id}
                  </td>
                  <td className="px-4 py-4 text-sm text-primary/70">
                    {formatDate(member.joinDate)}
                  </td>
                  <td className="px-4 py-4 text-base font-bold text-primary">
                    {formatCurrency(member.totalContribution)}
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-primary/80">
                    {member.status === "inactive" ? "inactive" : "active"}
                  </td>
                  <td className="rounded-r-[1.25rem] px-4 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => editMember(member)}
                        className="flex size-10 items-center justify-center rounded-[0.9rem] bg-primary text-white"
                        aria-label={`${member.name} সম্পাদনা করুন`}
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeMember(member.id)}
                        className="flex size-10 items-center justify-center rounded-[0.9rem] bg-[#ffd7d5] text-[#c62828] disabled:opacity-60"
                        aria-label={`${member.name} ডিলিট করুন`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredMembers.length === 0 ? (
          <div className="mt-4 rounded-[1.5rem] bg-white/70 p-5 text-sm text-primary/55 bengali-copy">
            কোনো সদস্য পাওয়া যায়নি।
          </div>
        ) : null}
      </div>
    </section>
  );
}
