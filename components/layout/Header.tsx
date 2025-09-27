"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Command } from "lucide-react";
import { cn } from "@/lib/utils";
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
    Object.values(sampleGamesData as any).forEach((monthGames) => {
      allGames.push(...monthGames);
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
        <Dialog
          open={searchOpen}
          onOpenChange={setSearchOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 justify-start rounded-md border border-border/40 bg-background/50 px-3 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground min-w-[200px] hidden sm:flex">
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
          </DialogTrigger>

          {/* 모바일용 검색 버튼 */}
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 rounded-full hover:bg-muted transition-all duration-200 hover:scale-105 sm:hidden">
              <Search className="h-4 w-4" />
              <span className="sr-only">검색</span>
            </Button>
          </DialogTrigger>

          <DialogContent
            className={cn(
              "gap-0 p-0 max-w-2xl",
              // 모바일에서는 전체화면으로
              "sm:w-full h-full md:w-full h-full",
              " sm:max-h-[600px]"
            )}>
            <DialogHeader className="h-16 px-6 py-4 border-b">
              <DialogTitle className="text-left">게임 검색</DialogTitle>
            </DialogHeader>

            <div className="p-6 basis-full flex-1 h-full">
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

              {/* 검색 결과 영역 */}
              <div className="mt-6 space-y-4 max-h-[400px] overflow-y-auto">
                {searchQuery ? (
                  searchResults.length > 0 ? (
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground mb-3">
                        "{searchQuery}"에 대한 검색 결과 ({searchResults.length}개)
                      </div>
                      {searchResults.map((game) => (
                        <div
                          key={game.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-accent/50 cursor-pointer transition-all duration-200"
                          onClick={() => {
                            // TODO: 게임 상세 페이지로 이동 또는 해당 날짜로 이동
                            console.log("선택된 게임:", game);
                            setSearchOpen(false);
                          }}>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{game.name}</div>
                            <div className="text-xs text-muted-foreground">
                              출시일: {new Date(game.released).toLocaleDateString("ko-KR")}
                            </div>
                            {game.genres && game.genres.length > 0 && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {game.genres.slice(0, 2).join(", ")}
                              </div>
                            )}
                          </div>
                          <Badge
                            variant="outline"
                            className="text-xs">
                            게임
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 opacity-20">🔍</div>
                      <div className="text-sm text-muted-foreground">
                        "{searchQuery}"에 대한 검색 결과가 없습니다
                      </div>
                    </div>
                  )
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 opacity-20">🎮</div>
                    <div className="text-sm text-muted-foreground">게임명을 입력해주세요</div>
                    <div className="text-xs text-muted-foreground mt-2">
                      <Badge
                        variant="secondary"
                        className="text-xs mr-1">
                        <Command className="h-3 w-3 mr-1" />K
                      </Badge>
                      단축키로 빠르게 검색할 수 있습니다
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
