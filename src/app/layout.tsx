import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://ai-cinematic-director-eight.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "AI Cinematic Director",
  title: {
    default: "AI Cinematic Director",
    template: "%s | AI Cinematic Director",
  },
  description: "아이디어를 캐릭터, 장면, 샷으로 구조화하고 일관성을 유지하면서 AI 영상을 연출하는 시네마틱 워크스페이스",
  keywords: ["AI 영상", "AI 영상 생성", "시네마틱", "영상 연출", "스토리보드", "샷 디자인", "Seedance"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    siteName: "AI Cinematic Director",
    title: "AI Cinematic Director",
    description: "아이디어를 캐릭터, 장면, 샷으로 구조화하고 일관성을 유지하면서 AI 영상을 연출하는 시네마틱 워크스페이스",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI Cinematic Director — AI 영상 연출 워크스페이스",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Cinematic Director",
    description: "아이디어를 캐릭터, 장면, 샷으로 구조화하고 일관성을 유지하면서 AI 영상을 연출하는 시네마틱 워크스페이스",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const themeBootstrap = `
(function () {
  try {
    var theme = localStorage.getItem("acd-theme");
    if (theme === "light" || theme === "dark") {
      document.documentElement.dataset.theme = theme;
    } else {
      delete document.documentElement.dataset.theme;
    }
  } catch (_) {}
})();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
