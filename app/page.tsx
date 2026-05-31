"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, AlertTriangle, Loader2, TrendingUp, TrendingDown, ArrowUpRight, Smartphone, Globe } from "lucide-react";
import { fetchCards, fetchPocketCards, CardSeries } from "@/lib/api";
import { PokemonCard } from "@/types/pokemon";
import { CardGrid } from "@/components/cards/CardGrid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function MarketDashboard() {
  const [query, setQuery] = useState("");
  const [rarity, setRarity] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(false);

  // Stats
  const [marketStats, setMarketStats] = useState({
    avgPrice: 0,
    dailyChange: 0,
    volatility: 0,
    movers: [] as PokemonCard[]
  });

  const performSearch = useCallback(async (
    searchQuery: string, 
    searchRarity: string, 
    searchType: string,
    pageNum: number = 1,
    append: boolean = false
  ) => {
    try {
      if (append) setIsMoreLoading(true);
      else setIsLoading(true);
      setError(false);

      // Standard API
      let apiQuery = searchQuery || "";
      if (searchRarity && searchRarity !== 'all') apiQuery += ` rarity:"${searchRarity}"`;
      if (searchType && searchType !== 'all') apiQuery += ` types:${searchType}`;

      const response = await fetchCards(apiQuery, pageNum, 20);
      
      if (append) {
        // Use functional update to avoid dependency on 'cards' state
        setCards(prev => {
          const newCards = response.data.filter(nc => !prev.some(oc => oc.id === nc.id));
          return [...prev, ...newCards];
        });
      } else {
        setCards(response.data);
        
        // Use first 3 as "Movers" for dashboard
        setMarketStats({
          avgPrice: response.data.reduce((acc, c) => acc + (c.tcgplayer?.prices?.normal?.market || 40), 0) / (response.data.length || 1),
          dailyChange: -1.2,
          volatility: 8.4,
          movers: response.data.slice(0, 3)
        });
      }
      setTotalCount(response.totalCount);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setIsLoading(false);
      setIsMoreLoading(false);
    }
  }, []); // Removed 'cards' dependency

  useEffect(() => {
    // Wrap in a setTimeout to avoid synchronous setState warning during mount/update
    const timer = setTimeout(() => {
      performSearch("", rarity, type, 1, false);
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchClick = () => {
    setPage(1);
    performSearch(query, rarity, type, 1, false);
  };

  const handleFilterChange = (value: string, filterType: "rarity" | "type") => {
    const newRarity = filterType === "rarity" ? value : rarity;
    const newType = filterType === "type" ? value : type;
    
    if (filterType === "rarity") setRarity(value);
    if (filterType === "type") setType(value);
    setPage(1);
    
    // Immediate search on filter change
    performSearch(
      query, 
      newRarity, 
      newType, 
      1, 
      false
    );
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    performSearch(query, rarity, type, nextPage, true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <header className="bg-slate-900 pt-20 pb-32 px-4 relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-red-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-1/3 h-full bg-indigo-600/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Live Terminal Alpha v4.0</span>
              </div>
              <h1 className="text-6xl font-black text-white tracking-tighter leading-tight">
                Market <span className="text-red-600">Discovery.</span>
              </h1>
              <p className="text-slate-400 text-lg font-medium max-w-xl mt-2">
                Institutional-grade analytical terminal for Pokémon TCG asset classes.
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
             <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Avg Market Price</div>
                <div className="text-2xl font-black text-white">${marketStats.avgPrice.toFixed(2)}</div>
             </div>
             <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">24H Pulse</div>
                <div className={`text-2xl font-black flex items-center gap-1 ${marketStats.dailyChange >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>
                  {marketStats.dailyChange >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                  {marketStats.dailyChange}%
                </div>
             </div>
             <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Volatility Index</div>
                <div className="text-2xl font-black text-white">{marketStats.volatility}%</div>
             </div>
             <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md relative overflow-hidden group cursor-pointer">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Top Mover</div>
                <div className="text-sm font-bold text-white truncate">{marketStats.movers[0]?.name || "Loading..."}</div>
                <div className="absolute right-4 bottom-4 text-emerald-400 opacity-20 group-hover:opacity-100 transition-opacity">
                   <ArrowUpRight className="h-8 w-8" />
                </div>
             </div>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-red-500 transition-colors" />
              <div className="absolute inset-0 bg-white/5 rounded-2xl border border-white/10 group-focus-within:border-red-500/50 transition-all" />
              <Input
                placeholder="Search assets (e.g. Charizard, Gengar...)"
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
                  {["Common", "Uncommon", "Rare", "Rare Holo", "Rare Ultra", "Rare Rainbow", "Rare Secret"].map(r => (
                    <SelectItem key={r} value={r} className="rounded-xl font-bold">{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

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

              <Button 
                onClick={handleSearchClick}
                className="bg-red-600 hover:bg-red-700 text-white h-14 px-8 rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-red-900/20"
              >
                Scan Market
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto -mt-12 relative z-20 px-4">
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
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">
                Market Results
              </h3>
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
