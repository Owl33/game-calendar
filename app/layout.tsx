// /app/layout.tsx
import localFont from "next/font/local";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query";
import { Header } from "@/components/layout/Header";
import "../styles/globals.css";
const pretendard = localFont({
  src: "../public/fonts/PretendardVariable.woff2",
  display: "swap",
  weight: "100 900",
  variable: "--font-pretendard",
});
<meta
  name="viewport"
  content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=overlays-content"
/>;
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${pretendard.variable}`}>
      <body className={`${pretendard.className} flex flex-col min-h-screen w-full`}>
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
