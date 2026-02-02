import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI 에이전트 마켓 | 한국 최초 AI 에이전트 플랫폼",
  description: "블로그 대필, AI 친구, 이력서 작성 등 다양한 AI 에이전트를 만나보세요. 한국어에 최적화된 AI가 당신의 일을 대신합니다.",
  keywords: ["AI", "에이전트", "마켓플레이스", "블로그", "카톡", "챗봇", "한국"],
  openGraph: {
    title: "AI 에이전트 마켓",
    description: "한국 최초 AI 에이전트 플랫폼. AI가 당신의 일을 대신합니다.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <div className="noise" />
        {children}
      </body>
    </html>
  );
}
