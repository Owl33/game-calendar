// /app/layout.tsx
import localFont from "next/font/local";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query";
import "@/styles/globals.css";

const pretendard = localFont({
  src: "../public/fonts/PretendardVariable.woff2",
  display: "swap",
  weight: "100 900",
  variable: "--font-pretendard",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${pretendard.variable}`}>
      <body className={`${pretendard.className} flex flex-col min-h-screen`}>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange>
            <header>Owl Clandar 

              
            </header>
            <main>{children}</main>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
