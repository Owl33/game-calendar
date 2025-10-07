/**
 * GameListHeader - 게임 목록 헤더 (정렬 기능)
 */

"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Calendar, Plus, LayoutGrid, List } from "lucide-react";

interface GameListHeaderProps {
  sortBy: "name" | "date" | "popularityScore";
  onSortChange: (sort: "name" | "date" | "popularityScore") => void;
  viewMode: "card" | "list";
  onViewModeChange: (mode: "card" | "list") => void;
  className?: string;
}

export function GameListHeader({ sortBy, onSortChange, viewMode, onViewModeChange, className }: GameListHeaderProps) {
  const sortOptions = [
    { value: "popularityScore", label: "인기순", icon: Plus },
    { value: "date", label: "출시일순", icon: Calendar },
    { value: "name", label: "이름순", icon: ArrowUpDown },
  ];

  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      <h3 className="text-lg font-bold text-foreground">게임 목록</h3>

      <div className="flex items-center gap-2">
        {/* View Mode Toggle */}
        <div className="flex items-center rounded-lg border bg-background p-1">
          <Button
            variant={viewMode === "card" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("card")}
            className="h-7 px-2">
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("list")}
            className="h-7 px-2">
            <List className="h-4 w-4" />
          </Button>
        </div>

        {/* Sort Select */}
        <Select
          value={sortBy}
          onValueChange={onSortChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <SelectItem
                  key={option.value}
                  value={option.value}>
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4" />
                    {option.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
