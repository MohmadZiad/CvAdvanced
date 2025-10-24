import * as React from "react";
import { cn } from "@/lib/utils";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, Props>(
  ({ className, type = "text", ...rest }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-12 w-full rounded-[1.75rem] border border-transparent bg-white/80 px-5 text-sm text-foreground/80 shadow-[0_1px_0_rgba(255,255,255,0.6),0_22px_55px_-40px_rgba(30,41,59,0.45)] transition-colors placeholder:text-foreground/40 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary/55 focus:ring-offset-2 focus:ring-offset-background dark:bg-white/10 dark:text-white/80 dark:placeholder:text-white/40 dark:shadow-[0_1px_0_rgba(255,255,255,0.08),0_22px_65px_-42px_rgba(2,6,23,0.75)] dark:focus:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60 supports-[backdrop-filter]:backdrop-blur-xl",
        className,
      )}
      {...rest}
    />
  ),
);

Input.displayName = "Input";
