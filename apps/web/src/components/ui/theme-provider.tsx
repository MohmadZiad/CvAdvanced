"use client";

import * as React from "react";
import { ThemeProvider as NextThemeProvider } from "next-themes";

type Props = React.ComponentProps<typeof NextThemeProvider>;

export function ThemeProvider({ children, ...props }: Props) {
  return (
    <NextThemeProvider
      attribute="class"
      storageKey="theme"
      enableSystem
      defaultTheme="system"
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemeProvider>
  );
}
