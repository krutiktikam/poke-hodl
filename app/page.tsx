"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, AlertTriangle, Loader2, Zap, Star, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CardGrid } from "@/components/cards/CardGrid";
import { fetchCards } from "@/lib/api";
import { PokemonCard } from "@/types/pokemon";
import { Button } from "@/components/ui/button";

import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";

export default function MarketDashboard() {
  const [query, setQuery] = useState("");
  const [rarity, setRarity] = useState("all");
  const [type, setType] = useState("all");
  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [movers, setMovers] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isMoversLoading, setIsMoversLoading] = useState(true);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = useCallback(async (searchTerm: string, currentRarity: string, currentType: string, isAppend = false) => {
    try {
      if (isAppend) setIsMoreLoading(true);
      else setIsLoading(true);
      
      setError(null);
      let apiQuery = "";
      
      const parts = [];
      if (searchTerm.trim()) parts.push(`name:"*${searchTerm}*"` );
      if (currentRarity !== "all") parts.push(`rarity:"${currentRarity}"`);
      if (currentType !== "all") parts.push(`types:"${currentType}"`);
      
      apiQuery = parts.join(" ");
      
      const currentPage = isAppend ? page + 1 : 1;
      const response = await fetchCards(apiQuery, currentPage);
      
      if (isAppend) {
        setCards(prev => {
          const combined = [...prev, ...response.data];
          const uniqueMap = new Map();
          combined.forEach(card => {
            if (!uniqueMap.has(card.id)) uniqueMap.set(card.id, card);
          });
          return Array.from(uniqueMap.values());
        });
        setPage(currentPage);
      } else {
        const uniqueMap = new Map();
        response.data.forEach(card => {
          if (!uniqueMap.has(card.id)) uniqueMap.set(card.id, card);
        });
        setCards(Array.from(uniqueMap.values()));
        setTotalCount(response.totalCount);
        setPage(1);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect to the Pokémon TCG API.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setIsMoreLoading(false);
    }
  }, [page]);

  useEffect(() => {
    const init = async () => {
      await performSearch("", "all", "all");
      
      // Load Market Movers (Simulated for this demo by fetching "Market Leaders")
      try {
        setIsMoversLoading(true);
        const moversResponse = await fetchCards('set.id:swsh4 rarity:"Rare Holo VMAX"');
        const simulatedMovers = moversResponse.data.slice(0, 4).map((card, i) => {
          const price = card.tcgplayer?.prices?.holofoil?.market || 50;
          const change = [8.4, -3.2, 12.1, -1.5][i % 4];
          return { ...card, change, currentPrice: price };
        });
        setMovers(simulatedMovers);
      } catch (e) {
        console.error("Movers Load Error:", e);
      } finally {
        setIsMoversLoading(false);
      }
    };
    init();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query, rarity, type);
  };

  const handleLoadMore = () => {
    performSearch(query, rarity, type, true);
  };

  const handleFilterChange = (value: string, filterType: "rarity" | "type") => {
    if (filterType === "rarity") {
      setRarity(value);
      performSearch(query, value, type);
    } else {
      setType(value);
      performSearch(query, rarity, value);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <Toaster position="bottom-right" />
      
      <header className="max-w-6xl mx-auto mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <Badge className="mb-4 bg-red-100 text-red-600 hover:bg-red-100 border-none px-3 py-1 font-black text-[10px] uppercase tracking-widest">
              Live Market Terminal v4.0
            </Badge>
            <h1 className="text-7xl font-black text-slate-900 tracking-tighter leading-tight">
              The Poké<span className="text-red-600">Market.</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium max-w-xl">
              Professional-grade analytics for the most valuable assets in the TCG world.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Market Volatility</div>
              <div className="text-3xl font-black text-slate-900">Moderate</div>
              <div className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1">
                <ArrowUpRight className="h-3 w-3" /> Accumulation Phase
              </div>
            </div>
          </div>
        </div>

        {/* Market Movers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {isMoversLoading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-50 animate-pulse rounded-[2rem]" />
            ))
          ) : (
            movers.map((card) => (
              <Link href={`/card/${card.id}`} key={card.id}>
                <Card className="p-6 border-slate-100 hover:shadow-xl transition-all rounded-[2rem] group cursor-pointer bg-white">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-red-50 transition-colors">
                      <Activity className={`h-5 w-5 ${card.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-black ${card.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {card.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {card.change >= 0 ? '+' : ''}{card.change}%
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{card.name}</div>
                    <div className="text-2xl font-black text-slate-900">${card.currentPrice.toFixed(2)}</div>
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>

        <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-red-900/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10">
             <TrendingUp className="h-64 w-64" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl font-black mb-4 tracking-tight">Market Exploration Engine</h2>
            <p className="text-slate-400 font-medium mb-10">
              Query over {totalCount.toLocaleString()} cards with institutional-grade search filters.
            </p>
            
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 bg-white/10 p-2 rounded-3xl border border-white/10 backdrop-blur-md">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <Input
                  placeholder="Asset Name (e.g. Umbreon VMAX)"
                  className="pl-12 h-14 bg-transparent border-none focus-visible:ring-0 text-lg shadow-none text-white placeholder:text-white/20 font-bold"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={type} onValueChange={(v) => handleFilterChange(v as string, "type")}>
                  <SelectTrigger className="w-[120px] h-14 bg-white/5 border-none focus:ring-0 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl bg-slate-900 border-white/10 text-white">
                    <SelectItem value="all">All Types</SelectItem>
                    {["Fire", "Water", "Grass", "Lightning", "Psychic", "Fighting", "Darkness", "Metal", "Dragon", "Colorless"].map(t => (
                      <SelectItem key={t} value={t} className="rounded-xl font-bold">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button type="submit" className="h-14 px-8 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black transition-all active:scale-95">
                  Execute Search
                </Button>
              </div>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {error ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100 shadow-sm p-12">
            <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-slate-900 mb-2">Market Data Unavailable</h3>
            <p className="text-slate-500 mb-8 font-medium">Failed to establish connection with the TCG terminal.</p>
            <Button className="bg-red-600" onClick={() => performSearch(query, rarity, type)}>Reconnect</Button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-between items-center px-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Market Results</h3>
              <div className="h-px flex-grow mx-8 bg-slate-100" />
              <Badge variant="outline" className="border-slate-200 text-slate-400 font-bold">{totalCount} Assets Found</Badge>
            </div>
            <CardGrid cards={cards} isLoading={isLoading} />
          </div>
        )}

        {cards.length > 0 && cards.length < totalCount && (
          <div className="flex justify-center mt-24 mb-24">
            <Button 
              onClick={handleLoadMore} 
              disabled={isMoreLoading}
              className="bg-slate-900 hover:bg-black text-white h-16 px-16 rounded-[2rem] font-black text-lg shadow-2xl transition-all active:scale-95"
            >
              {isMoreLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Fetch More Data"}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}