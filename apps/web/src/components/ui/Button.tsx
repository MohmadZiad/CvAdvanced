import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { Loader2 } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-5 py-2.5 text-sm font-semibold tracking-tight text-foreground transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60 active:scale-[0.98] supports-[backdrop-filter]:backdrop-blur-xl",
  {
    variants: {
      variant: {
        primary:
          "text-white shadow-[0_28px_55px_-32px_rgba(59,130,246,0.8)] bg-[linear-gradient(135deg,rgba(99,102,241,0.98),rgba(59,130,246,0.9))] hover:shadow-[0_36px_70px_-34px_rgba(59,130,246,0.9)]",
        secondary:
          "border border-white/80 bg-white/80 text-foreground/80 shadow-[0_18px_48px_-36px_rgba(30,41,59,0.45)] hover:bg-white/95 hover:text-foreground dark:border-white/10 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/15 dark:shadow-[0_18px_60px_-38px_rgba(2,6,23,0.7)]",
        ghost:
          "border border-transparent bg-transparent text-foreground/70 hover:border-foreground/10 hover:bg-foreground/5 hover:text-foreground dark:text-white/70 dark:hover:bg-white/10",
        glass:
          "border border-white/60 bg-white/55 text-foreground shadow-[0_22px_55px_-40px_rgba(30,41,59,0.55)] hover:border-white/80 hover:bg-white/75 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15 dark:shadow-[0_22px_65px_-42px_rgba(2,6,23,0.75)]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_26px_55px_-32px_rgba(239,68,68,0.7)] hover:brightness-[1.05]",
      },
      size: {
        xs: "h-8 px-3 text-xs",
        sm: "h-10 px-4 text-xs",
        md: "h-11 px-5 text-sm",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-7 text-base",
        icon: "h-10 w-10 p-0",
      },
      align: {
        start: "justify-start",
        center: "justify-center",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      align: "center",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      align,
      loading = false,
      disabled,
      asChild,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, align }), className)}
        disabled={disabled || loading}
        {...props}
      >
        <span className={cn("flex items-center gap-2", loading && "opacity-0")}>{children}</span>
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="size-4 animate-spin" aria-hidden />
          </span>
        )}
      </Comp>
    );
  },
);

Button.displayName = "Button";

export { buttonVariants };
