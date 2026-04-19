import type { ProgressDimension } from "@/lib/api";

interface RubricRadarProps {
  averages: ProgressDimension[];
  size?: number;
  maxScore?: number;
}

/**
 * SVG radar chart that animates its polygon draw on mount via CSS keyframes.
 * Server-renderable — the animation is pure CSS so it runs without JS.
 * Respects `prefers-reduced-motion` by jumping to the final state.
 */
export function RubricRadar({ averages, size = 320, maxScore = 100 }: RubricRadarProps) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.36;
  const levels = 4;
  const n = Math.max(averages.length, 3);

  const polar = (angle: number, r: number) => {
    const a = angle - Math.PI / 2;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };

  const ringPoints = (r: number) =>
    Array.from({ length: n }, (_, i) => {
      const angle = (2 * Math.PI * i) / n;
      const p = polar(angle, r);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    }).join(" ");

  const data = averages.map((d, i) => {
    const angle = (2 * Math.PI * i) / n;
    const r = (Math.max(0, Math.min(maxScore, d.score)) / maxScore) * radius;
    return { ...polar(angle, r), score: d.score, dimension: d.dimension };
  });

  const dataPoly = data.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  return (
    <div className="w-full flex flex-col items-center">
      <style>{`
        @keyframes radarDraw {
          from { opacity: 0; transform: scale(0.75); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes radarPop {
          from { opacity: 0; transform: scale(0); }
          to   { opacity: 1; transform: scale(1); }
        }
        .radar-poly {
          transform-origin: ${cx}px ${cy}px;
          animation: radarDraw 900ms cubic-bezier(0.22,1,0.36,1) both;
        }
        .radar-point {
          transform-origin: center;
          animation: radarPop 700ms cubic-bezier(0.22,1,0.36,1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .radar-poly, .radar-point { animation: none !important; }
        }
      `}</style>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-label="Rubric averages radar"
        role="img"
      >
        <defs>
          <radialGradient id="radar-fill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E8C872" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#E8C872" stopOpacity="0.10" />
          </radialGradient>
          <filter id="radar-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid rings */}
        {Array.from({ length: levels }, (_, i) => {
          const r = (radius * (i + 1)) / levels;
          return (
            <polygon
              key={`ring-${i}`}
              points={ringPoints(r)}
              fill="none"
              stroke="#2A2A36"
              strokeWidth={1}
              strokeDasharray={i === levels - 1 ? undefined : "3 4"}
              opacity={0.8}
            />
          );
        })}

        {/* Axes */}
        {Array.from({ length: n }, (_, i) => {
          const angle = (2 * Math.PI * i) / n;
          const p = polar(angle, radius);
          return (
            <line
              key={`axis-${i}`}
              x1={cx}
              y1={cy}
              x2={p.x}
              y2={p.y}
              stroke="#2A2A36"
              strokeWidth={1}
              opacity={0.6}
            />
          );
        })}

        {/* Data polygon */}
        {data.length > 0 && (
          <g className="radar-poly">
            <polygon
              points={dataPoly}
              fill="url(#radar-fill)"
              stroke="#E8C872"
              strokeWidth={2}
              filter="url(#radar-glow)"
            />
            {data.map((p, i) => (
              <circle
                key={`pt-${i}`}
                cx={p.x}
                cy={p.y}
                r={4}
                fill="#E8C872"
                className="radar-point"
                style={{ animationDelay: `${400 + i * 80}ms` }}
              />
            ))}
          </g>
        )}

        {/* Labels */}
        {averages.map((d, i) => {
          const angle = (2 * Math.PI * i) / n;
          const labelR = radius + 26;
          const p = polar(angle, labelR);
          return (
            <text
              key={`lbl-${i}`}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-[#C9C9D1]"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 11,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {d.dimension}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
