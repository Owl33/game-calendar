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
import { ArrowUpDown, Calendar, Plus } from "lucide-react";

interface GameListHeaderProps {
  sortBy: "name" | "date" | "added";
  onSortChange: (sort: "name" | "date" | "added") => void;
  className?: string;
}

export function GameListHeader({
  sortBy,
  onSortChange,
  className
}: GameListHeaderProps) {
  const sortOptions = [
    { value: "added", label: "추가순", icon: Plus },
    { value: "date", label: "출시일순", icon: Calendar },
    { value: "name", label: "이름순", icon: ArrowUpDown },
  ];

  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      <h3 className="text-lg font-bold text-foreground">게임 목록</h3>

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
  );
}
