import Steam from "@/public/icon/steam.png";
import Xbox from "@/public/icon/xbox.png";
import Psn from "@/public/icon/psn.png";
import Nintendo from "@/public/icon/nintendo.png";

export function getYouTubeEmbedUrl(url?: string) {
  if (!url) return undefined;
  if (url.includes("youtube")) {
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    console.log(m);
    return m?.[1] ? `https://www.youtube-nocookie.com/embed/${m[1]}` : undefined;
  } else {
    return url;
  }
}

export function findLogo(store: string) {
  switch (store) {
    case "steam":
      return Steam;
    case "psn":
    case "playstation":
      return Psn;
    case "xbox":
      return Xbox;
    case "nintendo":
      return Nintendo;
    default:
      return Steam;
  }
}

export function formatNumber(n?: number | null) {
  if (n === null || n === undefined) return "데이터 없음";
  return new Intl.NumberFormat("ko-KR").format(n);
}
