"use client";

import { useRef } from "react";
import { EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay, { AutoplayType } from "embla-carousel-autoplay";
import { GameCard } from "../games/GameCard";

type PropType = {
  games: any[];
  options?: EmblaOptionsType;
};

export const GameCarouselList: React.FC<PropType> = ({ options, games }) => {
  // Autoplay 인스턴스 (리렌더에도 동일 인스턴스 유지)
  const autoplay = useRef<AutoplayType>(
    Autoplay({
      delay: 3000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    })
  );

  // Embla + Autoplay 플러그인
  const [emblaRef] = useEmblaCarousel({ loop: true, align: "start", ...options }, [
    autoplay.current,
  ]);

  return (
    <div
      className="
        mx-auto
        [--slide-spacing:1rem]
        [--slide-size:85%]         /* 모바일: 1장 크게 */
        sm:[--slide-size:60%]      /* 작은 태블릿: 1.5~2장 */
        lg:[--slide-size:28%]      /* 데스크탑: ~3~4장 */
        xl:[--slide-size:22%]      /* 와이드: ~4~5장 */
      ">
      {/* viewport */}
      <div
        ref={emblaRef}
        className="overflow-hidden p-4">
        {/* container */}
        <div
          className="
            flex
            ml-[calc(var(--slide-spacing)*-1)]
            [touch-action:pan-y_pinch-zoom]
          ">
          {games.map((game) => (
            <div
              key={game.gameId}
              className="
                shrink-0
                basis-[var(--slide-size)]
                min-w-0
                pl-[var(--slide-spacing)]
                transform-gpu
                [transform:translate3d(0,0,0)]
              ">
              {/* 카드 래퍼: 슬라이드 높이 고정(원하면 제거/조절) */}
              <div>
                <GameCard game={game} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
