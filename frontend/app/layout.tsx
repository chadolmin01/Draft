import type { Metadata } from "next";
import { ClientLayoutWrapper } from "@/components/client-layout-wrapper";
import "./globals.css";
import "../styles/print.css";

export const metadata: Metadata = {
  title: "AI 스타트업 플랫폼 - 아이디어를 사업계획으로",
  description: "간단한 아이디어 입력만으로 완전한 사업계획이 자동으로 생성됩니다",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased font-sans">
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}
