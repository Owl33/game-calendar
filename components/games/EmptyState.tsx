/**
 * EmptyState - 게임 없음 표시
 */

"use client";

import { FadeSlide } from "@/components/motion/FadeSlide";

export function EmptyState() {
  return (
    <FadeSlide
      direction="up"
      distance={20}
      duration={0.3}>
      <div className="text-center py-12 text-muted-foreground">
        <div className="w-20 h-20 mx-auto mb-6 text-6xl opacity-30">🎮</div>
        <h3 className="text-lg font-semibold mb-2">게임이 없습니다</h3>
        <p className="text-sm">해당 날짜에 출시되는 게임 데이터가 없습니다.</p>
      </div>
    </FadeSlide>
  );
}
