import { OHLCDataPoint, CandlestickPattern, AnalysisResult, ChartDataPoint } from '../types';

// ============================================
// Chart Analysis Service - 11 Analysis Methods
// ============================================

// ========== OHLC Data Generation ==========
export const generateOHLCData = (basePrice: number, days: number = 60): OHLCDataPoint[] => {
    const data: OHLCDataPoint[] = [];
    let currentPrice = basePrice;
    const now = new Date();

    for (let i = days; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        const volatility = 0.025;
        const open = currentPrice;
        const change = (Math.random() - 0.48) * volatility * currentPrice;
        const close = open + change;
        const high = Math.max(open, close) * (1 + Math.random() * 0.015);
        const low = Math.min(open, close) * (1 - Math.random() * 0.015);
        const volume = Math.floor(50000 + Math.random() * 200000);

        data.push({
            date: date.toISOString().split('T')[0],
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(close.toFixed(2)),
            volume,
        });

        currentPrice = close;
    }

    return data;
};

// ========== 1. Japanese Candlestick Pattern Analysis ==========
export interface CandlestickAnalysis {
    patterns: CandlestickPattern[];
    overallSignal: 'bullish' | 'bearish' | 'neutral';
    interpretation: string;
}

const isBullish = (candle: OHLCDataPoint) => candle.close > candle.open;
const isBearish = (candle: OHLCDataPoint) => candle.close < candle.open;
const bodySize = (candle: OHLCDataPoint) => Math.abs(candle.close - candle.open);
const upperWick = (candle: OHLCDataPoint) => candle.high - Math.max(candle.open, candle.close);
const lowerWick = (candle: OHLCDataPoint) => Math.min(candle.open, candle.close) - candle.low;
const totalRange = (candle: OHLCDataPoint) => candle.high - candle.low;

export const analyzeCandlestickPatterns = (data: OHLCDataPoint[]): CandlestickAnalysis => {
    const patterns: CandlestickPattern[] = [];

    if (data.length < 3) {
        return { patterns: [], overallSignal: 'neutral', interpretation: 'Insufficient data for pattern analysis' };
    }

    // Analyze last 10 candles for patterns
    const lookback = Math.min(10, data.length);
    for (let i = data.length - lookback; i < data.length; i++) {
        const candle = data[i];
        const prev = i > 0 ? data[i - 1] : null;
        const prev2 = i > 1 ? data[i - 2] : null;
        const range = totalRange(candle);
        const body = bodySize(candle);

        // Doji Pattern
        if (range > 0 && body / range < 0.1) {
            patterns.push({
                name: 'Doji',
                type: 'neutral',
                description: 'Open and close are nearly equal, indicating indecision.',
                psychology: 'Neither buyers nor sellers are in control. Market is at equilibrium.',
                confidence: 75,
                startIndex: i,
                endIndex: i,
            });
        }

        // Hammer Pattern (Bullish)
        if (lowerWick(candle) > body * 2 && upperWick(candle) < body * 0.5 && prev && isBearish(prev)) {
            patterns.push({
                name: 'Hammer',
                type: 'bullish',
                description: 'Small body with long lower wick after downtrend.',
                psychology: 'Sellers pushed prices down but buyers recovered. Potential reversal.',
                confidence: 72,
                startIndex: i,
                endIndex: i,
            });
        }

        // Shooting Star (Bearish)
        if (upperWick(candle) > body * 2 && lowerWick(candle) < body * 0.5 && prev && isBullish(prev)) {
            patterns.push({
                name: 'Shooting Star',
                type: 'bearish',
                description: 'Small body with long upper wick after uptrend.',
                psychology: 'Buyers pushed prices up but sellers rejected. Potential reversal.',
                confidence: 70,
                startIndex: i,
                endIndex: i,
            });
        }

        // Bullish Engulfing
        if (prev && isBearish(prev) && isBullish(candle) &&
            candle.open < prev.close && candle.close > prev.open) {
            patterns.push({
                name: 'Bullish Engulfing',
                type: 'bullish',
                description: 'Green candle completely engulfs previous red candle.',
                psychology: 'Strong buyer takeover after selling pressure. High reversal probability.',
                confidence: 80,
                startIndex: i - 1,
                endIndex: i,
            });
        }

        // Bearish Engulfing
        if (prev && isBullish(prev) && isBearish(candle) &&
            candle.open > prev.close && candle.close < prev.open) {
            patterns.push({
                name: 'Bearish Engulfing',
                type: 'bearish',
                description: 'Red candle completely engulfs previous green candle.',
                psychology: 'Strong seller takeover after buying pressure. High reversal probability.',
                confidence: 80,
                startIndex: i - 1,
                endIndex: i,
            });
        }

        // Morning Star (Bullish)
        if (prev && prev2 && isBearish(prev2) && bodySize(prev) < bodySize(prev2) * 0.3 && isBullish(candle)) {
            patterns.push({
                name: 'Morning Star',
                type: 'bullish',
                description: 'Three-candle bullish reversal pattern.',
                psychology: 'Bearish momentum exhausted, bulls taking control. Strong reversal signal.',
                confidence: 85,
                startIndex: i - 2,
                endIndex: i,
            });
        }

        // Evening Star (Bearish)
        if (prev && prev2 && isBullish(prev2) && bodySize(prev) < bodySize(prev2) * 0.3 && isBearish(candle)) {
            patterns.push({
                name: 'Evening Star',
                type: 'bearish',
                description: 'Three-candle bearish reversal pattern.',
                psychology: 'Bullish momentum exhausted, bears taking control. Strong reversal signal.',
                confidence: 85,
                startIndex: i - 2,
                endIndex: i,
            });
        }
    }

    // Determine overall signal
    const bullishCount = patterns.filter(p => p.type === 'bullish').length;
    const bearishCount = patterns.filter(p => p.type === 'bearish').length;
    let overallSignal: 'bullish' | 'bearish' | 'neutral' = 'neutral';

    if (bullishCount > bearishCount + 1) overallSignal = 'bullish';
    else if (bearishCount > bullishCount + 1) overallSignal = 'bearish';

    const interpretation = patterns.length > 0
        ? `Detected ${patterns.length} candlestick patterns. ${overallSignal === 'bullish' ? 'Bullish bias suggests buying pressure.' : overallSignal === 'bearish' ? 'Bearish bias suggests selling pressure.' : 'Mixed signals - wait for confirmation.'}`
        : 'No significant candlestick patterns detected in recent data.';

    return { patterns, overallSignal, interpretation };
};

