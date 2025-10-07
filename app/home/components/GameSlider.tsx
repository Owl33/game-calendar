/**
 * GameSlider - 게임 가로 스크롤 슬라이더
 */

"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GameSliderProps {
  children: React.ReactNode;
  title: string;
  className?: string;
}

export function GameSlider({ children, title, className }: GameSliderProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft + (direction === "right" ? scrollAmount : -scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className={cn("relative", className)}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold gradient-header-title">{title}</h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => scroll("left")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => scroll("right")}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* 슬라이더 */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}>
        {children}
      </div>
    </section>
  );
}
