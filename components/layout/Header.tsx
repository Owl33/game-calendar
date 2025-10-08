"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Command } from "lucide-react";
import { cn } from "@/lib/utils";
import SearchModal from "@/components/search/search-modal";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const [open, setOpen] = useState(false);

  // Cmd/Ctrl+K 단축키로 열기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // 모달 열릴 때 배경 스크롤 잠금
  useEffect(() => {
    if (open) {
      document.documentElement.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <header className={cn("border-b border-border/40 h-14", className)}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* 로고 */}
        <Link
          href="/"
          className="flex items-center gap-2">
          <h1 className="font-bold text-xl gradient-header-title cursor-pointer hover:opacity-80 transition-opacity">
            Game Calendar
          </h1>
        </Link>

        {/* 네비 + 검색 버튼 */}
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              홈
            </Link>
            <Link
              href="/calendar"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              캘린더
            </Link>
            <Link
              href="/games"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              전체게임
            </Link>
          </nav>

          {/* 데스크톱 검색 버튼 */}
          <Button
            variant="ghost"
            className="relative justify-start rounded-md border border-border/40 bg-background/50 px-3 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground min-w-[220px] hidden sm:flex"
            onClick={() => setOpen(true)}>
            <Search className="mr-2 h-4 w-4" />
            <span>게임 검색...</span>
            <div className="ml-auto flex items-center gap-1">
              <Badge
                variant="secondary"
                className="px-1.5 py-0.5 text-xs">
                <Command className="h-3 w-3 mr-1" />K
              </Badge>
            </div>
          </Button>

          {/* 모바일 검색 아이콘 */}
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 rounded-full hover:bg-muted transition-all duration-200 hover:scale-105 sm:hidden"
            onClick={() => setOpen(true)}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 검색 모달 (재사용 컴포넌트) */}
      <SearchModal
        open={open}
        onClose={() => setOpen(false)}
      />
    </header>
  );
}