// ========== 2. Bar Chart (OHLC) Analysis ==========
export interface BarChartAnalysis {
    trend: 'uptrend' | 'downtrend' | 'sideways';
    volatility: 'high' | 'medium' | 'low';
    barPatterns: string[];
    interpretation: string;
}

export const analyzeBarChart = (data: OHLCDataPoint[]): BarChartAnalysis => {
    if (data.length < 10) {
        return { trend: 'sideways', volatility: 'low', barPatterns: [], interpretation: 'Insufficient data' };
    }

    const recent = data.slice(-20);
    const firstHalf = recent.slice(0, 10);
    const secondHalf = recent.slice(-10);

    const firstAvg = firstHalf.reduce((s, d) => s + d.close, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((s, d) => s + d.close, 0) / secondHalf.length;

    const trend: 'uptrend' | 'downtrend' | 'sideways' =
        secondAvg > firstAvg * 1.02 ? 'uptrend' :
            secondAvg < firstAvg * 0.98 ? 'downtrend' : 'sideways';

    const ranges = recent.map(d => (d.high - d.low) / d.low * 100);
    const avgRange = ranges.reduce((s, r) => s + r, 0) / ranges.length;
    const volatility: 'high' | 'medium' | 'low' = avgRange > 3 ? 'high' : avgRange > 1.5 ? 'medium' : 'low';

    const barPatterns: string[] = [];

    // Check for inside bar
    if (data.length >= 2) {
        const last = data[data.length - 1];
        const prev = data[data.length - 2];
        if (last.high < prev.high && last.low > prev.low) {
            barPatterns.push('Inside Bar (Consolidation)');
        }
    }

    // Check for outside bar
    if (data.length >= 2) {
        const last = data[data.length - 1];
        const prev = data[data.length - 2];
        if (last.high > prev.high && last.low < prev.low) {
            barPatterns.push('Outside Bar (Volatility Expansion)');
        }
    }

    return {
        trend,
        volatility,
        barPatterns,
        interpretation: `Market is in ${trend} with ${volatility} volatility. ${barPatterns.join('. ') || 'No special bar patterns detected.'}`,
    };
};

// ========== 3. Point and Figure Charts ==========
export interface PointFigureData {
    columns: { type: 'X' | 'O'; startPrice: number; endPrice: number; count: number }[];
    boxSize: number;
    reversalAmount: number;
    patterns: string[];
}

export const generatePointFigure = (data: OHLCDataPoint[], boxSize: number = 0.5): PointFigureData => {
    if (data.length < 5) {
        return { columns: [], boxSize, reversalAmount: 3, patterns: [] };
    }

    const columns: { type: 'X' | 'O'; startPrice: number; endPrice: number; count: number }[] = [];
    const reversalAmount = 3;

    let currentType: 'X' | 'O' = data[1].close > data[0].close ? 'X' : 'O';
    let currentStart = Math.floor(data[0].close / boxSize) * boxSize;
    let currentEnd = currentStart;

    for (let i = 1; i < data.length; i++) {
        const price = data[i].close;
        const priceLevel = Math.floor(price / boxSize) * boxSize;

        if (currentType === 'X') {
            if (priceLevel >= currentEnd + boxSize) {
                currentEnd = priceLevel;
            } else if (priceLevel <= currentEnd - boxSize * reversalAmount) {
                columns.push({ type: 'X', startPrice: currentStart, endPrice: currentEnd, count: Math.floor((currentEnd - currentStart) / boxSize) });
                currentType = 'O';
                currentStart = currentEnd - boxSize;
                currentEnd = priceLevel;
            }
        } else {
            if (priceLevel <= currentEnd - boxSize) {
                currentEnd = priceLevel;
            } else if (priceLevel >= currentEnd + boxSize * reversalAmount) {
                columns.push({ type: 'O', startPrice: currentStart, endPrice: currentEnd, count: Math.floor((currentStart - currentEnd) / boxSize) });
                currentType = 'X';
                currentStart = currentEnd + boxSize;
                currentEnd = priceLevel;
            }
        }
    }

    // Add final column
    const count = currentType === 'X'
        ? Math.floor((currentEnd - currentStart) / boxSize)
        : Math.floor((currentStart - currentEnd) / boxSize);
    columns.push({ type: currentType, startPrice: currentStart, endPrice: currentEnd, count });

    // Detect patterns
    const patterns: string[] = [];
    if (columns.length >= 3) {
        const last3 = columns.slice(-3);
        if (last3[2].type === 'X' && last3[2].endPrice > last3[0].endPrice) {
            patterns.push('Double Top Breakout (Bullish)');
        }
        if (last3[2].type === 'O' && last3[2].endPrice < last3[0].endPrice) {
            patterns.push('Double Bottom Breakdown (Bearish)');
        }
    }

    return { columns, boxSize, reversalAmount, patterns };
};

// ========== 4. Heikin-Ashi Charts ==========
export interface HeikinAshiData {
    candles: OHLCDataPoint[];
    trend: 'strong-bullish' | 'bullish' | 'neutral' | 'bearish' | 'strong-bearish';
    trendStrength: number;
}

export const calculateHeikinAshi = (data: OHLCDataPoint[]): HeikinAshiData => {
    if (data.length < 2) {
        return { candles: [], trend: 'neutral', trendStrength: 0 };
    }

    const haCandles: OHLCDataPoint[] = [];

    // First HA candle
    const first = data[0];
    haCandles.push({
        date: first.date,
        open: (first.open + first.close) / 2,
        close: (first.open + first.high + first.low + first.close) / 4,
        high: first.high,
        low: first.low,
        volume: first.volume,
    });

    // Subsequent HA candles
    for (let i = 1; i < data.length; i++) {
        const current = data[i];
        const prevHA = haCandles[i - 1];

        const haClose = (current.open + current.high + current.low + current.close) / 4;
        const haOpen = (prevHA.open + prevHA.close) / 2;

        haCandles.push({
            date: current.date,
            open: parseFloat(haOpen.toFixed(2)),
            close: parseFloat(haClose.toFixed(2)),
            high: Math.max(current.high, haOpen, haClose),
            low: Math.min(current.low, haOpen, haClose),
            volume: current.volume,
        });
    }

    // Analyze trend from last 5 candles
    const recent = haCandles.slice(-5);
    let bullishCount = 0;
    let noLowerWickCount = 0;

    recent.forEach(candle => {
        if (candle.close > candle.open) {
            bullishCount++;
            if (candle.low === Math.min(candle.open, candle.close)) noLowerWickCount++;
        }
    });

    const trendStrength = (noLowerWickCount / 5) * 100;
    let trend: 'strong-bullish' | 'bullish' | 'neutral' | 'bearish' | 'strong-bearish';

    if (bullishCount >= 4 && noLowerWickCount >= 3) trend = 'strong-bullish';
    else if (bullishCount >= 3) trend = 'bullish';
    else if (bullishCount <= 1 && noLowerWickCount === 0) trend = 'strong-bearish';
    else if (bullishCount <= 2) trend = 'bearish';
    else trend = 'neutral';

    return { candles: haCandles, trend, trendStrength };
};

// ========== 5. Renko Charts ==========
export interface RenkoData {
    bricks: { type: 'up' | 'down'; price: number; date: string }[];
    trend: 'bullish' | 'bearish' | 'neutral';
    brickSize: number;
}

export const generateRenko = (data: OHLCDataPoint[], brickSize?: number): RenkoData => {
    if (data.length < 5) {
        return { bricks: [], trend: 'neutral', brickSize: 1 };
    }

    // Auto-calculate brick size based on ATR
    const ranges = data.slice(-20).map(d => d.high - d.low);
    const atr = ranges.reduce((s, r) => s + r, 0) / ranges.length;
    const calculatedBrickSize = brickSize || parseFloat((atr * 0.5).toFixed(2)) || 1;

    const bricks: { type: 'up' | 'down'; price: number; date: string }[] = [];
    let lastPrice = Math.floor(data[0].close / calculatedBrickSize) * calculatedBrickSize;

    for (const candle of data) {
        const price = candle.close;

        while (price >= lastPrice + calculatedBrickSize) {
            lastPrice += calculatedBrickSize;
            bricks.push({ type: 'up', price: lastPrice, date: candle.date });
        }

        while (price <= lastPrice - calculatedBrickSize) {
            lastPrice -= calculatedBrickSize;
            bricks.push({ type: 'down', price: lastPrice, date: candle.date });
        }
    }

    const recentBricks = bricks.slice(-5);
    const upCount = recentBricks.filter(b => b.type === 'up').length;
    const trend: 'bullish' | 'bearish' | 'neutral' =
        upCount >= 4 ? 'bullish' : upCount <= 1 ? 'bearish' : 'neutral';

    return { bricks, trend, brickSize: calculatedBrickSize };
};

// ========== 6. Kagi Charts ==========
export interface KagiData {
    lines: { type: 'yang' | 'yin'; startPrice: number; endPrice: number; date: string }[];
    trend: 'bullish' | 'bearish' | 'neutral';
    reversalAmount: number;
}

export const generateKagi = (data: OHLCDataPoint[], reversalPercent: number = 4): KagiData => {
    if (data.length < 5) {
        return { lines: [], trend: 'neutral', reversalAmount: reversalPercent };
    }

    const lines: { type: 'yang' | 'yin'; startPrice: number; endPrice: number; date: string }[] = [];
    let direction: 'up' | 'down' = data[1].close > data[0].close ? 'up' : 'down';
    let lastPrice = data[0].close;
    let lastHigh = data[0].high;
    let lastLow = data[0].low;
    let lineType: 'yang' | 'yin' = direction === 'up' ? 'yang' : 'yin';

    for (let i = 1; i < data.length; i++) {
        const price = data[i].close;
        const reversalAmount = lastPrice * (reversalPercent / 100);

        if (direction === 'up') {
            if (price > lastPrice) {
                lastPrice = price;
                if (price > lastHigh) {
                    lineType = 'yang'; // Thick line (demand)
                    lastHigh = price;
                }
            } else if (price <= lastPrice - reversalAmount) {
                lines.push({ type: lineType, startPrice: lastPrice, endPrice: price, date: data[i].date });
                direction = 'down';
                lastPrice = price;
                if (price < lastLow) {
                    lineType = 'yin'; // Thin line (supply)
                    lastLow = price;
                }
            }
        } else {
            if (price < lastPrice) {
                lastPrice = price;
                if (price < lastLow) {
                    lineType = 'yin';
                    lastLow = price;
                }
            } else if (price >= lastPrice + reversalAmount) {
                lines.push({ type: lineType, startPrice: lastPrice, endPrice: price, date: data[i].date });
                direction = 'up';
                lastPrice = price;
                if (price > lastHigh) {
                    lineType = 'yang';
                    lastHigh = price;
                }
            }
        }
    }

    const recentLines = lines.slice(-3);
    const yangCount = recentLines.filter(l => l.type === 'yang').length;
    const trend: 'bullish' | 'bearish' | 'neutral' =
        yangCount >= 2 ? 'bullish' : yangCount === 0 ? 'bearish' : 'neutral';

    return { lines, trend, reversalAmount: reversalPercent };
};

// ========== 7. Classic Chart Patterns ==========
export interface ClassicPatternResult {
    patterns: {
        name: string;
        type: 'continuation' | 'reversal';
        direction: 'bullish' | 'bearish';
        confidence: number;
        description: string;
    }[];
}

export const detectClassicPatterns = (data: OHLCDataPoint[]): ClassicPatternResult => {
    const patterns: ClassicPatternResult['patterns'] = [];

    if (data.length < 20) {
        return { patterns };
    }

    const recent = data.slice(-30);
    const highs = recent.map(d => d.high);
    const lows = recent.map(d => d.low);

    // Find peaks and troughs
    const peaks: number[] = [];
    const troughs: number[] = [];

    for (let i = 2; i < recent.length - 2; i++) {
        if (highs[i] > highs[i - 1] && highs[i] > highs[i - 2] && highs[i] > highs[i + 1] && highs[i] > highs[i + 2]) {
            peaks.push(i);
        }
        if (lows[i] < lows[i - 1] && lows[i] < lows[i - 2] && lows[i] < lows[i + 1] && lows[i] < lows[i + 2]) {
            troughs.push(i);
        }
    }

    // Head and Shoulders
    if (peaks.length >= 3) {
        const [left, head, right] = peaks.slice(-3);
        if (highs[head] > highs[left] && highs[head] > highs[right] &&
            Math.abs(highs[left] - highs[right]) / highs[left] < 0.05) {
            patterns.push({
                name: 'Head and Shoulders',
                type: 'reversal',
                direction: 'bearish',
                confidence: 75,
                description: 'Classic reversal pattern with center peak higher than shoulders. Suggests trend reversal from bullish to bearish.',
            });
        }
    }

    // Inverse Head and Shoulders
    if (troughs.length >= 3) {
        const [left, head, right] = troughs.slice(-3);
        if (lows[head] < lows[left] && lows[head] < lows[right] &&
            Math.abs(lows[left] - lows[right]) / lows[left] < 0.05) {
            patterns.push({
                name: 'Inverse Head and Shoulders',
                type: 'reversal',
                direction: 'bullish',
                confidence: 75,
                description: 'Bullish reversal pattern with center trough lower than shoulders. Suggests trend reversal from bearish to bullish.',
            });
        }
    }

    // Triangle Detection
    if (peaks.length >= 2 && troughs.length >= 2) {
        const highSlope = (highs[peaks[peaks.length - 1]] - highs[peaks[peaks.length - 2]]) / (peaks[peaks.length - 1] - peaks[peaks.length - 2]);
        const lowSlope = (lows[troughs[troughs.length - 1]] - lows[troughs[troughs.length - 2]]) / (troughs[troughs.length - 1] - troughs[troughs.length - 2]);

        if (highSlope < -0.1 && lowSlope > 0.1) {
            patterns.push({
                name: 'Symmetrical Triangle',
                type: 'continuation',
                direction: 'bullish',
                confidence: 65,
                description: 'Converging trendlines suggest consolidation before breakout. Direction depends on breakout.',
            });
        } else if (Math.abs(highSlope) < 0.05 && lowSlope > 0.1) {
            patterns.push({
                name: 'Ascending Triangle',
                type: 'continuation',
                direction: 'bullish',
                confidence: 70,
                description: 'Flat resistance with rising support suggests bullish breakout.',
            });
        } else if (highSlope < -0.1 && Math.abs(lowSlope) < 0.05) {
            patterns.push({
                name: 'Descending Triangle',
                type: 'continuation',
                direction: 'bearish',
                confidence: 70,
                description: 'Falling resistance with flat support suggests bearish breakdown.',
            });
        }
    }

    // Double Top / Double Bottom
    if (peaks.length >= 2) {
        const [first, second] = peaks.slice(-2);
        if (Math.abs(highs[first] - highs[second]) / highs[first] < 0.02) {
            patterns.push({
                name: 'Double Top',
                type: 'reversal',
                direction: 'bearish',
                confidence: 72,
                description: 'Two peaks at similar levels indicate resistance and potential bearish reversal.',
            });
        }
    }

    if (troughs.length >= 2) {
        const [first, second] = troughs.slice(-2);
        if (Math.abs(lows[first] - lows[second]) / lows[first] < 0.02) {
            patterns.push({
                name: 'Double Bottom',
                type: 'reversal',
                direction: 'bullish',
                confidence: 72,
                description: 'Two troughs at similar levels indicate support and potential bullish reversal.',
            });
        }
    }

    return { patterns };
};

// ========== 8. Moving Average Analysis ==========
export interface MovingAverageAnalysis {
    sma20: number;
    sma50: number;
    sma200: number;
    ema12: number;
    ema26: number;
    crossovers: { type: 'golden-cross' | 'death-cross'; date: string }[];
    trend: 'bullish' | 'bearish' | 'neutral';
    interpretation: string;
}

const calculateSMA = (data: number[], period: number): number => {
    if (data.length < period) return data[data.length - 1] || 0;
    return data.slice(-period).reduce((s, v) => s + v, 0) / period;
};

const calculateEMA = (data: number[], period: number): number => {
    if (data.length < period) return data[data.length - 1] || 0;
    const multiplier = 2 / (period + 1);
    let ema = data.slice(0, period).reduce((s, v) => s + v, 0) / period;
    for (let i = period; i < data.length; i++) {
        ema = (data[i] - ema) * multiplier + ema;
    }
    return ema;
};

export const analyzeMovingAverages = (data: OHLCDataPoint[]): MovingAverageAnalysis => {
    const closes = data.map(d => d.close);

    const sma20 = parseFloat(calculateSMA(closes, 20).toFixed(2));
    const sma50 = parseFloat(calculateSMA(closes, 50).toFixed(2));
    const sma200 = parseFloat(calculateSMA(closes, Math.min(200, closes.length)).toFixed(2));
    const ema12 = parseFloat(calculateEMA(closes, 12).toFixed(2));
    const ema26 = parseFloat(calculateEMA(closes, 26).toFixed(2));

    const crossovers: { type: 'golden-cross' | 'death-cross'; date: string }[] = [];

    // Check for crossovers in last 10 days
    if (data.length >= 52) {
        for (let i = data.length - 10; i < data.length; i++) {
            const prevSMA50 = calculateSMA(closes.slice(0, i), 50);
            const currSMA50 = calculateSMA(closes.slice(0, i + 1), 50);
            const prevSMA200 = calculateSMA(closes.slice(0, i), Math.min(200, i));
            const currSMA200 = calculateSMA(closes.slice(0, i + 1), Math.min(200, i + 1));

            if (prevSMA50 < prevSMA200 && currSMA50 > currSMA200) {
                crossovers.push({ type: 'golden-cross', date: data[i].date });
            } else if (prevSMA50 > prevSMA200 && currSMA50 < currSMA200) {
                crossovers.push({ type: 'death-cross', date: data[i].date });
            }
        }
    }

    const currentPrice = closes[closes.length - 1];
    let trend: 'bullish' | 'bearish' | 'neutral' = 'neutral';

    if (currentPrice > sma20 && sma20 > sma50) trend = 'bullish';
    else if (currentPrice < sma20 && sma20 < sma50) trend = 'bearish';

    const interpretation = crossovers.length > 0
        ? `${crossovers[crossovers.length - 1].type === 'golden-cross' ? 'Golden Cross detected - bullish signal!' : 'Death Cross detected - bearish signal!'}`
        : `Price is ${currentPrice > sma50 ? 'above' : 'below'} 50 SMA. ${trend === 'bullish' ? 'Uptrend intact.' : trend === 'bearish' ? 'Downtrend in progress.' : 'Sideways movement.'}`;

    return { sma20, sma50, sma200, ema12, ema26, crossovers, trend, interpretation };
};

// ========== 9. Oscillator Analysis (RSI, MACD, Stochastic) ==========
export interface OscillatorAnalysis {
    rsi: { value: number; signal: 'overbought' | 'oversold' | 'neutral'; divergence: boolean };
    macd: { value: number; signal: number; histogram: number; trend: 'bullish' | 'bearish' | 'neutral' };
    stochastic: { k: number; d: number; signal: 'overbought' | 'oversold' | 'neutral' };
    overallSignal: string;
}

export const analyzeOscillators = (data: OHLCDataPoint[]): OscillatorAnalysis => {
    const closes = data.map(d => d.close);
    const highs = data.map(d => d.high);
    const lows = data.map(d => d.low);

    // RSI Calculation
    let gains = 0, losses = 0;
    for (let i = 1; i <= Math.min(14, closes.length - 1); i++) {
        const change = closes[closes.length - i] - closes[closes.length - i - 1];
        if (change > 0) gains += change;
        else losses -= change;
    }
    const avgGain = gains / 14;
    const avgLoss = losses / 14;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsiValue = parseFloat((100 - (100 / (1 + rs))).toFixed(2));
    const rsiSignal: 'overbought' | 'oversold' | 'neutral' =
        rsiValue > 70 ? 'overbought' : rsiValue < 30 ? 'oversold' : 'neutral';

    // Check for RSI divergence
    const priceUp = closes[closes.length - 1] > closes[closes.length - 10];
    const rsiUp = rsiValue > 50;
    const divergence = priceUp !== rsiUp;

    // MACD Calculation
    const ema12 = calculateEMA(closes, 12);
    const ema26 = calculateEMA(closes, 26);
    const macdValue = parseFloat((ema12 - ema26).toFixed(2));
    const macdSignal = parseFloat((macdValue * 0.9).toFixed(2)); // Simplified
    const histogram = parseFloat((macdValue - macdSignal).toFixed(2));
    const macdTrend: 'bullish' | 'bearish' | 'neutral' =
        histogram > 0.5 ? 'bullish' : histogram < -0.5 ? 'bearish' : 'neutral';

    // Stochastic Calculation
    const period = Math.min(14, closes.length);
    const high14 = Math.max(...highs.slice(-period));
    const low14 = Math.min(...lows.slice(-period));
    const k = parseFloat((((closes[closes.length - 1] - low14) / (high14 - low14)) * 100).toFixed(2));
    const d = parseFloat((k * 0.8 + 20).toFixed(2)); // Simplified
    const stochSignal: 'overbought' | 'oversold' | 'neutral' =
        k > 80 ? 'overbought' : k < 20 ? 'oversold' : 'neutral';

    // Overall signal
    let signals = 0;
    if (rsiSignal === 'oversold') signals++;
    if (rsiSignal === 'overbought') signals--;
    if (macdTrend === 'bullish') signals++;
    if (macdTrend === 'bearish') signals--;
    if (stochSignal === 'oversold') signals++;
    if (stochSignal === 'overbought') signals--;

    const overallSignal = signals >= 2 ? 'Strong Buy Signal' : signals <= -2 ? 'Strong Sell Signal' :
        signals === 1 ? 'Weak Buy Signal' : signals === -1 ? 'Weak Sell Signal' : 'Neutral - Wait for confirmation';

    return {
        rsi: { value: rsiValue, signal: rsiSignal, divergence },
        macd: { value: macdValue, signal: macdSignal, histogram, trend: macdTrend },
        stochastic: { k, d, signal: stochSignal },
        overallSignal,
    };
};

// ========== 10. Fibonacci & Pivot Points ==========
export interface FibonacciAnalysis {
    levels: { level: string; price: number }[];
    pivotPoints: { pivot: number; s1: number; s2: number; s3: number; r1: number; r2: number; r3: number };
    currentPosition: string;
}

export const analyzeFibonacci = (data: OHLCDataPoint[]): FibonacciAnalysis => {
    const recent = data.slice(-30);
    const high = Math.max(...recent.map(d => d.high));
    const low = Math.min(...recent.map(d => d.low));
    const range = high - low;

    const levels = [
        { level: '0% (Low)', price: parseFloat(low.toFixed(2)) },
        { level: '23.6%', price: parseFloat((low + range * 0.236).toFixed(2)) },
        { level: '38.2%', price: parseFloat((low + range * 0.382).toFixed(2)) },
        { level: '50%', price: parseFloat((low + range * 0.5).toFixed(2)) },
        { level: '61.8%', price: parseFloat((low + range * 0.618).toFixed(2)) },
        { level: '78.6%', price: parseFloat((low + range * 0.786).toFixed(2)) },
        { level: '100% (High)', price: parseFloat(high.toFixed(2)) },
    ];

    // Pivot Points (Standard)
    const lastDay = data[data.length - 1];
    const pivot = (lastDay.high + lastDay.low + lastDay.close) / 3;
    const s1 = 2 * pivot - lastDay.high;
    const s2 = pivot - (lastDay.high - lastDay.low);
    const s3 = s1 - (lastDay.high - lastDay.low);
    const r1 = 2 * pivot - lastDay.low;
    const r2 = pivot + (lastDay.high - lastDay.low);
    const r3 = r1 + (lastDay.high - lastDay.low);

    const currentPrice = lastDay.close;
    let currentPosition = '';

    for (let i = 0; i < levels.length - 1; i++) {
        if (currentPrice >= levels[i].price && currentPrice < levels[i + 1].price) {
            currentPosition = `Between ${levels[i].level} and ${levels[i + 1].level}`;
            break;
        }
    }

    return {
        levels,
        pivotPoints: {
            pivot: parseFloat(pivot.toFixed(2)),
            s1: parseFloat(s1.toFixed(2)),
            s2: parseFloat(s2.toFixed(2)),
            s3: parseFloat(s3.toFixed(2)),
            r1: parseFloat(r1.toFixed(2)),
            r2: parseFloat(r2.toFixed(2)),
            r3: parseFloat(r3.toFixed(2)),
        },
        currentPosition,
    };
};

// ========== 11. Volume Analysis ==========
export interface VolumeAnalysis {
    obv: number;
    obvTrend: 'accumulation' | 'distribution' | 'neutral';
    vpt: number;
    avgVolume: number;
    volumeSpike: boolean;
    confirmation: 'confirmed' | 'divergence' | 'neutral';
    interpretation: string;
}

export const analyzeVolume = (data: OHLCDataPoint[]): VolumeAnalysis => {
    if (data.length < 10) {
        return {
            obv: 0, obvTrend: 'neutral', vpt: 0, avgVolume: 0,
            volumeSpike: false, confirmation: 'neutral', interpretation: 'Insufficient data',
        };
    }

    // OBV (On-Balance Volume)
    let obv = 0;
    for (let i = 1; i < data.length; i++) {
        if (data[i].close > data[i - 1].close) {
            obv += data[i].volume;
        } else if (data[i].close < data[i - 1].close) {
            obv -= data[i].volume;
        }
    }

    // OBV Trend
    const recentOBV = data.slice(-10).reduce((sum, d, i, arr) => {
        if (i === 0) return 0;
        return sum + (d.close > arr[i - 1].close ? d.volume : -d.volume);
    }, 0);
    const obvTrend: 'accumulation' | 'distribution' | 'neutral' =
        recentOBV > 0 ? 'accumulation' : recentOBV < 0 ? 'distribution' : 'neutral';

    // VPT (Volume Price Trend)
    let vpt = 0;
    for (let i = 1; i < data.length; i++) {
        const priceChange = (data[i].close - data[i - 1].close) / data[i - 1].close;
        vpt += priceChange * data[i].volume;
    }

    // Average Volume
    const avgVolume = Math.floor(data.slice(-20).reduce((s, d) => s + d.volume, 0) / 20);
    const lastVolume = data[data.length - 1].volume;
    const volumeSpike = lastVolume > avgVolume * 1.5;

    // Price-Volume Confirmation
    const priceUp = data[data.length - 1].close > data[data.length - 5].close;
    const volumeUp = lastVolume > avgVolume;
    const confirmation: 'confirmed' | 'divergence' | 'neutral' =
        (priceUp && volumeUp) || (!priceUp && !volumeUp) ? 'confirmed' :
            (priceUp !== volumeUp) ? 'divergence' : 'neutral';

    const interpretation = volumeSpike
        ? `Volume spike detected! ${confirmation === 'confirmed' ? 'Price move is confirmed by volume.' : 'Warning: Price-volume divergence may indicate weak move.'}`
        : `Volume is ${lastVolume > avgVolume ? 'above' : 'below'} average. ${obvTrend === 'accumulation' ? 'OBV shows accumulation (bullish).' : obvTrend === 'distribution' ? 'OBV shows distribution (bearish).' : 'Volume neutral.'}`;

    return {
        obv,
        obvTrend,
        vpt: Math.floor(vpt),
        avgVolume,
        volumeSpike,
        confirmation,
        interpretation,
    };
};

// ========== Comprehensive Analysis ==========
export const runFullAnalysis = (data: OHLCDataPoint[], method: string): AnalysisResult => {
    let signal: AnalysisResult['signal'] = 'Hold';
    let confidence = 50;
    let patterns: CandlestickPattern[] = [];
    let interpretation = '';
    let psychology = '';
    let useCase = '';
    let supportLevels: number[] = [];
    let resistanceLevels: number[] = [];

    switch (method) {
        case 'candlestick': {
            const result = analyzeCandlestickPatterns(data);
            patterns = result.patterns;
            signal = result.overallSignal === 'bullish' ? 'Buy' : result.overallSignal === 'bearish' ? 'Sell' : 'Hold';
            confidence = patterns.length > 0 ? Math.max(...patterns.map(p => p.confidence)) : 50;
            interpretation = result.interpretation;
            psychology = 'Candlestick patterns reflect the emotional battle between buyers and sellers within each trading period.';
            useCase = 'Best for short-term trading, swing trading, and identifying reversals.';
            break;
        }
        case 'bar': {
            const result = analyzeBarChart(data);
            signal = result.trend === 'uptrend' ? 'Buy' : result.trend === 'downtrend' ? 'Sell' : 'Hold';
            confidence = result.volatility === 'high' ? 60 : 70;
            interpretation = result.interpretation;
            psychology = 'Bar size shows trading range volatility; closing position shows buyer/seller dominance.';
            useCase = 'Alternative to candlesticks for clarity in historical data analysis.';
            break;
        }
        case 'point-figure': {
            const result = generatePointFigure(data);
            signal = result.patterns.some(p => p.includes('Bullish')) ? 'Buy' :
                result.patterns.some(p => p.includes('Bearish')) ? 'Sell' : 'Hold';
            confidence = result.patterns.length > 0 ? 72 : 50;
            interpretation = `Generated ${result.columns.length} columns. ${result.patterns.join('. ') || 'Focus on X/O column reversals for signals.'}`;
            psychology = 'Filters out time noise to show pure supply and demand dynamics.';
            useCase = 'Identifying support/resistance levels, long-term trend spotting.';
            break;
        }
        case 'heikin-ashi': {
            const result = calculateHeikinAshi(data);
            signal = result.trend.includes('bullish') ? (result.trend === 'strong-bullish' ? 'Strong Buy' : 'Buy') :
                result.trend.includes('bearish') ? (result.trend === 'strong-bearish' ? 'Strong Sell' : 'Sell') : 'Hold';
            confidence = result.trendStrength;
            interpretation = `Trend: ${result.trend}. Trend strength: ${result.trendStrength.toFixed(0)}%. Smooth candles reduce noise for clearer trend identification.`;
            psychology = 'Shows momentum clearly by averaging prices, reduces emotional reaction to short-term reversals.';
            useCase = 'Identifying trend direction, trend strength, and optimal exit/entry points.';
            break;
        }
        case 'renko': {
            const result = generateRenko(data);
            signal = result.trend === 'bullish' ? 'Buy' : result.trend === 'bearish' ? 'Sell' : 'Hold';
            confidence = result.bricks.length > 10 ? 70 : 55;
            interpretation = `${result.bricks.length} bricks generated with size ৳${result.brickSize}. Trend: ${result.trend}. Focus on brick color changes for reversal signals.`;
            psychology = 'Simplifies market direction by removing time element, showing only significant price moves.';
            useCase = 'Trend-following strategies, breakout detection with minimal noise.';
            break;
        }
        case 'kagi': {
            const result = generateKagi(data);
            signal = result.trend === 'bullish' ? 'Buy' : result.trend === 'bearish' ? 'Sell' : 'Hold';
            confidence = result.lines.length > 5 ? 68 : 50;
            interpretation = `${result.lines.length} Kagi lines generated. Yang (thick) = demand, Yin (thin) = supply. Current trend: ${result.trend}.`;
            psychology = 'Line thickness changes highlight shifts in supply/demand dominance and trend reversals.';
            useCase = 'Market strength analysis, identifying trend reversals and support/resistance.';
            break;
        }
        case 'patterns': {
            const result = detectClassicPatterns(data);
            const bullishPatterns = result.patterns.filter(p => p.direction === 'bullish');
            const bearishPatterns = result.patterns.filter(p => p.direction === 'bearish');
            signal = bullishPatterns.length > bearishPatterns.length ? 'Buy' :
                bearishPatterns.length > bullishPatterns.length ? 'Sell' : 'Hold';
            confidence = result.patterns.length > 0 ? Math.max(...result.patterns.map(p => p.confidence)) : 50;
            patterns = result.patterns.map(p => ({
                name: p.name, type: p.direction, description: p.description,
                psychology: p.type === 'reversal' ? 'Pattern indicates market psychology shift.' : 'Pattern suggests trend continuation.',
                confidence: p.confidence, startIndex: 0, endIndex: 0,
            }));
            interpretation = result.patterns.length > 0
                ? `Detected: ${result.patterns.map(p => p.name).join(', ')}`
                : 'No classic chart patterns detected in current data.';
            psychology = 'Chart patterns reflect market phases: accumulation, distribution, and breakout psychology.';
            useCase = 'Mid-to-long-term technical analysis, confirming market sentiment.';
            break;
        }
        case 'moving-average': {
            const result = analyzeMovingAverages(data);
            signal = result.crossovers.some(c => c.type === 'golden-cross') ? 'Strong Buy' :
                result.crossovers.some(c => c.type === 'death-cross') ? 'Strong Sell' :
                    result.trend === 'bullish' ? 'Buy' : result.trend === 'bearish' ? 'Sell' : 'Hold';
            confidence = result.crossovers.length > 0 ? 82 : 65;
            interpretation = result.interpretation;
            psychology = 'Moving averages smooth price data to reveal trend momentum and potential exhaustion points.';
            useCase = 'Trend confirmation, entry/exit timing, swing trading strategies.';
            supportLevels = [result.sma50, result.sma200];
            resistanceLevels = result.trend === 'bearish' ? [result.sma20] : [];
            break;
        }
        case 'oscillator': {
            const result = analyzeOscillators(data);
            signal = result.overallSignal.includes('Strong Buy') ? 'Strong Buy' :
                result.overallSignal.includes('Strong Sell') ? 'Strong Sell' :
                    result.overallSignal.includes('Buy') ? 'Buy' :
                        result.overallSignal.includes('Sell') ? 'Sell' : 'Hold';
            confidence = result.rsi.divergence ? 78 : 68;
            interpretation = `RSI: ${result.rsi.value} (${result.rsi.signal}), MACD: ${result.macd.trend}, Stochastic: ${result.stochastic.k.toFixed(0)} (${result.stochastic.signal}). ${result.rsi.divergence ? 'DIVERGENCE DETECTED!' : ''}`;
            psychology = 'Oscillators show extremes in buying/selling pressure and potential reversal zones.';
            useCase = 'Short-term reversal spotting, trade timing, divergence analysis.';
            break;
        }
        case 'fibonacci': {
            const result = analyzeFibonacci(data);
            const currentPrice = data[data.length - 1].close;
            signal = currentPrice < result.levels[2].price ? 'Buy' : currentPrice > result.levels[4].price ? 'Sell' : 'Hold';
            confidence = 70;
            interpretation = `Price is ${result.currentPosition}. Key levels: 38.2% (৳${result.levels[2].price}), 61.8% (৳${result.levels[4].price}). Pivot: ৳${result.pivotPoints.pivot}`;
            psychology = 'Traders collectively react to Fibonacci levels, creating self-fulfilling support/resistance zones.';
            useCase = 'Predicting pullback levels, setting target prices and stop-losses.';
            supportLevels = [result.pivotPoints.s1, result.pivotPoints.s2, result.levels[2].price];
            resistanceLevels = [result.pivotPoints.r1, result.pivotPoints.r2, result.levels[4].price];
            break;
        }
        case 'volume': {
            const result = analyzeVolume(data);
            signal = result.obvTrend === 'accumulation' && result.confirmation === 'confirmed' ? 'Buy' :
                result.obvTrend === 'distribution' && result.confirmation === 'confirmed' ? 'Sell' : 'Hold';
            confidence = result.volumeSpike ? 75 : result.confirmation === 'confirmed' ? 70 : 55;
            interpretation = result.interpretation;
            psychology = 'Volume reflects participation and conviction behind price movements.';
            useCase = 'Confirming trend strength, spotting divergences, validating breakouts.';
            break;
        }
        default:
            interpretation = 'Unknown analysis method selected.';
    }

    return {
        method,
        signal,
        confidence,
        patterns,
        interpretation,
        psychology,
        useCase,
        supportLevels,
        resistanceLevels,
        timestamp: new Date(),
    };
};
