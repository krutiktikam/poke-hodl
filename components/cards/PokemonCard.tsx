import Link from "next/link";
import Image from "next/image";
import { PokemonCard as PokemonCardType } from "@/types/pokemon";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PokemonCardProps {
  card: PokemonCardType;
}

export function PokemonCard({ card }: PokemonCardProps) {
  const price = card.tcgplayer?.prices?.holofoil?.market || 
                card.tcgplayer?.prices?.normal?.market || 
                card.tcgplayer?.prices?.reverseHolofoil?.market || 
                0;

  return (
    <Link href={`/card/${card.id}`}>
      <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 bg-white border-slate-200 rounded-[2rem] cursor-pointer">
        <CardHeader className="p-0 bg-slate-50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative aspect-[2/3] w-full overflow-hidden">
            <Image
              src={card.images.small}
              alt={card.name}
              fill
              className="object-contain p-4 group-hover:scale-110 transition-transform duration-500 ease-out"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-1">
            <CardTitle className="text-lg font-black truncate text-slate-900 tracking-tight">{card.name}</CardTitle>
            <span className="text-[10px] uppercase tracking-wider font-black px-2 py-1 rounded-lg bg-red-50 text-red-600">
              {card.rarity?.split(' ').map(word => word[0]).join('') || 'C'}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{card.set.name}</p>
          <div className="flex justify-between items-center pt-4 border-t border-slate-50">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Market Value</span>
              <span className="text-2xl font-black text-slate-900 tracking-tighter">
                {price > 0 ? `$${price.toFixed(2)}` : "—"}
              </span>
            </div>
            <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
