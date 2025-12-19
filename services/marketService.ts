import { Stock, ChartDataPoint, NewsItem } from "../types";

// ============================================
// Extended DSE Market Data
// ============================================

// Major DSE Indices
export interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
  volume: number;
  trades: number;
}

export const MARKET_INDICES: MarketIndex[] = [
  { name: 'DSEX', value: 5432.67, change: 45.23, changePercent: 0.84, volume: 245000000, trades: 125430 },
  { name: 'DSES', value: 1187.45, change: 8.12, changePercent: 0.69, volume: 89000000, trades: 45670 },
  { name: 'DS30', value: 1945.32, change: 15.67, changePercent: 0.81, volume: 156000000, trades: 78900 },
];

// Sector Performance Data
export interface SectorData {
  name: string;
  change: number;
  volume: number;
  companies: number;
}

export const SECTOR_DATA: SectorData[] = [
  { name: 'Bank', change: 1.2, volume: 45000000, companies: 34 },
  { name: 'Pharmaceuticals', change: 0.8, volume: 32000000, companies: 28 },
  { name: 'Telecommunication', change: -0.3, volume: 25000000, companies: 5 },
  { name: 'Engineering', change: 1.5, volume: 18000000, companies: 42 },
  { name: 'Fuel & Power', change: 0.5, volume: 22000000, companies: 21 },
  { name: 'Food & Allied', change: 2.1, volume: 15000000, companies: 18 },
  { name: 'Textile', change: -0.8, volume: 12000000, companies: 56 },
  { name: 'Cement', change: 1.8, volume: 8000000, companies: 7 },
  { name: 'Insurance', change: 0.2, volume: 6000000, companies: 46 },
  { name: 'Miscellaneous', change: 0.9, volume: 28000000, companies: 25 },
];

