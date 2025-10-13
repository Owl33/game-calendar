// /app/layout.tsx
import localFont from "next/font/local";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query";
import { Header } from "@/components/layout/Header";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import "../styles/globals.css";
<meta
  name="viewport"
  content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=overlays-content"
/>;
const spoqa = localFont({
  src: [
    { path: "../public/fonts/SpoqaHanSansNeo-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/SpoqaHanSansNeo-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/SpoqaHanSansNeo-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-spoqa",
  display: "swap",
  preload: true, // 초기 뷰에서 사용하면 유지
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${spoqa.variable}`}>
      <body className={` flex flex-col min-h-screen w-full`}>
        <ServiceWorkerRegister />
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange={false}
            forcedTheme="dark">
            <Header />
            <main className=" lg:p-8 p-4">{children}</main>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
