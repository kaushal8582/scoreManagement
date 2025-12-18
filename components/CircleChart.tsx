"use client";

import React, { useMemo, useState } from "react";

export interface PieDatum {
  label: string;
  value: number;
  color?: string;
  meta?: Record<string, any>;
}

interface CircleChartProps {
  data: PieDatum[];
  size?: number; // diameter in px
  strokeWidth?: number; // pie thickness
}

const DEFAULT_COLORS = [
  "#2563EB", // blue
  "#22C55E", // green
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // violet
  "#06B6D4", // cyan
  "#F43F5E", // rose
  "#84CC16", // lime
  "#A855F7", // purple
  "#10B981", // emerald
  "#FF7F50", // coral
  "#2DD4BF"  // teal
];

// Optional mapping for known categories to stable colors
const CATEGORY_COLORS: Record<string, string> = {
  P: "#2563EB",
  A: "#EF4444",
  L: "#F59E0B",
  M: "#A855F7",
  S: "#06B6D4",
  RGI: "#22C55E",
  RGO: "#84CC16",
  RRI: "#10B981",
  RRO: "#2DD4BF",
  V: "#8B5CF6",
  oneToOne: "#F43F5E",
  CEU: "#FF7F50",
  T: "#0EA5E9",
  TYFCB_amount: "#D946EF"
};

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = (angle - 90) * Math.PI / 180.0;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  return [
    "M", start.x, start.y,
    "A", r, r, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
}

export function CircleChart({ data, size = 180, strokeWidth = 24 }: CircleChartProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [mouse, setMouse] = useState<{x:number;y:number}>({x:0,y:0});

  const cleaned = useMemo(() => (data || []).filter((d) => (d?.value ?? 0) > 0), [data]);
  const total = useMemo(() => cleaned.reduce((sum, d) => sum + (d.value || 0), 0), [cleaned]);
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size - strokeWidth) / 2;

  let currentAngle = 0;
  const slices = cleaned.map((d, i) => {
    const pct = total > 0 ? d.value / total : 0;
    const sweep = pct * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sweep;
    currentAngle = endAngle;
    const color = d.color || CATEGORY_COLORS[d.label] || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
    return { startAngle, endAngle, color, datum: d, pct };
  });

  console.log("slices",slices);

  return (
    <div
      className="relative"
      onMouseMove={(e) => {
        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
    >
      <svg width={size} height={size} role="img" aria-label="Circle chart">
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
        {slices.map((s, idx) => (
          <path
            key={idx}
            d={arcPath(cx, cy, radius, s.startAngle, s.endAngle)}
            stroke={s.color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="butt"
            onMouseEnter={() => setHoverIdx(idx)}
            onMouseLeave={() => setHoverIdx(null)}
          />
        ))}
      </svg>

      {hoverIdx != null && slices[hoverIdx] && (
        <div
          className="pointer-events-none absolute z-10 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs shadow"
          style={{ left: mouse.x + 10, top: mouse.y + 10 }}
        >
          <div className="font-semibold text-gray-900">{slices[hoverIdx].datum.label}</div>
          <div className="text-gray-600">{slices[hoverIdx].datum.value.toLocaleString()}</div>
          {slices[hoverIdx].datum.meta?.captain && (
            <div className="text-gray-600">Captain: {String(slices[hoverIdx].datum.meta.captain)}</div>
          )}
          {typeof slices[hoverIdx].datum.meta?.totalPoints === 'number' && (
            <div className="text-gray-600">Total: {Number(slices[hoverIdx].datum.meta.totalPoints).toLocaleString()}</div>
          )}
          <div className="mt-1 text-gray-500">{Math.round(slices[hoverIdx].pct * 100)}%</div>
        </div>
      )}

      {/* simple legend below */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        {slices.map((s, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <span className="inline-block h-2 w-2 rounded" style={{ backgroundColor: s.color }} />
            <span className="text-gray-700">{s.datum.label}</span>
            <span className="ml-auto text-gray-500">{s.datum.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}