import type { ReactNode, ElementType } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

export type SortOption<T extends string = string> = {
  value: T;
  label: string;
  icon?: ElementType;
};

interface GameResultsToolbarProps<TSort extends string = string> {
  title?: string;
  className?: string;
  sortBy?: TSort;
  sortOptions?: SortOption<TSort>[];
  onSortChange?: (value: TSort) => void;
  sortOrder?: "ASC" | "DESC";
  onSortOrderChange?: (value: "ASC" | "DESC") => void;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
  viewMode?: "card" | "list";
  onViewModeChange?: (mode: "card" | "list") => void;
  extraActions?: ReactNode;
}

export function GameResultsToolbar<TSort extends string = string>({
  title,
  className,
  sortBy,
  sortOptions,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  pageSize,
  pageSizeOptions = [9, 15, 24, 30, 40],
  onPageSizeChange,
  viewMode,
  onViewModeChange,
  extraActions,
}: GameResultsToolbarProps<TSort>) {
  const showSort = sortOptions && sortOptions.length > 0 && sortBy && onSortChange;
  const showSortOrder = typeof sortOrder !== "undefined" && !!onSortOrderChange;
  const showPageSize = typeof pageSize !== "undefined" && !!onPageSizeChange;
  const showViewToggle = typeof viewMode !== "undefined" && !!onViewModeChange;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}>
      <div className="flex items-center gap-3">
        {title ? <h3 className="text-lg font-bold text-foreground">{title}</h3> : null}
        {extraActions}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {showViewToggle && (
          <div className="flex items-center rounded-lg border bg-background p-1">
            <Button
              variant={viewMode === "card" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange?.("card")}
              className="h-8 px-2">
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange?.("list")}
              className="h-8 px-2">
              <List className="h-4 w-4" />
            </Button>
          </div>
        )}

        {showSort && (
          <Select
            value={sortBy}
            onValueChange={(value) => onSortChange?.(value as TSort)}>
            <SelectTrigger className="w-[120px] h-9">
              <SelectValue placeholder="정렬 기준" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <SelectItem
                    key={option.value}
                    value={option.value}>
                    <div className="flex items-center gap-2">
                      {Icon ? <Icon className="h-4 w-4" /> : null}
                      {option.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        )}

        {showSortOrder && (
          <Select
            value={sortOrder}
            onValueChange={(value) => onSortOrderChange?.(value as "ASC" | "DESC")}>
            <SelectTrigger className="w-[110px] h-9">
              <SelectValue placeholder="정렬" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DESC">내림차순</SelectItem>
              <SelectItem value="ASC">오름차순</SelectItem>
            </SelectContent>
          </Select>
        )}

        {showPageSize && (
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange?.(Number(value))}>
            <SelectTrigger className="w-[90px] h-9">
              <SelectValue placeholder="페이지" />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem
                  key={size}
                  value={String(size)}>
                  {size}개
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}
