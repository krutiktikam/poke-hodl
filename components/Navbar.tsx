"use client";

import Link from "next/link";
import { TrendingUp, Search, Camera, Menu, Wallet, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { User as SupabaseUser } from "@supabase/supabase-js";

export function Navbar() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-red-600 p-1.5 rounded-lg">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 uppercase tracking-tighter">Poké<span className="text-red-600">HODL</span></span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-bold text-slate-500 hover:text-red-600 transition-colors flex items-center gap-2 uppercase tracking-widest">
            <Search className="h-4 w-4" />
            Market
          </Link>
          <Link href="/scan" className="text-sm font-bold text-slate-500 hover:text-red-600 transition-colors flex items-center gap-2 uppercase tracking-widest">
            <Camera className="h-4 w-4" />
            AI Scanner
          </Link>
          <Link href="/portfolio" className="text-sm font-bold text-slate-500 hover:text-red-600 transition-colors flex items-center gap-2 uppercase tracking-widest">
            <Wallet className="h-4 w-4" />
            Vault
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Verified Pro</span>
                <span className="text-xs font-bold text-slate-900">{user.email?.split('@')[0]}</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleSignOut}
                className="rounded-xl hover:bg-red-50 hover:text-red-600 text-slate-400"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Link href="/auth">
              <Button className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-6 h-10 font-bold shadow-lg shadow-red-100 transition-all active:scale-95">
                Sign In
              </Button>
            </Link>
          )}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6 text-slate-600" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
