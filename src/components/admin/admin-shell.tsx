import Link from "next/link";
import {
  ChartColumnBig,
  CircleCheckBig,
  CircleDollarSign,
  LayoutDashboard,
  Users2,
} from "lucide-react";

import { LogoutButton } from "@/components/admin/logout-button";
import { cn } from "@/lib/utils";

type AdminShellProps = {
  activePath: "/admin" | "/admin/approvals" | "/admin/expenses" | "/admin/members";
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
};

const sidebarItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { label: "Member Directory", icon: Users2, href: "/admin/members" },
  { label: "Fund Approvals", icon: CircleCheckBig, href: "/admin/approvals" },
  { label: "Expense Entries", icon: CircleDollarSign, href: "/admin/expenses" },
  { label: "Financial Analytics", icon: ChartColumnBig, href: "/admin" },
] as const;

export function AdminShell({
  activePath,
  eyebrow = "Mosque Forum Admin",
  title,
  description,
  children,
}: AdminShellProps) {
  return (
    <main className="min-h-screen bg-[#f8f4ec] text-primary">
      <div className="lg:flex">
        <aside className="flex w-full flex-col bg-primary px-4 py-4 text-primary-foreground shadow-[18px_0_40px_rgba(0,56,32,0.28)] sm:px-6 sm:py-6 lg:sticky lg:top-0 lg:h-screen lg:w-90 lg:px-7 lg:py-7">
          <div>
            <h1 className="headline-display text-xl font-extrabold leading-tight sm:text-2xl lg:text-3xl">
              The Sacred Editorial
            </h1>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-primary-foreground/70 sm:mt-3 sm:text-sm lg:text-base">
              Administrative Portal
            </p>
          </div>

          <nav className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-2 md:gap-2.5 lg:mt-14 lg:block lg:space-y-5">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePath === item.href;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-[1.05rem] px-3 py-2 text-xs font-medium text-center transition-colors sm:justify-start sm:gap-3 sm:px-4 sm:py-2.5 sm:text-sm md:py-2 md:text-xs lg:gap-4 lg:rounded-r-[1.8rem] lg:rounded-l-[1.35rem] lg:px-5 lg:py-3.5 lg:text-base",
                    isActive
                      ? "bg-primary-foreground text-primary shadow-[0_10px_18px_rgba(0,0,0,0.12)] lg:border-r-4 lg:border-secondary"
                      : "text-primary-foreground/85 hover:bg-primary-foreground/10 hover:text-primary-foreground",
                  )}
                >
                  <Icon className="size-4 sm:size-5 lg:size-6" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 border-t border-primary-foreground/20 pt-5 lg:mt-auto lg:pt-8">
            <LogoutButton
              label="Logout"
              className="flex items-center gap-3 px-2 py-2 text-sm font-medium text-primary-foreground/75 hover:text-primary-foreground disabled:opacity-60 sm:text-base lg:gap-4 lg:px-4 lg:py-3 lg:text-base"
            />
          </div>
        </aside>

        <div className="min-w-0 flex-1 px-3 py-5 text-sm sm:px-5 sm:py-6 sm:text-base md:px-6 md:py-5 lg:px-10 lg:py-8">
          <header className="mb-6 md:mb-5 lg:mb-10">
            <div>
              <p className="headline-display text-base italic text-primary/90 sm:text-lg md:text-base lg:text-xl">
                {eyebrow}
              </p>
            </div>
          </header>

          <section className="mb-6 md:mb-7 lg:mb-10">
            <h2 className="headline-display text-xl font-extrabold leading-tight text-primary sm:text-2xl md:text-[1.9rem] lg:text-4xl xl:text-5xl">
              {title}
            </h2>
            {description ? (
              <p className="mt-3 max-w-4xl text-sm text-primary/75 bengali-copy sm:mt-4 sm:text-base lg:mt-5">
                {description}
              </p>
            ) : null}
          </section>

          {children}
        </div>
      </div>
    </main>
  );
}
