import React from "react";
import { cn } from "@/utils/cn";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  const variantStyles = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-sm hover:shadow",
    secondary:
      "bg-slate-800 text-white hover:bg-slate-900 active:bg-black shadow-sm",
    outline:
      "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200",
    danger: "bg-amber-500 text-slate-950 hover:bg-amber-600 active:bg-amber-700 font-bold",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs rounded-lg font-medium",
    md: "px-4 py-2 text-sm rounded-xl font-semibold",
    lg: "px-6 py-3 text-base rounded-xl font-bold",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
