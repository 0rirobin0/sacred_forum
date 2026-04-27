import { type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  tone?: "default" | "accent" | "primary";
};

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  tone = "default",
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-[1.75rem] border p-6 shadow-[0_18px_40px_rgba(0,0,0,0.04)]",
        tone === "primary" &&
          "border-primary/15 bg-primary text-primary-foreground shadow-[0_18px_40px_rgba(0,56,32,0.16)]",
        tone === "accent" && "border-red-200 bg-card/90",
        tone === "default" && "border-border/70 bg-card/90",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className={cn(
              "text-sm font-bold uppercase tracking-[0.2em]",
              tone === "primary" ? "text-primary-foreground/70" : "text-muted-foreground",
            )}
          >
            {title}
          </p>
          <p className="mt-4 headline-display text-3xl font-extrabold sm:text-4xl">{value}</p>
        </div>
        <div
          className={cn(
            "flex size-12 items-center justify-center rounded-2xl",
            tone === "primary" && "bg-white/10 text-white",
            tone === "accent" && "bg-red-50 text-red-500",
            tone === "default" && "bg-primary/10 text-primary",
          )}
        >
          <Icon className="size-6" />
        </div>
      </div>
      {description ? (
        <p
          className={cn(
            "mt-5 text-sm bengali-copy",
            tone === "primary" ? "text-primary-foreground/75" : "text-muted-foreground",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
