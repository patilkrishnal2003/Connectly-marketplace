import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type DropdownMenuContextValue = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenuContext() {
  const context = useContext(DropdownMenuContext);
  if (!context) {
    throw new Error("DropdownMenu components must be used within a DropdownMenu");
  }
  return context;
}

interface DropdownMenuProps {
  children: ReactNode;
  className?: string;
}

export function DropdownMenu({ children, className }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div ref={containerRef} className={cn("relative inline-block text-left", className)}>
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

interface DropdownMenuTriggerProps extends HTMLAttributes<HTMLElement> {
  asChild?: boolean;
  children: ReactElement;
}

export function DropdownMenuTrigger({ asChild = false, children, onClick, ...props }: DropdownMenuTriggerProps) {
  const { open, setOpen } = useDropdownMenuContext();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    onClick?.(event);
    setOpen((prev) => !prev);
  };

  if (asChild) {
    const child = Children.only(children);
    return cloneElement(child, {
      ...props,
      "aria-expanded": open,
      onClick: handleClick,
    });
  }

  return (
    <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={handleClick} {...props}>
      {children}
    </button>
  );
}

interface DropdownMenuContentProps extends HTMLAttributes<HTMLDivElement> {
  align?: "start" | "end";
}

export const DropdownMenuContent = forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ className, align = "start", ...props }, ref) => {
    const { open } = useDropdownMenuContext();
    if (!open) return null;

    const positionClass = align === "end" ? "right-0" : "left-0";

    return (
      <div
        ref={ref}
        className={cn(
          "absolute top-full mt-2 min-w-[220px] rounded-xl border border-border bg-card py-1 shadow-soft",
          positionClass,
          className
        )}
        {...props}
      />
    );
  }
);
DropdownMenuContent.displayName = "DropdownMenuContent";

interface DropdownMenuItemProps extends HTMLAttributes<HTMLButtonElement> {}

export const DropdownMenuItem = forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
  ({ className, onClick, ...props }, ref) => {
    const { setOpen } = useDropdownMenuContext();
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      setOpen(false);
    };

    return (
      <button
        type="button"
        ref={ref}
        className={cn("flex w-full items-center gap-2 px-4 py-2 text-sm text-muted-foreground transition hover:bg-muted/30", className)}
        onClick={handleClick}
        {...props}
      />
    );
  }
);
DropdownMenuItem.displayName = "DropdownMenuItem";

interface DropdownMenuSeparatorProps extends HTMLAttributes<HTMLDivElement> {}

export const DropdownMenuSeparator = ({ className, ...props }: DropdownMenuSeparatorProps) => (
  <div className={cn("my-1 h-px bg-border", className)} role="separator" {...props} />
);
