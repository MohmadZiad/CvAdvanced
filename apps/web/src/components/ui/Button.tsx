import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { Loader2 } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center rounded-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-br from-primary via-primary/90 to-secondary text-primary-foreground shadow-soft hover:brightness-110",
        secondary:
          "border border-border/60 bg-white/70 text-foreground shadow-sm backdrop-blur hover:border-border hover:bg-white/90 dark:bg-white/10",
        ghost: "text-foreground/70 hover:text-foreground hover:bg-foreground/5",
        glass:
          "border border-white/40 bg-white/40 text-foreground shadow-soft backdrop-blur dark:border-white/10 dark:bg-white/10",
        destructive:
          "bg-destructive text-destructive-foreground shadow-soft hover:brightness-110",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        md: "h-11 px-5",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
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
