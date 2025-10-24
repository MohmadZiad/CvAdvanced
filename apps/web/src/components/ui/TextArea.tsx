import * as React from "react";
import { cn } from "@/lib/utils";

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const TextArea = React.forwardRef<HTMLTextAreaElement, Props>(
  ({ className, ...rest }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-2xl border border-border/60 bg-white/70 px-4 py-3 text-sm text-foreground/80 shadow-ring transition placeholder:text-foreground/40 focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:bg-white/10",
        className,
      )}
      {...rest}
    />
  ),
);

TextArea.displayName = "TextArea";
