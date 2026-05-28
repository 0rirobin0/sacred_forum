import Link from "next/link";
import { Landmark } from "lucide-react";

import { mosqueLocation } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { href: "/", label: "হোম" },
  { href: "/members", label: "সদস্য তালিকা" },
  { href: "/fund-history", label: "ফান্ড হিস্ট্রি" },
  { href: "/expenses", label: "খরচ" },
  { href: "/add-fund", label: "ফান্ড জমা দিন" },
  { href: "/new-member", label: "নতুন সদস্য" },
  { href: "/about", label: "ফোরাম পরিচিতি" },
];

const desktopNavItems = [
  { href: "/", label: "Home" },
  { href: "/members", label: "Member List" },
  { href: "/fund-history", label: "Fund History" },
  { href: "/about", label: "About" },
];

type PublicShellProps = {
  children: React.ReactNode;
  activePath?: string;
};

export function PublicShell({ children, activePath = "/" }: PublicShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="container-shell flex min-h-20 flex-wrap items-center justify-between gap-3 py-3">
          <Link href="/" className="flex min-w-0 items-center gap-3 sm:flex-1">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(0,56,32,0.18)]">
              <Landmark className="size-5" />
            </div>
            <div className="min-w-0 space-y-1">
              <p className="headline-display text-xl font-black text-primary md:text-2xl">
                হাজী বাড়ি জামে মসজিদ উন্নয়ন ফোরাম
              </p>
              <p className="max-w-full text-[10px] font-medium tracking-[0.14em] text-secondary sm:text-xs">
                হাজী বাড়ি জামে মসজিদ
              </p>
            </div>
          </Link>
          <nav className="hidden items-center gap-6 lg:flex">
            {desktopNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "border-b-2 border-transparent pb-1 text-sm font-medium text-foreground/85 hover:text-secondary",
                  activePath === item.href && "border-secondary text-secondary",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex w-full shrink-0 items-center gap-3 sm:w-auto">
            <Link
              href="/add-fund"
              className="w-full rounded-full bg-primary px-5 py-3 text-center text-sm font-bold text-primary-foreground shadow-[0_10px_24px_rgba(0,56,32,0.18)] hover:brightness-110 sm:w-auto"
            >
              Donate Now
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-24 lg:pb-0">{children}</main>

      <footer id="about" className="mt-16 border-t border-primary/10 bg-primary py-12 text-primary-foreground">
        <div className="container-shell grid gap-8 md:grid-cols-2">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                <Landmark className="size-5" />
              </div>
              <div>
                <h3 className="headline-display text-2xl font-bold">
                  হাজী বাড়ি জামে মসজিদ উন্নয়ন ফোরাম
                </h3>
                <p className="text-xs text-secondary">হাজী বাড়ি জামে মসজিদ</p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-secondary bengali-copy">
              যোগাযোগ
            </p>
            <div className="mt-4 space-y-3 text-sm text-primary-foreground/80 bengali-copy">
              <p>{mosqueLocation}</p>
              <p>01718554424</p>
              <p>jahangirhossain182@gmail.com</p>
            </div>
          </div>
        </div>
        <div className="container-shell mt-10 border-t border-white/10 pt-6 text-center text-xs text-primary-foreground/55">
          © ২০২৪ হাজী বাড়ি জামে মসজিদ উন্নয়ন ফোরাম। সর্বস্বত্ব সংরক্ষিত।
        </div>
      </footer>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-background/95 px-2 py-2 backdrop-blur lg:hidden">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {mobileNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-2xl px-2 py-2 text-center text-[10px] font-bold leading-tight text-primary/70 sm:px-3 sm:text-[11px]",
                activePath === item.href && "bg-primary text-primary-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
