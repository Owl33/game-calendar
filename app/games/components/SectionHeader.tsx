"use client";

import { Button } from "@/components/ui/button";

export function SectionHeader({
  title,
  onReset,
  disabled,
}: {
  title: string;
  onReset?: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm font-semibold">{title}</div>
      {onReset && (
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={onReset} disabled={disabled}>
          초기화
        </Button>
      )}
    </div>
  );
}
