export interface Stock {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  sector: string;
  peRatio?: number;
  sentiment?: 'Bullish' | 'Bearish' | 'Neutral';
  confidence?: number;
}

export interface ChartDataPoint {
  date: string;
  price: number;
  volume: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isAuthenticated: boolean;
  avatar?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum MarketStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  PRE_OPEN = 'PRE_OPEN'
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  impact: 'Positive' | 'Negative' | 'Neutral';
}

// OHLC Data for Candlestick and Advanced Charts
export interface OHLCDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Extended User Profile
export interface UserProfile {
  id: string;
  name: string;
  phone?: string;
  email: string;
  avatar: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  watchlist: string[]; // Array of stock tickers
  favorites: string[]; // Array of favorite stock tickers
  preferredLanguage: 'en' | 'bn';
  preferredTheme: 'dark' | 'light' | 'system';
  createdAt: Date;
  updatedAt: Date;
}

// Analysis Result Types
export interface CandlestickPattern {
  name: string;
  type: 'bullish' | 'bearish' | 'neutral';
  description: string;
  psychology: string;
  confidence: number;
  startIndex: number;
  endIndex: number;
}

export interface AnalysisResult {
  method: string;
  signal: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
  confidence: number;
  patterns: CandlestickPattern[];
  interpretation: string;
  psychology: string;
  useCase: string;
  supportLevels: number[];
  resistanceLevels: number[];
  timestamp: Date;
}