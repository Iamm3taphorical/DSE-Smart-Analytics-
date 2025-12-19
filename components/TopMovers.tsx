import * as React from 'react';
import { TrendingUp, TrendingDown, Flame, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Stock } from '../types';
import { getTopGainers, getTopLosers, getMostTraded } from '../services/marketService';

interface TopMoversProps {
    onSelectStock?: (stock: Stock) => void;
}

const TopMovers: React.FC<TopMoversProps> = ({ onSelectStock }) => {
    const [activeTab, setActiveTab] = React.useState<'gainers' | 'losers' | 'active'>('gainers');

    const topGainers = getTopGainers(5);
    const topLosers = getTopLosers(5);
    const mostTraded = getMostTraded(5);

    const getData = () => {
        switch (activeTab) {
            case 'gainers': return topGainers;
            case 'losers': return topLosers;
            case 'active': return mostTraded;
        }
    };

    const tabs = [
        { id: 'gainers', label: 'Top Gainers', icon: TrendingUp, color: 'text-bullish' },
        { id: 'losers', label: 'Top Losers', icon: TrendingDown, color: 'text-bearish' },
        { id: 'active', label: 'Most Active', icon: Flame, color: 'text-neutral' },
    ] as const;

    return (
        <div className="card">
            {/* Tabs */}
            <div className="flex gap-1 mb-4 p-1 bg-secondary rounded-lg">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-all ${activeTab === tab.id
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? tab.color : ''}`} />
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Stock List */}
            <div className="space-y-2">
                {getData().map((stock, index) => (
                    <div
                        key={stock.ticker}
                        onClick={() => onSelectStock?.(stock)}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer 
                       transition-all border border-transparent hover:border-border hover:bg-secondary/50`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                ${activeTab === 'gainers' ? 'bg-bullish/20 text-bullish' :
                                    activeTab === 'losers' ? 'bg-bearish/20 text-bearish' :
                                        'bg-neutral/20 text-neutral'}`}>
                                {index + 1}
                            </div>
                            <div>
                                <p className="font-semibold text-sm">{stock.ticker}</p>
                                <p className="text-xs text-muted-foreground truncate max-w-[120px]">{stock.name}</p>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="font-mono text-sm">৳{stock.price.toFixed(2)}</p>
                            <div className={`flex items-center justify-end gap-1 text-xs font-medium
                ${stock.changePercent >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                                {stock.changePercent >= 0 ? (
                                    <ArrowUpRight className="w-3 h-3" />
                                ) : (
                                    <ArrowDownRight className="w-3 h-3" />
                                )}
                                <span>{stock.changePercent >= 0 ? '+' : ''}{stock.changePercent}%</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TopMovers;
