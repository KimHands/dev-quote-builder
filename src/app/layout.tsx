import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { AuthButton } from "@/components/AuthButton";

export const metadata: Metadata = {
  title: "개발 외주 견적 — 김종건",
  description: "비개발자도 쉽게: 선택만으로 예상 견적을 확인하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendard-dynamic-subset.min.css"
        />
      </head>
      <body>
        <Providers>
          <header
            style={{
              display: "flex",
              justifyContent: "flex-end",
              padding: "16px 24px",
            }}
          >
            <AuthButton />
          </header>
          {children}
        </Providers>
      </body>
    </html>
  );
}
