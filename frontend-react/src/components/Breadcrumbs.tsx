import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

type BreadcrumbItem = {
  label: string;
  to?: string;
  href?: string;
};

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumbs = ({ items, className = "" }: BreadcrumbsProps) => {
  return (
    <nav aria-label="Breadcrumb" className={`inline-flex items-center ${className}`}>
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const content = item.to ? (
            <Link
              to={item.to}
              className={`transition-colors hover:text-primary ${isLast ? "font-semibold text-foreground" : ""}`}
            >
              {item.label}
            </Link>
          ) : item.href ? (
            <a
              href={item.href}
              className={`transition-colors hover:text-primary ${isLast ? "font-semibold text-foreground" : ""}`}
            >
              {item.label}
            </a>
          ) : (
            <span className={`${isLast ? "font-semibold text-foreground" : ""}`}>{item.label}</span>
          );

          return (
            <li key={item.label} className="flex items-center gap-1">
              {content}
              {!isLast && <ChevronRight className="h-4 w-4 text-muted-foreground/80" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
