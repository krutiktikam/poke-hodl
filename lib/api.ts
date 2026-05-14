import { PokemonCard, PokemonAPIResponse } from "../types/pokemon";

const API_BASE_URL = "https://api.pokemontcg.io/v2";
const TCGDEX_BASE_URL = "https://api.tcgdex.net/v2/en";
// Standard TCG API Key
const API_KEY = process.env.POKEMON_TCG_API_KEY;

export type CardSeries = 'standard' | 'pocket';

/**
 * Standard Pokemon TCG API Client
 */
export const fetchCards = async (
  query?: string,
  page: number = 1,
  pageSize: number = 20
): Promise<PokemonAPIResponse<PokemonCard[]>> => {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });

  if (query) {
    params.append("q", query);
  }

  const response = await fetch(`${API_BASE_URL}/cards?${params.toString()}`, {
    headers: API_KEY ? { "X-Api-Key": API_KEY } : {},
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch cards: ${response.statusText}`);
  }

  return response.json();
};

/**
 * TCGdex API Client for Pocket Cards
 */
export const fetchPocketCards = async (
  query?: string,
  rarity?: string
): Promise<PokemonCard[]> => {
  try {
    let url = `${TCGDEX_BASE_URL}/cards?series=tcgp`;
    
    if (query) url += `&name=${encodeURIComponent(query)}`;
    if (rarity && rarity !== 'all') url += `&rarity=${encodeURIComponent(rarity)}`;

    const response = await fetch(url);
    if (!response.ok) return [];

    const data = await response.json();
    
    // TCGdex returns a list of cards for series/cards queries
    return (data || []).map(mapTCGdexToPokemonCard);
  } catch (err) {
    console.error("TCGdex Fetch Error:", err);
    return [];
  }
};

/**
 * Estimates a "Market Value" for Pocket cards based on their Pack Point crafting cost
 * and simulated scarcity.
 */
export function calculatePocketMarketValue(rarity: string): number {
  const rarityMap: Record<string, number> = {
    "1-Diamond": 35,
    "2-Diamond": 70,
    "3-Diamond": 150,
    "4-Diamond": 500,
    "1-Star": 400,
    "2-Star": 1250,
    "3-Star": 1500,
    "Crown": 2500,
  };

  // Convert points to a simulated USD value (e.g., $0.10 per point)
  const basePoints = rarityMap[rarity] || 35;
  const multiplier = 0.15; // Simulated market weight
  
  // Add a small random "Market Fluctuation" to make it look like a stock price
  const fluctuation = 1 + (Math.random() * 0.1 - 0.05);
  
  return parseFloat((basePoints * multiplier * fluctuation).toFixed(2));
}

/**
 * Maps TCGdex card structure to our internal PokemonCard type
 */
function mapTCGdexToPokemonCard(card: any): PokemonCard {
  const estimatedPrice = calculatePocketMarketValue(card.rarity || "1-Diamond");
  
  return {
    id: card.id,
    name: card.name,
    supertype: "Pokémon", // Default
    subtypes: [],
    set: {
      id: card.set?.id || "tcgp",
      name: card.set?.name || "Pocket",
      series: "TCG Pocket",
      printedTotal: 0,
      total: 0,
      legalities: { unlimited: "Legal" },
      releaseDate: "",
      updatedAt: "",
      images: { symbol: "", logo: "" }
    },
    number: card.localId || "",
    artist: "",
    rarity: card.rarity || "1-Diamond",
    legalities: { unlimited: "Legal" },
    images: {
      small: `${card.image}/low.webp`,
      large: `${card.image}/high.webp`,
    },
    // For Pocket, we inject our estimated price into the tcgplayer object
    tcgplayer: {
      url: "",
      updatedAt: new Date().toISOString(),
      prices: {
        normal: { 
          low: estimatedPrice * 0.8, 
          mid: estimatedPrice, 
          high: estimatedPrice * 1.2, 
          market: estimatedPrice 
        }
      }
    }
  };
}

export const fetchCardById = async (id: string, series: CardSeries = 'standard'): Promise<PokemonCard> => {
  if (series === 'pocket') {
    const response = await fetch(`${TCGDEX_BASE_URL}/cards/${id}`);
    if (!response.ok) throw new Error("Pocket card not found");
    return mapTCGdexToPokemonCard(await response.json());
  }

  const response = await fetch(`${API_BASE_URL}/cards/${id}`, {
    headers: API_KEY ? { "X-Api-Key": API_KEY } : {},
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch card ${id}: ${response.statusText}`);
  }

  const { data } = await response.json();
  return data;
};

/**
 * POKEPRICE API CLIENT
 * Used for historical trends and PSA grading insights.
 * Note: Now using internal API proxy to avoid CORS issues.
 */
const POKEPRICE_KEY = process.env.POKEPRICE_API_KEY || "pokeprice_free_34be7728b00f4e3ee04e9e3106c318a87b3f0691323b90c1";

export const fetchHistoricalData = async (cardId: string) => {
  try {
    const response = await fetch(`/api/pokeprice/history/${cardId}?key=${POKEPRICE_KEY}`);
    if (!response.ok) return null;
    return response.json();
  } catch (err) {
    console.error("Pokeprice History Error:", err);
    return null;
  }
};

export const fetchGradingInsights = async (cardId: string) => {
  try {
    const response = await fetch(`/api/pokeprice/grading/${cardId}?key=${POKEPRICE_KEY}`);
    if (!response.ok) return null;
    return response.json();
  } catch (err) {
    console.error("Pokeprice Grading Error:", err);
    return null;
  }
};
