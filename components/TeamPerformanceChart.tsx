"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { TeamPerformancePoint } from "../data/mockData";

interface Props {
  data: TeamPerformancePoint[];
}

// Generate a deterministic color for each team based on index
function generatePalette(n: number): string[] {
  const colors: string[] = [];
  for (let i = 0; i < n; i++) {
    const hue = Math.round((360 / Math.max(1, n)) * i);
    colors.push(`hsl(${hue} 70% 50%)`);
  }
  return colors;
}

export function TeamPerformanceChart({ data }: Props) {
  const weeks = Array.from(new Set(data.map((d) => d.week)));
  const teams = Array.from(new Set(data.map((d) => d.team))).sort();

  const palette = generatePalette(teams.length);
  const colorByTeam: Record<string, string> = teams.reduce((acc, team, idx) => {
    acc[team] = palette[idx] ?? "#e5e7eb";
    return acc;
  }, {} as Record<string, string>);

  const chartData = weeks.map((week) => {
    const entry: Record<string, string | number> = { week };
    teams.forEach((team) => {
      const point = data.find((d) => d.week === week && d.team === team);
      entry[team] = point?.points ?? 0;
    });
    return entry;
  });

  // console.log("chartData", chartData);

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
          <XAxis dataKey="week" stroke="#9ca3af" tickLine={false} />
          <YAxis stroke="#9ca3af" tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#f5f6f7ff",
              border: "1px solid #1f2937",
              borderRadius: 8
            }}
          />
          <Legend />
          {teams.map((team) => (
            <Line
              key={team}
              type="linear"
              dataKey={team}
              stroke={colorByTeam[team]}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}


