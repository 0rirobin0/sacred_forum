import * as React from "react";

import { cn } from "@/lib/utils";

type ScrollAreaProps = React.HTMLAttributes<HTMLDivElement>;

type ScrollBarProps = React.HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical";
};

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("relative overflow-hidden", className)} {...props} />
  ),
);
ScrollArea.displayName = "ScrollArea";

const ScrollViewport = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("h-full w-full overflow-auto", className)} {...props} />
  ),
);
ScrollViewport.displayName = "ScrollViewport";

const ScrollBar = React.forwardRef<HTMLDivElement, ScrollBarProps>(
  ({ className, orientation = "vertical", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex touch-none select-none bg-muted/40 p-1 transition-colors",
        orientation === "vertical" ? "h-full w-2" : "h-2 w-full",
        className,
      )}
      {...props}
    />
  ),
);
ScrollBar.displayName = "ScrollBar";

const ScrollThumb = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative flex-1 rounded-full bg-muted-foreground/40", className)}
      {...props}
    />
  ),
);
ScrollThumb.displayName = "ScrollThumb";

export { ScrollArea, ScrollViewport, ScrollBar, ScrollThumb };
