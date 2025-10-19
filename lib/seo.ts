const FALLBACK_SITE_URL = "https://releasepicks.com";

export function getSiteOrigin(): string {
  try {
    const candidate = process.env.NEXT_PUBLIC_SITE_URL ?? FALLBACK_SITE_URL;
    return new URL(candidate).origin;
  
  } catch {
    return FALLBACK_SITE_URL;
  }
}

export function absoluteUrl(pathname: string): string {
  const origin = getSiteOrigin();
  if (!pathname) return origin;
  if (pathname.startsWith("http://") || pathname.startsWith("https://")) {
    return pathname;
  }
  return `${origin}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

