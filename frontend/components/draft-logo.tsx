'use client';

/**
 * Draft 로고 - 메인 검색화면과 동일한 D 형태 (사선 컷 디자인)
 * 앱 전체에서 통일된 로고로 사용
 */
export function DraftLogo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* 꽉 찬 D 형태에서 사선으로 잘린 모습 */}
      <path d="M20 10H50C75 10 90 25 90 50C90 75 75 90 50 90H20V10ZM55 70L80 45C78 30 70 25 50 25H35V75H50C52 75 54 74 55 70Z" />
      {/* 사선 컷 - 배경색으로 잘린 느낌 */}
      <path d="M90 10L10 90H0L80 10H90Z" fill="var(--background)" />
    </svg>
  );
}
