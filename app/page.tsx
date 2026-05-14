"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, AlertTriangle, Loader2, Zap, Star, TrendingUp, TrendingDown, ArrowUpRight, Activity, Smartphone, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CardGrid } from "@/components/cards/CardGrid";
import { fetchCards, fetchPocketCards, CardSeries } from "@/lib/api";
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
  const [series, setSeries] = useState<CardSeries>("standard");
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

  const performSearch = useCallback(async (searchTerm: string, currentSeries: CardSeries, currentRarity: string, currentType: string, isAppend = false) => {
    try {
      if (isAppend) setIsMoreLoading(true);
      else setIsLoading(true);
      
      setError(null);

      if (currentSeries === 'pocket') {
        const pocketCards = await fetchPocketCards(searchTerm, currentRarity);
        setCards(pocketCards);
        setTotalCount(pocketCards.length);
        setPage(1);
        setIsLoading(false);
        setIsMoreLoading(false);
        return;
      }

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
      await performSearch("", series, "all", "all");
      
      try {
        setIsMoversLoading(true);
        let moversData: PokemonCard[] = [];
        
        if (series === 'standard') {
          const moversResponse = await fetchCards('set.id:swsh4 rarity:"Rare Holo VMAX"');
          moversData = moversResponse.data;
        } else {
          moversData = await fetchPocketCards("");
        }

        const simulatedMovers = moversData.slice(0, 4).map((card, i) => {
          const price = card.tcgplayer?.prices?.holofoil?.market || (series === 'pocket' ? 150 : 50);
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
  }, [series]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query, series, rarity, type);
  };

  const handleLoadMore = () => {
    performSearch(query, series, rarity, type, true);
  };

  const handleSeriesToggle = (newSeries: CardSeries) => {
    setSeries(newSeries);
    setQuery(""); // Clear search when switching
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <Toaster position="bottom-right" />
      
      <header className="max-w-6xl mx-auto mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <Badge className="mb-4 bg-red-100 text-red-600 hover:bg-red-100 border-none px-3 py-1 font-black text-[10px] uppercase tracking-widest">
              Live Market Terminal v4.2
            </Badge>
            <h1 className="text-7xl font-black text-slate-900 tracking-tighter leading-tight">
              The Poké<span className="text-red-600">Market.</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium max-w-xl">
              Professional-grade analytics for the most valuable assets in the TCG world.
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-sm flex">
              <button 
                onClick={() => handleSeriesToggle('standard')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${series === 'standard' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Globe className="h-4 w-4" />
                Standard
              </button>
              <button 
                onClick={() => handleSeriesToggle('pocket')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${series === 'pocket' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Smartphone className="h-4 w-4" />
                Pocket
              </button>
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
              <Link href={`/card/${card.id}${series === 'pocket' ? '?series=pocket' : ''}`} key={card.id}>
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

        <div className={`rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden transition-colors duration-500 ${series === 'pocket' ? 'bg-indigo-900 shadow-indigo-900/20' : 'bg-slate-900 shadow-red-900/20'}`}>
          <div className="absolute top-0 right-0 p-12 opacity-10">
             {series === 'pocket' ? <Smartphone className="h-64 w-64" /> : <TrendingUp className="h-64 w-64" />}
          </div>
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl font-black mb-4 tracking-tight">
              {series === 'pocket' ? 'Genetic Apex Explorer' : 'Market Exploration Engine'}
            </h2>
            <p className="text-slate-400 font-medium mb-10">
              {series === 'pocket' 
                ? "Analyzing digital assets from the Pokémon TCG Pocket ecosystem."
                : `Query over ${totalCount.toLocaleString()} physical assets with institutional-grade filters.`
              }
            </p>
            
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 bg-white/10 p-2 rounded-3xl border border-white/10 backdrop-blur-md">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <Input
                  placeholder={series === 'pocket' ? "Asset Name (e.g. Mewtwo ex)" : "Asset Name (e.g. Umbreon VMAX)"}
                  className="pl-12 h-14 bg-transparent border-none focus-visible:ring-0 text-lg shadow-none text-white placeholder:text-white/20 font-bold"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={rarity} onValueChange={(v) => handleFilterChange(v, "rarity")}>
                  <SelectTrigger className="w-[140px] h-14 bg-white/5 border-none focus:ring-0 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl">
                    <SelectValue placeholder="Rarity" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl bg-slate-900 border-white/10 text-white">
                    <SelectItem value="all">All Rarities</SelectItem>
                    {series === 'standard' ? (
                      ["Common", "Uncommon", "Rare", "Rare Holo", "Rare Ultra", "Rare Rainbow", "Rare Secret"].map(r => (
                        <SelectItem key={r} value={r} className="rounded-xl font-bold">{r}</SelectItem>
                      ))
                    ) : (
                      ["1-Diamond", "2-Diamond", "3-Diamond", "4-Diamond", "1-Star", "2-Star", "3-Star", "Crown"].map(r => (
                        <SelectItem key={r} value={r} className="rounded-xl font-bold">{r.replace('-', ' ')}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                {series === 'standard' && (
                  <Select value={type} onValueChange={(v) => handleFilterChange(v, "type")}>
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
                )}

                <Button type="submit" className={`h-14 px-8 rounded-2xl font-black transition-all active:scale-95 ${series === 'pocket' ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-red-600 hover:bg-red-700'}`}>
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
            <Button className="bg-red-600" onClick={() => performSearch(query, series, rarity, type)}>Reconnect</Button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-between items-center px-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">
                {series === 'pocket' ? 'Digital Inventory' : 'Market Results'}
              </h3>
              <div className="h-px flex-grow mx-8 bg-slate-100" />
              <Badge variant="outline" className="border-slate-200 text-slate-400 font-bold">{totalCount} Assets Found</Badge>
            </div>
            <CardGrid cards={cards} isLoading={isLoading} />
          </div>
        )}

        {series === 'standard' && cards.length > 0 && cards.length < totalCount && (
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