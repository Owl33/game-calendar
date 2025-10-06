"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // 마운트 후에만 렌더링 (hydration 이슈 방지)
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={cn("h-9 w-9 p-0 rounded-full", className)}
        disabled>
        <Sun className="h-4 w-4" />
        <span className="sr-only">테마 전환</span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "h-9 w-9 p-0 rounded-full hover:bg-muted transition-all duration-200 hover:scale-105",
        className
      )}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-foreground" />
      ) : (
        <Moon className="h-4 w-4 text-foreground" />
      )}
      <span className="sr-only">테마 전환</span>
    </Button>
  );
}
