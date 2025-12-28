"use client";

import { useState, useEffect } from "react";
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Format week label: remove year on mobile
  const formatWeekLabel = (weekLabel: string): string => {
    if (isMobile) {
      // Remove .YY from dates (e.g., "03.12.25 - 10.12.25" -> "03.12 - 10.12")
      return weekLabel.replace(/\.\d{2}(?=\s|$)/g, '');
    }
    return weekLabel;
  };

  const weeks = Array.from(new Set(data.map((d) => d.week)));
  const teams = Array.from(new Set(data.map((d) => d.team))).sort();

  const palette = generatePalette(teams.length);
  const colorByTeam: Record<string, string> = teams.reduce((acc, team, idx) => {
    acc[team] = palette[idx] ?? "#e5e7eb";
    return acc;
  }, {} as Record<string, string>);

  const chartData = weeks.map((week) => {
    const entry: Record<string, string | number> = { week: formatWeekLabel(week) };
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
          <XAxis 
            dataKey="week" 
            interval={0} 
            stroke="#9ca3af" 
            tick={{ fontSize: 14 }} 
            tickLine={false}
            // angle={-45}
            textAnchor="middle"
            domain={['dataMin', 'dataMax']}
            padding={{ left: 10, right: isMobile ? 20 : 40 }}
            allowDataOverflow={false}
          />
          <YAxis stroke="#9ca3af" tickLine={false} />
          <Tooltip
          
            contentStyle={{
              backgroundColor: "#f5f6f7ff",
              border: "1px solid #0e50acff",
              borderRadius: 8,
              color:"black"
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


