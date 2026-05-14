import { PokemonCard as PokemonCardType } from "@/types/pokemon";
import { PokemonCard } from "./PokemonCard";

interface CardGridProps {
  cards: PokemonCardType[];
  isLoading?: boolean;
}

export function CardGrid({ cards, isLoading }: CardGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="aspect-[2/3] w-full bg-slate-200 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <p className="text-xl text-slate-400">No cards found. Try a different search!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {cards.map((card, index) => (
        <PokemonCard
          key={`${card.id}-${index}`}
          card={card}
        />
      ))}    </div>
  );
}
