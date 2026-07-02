"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CardScanner } from "@/components/scanner/CardScanner";
import { AddToPortfolioModal } from "@/components/cards/AddToPortfolioModal";
import { PokemonCard } from "@/types/pokemon";
import { Toaster } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Sparkles, History, ShieldCheck } from "lucide-react";

export default function ScanPage() {
  const router = useRouter();
  const [scanHistory, setScanHistory] = useState<PokemonCard[]>([]);

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("scan-history") || "[]");
    setScanHistory(history);
  }, []);

  const handleCardFound = (card: PokemonCard) => {
    // Add to scan history local cache
    const history = JSON.parse(localStorage.getItem("scan-history") || "[]");
    const updated = [
      card,
      ...history.filter((c: any) => c.id !== card.id)
    ].slice(0, 10);
    localStorage.setItem("scan-history", JSON.stringify(updated));
    setScanHistory(updated);

    const isPocket = card.set?.series === "TCG Pocket";
    router.push(`/card/${card.id}${isPocket ? '?series=pocket' : ''}`);
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
              <div className="text-sm font-bold text-slate-900">Gemini 1.5 Flash</div>
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

      {/* Scan History Section */}
      {scanHistory.length > 0 && (
        <div className="max-w-5xl mx-auto mt-16 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
              <History className="h-4 w-4 text-red-600" />
              Recent Scans
            </h2>
            <button 
              onClick={() => {
                localStorage.removeItem("scan-history");
                setScanHistory([]);
              }}
              className="text-xs font-bold text-slate-400 hover:text-red-600 transition-colors uppercase tracking-widest animate-pulse"
            >
              Clear History
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {scanHistory.map((card) => (
              <div 
                key={card.id} 
                onClick={() => handleCardFound(card)}
                className="bg-white border border-slate-100 hover:border-red-100 shadow-sm hover:shadow-md transition-all rounded-[2rem] p-4 cursor-pointer flex flex-col items-center group relative overflow-hidden"
              >
                <div className="relative w-full aspect-[2/3] max-w-[120px] mb-4 overflow-hidden rounded-xl">
                  <Image 
                    src={card.images.small} 
                    alt={card.name} 
                    fill 
                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                    sizes="120px"
                  />
                </div>
                <div className="w-full text-center">
                  <h4 className="text-sm font-bold text-slate-900 truncate leading-tight mb-1">{card.name}</h4>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest truncate">{card.set.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
