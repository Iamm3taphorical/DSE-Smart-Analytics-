import * as React from 'react';
import { Activity, TrendingUp, TrendingDown, Minus, Info, AlertTriangle } from 'lucide-react';
import { TechnicalIndicators as TechnicalIndicatorsType, getConfidenceScore } from '../services/analyticsService';

interface TechnicalIndicatorsProps {
    indicators: TechnicalIndicatorsType;
    ticker: string;
}

const TechnicalIndicators: React.FC<TechnicalIndicatorsProps> = ({ indicators, ticker }) => {
    const confidence = getConfidenceScore(indicators);

    const getRSIColor = () => {
        if (indicators.rsi > 70) return 'text-bearish';
        if (indicators.rsi < 30) return 'text-bullish';
        return 'text-neutral';
    };

    const getMACDColor = () => {
        if (indicators.macd.trend === 'Bullish') return 'text-bullish';
        if (indicators.macd.trend === 'Bearish') return 'text-bearish';
        return 'text-neutral';
    };

    const getSignalColor = () => {
        switch (confidence.signal) {
            case 'Strong Buy': return 'bg-bullish text-white';
            case 'Buy': return 'bg-bullish/20 text-bullish';
            case 'Hold': return 'bg-neutral/20 text-neutral';
            case 'Sell': return 'bg-bearish/20 text-bearish';
            case 'Strong Sell': return 'bg-bearish text-white';
        }
    };

    return (
        <div className="card space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Technical Analysis
                </h3>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${getSignalColor()}`}>
                    {confidence.signal}
                </div>
            </div>

            {/* Confidence Score */}
            <div className="p-4 bg-secondary/50 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">AI Confidence Score</span>
                    <span className="text-2xl font-bold font-mono">{confidence.score}%</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${confidence.score >= 60 ? 'bg-bullish' : confidence.score >= 40 ? 'bg-neutral' : 'bg-bearish'
                            }`}
                        style={{ width: `${confidence.score}%` }}
                    />
                </div>
                {confidence.reasons.length > 0 && (
                    <div className="mt-3 space-y-1">
                        {confidence.reasons.map((reason, i) => (
                            <p key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                                <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                {reason}
                            </p>
                        ))}
                    </div>
                )}
            </div>

            {/* Indicators Grid */}
            <div className="grid grid-cols-2 gap-4">
                {/* RSI */}
                <div className="p-4 bg-secondary/30 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">RSI (14)</span>
                        <span className={`text-xs font-medium ${getRSIColor()}`}>{indicators.rsiSignal}</span>
                    </div>
                    <p className={`text-xl font-bold font-mono ${getRSIColor()}`}>
                        {indicators.rsi.toFixed(1)}
                    </p>
                    <div className="w-full h-1 bg-secondary rounded-full mt-2 overflow-hidden">
                        <div
                            className={`h-full rounded-full ${getRSIColor().replace('text-', 'bg-')}`}
                            style={{ width: `${indicators.rsi}%` }}
                        />
                    </div>
                </div>

                {/* MACD */}
                <div className="p-4 bg-secondary/30 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">MACD</span>
                        <span className={`text-xs font-medium flex items-center gap-1 ${getMACDColor()}`}>
                            {indicators.macd.trend === 'Bullish' ? <TrendingUp className="w-3 h-3" /> :
                                indicators.macd.trend === 'Bearish' ? <TrendingDown className="w-3 h-3" /> :
                                    <Minus className="w-3 h-3" />}
                            {indicators.macd.trend}
                        </span>
                    </div>
                    <p className={`text-xl font-bold font-mono ${getMACDColor()}`}>
                        {indicators.macd.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Signal: {indicators.macd.signal} | Hist: {indicators.macd.histogram}
                    </p>
                </div>

                {/* Bollinger Bands */}
                <div className="p-4 bg-secondary/30 rounded-lg">
                    <span className="text-xs text-muted-foreground">Bollinger Bands</span>
                    <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Upper</span>
                            <span className="font-mono">৳{indicators.bollingerBands.upper}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Middle</span>
                            <span className="font-mono">৳{indicators.bollingerBands.middle}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Lower</span>
                            <span className="font-mono">৳{indicators.bollingerBands.lower}</span>
                        </div>
                    </div>
                </div>

                {/* Moving Averages */}
                <div className="p-4 bg-secondary/30 rounded-lg">
                    <span className="text-xs text-muted-foreground">Moving Averages</span>
                    <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">SMA 20</span>
                            <span className="font-mono">৳{indicators.sma20}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">SMA 50</span>
                            <span className="font-mono">৳{indicators.sma50}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">EMA 12</span>
                            <span className="font-mono">৳{indicators.ema12}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Support/Resistance */}
            <div className="flex gap-4">
                <div className="flex-1 p-3 bg-bullish/10 border border-bullish/20 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Support</p>
                    <p className="text-lg font-bold font-mono text-bullish">৳{indicators.support}</p>
                </div>
                <div className="flex-1 p-3 bg-bearish/10 border border-bearish/20 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Resistance</p>
                    <p className="text-lg font-bold font-mono text-bearish">৳{indicators.resistance}</p>
                </div>
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-2 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                    Technical indicators are for educational purposes only. Past performance does not guarantee future results.
                </p>
            </div>
        </div>
    );
};

export default TechnicalIndicators;
