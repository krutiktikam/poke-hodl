"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PortfolioItem } from "@/types/portfolio";
import { PortfolioCard } from "@/components/cards/PortfolioCard";
import { PokemonCard } from "@/components/cards/PokemonCard";
import { Card } from "@/components/ui/card";
import { 
  Wallet, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  Plus, 
  LayoutGrid,
  Loader2,
  AlertCircle,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PortfolioDistribution } from "@/components/charts/PortfolioDistribution";
import { fetchCards } from "@/lib/api";
import { User as SupabaseUser } from "@supabase/supabase-js";
interface EnrichedPortfolioItem extends PortfolioItem {
  currentPrice: number;
  history: { value: number }[];
}

export default function PortfolioPage() {
  const [items, setItems] = useState<EnrichedPortfolioItem[]>([]);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setIsLoading(false);
          return;
        }
        setUser(session.user);

        const { data, error } = await supabase
          .from('portfolio')
          .select('*')
          .eq('user_id', session.user.id);

        if (error) throw error;

        // Fetch current prices for each item
        const enrichedItems = await Promise.all((data || []).map(async (item) => {
          try {
            // This is a simplified fetch. In a real app, we'd batch this or use a cache.
            const response = await fetchCards(`id:"${item.card_id}"`);
            const currentPrice = response.data[0]?.tcgplayer?.prices?.normal?.market || 
                                response.data[0]?.tcgplayer?.prices?.holofoil?.market || 
                                item.purchase_price;
            
            // Mock history for sparkline
            const history = [
              { value: item.purchase_price },
              { value: item.purchase_price * 1.05 },
              { value: currentPrice * 0.95 },
              { value: currentPrice }
            ];

            return { ...item, currentPrice, history };
          } catch {
            return { ...item, currentPrice: item.purchase_price, history: [{value: item.purchase_price}] };
          }
        }));

        setItems(enrichedItems);
      } catch (error) {
        console.error("Failed to load portfolio:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPortfolio();

    const loadWatchlist = () => {
      const stored = JSON.parse(localStorage.getItem("watchlist") || "[]");
      setWatchlist(stored);
    };
    loadWatchlist();

    window.addEventListener("watchlist-updated", loadWatchlist);
    return () => {
      window.removeEventListener("watchlist-updated", loadWatchlist);
    };
  }, []);

  const totalValue = items.reduce((sum, item) => sum + (item.currentPrice * item.quantity), 0);
  const totalCost = items.reduce((sum, item) => sum + (item.purchase_price * item.quantity), 0);
  const totalProfit = totalValue - totalCost;
  const profitPercentage = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  const distributionData = Object.entries(
    items.reduce((acc: Record<string, number>, item) => {
      acc[item.set_name] = (acc[item.set_name] || 0) + (item.currentPrice * item.quantity);
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value: value as number }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 text-red-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <AlertCircle className="h-16 w-16 text-slate-300 mx-auto mb-6" />
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Access Restricted</h1>
        <p className="text-slate-500 mb-10 max-w-md mx-auto font-medium">
          Sign in to access your personal market terminal and track your asset collection.
        </p>
        <Link href="/auth">
          <Button className="bg-red-600 hover:bg-red-700 text-white rounded-2xl h-14 px-10 font-black text-lg shadow-xl shadow-red-100">
            Sign In to Vault
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 font-sans">
      <header className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-red-600 p-1.5 rounded-lg">
                <Wallet className="h-4 w-4 text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Personal Vault Alpha</span>
            </div>
            <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-tight">
              My <span className="text-red-600">Portfolio.</span>
            </h1>
            <p className="text-slate-500 font-medium max-w-xl">
              Real-time valuation and performance metrics for your verified assets.
            </p>
          </div>
          
          <div className="flex gap-4">
            <Link href="/">
              <Button className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl h-14 px-8 font-black transition-all active:scale-95 flex items-center gap-2 shadow-sm">
                <Plus className="h-5 w-5" />
                Add Assets
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-8 border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Total Net Worth</div>
            <div className="text-4xl font-black text-slate-900 tracking-tighter">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${totalProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              <TrendingUp className="h-3 w-3" />
              {totalProfit >= 0 ? '+' : ''}{profitPercentage.toFixed(1)}% Total Gain
            </div>
          </Card>

          <Card className="p-8 border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Unrealized P/L</div>
            <div className={`text-4xl font-black tracking-tighter ${totalProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {totalProfit >= 0 ? '+' : '-'}${Math.abs(totalProfit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Across {items.length} Unique Assets</div>
          </Card>

          <Card className="p-8 border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-slate-900 text-white lg:col-span-2 relative overflow-hidden">
            <div className="relative z-10">
              <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4">Market Position</div>
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-4xl font-black tracking-tighter text-white">Top 12%</div>
                  <div className="text-xs font-bold text-white/40 mt-1 uppercase tracking-widest">Collection Scarcity Rank</div>
                </div>
                <div className="h-12 w-px bg-white/10" />
                <div>
                  <div className="text-4xl font-black tracking-tighter text-emerald-400">Bullish</div>
                  <div className="text-xs font-bold text-white/40 mt-1 uppercase tracking-widest">Portfolio Sentiment</div>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <TrendingUp className="h-32 w-32" />
            </div>
          </Card>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
              <LayoutGrid className="h-4 w-4" />
              Verified Inventory
            </h2>
            <div className="h-px flex-grow mx-8 bg-slate-100" />
          </div>

          {items.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {items.map((item) => (
                <PortfolioCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="bg-white border-2 border-dashed border-slate-100 rounded-[3rem] py-24 text-center">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Your Vault is Empty</h3>
              <p className="text-slate-500 mb-8 max-w-xs mx-auto">Start scanning your cards or browse the market to add them to your portfolio.</p>
              <Link href="/">
                <Button className="bg-slate-900 text-white rounded-xl px-8 h-12 font-bold">Browse Market</Button>
              </Link>
            </div>
          )}

          {/* Watchlist Section */}
          <div className="space-y-8 pt-10">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                The Vault Watchlist
              </h2>
              <div className="h-px flex-grow mx-8 bg-slate-100" />
            </div>

            {watchlist.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {watchlist.map((card) => (
                  <PokemonCard key={card.id} card={card} />
                ))}
              </div>
            ) : (
              <div className="bg-white border-2 border-dashed border-slate-100 rounded-[3rem] py-16 text-center">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-6 w-6 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Your Watchlist is Empty</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6">Star cards on the market dashboard to keep an eye on their price trends.</p>
                <Link href="/">
                  <Button className="bg-slate-900 text-white rounded-xl px-6 h-10 font-bold text-sm">Browse Market</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
            <PieChartIcon className="h-4 w-4" />
            Allocation Alpha
          </h2>
          <Card className="p-8 border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] bg-white">
            <PortfolioDistribution data={distributionData} />
          </Card>

          <Card className="p-8 bg-red-600 text-white rounded-[3rem] border-none shadow-xl shadow-red-100">
            <h3 className="text-lg font-black mb-2">Optimization Tips</h3>
            <p className="text-white/80 text-sm font-medium mb-6">Your portfolio is heavily weighted in Base Set cards. Consider diversifying into Sword & Shield VMAX for better liquidity.</p>
            <Button className="w-full bg-white text-red-600 hover:bg-slate-50 font-black rounded-2xl h-12">
              View Market Analytics
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
