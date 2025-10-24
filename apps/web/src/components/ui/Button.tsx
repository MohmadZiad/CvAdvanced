import * as React from 'react';

// لو ما عندك دالة cn، أنشئ واحدة بسيطة في الأسفل أو استورد من util عندك
function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-foreground text-background hover:bg-foreground/90',
  secondary:
    'border bg-muted text-foreground hover:bg-muted/80',
  ghost:
    'bg-transparent hover:bg-muted',
  destructive:
    'bg-red-600 text-white hover:bg-red-600/90',
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      loading = false,
      disabled,
      type = 'button',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition',
          'focus:outline-none focus:ring-2 focus:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-60',
          VARIANTS[variant],
          className
        )}
        {...props}
      >
        {loading && (
          <svg
            className="me-2 h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              fill="currentColor"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
