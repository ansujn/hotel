"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useId, useMemo } from "react";

export interface ProgressPoint {
  label: string; // e.g. "Oct"
  value: number; // 0..100
}

interface Props {
  title?: string;
  subtitle?: string;
  points: ProgressPoint[];
}

/**
 * Hand-rolled SVG area/line chart. Animates the stroke on mount via
 * framer-motion. Respects reduced-motion.
 */
export function ProgressChart({
  title = "Rubric average over time",
  subtitle,
  points,
}: Props) {
  const prefersReducedMotion = useReducedMotion();
  const gradId = useId();
  const gridId = useId();

  const w = 720;
  const h = 220;
  const padL = 40;
  const padR = 16;
  const padT = 16;
  const padB = 36;

  const innerW = w - padL - padR;
  const innerH = h - padT - padB;

  const data = points.length > 0 ? points : [];

  const { path, area, dots, yTicks } = useMemo(() => {
    if (data.length === 0) {
      return { path: "", area: "", dots: [] as Array<{ x: number; y: number; p: ProgressPoint }>, yTicks: [] as number[] };
    }
    const xs = data.map((_, i) => (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW));
    const ys = data.map((d) => innerH - (Math.max(0, Math.min(100, d.value)) / 100) * innerH);
    const pts = xs.map((x, i) => ({ x: x + padL, y: ys[i] + padT, p: data[i] }));

    // Catmull-Rom-ish smoothing via cubic bezier
    const linePath = pts.reduce((acc, cur, i, arr) => {
      if (i === 0) return `M ${cur.x.toFixed(1)} ${cur.y.toFixed(1)}`;
      const prev = arr[i - 1];
      const cx1 = prev.x + (cur.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (cur.x - prev.x) / 2;
      const cy2 = cur.y;
      return `${acc} C ${cx1.toFixed(1)} ${cy1.toFixed(1)}, ${cx2.toFixed(1)} ${cy2.toFixed(1)}, ${cur.x.toFixed(1)} ${cur.y.toFixed(1)}`;
    }, "");

    const areaPath = `${linePath} L ${pts[pts.length - 1].x.toFixed(1)} ${(padT + innerH).toFixed(1)} L ${pts[0].x.toFixed(1)} ${(padT + innerH).toFixed(1)} Z`;

    return { path: linePath, area: areaPath, dots: pts, yTicks: [0, 50, 100] };
  }, [data, innerH, innerW, padT, padL]);

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-[#2A2A36] bg-[#15151C] p-8">
        <div className="text-[10px] tracking-[0.3em] text-[#8A8A96]">PROGRESS</div>
        <h3 className="serif mt-2 text-xl font-bold">{title}</h3>
        <p className="mt-6 text-sm text-[#8A8A96]">
          No scored performances yet. Once instructors begin rating,
          your child{"\u2019"}s growth over time will appear here.
        </p>
      </div>
    );
  }

  const latest = data[data.length - 1];
  const first = data[0];
  const delta = latest.value - first.value;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#2A2A36] bg-[#15151C] p-6 md:p-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[10px] tracking-[0.3em] text-[#E8C872]">PROGRESS</div>
          <h3 className="serif mt-2 text-xl font-bold">{title}</h3>
          {subtitle && (
            <p className="text-sm text-[#8A8A96] mt-1">{subtitle}</p>
          )}
        </div>
        <div className="text-right">
          <div className="serif text-4xl font-black text-[#E8C872]">
            {Math.round(latest.value)}
          </div>
          <div className="text-xs text-[#8A8A96]">
            {delta >= 0 ? "+" : ""}
            {Math.round(delta)} vs {first.label}
          </div>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        className="mt-6 w-full h-[220px]"
        role="img"
        aria-label={`Rubric average over time. Latest score ${Math.round(latest.value)} out of 100.`}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E8C872" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#E8C872" stopOpacity="0" />
          </linearGradient>
          <pattern id={gridId} width="60" height="40" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 40" fill="none" stroke="#2A2A36" strokeWidth="0.5" />
          </pattern>
        </defs>

        <rect x={padL} y={padT} width={innerW} height={innerH} fill={`url(#${gridId})`} opacity="0.4" />

        {/* y ticks */}
        {yTicks.map((t) => {
          const y = padT + innerH - (t / 100) * innerH;
          return (
            <g key={t}>
              <line x1={padL} x2={w - padR} y1={y} y2={y} stroke="#2A2A36" strokeDasharray="2 4" />
              <text x={padL - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#8A8A96">
                {t}
              </text>
            </g>
          );
        })}

        {/* area */}
        <motion.path
          d={area}
          fill={`url(#${gradId})`}
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />

        {/* line */}
        <motion.path
          d={path}
          fill="none"
          stroke="#E8C872"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={prefersReducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
        />

        {/* dots + labels */}
        {dots.map((d, i) => (
          <g key={i}>
            <motion.circle
              cx={d.x}
              cy={d.y}
              r="4"
              fill="#0B0B0F"
              stroke="#E8C872"
              strokeWidth="2"
              initial={prefersReducedMotion ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.6 + i * 0.08 }}
            />
            <text
              x={d.x}
              y={h - 12}
              textAnchor="middle"
              fontSize="10"
              fill="#8A8A96"
            >
              {d.p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
