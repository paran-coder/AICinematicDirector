import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Cinematic Director",
  description: "AI 영상 프리프로덕션과 샷 연출 워크스페이스",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
