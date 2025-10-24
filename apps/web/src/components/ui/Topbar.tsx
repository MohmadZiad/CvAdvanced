"use client";

import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Languages, Moon, Sparkles, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Lang = "ar" | "en";

type LangOption = {
  value: Lang;
  label: string;
  description: string;
};

const LANG_OPTIONS: LangOption[] = [
  { value: "ar", label: "العربية", description: "واجهة عربية و RTL" },
  { value: "en", label: "English", description: "English UI" },
];

function getLangFromStorage(): Lang {
  if (typeof window === "undefined") return "ar";
  try {
    return (window.localStorage.getItem("lang") as Lang) || "ar";
  } catch {
    return "ar";
  }
}

export default function Topbar() {
  const [mounted, setMounted] = React.useState(false);
  const [lang, setLang] = React.useState<Lang>("ar");
  const { resolvedTheme, setTheme } = useTheme();

  React.useEffect(() => {
    setMounted(true);
    const currentLang = getLangFromStorage();
    setLang(currentLang);

    const onStorage = () => setLang(getLangFromStorage());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const applyLang = React.useCallback((value: Lang) => {
    setLang(value);
    if (typeof window === "undefined") return;
    window.localStorage.setItem("lang", value);
    document.documentElement.setAttribute("lang", value);
    document.documentElement.setAttribute("dir", value === "ar" ? "rtl" : "ltr");
    window.dispatchEvent(new CustomEvent("lang-change", { detail: value }));
  }, []);

  const toggleTheme = React.useCallback(() => {
    const next = (resolvedTheme === "dark" ? "light" : "dark") as "light" | "dark";
    setTheme(next);
    window.localStorage.setItem("theme", next);
    window.dispatchEvent(new CustomEvent("theme-change", { detail: next === "dark" }));
  }, [resolvedTheme, setTheme]);

  const themeIcon = resolvedTheme === "dark" ? <SunMedium size={16} /> : <Moon size={16} />;
  const themeLabel = resolvedTheme === "dark" ? "Light" : "Dark";

  return (
    <Tooltip.Provider delayDuration={120} skipDelayDuration={0} disableHoverableContent>
      <header className="sticky top-4 z-40">
        <div className="container">
          <div className="relative flex items-center justify-between overflow-hidden rounded-[1.75rem] border border-border/40 bg-white/70 px-6 py-4 shadow-soft backdrop-blur-xl transition dark:border-white/10 dark:bg-white/10">
            <div className="flex items-center gap-3">
              <div className="relative grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-primary/90 via-primary to-secondary text-primary-foreground shadow-lg">
                <Sparkles size={18} />
                <span className="absolute inset-0 animate-ping rounded-2xl bg-white/40" aria-hidden />
              </div>
              <div>
                <p className="font-display text-sm font-semibold tracking-[0.12em] text-foreground/70">{process.env.NEXT_PUBLIC_APP_NAME || "CV Matcher"}</p>
                <p className="text-xs text-foreground/50">
                  Precision CV intelligence. No compromise on data privacy.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <Button variant="glass" size="sm" className="gap-2">
                    <Languages size={16} />
                    <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                      {lang.toUpperCase()}
                    </span>
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content
                  sideOffset={12}
                  className="min-w-[180px] rounded-2xl border border-border/50 bg-white/80 p-2 shadow-xl backdrop-blur-lg dark:border-white/10 dark:bg-white/10"
                >
                  {LANG_OPTIONS.map((option) => {
                    const active = option.value === lang;
                    return (
                      <DropdownMenu.Item
                        key={option.value}
                        onSelect={() => applyLang(option.value)}
                        className={cn(
                          "group relative cursor-pointer rounded-xl px-3 py-2 text-xs font-medium text-foreground/70 outline-none transition",
                          active && "bg-primary/10 text-primary",
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option.label}</span>
                          <AnimatePresence>
                            {active && (
                              <motion.span
                                layoutId="lang-active"
                                className="inline-flex size-2 rounded-full bg-primary"
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                              />
                            )}
                          </AnimatePresence>
                        </div>
                        <p className="mt-1 text-[11px] font-normal text-foreground/50">
                          {option.description}
                        </p>
                      </DropdownMenu.Item>
                    );
                  })}
                </DropdownMenu.Content>
              </DropdownMenu.Root>

              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <Button variant="glass" size="sm" className="gap-2" onClick={toggleTheme}>
                    {themeIcon}
                    <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                      {mounted ? themeLabel : ""}
                    </span>
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Content className="rounded-lg border border-border/40 bg-white/90 px-3 py-1 text-xs shadow backdrop-blur dark:border-white/20 dark:bg-slate-900/80">
                  تبديل الثيم
                </Tooltip.Content>
              </Tooltip.Root>
            </div>
          </div>
        </div>
      </header>
    </Tooltip.Provider>
  );
}
