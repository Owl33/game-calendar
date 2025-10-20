"use client";

import { memo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Building2, Users } from "lucide-react";
import { findLogo, formatNumber } from "@/utils/media";

function GameInfoPanel({ game }: { game: any }) {
  console.log(game);
  return (
    <div className="bg-card/40 px-0 p-3 rounded-2xl lg:sticky lg:top-6">
      <div>
        {/* 가격 + 상점 */}
        <section className="rounded-2xl p-5">
          <h3 className="font-semibold mb-3">출시 가격</h3>

          <div className="flex items-center justify-between">
            <p className="text-xl font-bold">
              {game?.currentPrice ? `₩ ${formatNumber(game.currentPrice)}` : "가격 정보 없음"}
            </p>
            <div className="flex gap-1 items-center">
              {Array.isArray(game.releases) &&
                game.releases.map((item: any) => (
                  <Button
                    key={item.store}
                    size="sm"
                    variant="secondary"
                    className="text-xs gap-2"
                    onClick={() => item.url && window.open(item.url, "_blank")}>
                    <Image
                      src={findLogo(item.store)}
                      alt={item.store}
                      width={14}
                      height={14}
                    />
                    {item.store.toUpperCase()}
                  </Button>
                ))}
            </div>
          </div>
        </section>

        {/* 개발사/배급사 */}
        {(game.developers?.length || game.publishers?.length) && (
          <section className="rounded-2xl p-5">
            <div className="grid sm:grid-cols-2 gap-6">
              {Array.isArray(game.developers) && game.developers.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    개발사
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {game.developers.map((dev: { id: number; name: string }) => (
                      <Badge
                        variant="secondary"
                        key={`${dev.id}-${dev.name}`}
                        className="text-sm">
                        {dev.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {Array.isArray(game.publishers) && game.publishers.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    배급사
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {game.publishers.map((pub: { id: number; name: string }) => (
                      <Badge
                        key={`${pub.id}-${pub.name}`}
                        variant="secondary"
                        className="text-sm">
                        {pub.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 장르/태그/언어 */}
        {(game.genres?.length || game.tags?.length || game.supportLanguages?.length) && (
          <section className="rounded-2xl p-5">
            <div className="grid gap-6">
              <div>
                <h3 className="font-semibold mb-3">장르</h3>
                {Array.isArray(game.genres) && game.genres.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {game.genres.map((genre: string) => (
                      <Badge
                        variant="secondary"
                        key={genre}>
                        {genre}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">장르 정보 없음</p>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-3">태그</h3>
                {Array.isArray(game.tags) && game.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {game.tags.slice(0, 9).map((tag: string) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {game.tags.length > 9 && (
                      <Badge
                        variant="secondary"
                        className="text-xs">
                        +{game.tags.length - 9}개 더
                      </Badge>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">태그 정보 없음</p>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-3">지원 언어</h3>
                {Array.isArray(game.supportLanguages) && game.supportLanguages.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {game.supportLanguages.map((lang: string) => (
                      <Badge
                        key={lang}
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          lang === "한국어" && "bg-primary text-primary-foreground"
                        )}>
                        {lang}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">언어 정보 없음</p>
                )}
              </div>
            </div>
          </section>
        )}

    
      </div>
    </div>
  );
}

export default memo(GameInfoPanel);
