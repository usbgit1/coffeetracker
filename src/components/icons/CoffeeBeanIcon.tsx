export default function CoffeeBeanIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <ellipse
        cx="12"
        cy="12"
        rx="7.5"
        ry="10"
        transform="rotate(-25 12 12)"
        fill="currentColor"
      />
      <path
        d="M12 3 C 8.2 7.8, 8.2 16.2, 12 21"
        transform="rotate(-25 12 12)"
        stroke="#3b2314"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
