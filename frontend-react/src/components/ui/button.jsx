import React from "react";

const VARIANT_CLASSES = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost"
};

export function Button({ variant = "primary", className = "", children, ...props }) {
  const variantClass = VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary;
  return (
    <button
      type={props.type || "button"}
      className={`${variantClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
