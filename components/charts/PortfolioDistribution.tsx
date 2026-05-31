"use client";

import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip 
} from "recharts";
import { useEffect, useState } from "react";

interface PortfolioDistributionProps {
  data: { name: string; value: number }[];
}

const COLORS = ["#dc2626", "#2563eb", "#059669", "#d97706", "#7c3aed", "#db2777"];

export function PortfolioDistribution({ data }: PortfolioDistributionProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="h-[250px] w-full bg-slate-50 animate-pulse rounded-3xl" />;

  return (
    <div className="relative w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: 'none', 
              borderRadius: '12px',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
            formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Value']}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
