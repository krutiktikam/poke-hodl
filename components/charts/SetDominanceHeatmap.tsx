"use client";

import { useEffect, useState } from "react";
import { ResponsiveContainer, Treemap, Tooltip } from "recharts";

interface SetDominanceHeatmapProps {
  data: { name: string; value: number; isCurrent: boolean }[];
}

const CustomizedContent = (props: any) => {
  const { x, y, width, height, index, name, isCurrent } = props;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: isCurrent ? "#dc2626" : "#1e293b",
          stroke: "#fff",
          strokeWidth: 2,
          strokeOpacity: 1,
        }}
      />
      {width > 50 && height > 30 && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          fill="#fff"
          fontSize={10}
          fontWeight="black"
          className="uppercase tracking-tighter"
        >
          {name.length > 10 ? `${name.substring(0, 8)}...` : name}
        </text>
      )}
    </g>
  );
};

export function SetDominanceHeatmap({ data }: SetDominanceHeatmapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="h-[300px] w-full bg-slate-50 animate-pulse rounded-3xl" />;

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%" debounce={100}>
        <Treemap
          data={data}
          dataKey="value"
          aspectRatio={4 / 3}
          stroke="#fff"
          content={<CustomizedContent />}
        >
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-3 rounded-xl shadow-xl border border-slate-100">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{payload[0].payload.name}</p>
                    <p className="text-sm font-black text-slate-900">${payload[0].value.toFixed(2)}</p>
                  </div>
                );
              }
              return null;
            }}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}
