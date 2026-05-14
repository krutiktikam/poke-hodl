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
  query?: string
): Promise<PokemonCard[]> => {
  try {
    // TCGdex uses a slightly different structure. 
    // For Pocket, we specifically target the 'tcgp' series.
    const url = query 
      ? `${TCGDEX_BASE_URL}/cards?name=${encodeURIComponent(query)}&series=tcgp`
      : `${TCGDEX_BASE_URL}/series/tcgp`;

    const response = await fetch(url);
    if (!response.ok) return [];

    const data = await response.json();
    
    // If it's a series list, we need to fetch the cards for the sets
    if (data.sets) {
      const cards: any[] = [];
      // Just fetch the first set for the dashboard demo
      const firstSet = data.sets[0];
      const setResponse = await fetch(`${TCGDEX_BASE_URL}/sets/${firstSet.id}`);
      const setData = await setResponse.json();
      return (setData.cards || []).map(mapTCGdexToPokemonCard);
    }

    return (data || []).map(mapTCGdexToPokemonCard);
  } catch (err) {
    console.error("TCGdex Fetch Error:", err);
    return [];
  }
};

/**
 * Maps TCGdex card structure to our internal PokemonCard type
 */
function mapTCGdexToPokemonCard(card: any): PokemonCard {
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
    rarity: card.rarity || "Common",
    legalities: { unlimited: "Legal" },
    images: {
      small: `${card.image}/low.webp`,
      large: `${card.image}/high.webp`,
    },
    // Pocket cards don't have TCGPlayer prices, we'll simulate or leave empty
    tcgplayer: {
      url: "",
      updatedAt: new Date().toISOString(),
      prices: {
        normal: { low: 0, mid: 0, high: 0, market: 0 }
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
