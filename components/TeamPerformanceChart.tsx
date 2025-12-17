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

const teamColors: Record<string, string> = {
  Alpha: "#4f46e5",
  Bravo: "#22c55e",
  Delta: "#f97316"
};

export function TeamPerformanceChart({ data }: Props) {
  const weeks = Array.from(new Set(data.map((d) => d.week)));
  const teams = Array.from(new Set(data.map((d) => d.team)));

  const chartData = weeks.map((week) => {
    const entry: Record<string, string | number> = { week };
    teams.forEach((team) => {
      const point = data.find((d) => d.week === week && d.team === team);
      entry[team] = point?.points ?? 0;
    });
    return entry;
  });

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
          <XAxis dataKey="week" stroke="#9ca3af" tickLine={false} />
          <YAxis stroke="#9ca3af" tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#020617",
              border: "1px solid #1f2937",
              borderRadius: 8
            }}
          />
          <Legend />
          {teams.map((team) => (
            <Line
              key={team}
              type="monotone"
              dataKey={team}
              stroke={teamColors[team] ?? "#e5e7eb"}
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


