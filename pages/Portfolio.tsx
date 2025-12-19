import * as React from 'react';
import { useState } from 'react';
import { Briefcase, TrendingUp, TrendingDown, DollarSign, Plus as PlusIcon } from 'lucide-react';

const Portfolio: React.FC = () => {
    console.log("Portfolio: Rendering Portfolio Simulation page...");
    const [transactions, setTransactions] = useState([
        { ticker: 'BRACBANK', qty: 100, avgCost: 50.00, ltp: 55.00 },
        { ticker: 'SQUAREPHARMA', qty: 200, avgCost: 60.00, ltp: 65.00 },
        { ticker: 'GP', qty: 300, avgCost: 70.00, ltp: 75.00 },
        { ticker: 'BATBC', qty: 400, avgCost: 80.00, ltp: 85.00 }
    ]);

    const addTransaction = () => {
        const newTx = {
            ticker: 'ROBI',
            qty: 500,
            avgCost: 40.00,
            ltp: 42.00
        };
        setTransactions(prev => [newTx, ...prev]);
    };
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Portfolio Simulation</h1>
                <button
                    onClick={addTransaction}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <PlusIcon className="w-4 h-4" />
                    Add Transaction
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 rounded-xl bg-card border border-border">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground uppercase font-bold tracking-wider">Total Value</p>
                            <h3 className="text-2xl font-bold">৳ 1,245,670</h3>
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-xl bg-card border border-border">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground uppercase font-bold tracking-wider">Day Gain</p>
                            <h3 className="text-2xl font-bold text-bullish">+৳ 12,450 (1.2%)</h3>
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-xl bg-card border border-border">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-purple-500/10 text-purple-500">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground uppercase font-bold tracking-wider">Cash Balance</p>
                            <h3 className="text-2xl font-bold">৳ 450,000</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4">Symbol</th>
                                <th className="px-6 py-4">Qty</th>
                                <th className="px-6 py-4">Avg Cost</th>
                                <th className="px-6 py-4">LTP</th>
                                <th className="px-6 py-4">Day Gain</th>
                                <th className="px-6 py-4">Total Gain</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {transactions.map((tx, i) => (
                                <tr key={tx.ticker + i} className="hover:bg-secondary/20 transition-colors">
                                    <td className="px-6 py-4 font-bold">{tx.ticker}</td>
                                    <td className="px-6 py-4">{tx.qty}</td>
                                    <td className="px-6 py-4">৳ {tx.avgCost.toFixed(2)}</td>
                                    <td className="px-6 py-4">৳ {tx.ltp.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-bullish">+৳ {(tx.qty * (tx.ltp - tx.avgCost) / 10).toFixed(0)} (1.5%)</td>
                                    <td className="px-6 py-4 text-bullish">+৳ {(tx.qty * (tx.ltp - tx.avgCost)).toLocaleString()} (10%)</td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => alert(`Initiating trade for ${tx.ticker}...`)}
                                            className="text-primary hover:underline"
                                        >
                                            Trade
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Portfolio;
