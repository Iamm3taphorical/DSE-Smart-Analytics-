import * as React from 'react';
import { TrendingUp, TrendingDown, Activity, BarChart3, Clock } from 'lucide-react';
import { MARKET_INDICES, getMarketStatus } from '../services/marketService';

const MarketOverview: React.FC = () => {
    const marketStatus = getMarketStatus();

    const getStatusColor = () => {
        switch (marketStatus.status) {
            case 'OPEN': return 'bg-bullish';
            case 'PRE_OPEN':
            case 'POST_CLOSE': return 'bg-neutral';
            default: return 'bg-muted-foreground';
        }
    };

    return (
        <div className="space-y-4">
            {/* Market Status Banner */}
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor()} ${marketStatus.status === 'OPEN' ? 'animate-pulse' : ''}`} />
                    <span className="text-sm font-medium">{marketStatus.message}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>DSE Trading Hours: 10:30 AM - 2:30 PM</span>
                </div>
            </div>

            {/* Index Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {MARKET_INDICES.map((index) => (
                    <div
                        key={index.name}
                        className="card-interactive"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">{index.name}</p>
                                <p className="text-2xl font-bold font-mono mt-1">
                                    {index.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                            <div className={`p-2 rounded-lg ${index.change >= 0 ? 'bg-bullish/10' : 'bg-bearish/10'}`}>
                                {index.change >= 0 ? (
                                    <TrendingUp className="w-5 h-5 text-bullish" />
                                ) : (
                                    <TrendingDown className="w-5 h-5 text-bearish" />
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className={`text-sm font-medium ${index.change >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                                {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)} ({index.changePercent >= 0 ? '+' : ''}{index.changePercent}%)
                            </span>
                        </div>

                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <BarChart3 className="w-3 h-3" />
                                <span>Vol: {(index.volume / 1000000).toFixed(1)}M</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Activity className="w-3 h-3" />
                                <span>Trades: {index.trades.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MarketOverview;
