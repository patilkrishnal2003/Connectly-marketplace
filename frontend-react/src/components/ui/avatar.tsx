import { forwardRef, type HTMLAttributes, type ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const Avatar = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground",
      className
    )}
    {...props}
  />
));
Avatar.displayName = "Avatar";

const AvatarImage = forwardRef<HTMLImageElement, ImgHTMLAttributes<HTMLImageElement>>(({ className, ...props }, ref) => (
  <img ref={ref} className={cn("h-full w-full object-cover", className)} {...props} />
));
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("flex h-full w-full items-center justify-center text-xs font-semibold uppercase tracking-wide", className)}
    {...props}
  />
));
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarFallback, AvatarImage };
