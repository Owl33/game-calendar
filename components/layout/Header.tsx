"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Command, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 키보드 단축키 (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className={cn("border-b border-border/40 h-14", className)}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* 로고 */}
        <Link href="/home" className="flex items-center gap-2">
          <h1 className="font-bold text-xl gradient-header-title cursor-pointer hover:opacity-80 transition-opacity">
            Game Calendar
          </h1>
        </Link>

        {/* 우측 영역: 네비게이션 & 검색 */}
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-4">
            <Link
              href="/home"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              홈
            </Link>
            <Link
              href="/games"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              캘린더
            </Link>
          </nav>
          {/* 데스크톱용 검색 버튼 */}
          <Button
            variant="ghost"
            className="relative justify-start rounded-md border border-border/40 bg-background/50 px-3 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground min-w-[200px] hidden sm:flex"
            onClick={() => setSearchOpen(true)}>
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

          {/* 모바일용 검색 버튼 */}
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 rounded-full hover:bg-muted transition-all duration-200 hover:scale-105 sm:hidden"
            onClick={() => setSearchOpen(true)}>
            <Search className="h-4 w-4" />
            <span className="sr-only">검색</span>
          </Button>

          {/* 검색 모달 - motion.dev + glassmorphism */}
          {searchOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSearchOpen(false)}
              />

              {/* Modal */}
              <motion.div
                className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl mx-4 h-[600px] sm:h-[500px] rounded-2xl overflow-hidden flex flex-col bg-card elevated-card"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.2 }}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
                  <h2 className="text-lg font-semibold text-foreground">게임 검색</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full"
                    onClick={() => setSearchOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Search Input */}
                <div className="p-6 pb-4 flex-shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="게임명을 입력하세요..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-12"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Search Results */}
              </motion.div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
