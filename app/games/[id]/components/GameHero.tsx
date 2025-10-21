import { memo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { findLogo } from "@/utils/media";
import { Globe } from "lucide-react";

function GameHero({ game }: { game: any }) {
  return (
    <div className="bg-card/40 p-4 py-6 rounded-2xl col-span-12">
      <div className="flex flex-col  sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <p>{game.ogName}</p>
              <h1 className="text-4xl sm:text-4xl font-extrabold tracking-tight">{game.name}</h1>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3 ">
            <p className="text-sm">
              {game.releaseDate
                ? new Date(game.releaseDate).toLocaleDateString("ko-KR")
                : "출시일 정보 없음"}
            </p>
            {game.comingSoon && (
              <Badge
                variant="outline"
                className="text-sm">
                출시예정
              </Badge>
            )}
            {game.website && (
              <Badge
                variant="outline"
                className="text-sm cursor-pointer"
                onClick={() => window.open(game.website!, "_blank")}>
                <Globe /> 공식 웹사이트
              </Badge>
            )}
            <p className="text-sm text-muted-foreground">
              해당 날짜는 실제 출시 날짜와 차이날 수 있습니다.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {Array.isArray(game.platforms) && game.platforms.length > 0 && (
            <div className="flex flex-wrap gap-6">
              {game.releases.map((release: any) => (
                <div
                  className="flex items-center gap-3"
                  key={release.store}>
                  <Image
                    src={findLogo(release.store)}
                    alt={release.store}
                    width={18}
                    height={18}
                  />
    <p className="text-sm">
              {game?.releaseDate
                && new Date(game.releaseDate).toLocaleDateString("ko-KR")
                }
            </p>                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(GameHero);
