import React from "react";

const VARIANT_CLASSES = {
  primary: "badge-primary",
  secondary: "badge-secondary",
  success: "badge-success",
  warning: "badge-warning",
  danger: "badge-danger",
  neutral: "badge-neutral"
};

export function Badge({ variant = "primary", className = "", children, ...props }) {
  const variantClass = VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary;
  return (
    <span className={`${variantClass} ${className}`.trim()} {...props}>
      {children}
    </span>
  );
}
