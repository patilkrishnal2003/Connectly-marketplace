import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {}

export function Badge({ className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full whitespace-nowrap px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.08em]",
        className
      )}
      {...props}
    />
  );
}
