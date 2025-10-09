import { memo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { findLogo } from "@/utils/media";
import { Globe } from "lucide-react";

function GameHero({ game }: { game: any }) {
  return (
    <div className="bg-card/40 p-4 py-6 rounded-2xl col-span-12">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl sm:text-4xl font-extrabold tracking-tight">{game.name}</h1>
            {game.website && (
              <Button size="sm" variant="ghost" className="gap-2" onClick={() => window.open(game.website!, "_blank")}>
                <Globe className="w-4 h-4" /> 공식 웹사이트
              </Button>
            )}
          </div>

          <div className="mt-2 flex items-center gap-3 text-muted-foreground">
            <Badge variant="secondary" className="ml-2 text-sm">
              {game.releaseDate ? new Date(game.releaseDate).toLocaleDateString("ko-KR") : "출시일 정보 없음"}
            </Badge>
            {game.comingSoon && (
              <Badge variant="outline" className="text-sm">출시예정</Badge>
            )}
            <p className="text-xs">해당 날짜는 실제 출시 날짜와 차이날 수 있습니다.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {Array.isArray(game.platforms) && game.platforms.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {game.platforms.map((platform: string) => (
                <div className="flex items-center gap-2" key={platform}>
                  <Image src={findLogo(platform)} alt={platform} width={18} height={18} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(GameHero);
