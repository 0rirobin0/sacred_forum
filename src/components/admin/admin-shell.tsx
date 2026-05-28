import Link from "next/link";
import {
  BellRing,
  ChartColumnBig,
  CircleCheckBig,
  CircleDollarSign,
  LayoutDashboard,
  Users2,
} from "lucide-react";

import { LogoutButton } from "@/components/admin/logout-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type AdminShellProps = {
  activePath:
    | "/admin"
    | "/admin/approvals"
    | "/admin/expenses"
    | "/admin/members"
    | "/admin/financial-analytics"
    | "/admin/notifications";
  eyebrow?: string;
  title: string;
  description?: string;
  notificationCount: number;
  children: React.ReactNode;
};

type SidebarItem = {
  label: string;
  icon: typeof LayoutDashboard;
  href: AdminShellProps["activePath"];
  hasBadge?: boolean;
};

const sidebarItems: SidebarItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { label: "Notifications", icon: BellRing, href: "/admin/notifications", hasBadge: true },
  { label: "Members", icon: Users2, href: "/admin/members" },
  { label: "Add Fund", icon: CircleCheckBig, href: "/admin/approvals" },
  { label: "Expenses", icon: CircleDollarSign, href: "/admin/expenses" },
  { label: "Fund History", icon: ChartColumnBig, href: "/admin/financial-analytics" },
];

export function AdminShell({
  activePath,
  eyebrow = "হাজী বাড়ি জামে মসজিদ উন্নয়ন ফোরাম অ্যাডমিন",
  title,
  description,
  notificationCount,
  children,
}: AdminShellProps) {
  return (
    <main className="min-h-screen bg-[#f7f4ee] text-foreground">
      <div className="lg:flex">
        <aside className="w-full px-4 py-5 sm:px-6 lg:sticky lg:top-0 lg:h-screen lg:w-80 lg:px-6 lg:py-8">
          <Card className="flex h-full flex-col gap-6 border-border/70 bg-white/95 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Control Center
              </p>
              <h1 className="headline-display mt-3 text-2xl font-bold text-primary">
                হাজী বাড়ি জামে মসজিদ উন্নয়ন ফোরাম
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">Admin workspace</p>
            </div>

            <Separator />

            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePath === item.href;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-sm font-semibold transition",
                      isActive
                        ? "border-primary/15 bg-primary text-primary-foreground shadow-[0_12px_20px_rgba(0,56,32,0.2)]"
                        : "border-transparent text-muted-foreground hover:border-border/80 hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="size-4" />
                      {item.label}
                    </span>
                    {item.hasBadge ? (
                      <Badge
                        variant={isActive ? "accent" : notificationCount > 0 ? "accent" : "outline"}
                        className={cn(
                          "min-w-7 bg-red-500 rounded-full text-white justify-center",
                          isActive && "bg-white/20 text-white",
                        )}
                      >
                        {notificationCount}
                      </Badge>
                    ) : null}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto">
              <Separator className="mb-4" />
              <LogoutButton
                label="Logout"
                className="w-full rounded-xl border border-border/70 bg-muted/40 px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
              />
            </div>
          </Card>
        </aside>

        <div className="min-w-0 flex-1 px-4 pb-10 pt-3 sm:px-6 lg:px-10 lg:pt-8">
          <header className="mb-6 flex flex-col gap-3 lg:mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              {eyebrow}
            </p>
            <div>
              <h2 className="headline-display text-2xl font-bold text-primary sm:text-3xl lg:text-4xl">
                {title}
              </h2>
              {description ? (
                <p className="mt-2 max-w-3xl text-sm text-muted-foreground bengali-copy">
                  {description}
                </p>
              ) : null}
            </div>
          </header>

          {children}
        </div>
      </div>
    </main>
  );
}
