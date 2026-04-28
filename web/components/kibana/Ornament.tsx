/** Decorative diamond-and-rule ornament for premium section headers. */
export function Ornament({ tone = "gold" }: { tone?: "gold" | "burgundy" }) {
  const stroke = tone === "gold" ? "#D4AF37" : "#3B1F1A";
  return (
    <svg
      width="120"
      height="14"
      viewBox="0 0 120 14"
      aria-hidden
      className="opacity-80"
    >
      <line x1="0" y1="7" x2="48" y2="7" stroke={stroke} strokeWidth="1" />
      <line x1="72" y1="7" x2="120" y2="7" stroke={stroke} strokeWidth="1" />
      <path
        d="M60 1 L66 7 L60 13 L54 7 Z"
        fill="none"
        stroke={stroke}
        strokeWidth="1"
      />
      <circle cx="60" cy="7" r="1.5" fill={stroke} />
    </svg>
  );
}