// Expanded Stock List (30+ companies)
export const MOCK_STOCKS: Stock[] = [
  // Banking Sector
  { ticker: 'BRACBANK', name: 'BRAC Bank Ltd.', price: 38.40, change: 0.50, changePercent: 1.32, volume: 560000, sector: 'Bank', sentiment: 'Bullish', confidence: 85 },
  { ticker: 'CITYBANK', name: 'City Bank Ltd.', price: 24.80, change: 0.30, changePercent: 1.22, volume: 320000, sector: 'Bank', sentiment: 'Bullish', confidence: 78 },
  { ticker: 'DUTCHBANGL', name: 'Dutch-Bangla Bank Ltd.', price: 52.30, change: -0.70, changePercent: -1.32, volume: 180000, sector: 'Bank', sentiment: 'Neutral', confidence: 62 },
  { ticker: 'EBL', name: 'Eastern Bank Ltd.', price: 28.60, change: 0.40, changePercent: 1.42, volume: 290000, sector: 'Bank', sentiment: 'Bullish', confidence: 80 },
  { ticker: 'ISLAMIBANK', name: 'Islami Bank Bangladesh', price: 32.50, change: 0.20, changePercent: 0.62, volume: 450000, sector: 'Bank', sentiment: 'Neutral', confidence: 65 },

  // Pharmaceuticals
  { ticker: 'SQURPHARMA', name: 'Square Pharmaceuticals', price: 210.50, change: -0.80, changePercent: -0.38, volume: 89500, sector: 'Pharmaceuticals', sentiment: 'Bullish', confidence: 78 },
  { ticker: 'BEACONPHAR', name: 'Beacon Pharmaceuticals', price: 142.30, change: 2.40, changePercent: 1.71, volume: 125000, sector: 'Pharmaceuticals', sentiment: 'Bullish', confidence: 82 },
  { ticker: 'RENATA', name: 'Renata Ltd.', price: 1215.00, change: -10.50, changePercent: -0.86, volume: 2100, sector: 'Pharmaceuticals', sentiment: 'Neutral', confidence: 55 },
  { ticker: 'ACIPHARMA', name: 'ACI Pharmaceuticals', price: 245.80, change: 3.20, changePercent: 1.32, volume: 45000, sector: 'Pharmaceuticals', sentiment: 'Bullish', confidence: 75 },
  { ticker: 'IBNSINA', name: 'Ibn Sina Pharma', price: 328.60, change: -2.10, changePercent: -0.63, volume: 18500, sector: 'Pharmaceuticals', sentiment: 'Neutral', confidence: 68 },

  // Telecommunication
  { ticker: 'GP', name: 'Grameenphone Ltd.', price: 286.60, change: 1.20, changePercent: 0.42, volume: 154200, sector: 'Telecommunication', sentiment: 'Neutral', confidence: 65 },
  { ticker: 'ROBI', name: 'Robi Axiata Ltd.', price: 42.80, change: -0.30, changePercent: -0.70, volume: 890000, sector: 'Telecommunication', sentiment: 'Bearish', confidence: 58 },

  // Engineering
  { ticker: 'WALTONHIL', name: 'Walton Hi-Tech Industries', price: 1456.00, change: 25.40, changePercent: 1.78, volume: 12000, sector: 'Engineering', sentiment: 'Bullish', confidence: 88 },
  { ticker: 'BSRMSTEEL', name: 'BSRM Steels Ltd.', price: 68.40, change: 1.10, changePercent: 1.63, volume: 340000, sector: 'Engineering', sentiment: 'Bullish', confidence: 72 },
  { ticker: 'GPH', name: 'GPH Ispat Ltd.', price: 42.50, change: 0.80, changePercent: 1.92, volume: 520000, sector: 'Engineering', sentiment: 'Bullish', confidence: 70 },

  // Cement
  { ticker: 'LHBL', name: 'LafargeHolcim Bangladesh', price: 68.90, change: 1.10, changePercent: 1.62, volume: 890000, sector: 'Cement', sentiment: 'Bullish', confidence: 72 },
  { ticker: 'HEIDELBCEM', name: 'Heidelberg Cement BD', price: 245.60, change: 3.80, changePercent: 1.57, volume: 35000, sector: 'Cement', sentiment: 'Bullish', confidence: 76 },

  // Food & Allied
  { ticker: 'BATBC', name: 'British American Tobacco', price: 518.70, change: 5.40, changePercent: 1.05, volume: 45000, sector: 'Food & Allied', sentiment: 'Bullish', confidence: 82 },
  { ticker: 'OLYMPIC', name: 'Olympic Industries', price: 156.40, change: -1.20, changePercent: -0.76, volume: 28000, sector: 'Food & Allied', sentiment: 'Neutral', confidence: 64 },
  { ticker: 'RFRNTEA', name: 'Rahman Food & Beverage', price: 48.20, change: 0.60, changePercent: 1.26, volume: 145000, sector: 'Food & Allied', sentiment: 'Bullish', confidence: 68 },

  // Fuel & Power
  { ticker: 'POWERGRID', name: 'Power Grid Company of BD', price: 52.40, change: 0.90, changePercent: 1.75, volume: 680000, sector: 'Fuel & Power', sentiment: 'Bullish', confidence: 74 },
  { ticker: 'SUMITPOWER', name: 'Summit Power Ltd.', price: 35.80, change: -0.40, changePercent: -1.10, volume: 420000, sector: 'Fuel & Power', sentiment: 'Neutral', confidence: 60 },

  // Textile
  { ticker: 'MARICO', name: 'Marico Bangladesh Ltd.', price: 1850.00, change: 15.00, changePercent: 0.82, volume: 3500, sector: 'Textile', sentiment: 'Bullish', confidence: 79 },
  { ticker: 'SQURTEXT', name: 'Square Textiles Ltd.', price: 42.60, change: 0.50, changePercent: 1.19, volume: 185000, sector: 'Textile', sentiment: 'Neutral', confidence: 62 },

  // Insurance
  { ticker: 'DELTALIFE', name: 'Delta Life Insurance', price: 85.40, change: 1.60, changePercent: 1.91, volume: 125000, sector: 'Insurance', sentiment: 'Bullish', confidence: 71 },
  { ticker: 'PRAGATI', name: 'Pragati Insurance', price: 62.80, change: 0.80, changePercent: 1.29, volume: 95000, sector: 'Insurance', sentiment: 'Neutral', confidence: 65 },

  // Miscellaneous
  { ticker: 'BEXIMCO', name: 'Beximco Limited', price: 115.20, change: -2.10, changePercent: -1.79, volume: 2300000, sector: 'Miscellaneous', sentiment: 'Bearish', confidence: 60 },
  { ticker: 'RUNNERAUTO', name: 'Runner Automobiles', price: 48.60, change: 0.70, changePercent: 1.46, volume: 380000, sector: 'Miscellaneous', sentiment: 'Bullish', confidence: 73 },
  { ticker: 'AAMRATECH', name: 'AAMRA Technologies', price: 68.40, change: 1.20, changePercent: 1.79, volume: 145000, sector: 'IT', sentiment: 'Bullish', confidence: 77 },
  { ticker: 'BDCOM', name: 'BDCOM Online Ltd.', price: 32.80, change: 0.40, changePercent: 1.23, volume: 210000, sector: 'IT', sentiment: 'Neutral', confidence: 66 },
];

// Top Gainers and Losers (computed from mock data)
export const getTopGainers = (count: number = 5): Stock[] => {
  return [...MOCK_STOCKS]
    .filter(s => s.changePercent > 0)
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, count);
};

