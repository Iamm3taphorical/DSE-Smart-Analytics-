import * as React from 'react';
import { AlertTriangle, TrendingDown, TrendingUp, Activity } from 'lucide-react';
import { Stock } from '../../types';

interface VolatilityAlertProps {
    stock: Stock;
}

const VolatilityAlert: React.FC<VolatilityAlertProps> = ({ stock }) => {
    // Simple volatility logic for demo
    const isVolatile = Math.abs(stock.changePercent) > 2.5;
    const isHighVolume = stock.volume > 50000; // Mock threshold

    if (!isVolatile && !isHighVolume) return null;

    return (
        <div className={`rounded-xl border p-4 mb-4 animate-in fade-in slide-in-from-top-2 ${stock.change < 0
            ? 'bg-bearish/10 border-bearish/20 text-bearish'
            : 'bg-bullish/10 border-bullish/20 text-bullish'
            }`}>
            <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${stock.change < 0 ? 'bg-bearish/20' : 'bg-bullish/20'
                    }`}>
                    <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-bold flex items-center gap-2">
                        High Volatility Detected
                        <span className="text-[10px] px-1.5 py-0.5 rounded border border-current opacity-70">REAL-TIME</span>
                    </h4>
                    <p className="text-sm opacity-90 mt-1">
                        {stock.ticker} is experiencing significant price movement ({stock.changePercent > 0 ? '+' : ''}{stock.changePercent}%) with {isHighVolume ? 'unusual' : 'normal'} volume.
                        Recommended Action: {stock.change < 0 ? 'Monitor Support Levels' : 'Check Resistance Targets'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VolatilityAlert;
