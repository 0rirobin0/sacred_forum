import { RequestDecisionButtons } from "@/components/admin/request-decision-buttons";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";
import type { FundEntry, MemberRequest } from "@/lib/types";

type AdminNotificationBatchProps = {
  fundEntries: FundEntry[];
  memberRequests: MemberRequest[];
};

type PendingNotificationItem = {
  id: string;
  requestId: string;
  variant: "fund" | "member";
  batchLabel: string;
  requesterName: string;
  requesterMeta: string;
  detail: string;
  submittedDate: string;
  displayDate: string | Date;
  amount?: number;
};

function buildFundDisplayDate(entry: FundEntry) {
  if (!entry.month || !entry.year) {
    return entry.submittedDate;
  }

  const submitted = new Date(entry.submittedDate);
  if (Number.isNaN(submitted.getTime())) {
    return entry.submittedDate;
  }

  const monthIndex = Number(entry.month) - 1;
  const yearNumber = Number(entry.year);

  if (Number.isNaN(monthIndex) || Number.isNaN(yearNumber)) {
    return entry.submittedDate;
  }

  return new Date(yearNumber, monthIndex, submitted.getDate());
}

export function AdminNotificationBatch({
  fundEntries,
  memberRequests,
}: AdminNotificationBatchProps) {
  const pendingFunds = fundEntries.filter((entry) => entry.status === "pending");
  const pendingMembers = memberRequests.filter((entry) => entry.status === "pending");
  const pendingNotifications: PendingNotificationItem[] = [
    ...pendingFunds.map((entry) => ({
      id: `fund-${entry.id}`,
      requestId: entry.id,
      variant: "fund" as const,
      batchLabel: "Fund Request",
      requesterName: entry.memberName,
      requesterMeta: `${entry.memberMobile} • ${entry.paymentMethod}`,
      detail: entry.note?.trim() || "এই ফান্ড রিকোয়েস্ট অনুমোদনের অপেক্ষায় আছে।",
      submittedDate: entry.submittedDate,
      displayDate: buildFundDisplayDate(entry),
      amount: entry.amount,
    })),
    ...pendingMembers.map((entry) => ({
      id: `member-${entry.id}`,
      requestId: entry.id,
      variant: "member" as const,
      batchLabel: "Member Request",
      requesterName: entry.name,
      requesterMeta: entry.mobile,
      detail: entry.note?.trim() ? `${entry.address} • ${entry.note.trim()}` : entry.address,
      submittedDate: entry.submittedDate,
      displayDate: entry.submittedDate,
    })),
  ].sort((a, b) => {
    const nextTime = new Date(b.submittedDate).getTime();
    const prevTime = new Date(a.submittedDate).getTime();
    return (Number.isNaN(nextTime) ? 0 : nextTime) - (Number.isNaN(prevTime) ? 0 : prevTime);
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">
            Pending Notifications
          </p>
          <h3 className="mt-2 headline-display text-xl font-extrabold text-primary sm:text-2xl lg:text-3xl">
            পেন্ডিং নোটিফিকেশন টেবিল
          </h3>
        </div>
        <Badge variant="accent">{pendingNotifications.length}টি নতুন</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
              All Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="headline-display text-3xl font-extrabold text-primary">
              {pendingNotifications.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
              Fund Request
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="headline-display text-3xl font-extrabold text-primary">
              {pendingFunds.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
              Member Request
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="headline-display text-3xl font-extrabold text-primary">
              {pendingMembers.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table className="min-w-275">
            <TableHeader>
              <TableRow>
                <TableHead>ব্যাচ</TableHead>
                <TableHead>ধরণ</TableHead>
                <TableHead>অনুরোধকারী</TableHead>
                <TableHead>নোটিফিকেশন ডিটেইলস</TableHead>
                <TableHead>জমার তারিখ</TableHead>
                <TableHead className="text-right">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingNotifications.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Badge variant="outline">{item.batchLabel}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.variant === "fund" ? "secondary" : "accent"}>
                      {item.variant === "fund" ? "Fund Request" : "Member Request"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold text-foreground bengali-copy">{item.requesterName}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.requesterMeta}</p>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      {item.variant === "fund" && typeof item.amount === "number" ? (
                        <Badge variant="outline">{formatCurrency(item.amount)}</Badge>
                      ) : null}
                      <p className="text-sm text-muted-foreground bengali-copy">{item.detail}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(item.displayDate)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <RequestDecisionButtons
                        requestId={item.requestId}
                        variant={item.variant}
                        showLabels
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {pendingNotifications.length === 0 ? (
            <div className="mt-4 rounded-[1.5rem] bg-muted/60 p-5 text-sm text-muted-foreground bengali-copy">
              বর্তমানে কোনো পেন্ডিং সদস্য বা ফান্ড নোটিফিকেশন নেই।
            </div>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
