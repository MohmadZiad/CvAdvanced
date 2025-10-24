import * as React from "react";
import { cn } from "@/lib/utils";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, Props>(
  ({ className, type = "text", ...rest }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-12 w-full rounded-2xl border border-border/60 bg-white/70 px-4 text-sm text-foreground/80 shadow-ring transition placeholder:text-foreground/40 focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:bg-white/10",
        className,
      )}
      {...rest}
    />
  ),
);

Input.displayName = "Input";
