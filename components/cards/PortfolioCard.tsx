"use client";

import Image from "next/image";
import Link from "next/link";
import { PortfolioItem } from "@/types/portfolio";
import { Card } from "@/components/ui/card";
import { MiniSparkline } from "@/components/charts/MiniSparkline";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PortfolioCardProps {
  item: PortfolioItem & { currentPrice: number; history: { value: number }[] };
}

export function PortfolioCard({ item }: PortfolioCardProps) {
  const profit = (item.currentPrice - item.purchase_price) * item.quantity;
  const profitPercentage = ((item.currentPrice - item.purchase_price) / item.purchase_price) * 100;
  const isPositive = profit >= 0;

  return (
    <Link href={`/portfolio/${item.card_id}`}>
      <Card className="p-4 hover:shadow-md transition-all border-slate-100 bg-white group">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-12 flex-shrink-0">
            <Image 
              src={item.image_url} 
              alt={item.card_name} 
              fill 
              className="object-contain" 
              sizes="48px"
            />
          </div>
          
          <div className="flex-grow min-w-0">
            <h3 className="font-bold text-slate-900 truncate">{item.card_name}</h3>
            <p className="text-xs text-slate-500 truncate">{item.set_name}</p>
          </div>

          <div className="hidden sm:block">
            <MiniSparkline 
              data={item.history} 
              color={isPositive ? "#10b981" : "#dc2626"} 
            />
          </div>

          <div className="text-right">
            <div className="font-bold text-slate-900">${item.currentPrice.toFixed(2)}</div>
            <div className={`text-xs font-bold flex items-center justify-end gap-1 ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {isPositive ? '+' : ''}{profitPercentage.toFixed(1)}%
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
