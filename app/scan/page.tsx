"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CardScanner } from "@/components/scanner/CardScanner";
import { AddToPortfolioModal } from "@/components/cards/AddToPortfolioModal";
import { PokemonCard } from "@/types/pokemon";
import { Toaster } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Sparkles, History, ShieldCheck } from "lucide-react";

export default function ScanPage() {
  const router = useRouter();

  const handleCardFound = (card: PokemonCard) => {
    router.push(`/card/${card.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-10 font-sans">
      <Toaster position="bottom-right" />
      
      <div className="max-w-4xl mx-auto text-center mb-12">
        <Badge className="mb-4 bg-emerald-100 text-emerald-600 hover:bg-emerald-100 border-none px-3 py-1 font-black text-[10px] uppercase tracking-widest">
          Vision AI Engine v4.2
        </Badge>
        <h1 className="text-5xl font-black mb-6 text-slate-900 tracking-tight">
          Snap. Scan. <span className="text-red-600">Identify.</span>
        </h1>
        <p className="text-lg text-slate-500 mb-10 max-w-2xl mx-auto font-medium">
          Our Vision AI identifies your cards from PTCGL screenshots or physical photos with human-level precision.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 border border-slate-100">
            <div className="bg-white p-2 rounded-xl shadow-sm">
              <Sparkles className="h-5 w-5 text-red-600" />
            </div>
            <div className="text-left">
              <div className="text-xs font-black uppercase tracking-wider text-slate-400">Model</div>
              <div className="text-sm font-bold text-slate-900">Gemini 2.0 Flash</div>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 border border-slate-100">
            <div className="bg-white p-2 rounded-xl shadow-sm">
              <History className="h-5 w-5 text-red-600" />
            </div>
            <div className="text-left">
              <div className="text-xs font-black uppercase tracking-wider text-slate-400">Processing</div>
              <div className="text-sm font-bold text-slate-900">&lt; 2s Analysis</div>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 border border-slate-100">
            <div className="bg-white p-2 rounded-xl shadow-sm">
              <ShieldCheck className="h-5 w-5 text-red-600" />
            </div>
            <div className="text-left">
              <div className="text-xs font-black uppercase tracking-wider text-slate-400">Matching</div>
              <div className="text-sm font-bold text-slate-900">100% API Sync</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        <CardScanner onCardFound={handleCardFound} />
      </div>
    </div>
  );
}
