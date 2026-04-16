"use client";

interface Dimension {
  name: string;
  score: number;
}

interface RadarChartProps {
  dimensions: Dimension[];
  size?: number;
  maxScore?: number;
}

export function RadarChart({ dimensions, size = 300, maxScore = 100 }: RadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.38;
  const levels = 5;
  const n = dimensions.length || 5;

  function polarToCart(angle: number, r: number) {
    // Start from top (-90deg)
    const a = angle - Math.PI / 2;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }

  function polygonPoints(r: number) {
    return Array.from({ length: n }, (_, i) => {
      const angle = (2 * Math.PI * i) / n;
      const p = polarToCart(angle, r);
      return `${p.x},${p.y}`;
    }).join(" ");
  }

  const dataPoints = dimensions.map((d, i) => {
    const angle = (2 * Math.PI * i) / n;
    const r = (d.score / maxScore) * radius;
    return polarToCart(angle, r);
  });

  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {/* Grid levels */}
      {Array.from({ length: levels }, (_, i) => {
        const r = (radius * (i + 1)) / levels;
        return (
          <polygon
            key={i}
            points={polygonPoints(r)}
            fill="none"
            stroke="#2A2A36"
            strokeWidth={1}
          />
        );
      })}

      {/* Axes */}
      {Array.from({ length: n }, (_, i) => {
        const angle = (2 * Math.PI * i) / n;
        const p = polarToCart(angle, radius);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="#2A2A36"
            strokeWidth={1}
          />
        );
      })}

      {/* Data polygon with gradient fill */}
      {dimensions.length > 0 && (
        <>
          <defs>
            <linearGradient id="radar-fill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E8C872" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#E8C872" stopOpacity="0.12" />
            </linearGradient>
          </defs>
          <polygon
            points={dataPolygon}
            fill="url(#radar-fill)"
            stroke="#E8C872"
            strokeWidth={2.5}
          />
          {/* Data points */}
          {dataPoints.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={4} fill="#E8C872" />
          ))}
        </>
      )}

      {/* Labels */}
      {dimensions.map((d, i) => {
        const angle = (2 * Math.PI * i) / n;
        const labelR = radius + 28;
        const p = polarToCart(angle, labelR);
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-[#C9C9D1] text-[11px]"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {d.name}
          </text>
        );
      })}

      {/* Score labels near data points */}
      {dimensions.map((d, i) => {
        const angle = (2 * Math.PI * i) / n;
        const r = (d.score / maxScore) * radius + 14;
        const p = polarToCart(angle, r);
        return (
          <text
            key={`s-${i}`}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-[#E8C872] text-[10px] font-bold"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {d.score}
          </text>
        );
      })}
    </svg>
  );
}
