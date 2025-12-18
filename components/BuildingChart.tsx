"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

const ACTIVITY_SERIES = [
  { key: "P", color: "#22c55e" },
  { key: "A", color: "#ef4444" },
  { key: "L", color: "#f59e0b" },
  { key: "M", color: "#06b6d4" },
  { key: "S", color: "#7c3aed" },
  { key: "RGI", color: "#84cc16" },
  { key: "RGO", color: "#10b981" },
  { key: "RRI", color: "#3b82f6" },
  { key: "RRO", color: "#0ea5e9" },
  { key: "V", color: "#e11d48" },
  { key: "oneToOne", color: "#14b8a6" },
  { key: "CEU", color: "#f97316" },
  { key: "T", color: "#9333ea" },
  { key: "TYFCB_amount", color: "#098c00ff" },
  // { key: "totalPoints", color: "#8c0015ff" },
];

export function BuildingChart({ data }: any) {
  console.log("data", data);

  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 50, left: 20, bottom: 20 }}
        >
          <XAxis dataKey="name" interval={0} tick={{ fill: "#9ca3af", fontSize: 12 }} />

          {/* Left axis → stacked activities */}
          <YAxis yAxisId="left" tick={{ fill: "#9ca3af" }} />

          {/* Right axis → amount */}
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: "#9ca3af" }}
          />

          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;

              return (
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-3">
                  <p className="text-white font-semibold">{label}</p>
                  {payload.map((item) => (
                    <div
                      key={item.dataKey}
                      className="text-sm"
                      style={{ color: item.color }}
                    >
                      {item.name}: {item.value}
                    </div>
                  ))}
                </div>
              );
            }}
          />

          <Legend />

          {/* Stacked multi-color bars */}
          {ACTIVITY_SERIES.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              stackId="activities"
              yAxisId="left"
              fill={s.color}
            />
          ))}

          {/* Removed amount bar to show only a single stacked tower per user */}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
