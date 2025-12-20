import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const VARIANT_CLASSES: Record<string, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
};

const SIZE_CLASSES: Record<string, string> = {
  sm: "text-xs px-3 py-1.5",
  md: "text-sm px-4 py-2",
  lg: "text-base px-5 py-3",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof VARIANT_CLASSES;
  size?: keyof typeof SIZE_CLASSES;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type ?? "button"}
      className={cn(
        VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.primary,
        SIZE_CLASSES[size] ?? SIZE_CLASSES.md,
        className
      )}
      {...props}
    />
  );
}
