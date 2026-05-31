export interface MarketMetrics {
  sentiment: 'Bullish' | 'Bearish' | 'Neutral' | 'Consolidating';
  volatility: 'Low' | 'Medium' | 'High' | 'Extreme';
  volatilityScore: number;
  momentum: number; // Percentage change over recent period
  confidence: number; // 0-1 score based on data points available
}

export function calculateMarketMetrics(history: { date: string; price: number }[]): MarketMetrics {
  if (!history || history.length < 2) {
    return {
      sentiment: 'Neutral',
      volatility: 'Low',
      volatilityScore: 0,
      momentum: 0,
      confidence: 0,
    };
  }

  const prices = history.map(h => h.price);
  const recentPrice = prices[prices.length - 1];
  const oldPrice = prices[0];
  const momentum = ((recentPrice - oldPrice) / (oldPrice || 1)) * 100;

  // Calculate Volatility (Standard Deviation / Mean)
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
  const variance = prices.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / prices.length;
  const stdDev = Math.sqrt(variance);
  const volatilityScore = (stdDev / (mean || 1)) * 100;

  let volatility: MarketMetrics['volatility'] = 'Low';
  if (volatilityScore > 15) volatility = 'Extreme';
  else if (volatilityScore > 8) volatility = 'High';
  else if (volatilityScore > 3) volatility = 'Medium';

  // Calculate Sentiment
  let sentiment: MarketMetrics['sentiment'] = 'Neutral';
  const recentTrend = prices.slice(-3); // Last 3 points
  const trendSlope = recentTrend.length >= 2 ? (recentTrend[recentTrend.length - 1] - recentTrend[0]) / recentTrend.length : 0;

  if (momentum > 5 && trendSlope > 0) sentiment = 'Bullish';
  else if (momentum < -5 && trendSlope < 0) sentiment = 'Bearish';
  else if (Math.abs(momentum) < 2) sentiment = 'Consolidating';

  return {
    sentiment,
    volatility,
    volatilityScore,
    momentum,
    confidence: Math.min(history.length / 10, 1), // Max confidence at 10+ data points
  };
}

/**
 * Fills in missing days between data points using linear interpolation.
 */
export function interpolateDailyData(history: { date: string; price: number }[]) {
  if (history.length < 2) return history;

  const sorted = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const result: { date: string; price: number }[] = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const start = sorted[i];
    const end = sorted[i + 1];
    const startDate = new Date(start.date);
    const endDate = new Date(end.date);
    
    const dayDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const priceDiff = end.price - start.price;

    for (let j = 0; j < dayDiff; j++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + j);
      
      const interpolatedPrice = start.price + (priceDiff * (j / dayDiff));
      result.push({
        date: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: interpolatedPrice
      });
    }
  }

  // Add the last point
  result.push({
    date: new Date(sorted[sorted.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    price: sorted[sorted.length - 1].price
  });

  return result;
}

/**
 * Predicts future prices based on linear regression of the last 10 data points.
 */
export function calculateFutureProjections(history: { date: string; price: number }[], forecastDays: number = 30) {
  if (history.length < 2) return [];

  // Use the last 10 points for a more relevant short-term trend
  const recentData = history.slice(-10);
  const n = recentData.length;
  
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += recentData[i].price;
    sumXY += i * recentData[i].price;
    sumX2 += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const lastPrice = recentData[n - 1].price;
  const result: { date: string; price: number; isPrediction: boolean }[] = [];
  
  // Start from today
  const lastDate = new Date();

  for (let i = 1; i <= forecastDays; i++) {
    const futureDate = new Date(lastDate);
    futureDate.setDate(lastDate.getDate() + i);
    
    // We add the slope relative to the last known point index (n-1)
    const predictedPrice = Math.max(0, intercept + slope * (n - 1 + i));
    
    result.push({
      date: futureDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: predictedPrice,
      isPrediction: true
    });
  }

  return result;
}

export interface SetDominanceData {
  name: string;
  value: number;
  isCurrent: boolean;
}

/**
 * Calculates how much a card "dominates" its set in terms of value.
 */
export function calculateSetDominance(currentCard: any, setCards: any[]): SetDominanceData[] {
  if (!setCards || setCards.length === 0) return [];

  const getPrice = (c: any) => 
    c.tcgplayer?.prices?.holofoil?.market || 
    c.tcgplayer?.prices?.normal?.market || 
    c.tcgplayer?.prices?.reverseHolofoil?.market || 0;

  // Take top 15 cards for the heatmap
  const sorted = [...setCards]
    .sort((a, b) => getPrice(b) - getPrice(a))
    .slice(0, 15);

  // Ensure current card is in the list
  const isIncluded = sorted.some(c => c.id === currentCard.id);
  if (!isIncluded) {
    sorted.pop();
    sorted.push(currentCard);
  }

  return sorted
    .sort((a, b) => getPrice(b) - getPrice(a))
    .map(c => ({
      name: c.name,
      value: getPrice(c),
      isCurrent: c.id === currentCard.id
    }));
}
