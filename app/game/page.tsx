"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  Star,
  ExternalLink,
  Play,
  ChevronLeft,
  ChevronRight,
  Globe,
  Building2,
  Users,
} from "lucide-react";
import sampleGamesData from "../games/data/sample-game.json";

interface GameDetailProps {
  game: any;
  onBack?: () => void;
  className?: string;
}

export default function Game() {
  const game = sampleGamesData;
  const [selectedScreenshot, setSelectedScreenshot] = useState(0);
  const [showTrailer, setShowTrailer] = useState(false);

  // 긍정 리뷰 비율 계산
  const getPositivePercentage = () => {
    if (!game.review_summary || game.review_summary.total_reviews === 0) return 0;
    return Math.round(
      (game.review_summary.total_positive / game.review_summary.total_reviews) * 100
    );
  };

  // 플랫폼 아이콘 매핑
  const getPlatformIcon = (platformId: string) => {
    const icons: { [key: string]: string } = {
      pc: "💻",
      steam: "🔗",
      playstation5: "🎮",
      playstation4: "🎮",
      "xbox-series-x": "🎮",
      "xbox-one": "🎮",
      nintendo: "🎮",
    };
    return icons[platformId] || "🎮";
  };

  // 스크린샷 네비게이션
  const nextScreenshot = () => {
    setSelectedScreenshot((prev) => (prev === game.screenshots.length - 1 ? 0 : prev + 1));
  };

  const prevScreenshot = () => {
    setSelectedScreenshot((prev) => (prev === 0 ? game.screenshots.length - 1 : prev - 1));
  };

  // YouTube 임베드 URL 생성
  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  return (
    <motion.div
      className={cn("max-w-6xl mx-auto p-4 space-y-6")}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}>
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          뒤로가기
        </Button>
      </div>

      {/* Hero Section */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Images */}
        <div className="space-y-4">
          {/* Main Image/Video */}
          <div className="relative aspect-video rounded-lg overflow-hidden ">
            <AnimatePresence mode="wait">
              {showTrailer && game.trailer_url ? (
                <motion.div
                  key="trailer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full">
                  <iframe
                    src={getYouTubeEmbedUrl(game.trailer_url)}
                    className="w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                    title={`${game.name} Trailer`}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="image"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative w-full h-full">
                  <img
                    src={game.screenshots?.[selectedScreenshot] || game.image}
                    alt={game.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Screenshot Navigation */}
                  {game.screenshots && game.screenshots.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute left-2 top-1/2 -translate-y-1/2"
                        onClick={prevScreenshot}>
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 "
                        onClick={nextScreenshot}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Media Controls */}
          <div className="flex gap-2">
            {game.trailer_url && (
              <Button
                variant={showTrailer ? "default" : "outline"}
                size="sm"
                onClick={() => setShowTrailer(!showTrailer)}
                className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                {showTrailer ? "스크린샷 보기" : "트레일러 보기"}
              </Button>
            )}
          </div>

          {/* Screenshot Thumbnails */}
          {game.screenshots && game.screenshots.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {game.screenshots.slice(0, 5).map((screenshot: string, index: number) => (
                <motion.button
                  key={index}
                  className={cn(
                    "aspect-video rounded overflow-hidden border-2 transition-colors",
                    selectedScreenshot === index ? "border-primary" : "border-transparent"
                  )}
                  onClick={() => setSelectedScreenshot(index)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}>
                  <img
                    src={screenshot}
                    alt={`${game.name} screenshot ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Game Info */}
        <div className="space-y-6">
          {/* Title & Basic Info */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{game.name}</h1>
            {game.original_name && game.original_name !== game.name && (
              <p className="text-muted-foreground text-sm mb-4">{game.original_name}</p>
            )}

            {/* Release Date */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Calendar className="w-4 h-4" />
              <span>{new Date(game.release_date).toLocaleDateString("ko-KR")}</span>
              {game.release_status === "upcoming" && (
                <Badge
                  variant="outline"
                  className="text-xs">
                  출시 예정
                </Badge>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-muted-foreground">
                Steam Reviews : 압도적으로 긍정적 (총 리뷰 3054개)
              </span>
            </div>
          </div>
          {/* Platforms */}
          {game.platforms && game.platforms.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">플랫폼</h3>
              <div className="flex flex-wrap gap-2">
                {game.platforms.map((platform: any) => (
                  <Badge
                    key={platform.id}
                    variant="outline"
                    className="flex items-center gap-1">
                    <span>{getPlatformIcon(platform.id)}</span>
                    <span>{platform.name}</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {/* Description */}
          {game.description && (
            <div>
              <h3 className="font-semibold mb-2">게임 소개</h3>
              <p className="text-sm leading-relaxed whitespace-pre-line">{game.description}</p>
            </div>
          )}
        </div>
      </div>
      <div>
        {/* Genres & Tags */}
        <div className="space-y-4">
          {game.genres && game.genres.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">장르</h3>
              <div className="flex flex-wrap gap-2">
                {game.genres.map((genre: string) => (
                  <Badge
                    key={genre}
                    className=" text-primary">
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {game.tags && game.tags.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">태그</h3>
              <div className="flex flex-wrap gap-2">
                {game.tags.slice(0, 8).map((tag: string) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {game.tags.length > 8 && (
                  <Badge
                    variant="outline"
                    className="text-xs">
                    +{game.tags.length - 8}개 더
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Developer & Publisher */}
        <div className="grid grid-cols-2 gap-4">
          {game.developers && game.developers.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                개발사
              </h3>
              <div className="space-y-1">
                {game.developers.map((dev: string) => (
                  <p
                    key={dev}
                    className="text-sm text-muted-foreground">
                    {dev}
                  </p>
                ))}
              </div>
            </div>
          )}

          {game.publishers && game.publishers.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                배급사
              </h3>
              <div className="space-y-1">
                {game.publishers.map((pub: string) => (
                  <p
                    key={pub}
                    className="text-sm text-muted-foreground">
                    {pub}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Price & Store Links */}
        <div className="space-y-4">
          {game.price && (
            <div>
              <h3 className="font-semibold mb-2">가격</h3>
              <div className="text-2xl font-bold text-primary">
                {typeof game.price === "string" ? game.price : game.price.final}
              </div>
            </div>
          )}

          {/* Store Links */}
          {game.store_links && Object.keys(game.store_links).length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">구매 링크</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(game.store_links).map(([store, link]: [string, any]) => (
                  <Button
                    key={store}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() =>
                      window.open(typeof link === "string" ? link : link.url, "_blank")
                    }>
                    <ExternalLink className="w-4 h-4" />
                    {typeof link === "string" ? store : link.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Website */}
          {game.website && (
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => window.open(game.website, "_blank")}>
              <Globe className="w-4 h-4" />
              공식 웹사이트
            </Button>
          )}
        </div>
      </div>
      {/* Additional Sections */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Reviews & Ratings */}
        {(game.review_summary || game.metacritic || game.opencritic) && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">평점 및 리뷰</h2>

            {/* User Reviews */}
            {game.review_summary && game.review_summary.total_reviews > 0 && (
              <div className="p-4 rounded-lg border">
                <h3 className="font-semibold mb-2">유저 리뷰</h3>
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-primary">{getPositivePercentage()}%</div>
                  <div>
                    <p className="text-sm">
                      긍정적 ({game.review_summary.total_positive?.toLocaleString()})
                    </p>
                    <p className="text-sm text-muted-foreground">
                      총 {game.review_summary.total_reviews?.toLocaleString()}개 리뷰
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Metacritic */}
            {game.metacritic && game.metacritic.score && (
              <div className="p-4 rounded-lg border">
                <h3 className="font-semibold mb-2">Metacritic</h3>
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-green-600">{game.metacritic.score}</div>
                  <div>
                    <p className="text-sm">{game.metacritic.score_phrase}</p>
                    <p className="text-sm text-muted-foreground">
                      {game.metacritic.critic_reviews_count}개 리뷰
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* OpenCritic */}
            {game.opencritic && game.opencritic.score && (
              <div className="p-4 rounded-lg border">
                <h3 className="font-semibold mb-2">OpenCritic</h3>
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-blue-600">{game.opencritic.score}</div>
                  <div>
                    <p className="text-sm">{game.opencritic.tier}</p>
                    <p className="text-sm text-muted-foreground">
                      {game.opencritic.reviews_count}개 리뷰
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* DLC & Additional Content */}
        {game.dlc_list && game.dlc_list.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">DLC 및 추가 콘텐츠</h2>
            <div className="space-y-3">
              {game.dlc_list.map((dlc: any, index: number) => (
                <motion.div
                  key={dlc.id || index}
                  className="p-4 rounded-lg border  transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{dlc.name}</h3>
                      {dlc.release_date && (
                        <p className="text-sm text-muted-foreground">
                          {new Date(dlc.release_date).toLocaleDateString("ko-KR")}
                        </p>
                      )}
                    </div>
                    {dlc.price && (
                      <div className="text-right">
                        <p className="font-semibold text-primary">{dlc.price}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Languages */}
      {game.languages && (
        <div>
          <h2 className="text-xl font-bold mb-4">지원 언어</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {game.languages.interface && (
              <div>
                <h3 className="font-semibold mb-2">인터페이스</h3>
                <div className="flex flex-wrap gap-1">
                  {game.languages.interface.map((lang: string) => (
                    <Badge
                      key={lang}
                      variant="outline"
                      className="text-xs">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {game.languages.audio && (
              <div>
                <h3 className="font-semibold mb-2">음성</h3>
                <div className="flex flex-wrap gap-1">
                  {game.languages.audio.map((lang: string) => (
                    <Badge
                      key={lang}
                      variant="outline"
                      className="text-xs">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {game.languages.subtitles && (
              <div>
                <h3 className="font-semibold mb-2">자막</h3>
                <div className="flex flex-wrap gap-1">
                  {game.languages.subtitles.slice(0, 6).map((lang: string) => (
                    <Badge
                      key={lang}
                      variant="outline"
                      className="text-xs">
                      {lang}
                    </Badge>
                  ))}
                  {game.languages.subtitles.length > 6 && (
                    <Badge
                      variant="outline"
                      className="text-xs">
                      +{game.languages.subtitles.length - 6}개 더
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
