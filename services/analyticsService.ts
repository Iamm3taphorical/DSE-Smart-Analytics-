import { Stock, ChartDataPoint } from '../types';

// ============================================
// Technical Analysis Service
// ============================================

export interface TechnicalIndicators {
    rsi: number;
    rsiSignal: 'Overbought' | 'Oversold' | 'Neutral';
    macd: {
        value: number;
        signal: number;
        histogram: number;
        trend: 'Bullish' | 'Bearish' | 'Neutral';
    };
    sma20: number;
    sma50: number;
    ema12: number;
    ema26: number;
    bollingerBands: {
        upper: number;
        middle: number;
        lower: number;
        width: number;
    };
    volatility: number;
    support: number;
    resistance: number;
}

// Calculate Simple Moving Average
export const calculateSMA = (data: number[], period: number): number => {
    if (data.length < period) return data[data.length - 1] || 0;
    const slice = data.slice(-period);
    return slice.reduce((sum, val) => sum + val, 0) / period;
};

// Calculate Exponential Moving Average
export const calculateEMA = (data: number[], period: number): number => {
    if (data.length < period) return data[data.length - 1] || 0;
    const multiplier = 2 / (period + 1);
    let ema = data.slice(0, period).reduce((sum, val) => sum + val, 0) / period;

    for (let i = period; i < data.length; i++) {
        ema = (data[i] - ema) * multiplier + ema;
    }

    return ema;
};

// Calculate RSI (Relative Strength Index)
export const calculateRSI = (data: number[], period: number = 14): number => {
    if (data.length < period + 1) return 50;

    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= period; i++) {
        const change = data[data.length - i] - data[data.length - i - 1];
        if (change > 0) gains += change;
        else losses -= change;
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
};

// Calculate MACD
export const calculateMACD = (data: number[]): { value: number; signal: number; histogram: number } => {
    const ema12 = calculateEMA(data, 12);
    const ema26 = calculateEMA(data, 26);
    const macdLine = ema12 - ema26;

    // For signal line, we would need historical MACD values
    // Simplified calculation for demo
    const signalLine = macdLine * 0.9; // Approximation
    const histogram = macdLine - signalLine;

    return {
        value: parseFloat(macdLine.toFixed(2)),
        signal: parseFloat(signalLine.toFixed(2)),
        histogram: parseFloat(histogram.toFixed(2)),
    };
};

// Calculate Bollinger Bands
export const calculateBollingerBands = (data: number[], period: number = 20): {
    upper: number;
    middle: number;
    lower: number;
    width: number;
} => {
    const sma = calculateSMA(data, period);
    const slice = data.slice(-period);

    // Calculate standard deviation
    const squaredDiffs = slice.map(val => Math.pow(val - sma, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / period;
    const stdDev = Math.sqrt(variance);

    const upper = sma + (stdDev * 2);
    const lower = sma - (stdDev * 2);

    return {
        upper: parseFloat(upper.toFixed(2)),
        middle: parseFloat(sma.toFixed(2)),
        lower: parseFloat(lower.toFixed(2)),
        width: parseFloat(((upper - lower) / sma * 100).toFixed(2)),
    };
};

// Calculate Volatility (as percentage)
export const calculateVolatility = (data: number[]): number => {
    if (data.length < 2) return 0;

    const returns: number[] = [];
    for (let i = 1; i < data.length; i++) {
        returns.push((data[i] - data[i - 1]) / data[i - 1]);
    }

    const avgReturn = returns.reduce((sum, val) => sum + val, 0) / returns.length;
    const squaredDiffs = returns.map(r => Math.pow(r - avgReturn, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / returns.length;

    return parseFloat((Math.sqrt(variance) * 100).toFixed(2));
};

// Calculate Support and Resistance levels
export const calculateSupportResistance = (data: number[]): { support: number; resistance: number } => {
    if (data.length < 5) {
        return { support: data[0] || 0, resistance: data[data.length - 1] || 0 };
    }

    const sortedData = [...data].sort((a, b) => a - b);
    const support = sortedData[Math.floor(sortedData.length * 0.1)];
    const resistance = sortedData[Math.floor(sortedData.length * 0.9)];

    return {
        support: parseFloat(support.toFixed(2)),
        resistance: parseFloat(resistance.toFixed(2)),
    };
};

// Get all technical indicators for a stock
export const getTechnicalIndicators = (chartData: ChartDataPoint[]): TechnicalIndicators => {
    const prices = chartData.map(d => d.price);

    const rsi = calculateRSI(prices);
    const macdData = calculateMACD(prices);
    const bollingerBands = calculateBollingerBands(prices);
    const { support, resistance } = calculateSupportResistance(prices);

    // Determine RSI signal
    let rsiSignal: 'Overbought' | 'Oversold' | 'Neutral' = 'Neutral';
    if (rsi > 70) rsiSignal = 'Overbought';
    else if (rsi < 30) rsiSignal = 'Oversold';

    // Determine MACD trend
    let macdTrend: 'Bullish' | 'Bearish' | 'Neutral' = 'Neutral';
    if (macdData.histogram > 0) macdTrend = 'Bullish';
    else if (macdData.histogram < 0) macdTrend = 'Bearish';

    return {
        rsi: parseFloat(rsi.toFixed(2)),
        rsiSignal,
        macd: {
            ...macdData,
            trend: macdTrend,
        },
        sma20: parseFloat(calculateSMA(prices, 20).toFixed(2)),
        sma50: parseFloat(calculateSMA(prices, 50).toFixed(2)),
        ema12: parseFloat(calculateEMA(prices, 12).toFixed(2)),
        ema26: parseFloat(calculateEMA(prices, 26).toFixed(2)),
        bollingerBands,
        volatility: calculateVolatility(prices),
        support,
        resistance,
    };
};

// Get confidence score based on indicators
export const getConfidenceScore = (indicators: TechnicalIndicators): {
    score: number;
    signal: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
    reasons: string[];
} => {
    let score = 50;
    const reasons: string[] = [];

    // RSI analysis
    if (indicators.rsi < 30) {
        score += 15;
        reasons.push('RSI indicates oversold conditions');
    } else if (indicators.rsi > 70) {
        score -= 15;
        reasons.push('RSI indicates overbought conditions');
    }

    // MACD analysis
    if (indicators.macd.histogram > 0 && indicators.macd.trend === 'Bullish') {
        score += 10;
        reasons.push('Positive MACD momentum');
    } else if (indicators.macd.histogram < 0 && indicators.macd.trend === 'Bearish') {
        score -= 10;
        reasons.push('Negative MACD momentum');
    }

    // Bollinger Band analysis
    if (indicators.bollingerBands.width < 5) {
        reasons.push('Low volatility - potential breakout ahead');
    } else if (indicators.bollingerBands.width > 15) {
        reasons.push('High volatility detected');
    }

    // Clamp score
    score = Math.max(0, Math.min(100, score));

    // Determine signal
    let signal: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
    if (score >= 75) signal = 'Strong Buy';
    else if (score >= 60) signal = 'Buy';
    else if (score >= 40) signal = 'Hold';
    else if (score >= 25) signal = 'Sell';
    else signal = 'Strong Sell';

    return { score, signal, reasons };
};
