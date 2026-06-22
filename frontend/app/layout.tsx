import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import { LayoutShell } from "@/components/layout-shell";
import { QueryProvider } from "@/components/query-provider";

const playwrite = localFont({
  src: [
  {
    path: "../fonts/PlaywriteGBJ-VariableFont_wght.ttf",
    weight: "100 400",
    style: "normal",
  },
  {
    path: "../fonts/PlaywriteGBJ-Italic-VariableFont_wght.ttf",
    weight: "100 400",
    style: "italic",
  },
  ],
  variable: "--font-playwrite",
  display: "swap",
});


export const metadata: Metadata = {
  title: "Gastro-AI - Tìm quán ngon theo gu của bạn",
  description: "AI-powered restaurant and cafe discovery for Vietnam. Find the perfect spot using natural language search.",
};

const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}else if(window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.setAttribute('data-theme','dark');}else{document.documentElement.setAttribute('data-theme','light');}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
  <html lang="vi">
    <body className={playwrite.variable}>
    <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeScript }} />
    <QueryProvider>
      <LayoutShell>{children}</LayoutShell>
    </QueryProvider>
    </body>
  </html>
  );
}
