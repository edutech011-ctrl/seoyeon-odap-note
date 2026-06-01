import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "서연이의 오답노트 🐹",
  description: "AI가 만들어주는 나만의 오답노트",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Jua&family=Noto+Sans+KR:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col" style={{ backgroundColor: "#F5EFE0", fontFamily: "'Jua', 'Noto Sans KR', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
