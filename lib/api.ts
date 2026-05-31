import { PokemonCard, PokemonAPIResponse } from "../types/pokemon";

const API_BASE_URL = "https://api.pokemontcg.io/v2";
// Standard TCG API Key
const API_KEY = process.env.POKEMON_TCG_API_KEY;

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

export const fetchCardById = async (id: string): Promise<PokemonCard> => {
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
 * Fetches all cards in a specific set, used for market concentration analytics.
 */
export const fetchCardsBySet = async (setId: string): Promise<PokemonCard[]> => {
  const params = new URLSearchParams({
    q: `set.id:${setId}`,
    orderBy: "-tcgplayer.prices.holofoil.market", // Try holofoil first
    pageSize: "50"
  });

  const response = await fetch(`${API_BASE_URL}/cards?${params.toString()}`, {
    headers: API_KEY ? { "X-Api-Key": API_KEY } : {},
  });

  if (!response.ok) {
    return [];
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
