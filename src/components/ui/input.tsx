import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-md border border-champagne-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-forest-500 focus:outline-none focus:ring-1 focus:ring-forest-500",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
