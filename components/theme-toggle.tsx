"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

const THEMES = ["light", "dark", "system"] as const;
type ThemeOption = (typeof THEMES)[number];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-10 w-10 rounded-xl glass-panel" aria-hidden="true" />
    );
  }

  const current = (theme ?? "system") as ThemeOption;
  const nextTheme = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];

  const Icon = current === "light" ? Sun : current === "dark" ? Moon : Monitor;

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      aria-label={`Current theme: ${current}. Activate to switch to ${nextTheme} theme.`}
      title={`Theme: ${current} (click for ${nextTheme})`}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-xl glass-panel text-foreground transition-all duration-200",
        "hover:border-primary/40 hover:glow-primary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:bg-background",
      )}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
