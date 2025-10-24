import type { Config } from "tailwindcss";

export default {
  darkMode: ["class", "media"],
  content: [
    "./src/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
    "./app/**/*.{ts,tsx,mdx}",
    // لو عندك مونوربو:
    "../**/src/**/*.{ts,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "General Sans Variable", "Inter Variable", "sans-serif"],
        display: ["var(--font-display)", "General Sans Variable", "Inter Variable", "sans-serif"],
        mono: ["var(--font-mono)", "Geist Mono", "ui-monospace"],
      },
      colors: {
        border: "rgb(var(--border) / <alpha-value>)",
        input: "rgb(var(--input) / <alpha-value>)",
        ring: "rgb(var(--ring) / <alpha-value>)",
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          foreground: "rgb(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary) / <alpha-value>)",
          foreground: "rgb(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "rgb(var(--destructive) / <alpha-value>)",
          foreground: "rgb(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "rgb(var(--muted) / <alpha-value>)",
          foreground: "rgb(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          foreground: "rgb(var(--accent-foreground) / <alpha-value>)",
        },
        info: "rgb(var(--info) / <alpha-value>)",
        success: "rgb(var(--success) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
        card: {
          DEFAULT: "rgb(var(--base) / <alpha-value>)",
          foreground: "rgb(var(--base-foreground) / <alpha-value>)",
        },
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        ring: "var(--shadow-ring)",
      },
      backgroundImage: {
        "blurred-gradient":
          "radial-gradient(circle at 20% 20%, rgba(37,99,235,.18), transparent 55%), radial-gradient(circle at 80% 0%, rgba(139,92,246,.14), transparent 58%)",
      },
      keyframes: {
        floaty: {
          "0%": { transform: "translateY(0px)" },
          "100%": { transform: "translateY(-8px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: 0.65 },
          "50%": { opacity: 1 },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-1.5deg)" },
          "50%": { transform: "rotate(1.5deg)" },
        },
      },
      animation: {
        floaty: "floaty 3s ease-in-out infinite alternate",
        glow: "pulseGlow 5s ease-in-out infinite",
        wiggle: "wiggle 6s ease-in-out infinite",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("tailwindcss-animate")],
} satisfies Config;
