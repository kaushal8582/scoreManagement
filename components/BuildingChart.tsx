"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const ACTIVITY_SERIES = [
  { key: "Attendance", color: "#22c55e" },
  { key: "Visitors", color: "#ef4444" },
  { key: "Referrals", color: "#f59e0b" },
  { key: "Training", color: "#06b6d4" },
  { key: "Testimonials", color: "#7c3aed" },
  { key: "RGI", color: "#84cc16" },
  { key: "RGO", color: "#10b981" },
  { key: "RRI", color: "#3b82f6" },
  { key: "RRO", color: "#0ea5e9" },
  { key: "V", color: "#e11d48" },
  { key: "121", color: "#14b8a6" },
  { key: "CEU", color: "#f97316" },
  { key: "Conversion", color: "#9333ea" },
  { key: "TYFCB", color: "#098c00ff" },
];

/* =======================
   Custom X Axis Tick
   ======================= */
const CustomXAxisTick = ({ x, y, payload, data }: any) => {
 
  const item = data[payload.index]; // FULL ROW
  const total = (item.Attendance + item.Conversion +item?.Referrals + item?.TYFCB + item?.Testimonials + item?.Training + item?.Visitors +item?.["121"])




  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={14}
        textAnchor="middle"
        fill="#000000ff"
        fontSize={14}

        
      >
        {item?.name}
      </text>

      <text
        x={0}
        y={0}
        dy={30}
        textAnchor="middle"
        fill="#252626ff"
        fontSize={11}
        fontWeight={600}
      >
        Total: {total.toFixed(2)}
      </text>
    </g>
  );
};


export function BuildingChart({ data }: any) {

   const isMobile = typeof window !== "undefined" && window.innerWidth < 640;


  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 50, left: 20, bottom: 55 }}
        >
          {/* X Axis with custom tick */}
          {/* <XAxis
            dataKey="name "
            interval={0}
             tick={(props) => <CustomXAxisTick {...props} data={data} />}
          /> */}

          {isMobile ?<XAxis
  dataKey="name"
  angle={-45}
  textAnchor="end"
  height={80}
  interval={0}
  // tick={(props) => <CustomXAxisTick {...props} data={data} />}
  
/>:<XAxis
  dataKey="name"
  angle={-45}
  textAnchor="end"
  height={80}
  interval={0}
  tick={(props) => <CustomXAxisTick {...props} data={data} />}
  
/> }

          <XAxis
  dataKey="name"
  angle={-45}
  textAnchor="end"
  height={80}
  interval={0}
  // tick={(props) => <CustomXAxisTick {...props} data={data} />}
  
/>

          {/* Left axis → stacked activities */}
          <YAxis yAxisId="left" tick={{ fill: "#9ca3af" }} />

          {/* Tooltip */}
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

          {/* Stacked activity bars */}
          {ACTIVITY_SERIES.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              stackId="activities"
              yAxisId="left"
              fill={s.color}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
