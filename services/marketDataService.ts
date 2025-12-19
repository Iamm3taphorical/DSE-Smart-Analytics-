import axios from 'axios';
import { StockData } from '../types';

const API_URL = 'http://localhost:5000/api';

// Mock Data for Fallback
const MOCK_STOCKS: StockData[] = [
    { ticker: 'GP', name: 'Grameenphone Ltd.', price: 286.6, change: 12.4, changePercent: 4.5, volume: 154200, high: 290, low: 280, sector: 'Telecommunication', sentiment: 'Bullish', confidence: 85 },
    { ticker: 'BATBC', name: 'British American Tobacco', price: 518.2, change: -5.3, changePercent: -1.0, volume: 45000, high: 525, low: 515, sector: 'Food & Allied', sentiment: 'Bearish', confidence: 62 },
    { ticker: 'SQUAREPHARMA', name: 'Square Pharmaceuticals', price: 215.8, change: 3.2, changePercent: 1.5, volume: 89300, high: 218, low: 212, sector: 'Pharmaceuticals', sentiment: 'Bullish', confidence: 78 },
    { ticker: 'RENATA', name: 'Renata Ltd.', price: 1210.5, change: 0.0, changePercent: 0.0, volume: 1200, high: 1215, low: 1205, sector: 'Pharmaceuticals', sentiment: 'Neutral', confidence: 50 },
    { ticker: 'ISLAMIBANK', name: 'Islami Bank Bd Ltd', price: 32.4, change: 0.5, changePercent: 1.6, volume: 560000, high: 33, low: 32, sector: 'Bank', sentiment: 'Bullish', confidence: 70 },
];

export const fetchMarketData = async (): Promise<StockData[]> => {
    try {
        console.log('Fetching market data from scraper...');
        const response = await axios.get(`${API_URL}/stocks`);

        // Transform Scraper Data to App format if needed
        // Scraper returns: { ticker, price, change, ... }
        // We need to add 'sector', 'sentiment', 'confidence' if missing (mock AI analysis)

        const rawData = response.data;
        if (!Array.isArray(rawData) || rawData.length === 0) {
            console.warn('Scraper returned empty array, using mock data.');
            return MOCK_STOCKS;
        }

        return rawData.map((s: any) => ({
            ticker: s.ticker,
            name: s.ticker, // Scraper might not have full name yet
            price: s.price,
            change: s.change,
            changePercent: s.changePercent,
            volume: s.volume,
            high: s.high,
            low: s.low,
            sector: 'Unknown', // Need deeper scraping for sector
            sentiment: s.change >= 0 ? 'Bullish' : 'Bearish',
            confidence: Math.floor(Math.random() * 30) + 60 // Mock confidence
        }));
    } catch (error) {
        console.error('Failed to fetch from scraper (is backend running?):', error);
        return MOCK_STOCKS;
    }
};

export const searchStocks = async (query: string): Promise<StockData[]> => {
    try {
        const response = await axios.get(`${API_URL}/search?q=${query}`);
        return response.data.map((s: any) => ({
            ticker: s.ticker,
            name: s.ticker,
            price: s.price,
            change: s.change,
            changePercent: s.changePercent,
            volume: s.volume,
            high: s.high,
            low: s.low,
            sector: 'Unknown',
            sentiment: 'Neutral',
            confidence: 50
        }));
    } catch {
        return MOCK_STOCKS.filter(s => s.ticker.toLowerCase().includes(query.toLowerCase()));
    }
};
