"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Command, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import sampleGamesData from "@/app/games/data/sample-games.json";

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

  // 검색 결과 필터링 (샘플 데이터 사용)
  const getAllGames = () => {
    const allGames: any[] = [];
    Object.values(sampleGamesData as any).forEach((monthGames: any) => {
      if (Array.isArray(monthGames)) {
        allGames.push(...monthGames);
      }
    });
    return allGames;
  };

  const searchResults = searchQuery
    ? getAllGames().filter((game) => game.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <header className={cn("border-b border-border/40 h-14", className)}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* 로고 */}
        <div className="flex items-center gap-2">
          <h1 className="font-bold text-xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Game Calendar
          </h1>
        </div>

        {/* 검색 */}
        <div>
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
          <AnimatePresence>
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
                  className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl mx-4 h-[600px] sm:h-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border overflow-hidden flex flex-col"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ duration: 0.2 }}>

                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
                    <h2 className="text-lg font-semibold">게임 검색</h2>
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
                  <div className="px-6 pb-6 flex-1 overflow-y-auto">
                    {searchQuery ? (
                      searchResults.length > 0 ? (
                        <div className="space-y-3">
                          <div className="text-sm text-muted-foreground mb-4">
                            "{searchQuery}"에 대한 검색 결과 ({searchResults.length}개)
                          </div>
                          {searchResults.map((game, index) => (
                            <motion.div
                              key={game.id}
                              className="p-4 rounded-lg border hover:bg-accent/50 cursor-pointer transition-all duration-200"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => {
                                console.log("선택된 게임:", game);
                                setSearchOpen(false);
                              }}>
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="font-medium text-sm mb-1">{game.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    출시일: {new Date(game.released).toLocaleDateString("ko-KR")}
                                  </div>
                                  {game.genres && game.genres.length > 0 && (
                                    <div className="text-xs text-muted-foreground mt-1 flex gap-1">
                                      {game.genres.slice(0, 2).map((genre: string) => (
                                        <Badge key={genre} variant="outline" className="text-xs px-2 py-0.5">
                                          {genre}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <Badge
                                  variant="outline"
                                  className="text-xs">
                                  게임
                                </Badge>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <motion.div
                          className="text-center py-12"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}>
                          <div className="w-16 h-16 mx-auto mb-4 opacity-20 text-4xl">🔍</div>
                          <div className="text-sm text-muted-foreground">
                            "{searchQuery}"에 대한 검색 결과가 없습니다
                          </div>
                        </motion.div>
                      )
                    ) : (
                      <motion.div
                        className="text-center py-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}>
                        <div className="w-16 h-16 mx-auto mb-4 opacity-20 text-4xl">🎮</div>
                        <div className="text-sm text-muted-foreground mb-2">게임명을 입력해주세요</div>
                        <div className="text-xs text-muted-foreground">
                          <Badge
                            variant="secondary"
                            className="text-xs mr-1">
                            <Command className="h-3 w-3 mr-1" />K
                          </Badge>
                          단축키로 빠르게 검색할 수 있습니다
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