export const getTopLosers = (count: number = 5): Stock[] => {
  return [...MOCK_STOCKS]
    .filter(s => s.changePercent < 0)
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, count);
};

export const getMostTraded = (count: number = 5): Stock[] => {
  return [...MOCK_STOCKS]
    .sort((a, b) => b.volume - a.volume)
    .slice(0, count);
};

// News Data
export const MOCK_NEWS: NewsItem[] = [
  { id: '1', title: 'BSEC approves new IPO for IT sector, expected to boost tech stocks', source: 'The Daily Star', time: '2h ago', impact: 'Positive' },
  { id: '2', title: 'DSE turnover hits 5-month low amidst liquidity crunch', source: 'Financial Express', time: '4h ago', impact: 'Negative' },
  { id: '3', title: 'GP declares 125% interim cash dividend for shareholders', source: 'DSE News', time: '6h ago', impact: 'Positive' },
  { id: '4', title: 'Central Bank tightens policy regarding margin loans', source: 'BizBangla', time: '1d ago', impact: 'Negative' },
  { id: '5', title: 'Walton Hi-Tech reports 28% YoY revenue growth in Q3', source: 'Business Standard', time: '1d ago', impact: 'Positive' },
  { id: '6', title: 'Square Pharma receives FDA approval for new generic drug', source: 'Pharma Today', time: '2d ago', impact: 'Positive' },
  { id: '7', title: 'Foreign investors show renewed interest in banking sector', source: 'New Age', time: '2d ago', impact: 'Positive' },
  { id: '8', title: 'Cement sector faces headwinds from rising input costs', source: 'The Business Post', time: '3d ago', impact: 'Negative' },
];

// Generate realistic chart data with trends
export const generateMockChartData = (ticker: string, days: number = 30): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const stock = MOCK_STOCKS.find(s => s.ticker === ticker);
  let basePrice = stock?.price || 100;
  const now = new Date();

  // Add some trend based on sentiment
  const trendFactor = stock?.sentiment === 'Bullish' ? 0.001 : stock?.sentiment === 'Bearish' ? -0.001 : 0;

  // Generate data points going backwards
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // More realistic price movement
    const volatility = 0.02 * basePrice; // 2% daily volatility
    const randomChange = (Math.random() - 0.5) * volatility;
    const trendChange = basePrice * trendFactor;

    basePrice += randomChange + trendChange;
    basePrice = Math.max(basePrice, 1); // Prevent negative prices

    data.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(basePrice.toFixed(2)),
      volume: Math.floor(Math.random() * (stock?.volume || 50000) * 0.5) + (stock?.volume || 10000) * 0.5
    });
  }

  return data;
};

// Market Status
export type MarketStatusType = 'OPEN' | 'CLOSED' | 'PRE_OPEN' | 'POST_CLOSE';

export const getMarketStatus = (): { status: MarketStatusType; message: string } => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const day = now.getDay();

  // DSE is open Sunday-Thursday, 10:30 AM - 2:30 PM (BST)
  const isWeekend = day === 5 || day === 6; // Friday or Saturday
  const timeInMinutes = hours * 60 + minutes;
  const openTime = 10 * 60 + 30; // 10:30 AM
  const closeTime = 14 * 60 + 30; // 2:30 PM

  if (isWeekend) {
    return { status: 'CLOSED', message: 'Market closed (Weekend)' };
  }

  if (timeInMinutes < openTime - 30) {
    return { status: 'CLOSED', message: 'Market opens at 10:30 AM' };
  }

  if (timeInMinutes >= openTime - 30 && timeInMinutes < openTime) {
    return { status: 'PRE_OPEN', message: 'Pre-market session' };
  }

  if (timeInMinutes >= openTime && timeInMinutes <= closeTime) {
    return { status: 'OPEN', message: 'Market is open' };
  }

  if (timeInMinutes > closeTime && timeInMinutes < closeTime + 30) {
    return { status: 'POST_CLOSE', message: 'Post-market session' };
  }

  return { status: 'CLOSED', message: 'Market closed' };
};

// Simulate real-time price updates
export const simulatePriceUpdate = (stock: Stock): Stock => {
  const volatility = 0.003; // 0.3% max change per update
  const change = stock.price * volatility * (Math.random() - 0.5);
  const newPrice = parseFloat((stock.price + change).toFixed(2));
  const totalChange = parseFloat((stock.change + change).toFixed(2));
  const changePercent = parseFloat(((totalChange / (stock.price - stock.change)) * 100).toFixed(2));

  return {
    ...stock,
    price: newPrice,
    change: totalChange,
    changePercent,
  };
};