export function LogoSmall({ className }: { className?: string }) {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="2" y="2" width="36" height="36" rx="4" stroke="currentColor" strokeWidth="4" />
      <path
        d="M14 12V28H20C24.4183 28 28 24.4183 28 20C28 15.5817 24.4183 12 20 12H14Z"
        fill="currentColor"
      />
    </svg>
  );
}
