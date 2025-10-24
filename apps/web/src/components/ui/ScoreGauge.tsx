// apps/web/src/components/ui/ScoreGauge.tsx
"use client";

type Props = {
  value: number;
  size?: number;
};

export default function ScoreGauge({ value, size = 160 }: Props) {
  const clamped = Math.max(0, Math.min(10, Number(value ?? 0)));
  const radius = size / 2 - 12;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference * (clamped / 10);

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width={size} height={size} className="overflow-visible">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(var(--primary))" />
            <stop offset="50%" stopColor="rgb(var(--secondary))" />
            <stop offset="100%" stopColor="rgb(var(--accent))" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(148, 163, 184, 0.25)"
          strokeWidth={12}
          strokeLinecap="round"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gaugeGradient)"
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference - progress}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          fill="none"
          filter="url(#glow)"
        />
      </svg>

      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-[2.75rem] font-semibold leading-none tracking-tight text-foreground">
          {clamped.toFixed(1)}
        </span>
        <span className="text-xs uppercase tracking-[0.4em] text-foreground/50">/ 10</span>
      </div>

      <div className="absolute inset-0 -z-10 animate-glow rounded-full bg-primary/10 blur-3xl" aria-hidden />
    </div>
  );
}
