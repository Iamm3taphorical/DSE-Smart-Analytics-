import * as React from 'react';
import { useState, useEffect } from 'react';
import {
    Wallet, TrendingUp, TrendingDown, Plus, Minus,
    ArrowUpRight, ArrowDownRight, DollarSign, History,
    X, Search
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MOCK_STOCKS } from '../services/marketService';
import {
    getPortfolio, createPortfolio, updatePortfolioCash,
    getHoldings, upsertHolding, getTransactions, addTransaction,
    DBPortfolio, DBHolding, DBTransaction
} from '../services/supabaseService';
import toast, { Toaster } from 'react-hot-toast';

interface PortfolioProps {
    userId?: string;
}

const Portfolio: React.FC<PortfolioProps> = ({ userId = 'demo-user' }) => {
    const { t } = useTranslation();
    const [portfolio, setPortfolio] = useState<DBPortfolio | null>(null);
    const [holdings, setHoldings] = useState<DBHolding[]>([]);
    const [transactions, setTransactions] = useState<DBTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [showTradeModal, setShowTradeModal] = useState(false);
    const [showCashModal, setShowCashModal] = useState(false);
    const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
    const [cashType, setCashType] = useState<'deposit' | 'withdraw'>('deposit');

    // Form states
    const [selectedStock, setSelectedStock] = useState(MOCK_STOCKS[0].ticker);
    const [quantity, setQuantity] = useState(1);
    const [cashAmount, setCashAmount] = useState(10000);
    const [searchQuery, setSearchQuery] = useState('');

    // Load portfolio data
    useEffect(() => {
        loadData();
    }, [userId]);

    const loadData = async () => {
        setLoading(true);
        try {
            let p = await getPortfolio(userId);
            if (!p) {
                p = await createPortfolio(userId, 100000); // Start with 100k virtual money
            }
            setPortfolio(p);

            if (p) {
                const h = await getHoldings(p.id, userId);
                setHoldings(h);

                const tx = await getTransactions(p.id, userId);
                setTransactions(tx);
            }
        } catch (error) {
            console.error('Error loading portfolio:', error);
            toast.error('Failed to load portfolio');
        }
        setLoading(false);
    };

    // Get current stock price
    const getStockPrice = (ticker: string): number => {
        const stock = MOCK_STOCKS.find(s => s.ticker === ticker);
        return stock?.price || 0;
    };

    // Calculate portfolio metrics
    const calculateMetrics = () => {
        let totalStockValue = 0;
        let totalCost = 0;
        let dayGain = 0;

        holdings.forEach(h => {
            const currentPrice = getStockPrice(h.ticker);
            const stockValue = h.quantity * currentPrice;
            const cost = h.quantity * h.avg_cost;
            totalStockValue += stockValue;
            totalCost += cost;

            // Simulate day gain (random for demo)
            const stock = MOCK_STOCKS.find(s => s.ticker === h.ticker);
            if (stock) {
                dayGain += h.quantity * stock.change;
            }
        });

        const totalValue = totalStockValue + (portfolio?.cash_balance || 0);
        const totalGain = totalStockValue - totalCost;
        const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

        return {
            totalValue,
            totalStockValue,
            cashBalance: portfolio?.cash_balance || 0,
            totalGain,
            totalGainPercent,
            dayGain,
        };
    };

    const metrics = calculateMetrics();

    // Handle trade (buy/sell)
    const handleTrade = async () => {
        if (!portfolio) return;

        const price = getStockPrice(selectedStock);
        const totalCost = price * quantity;

        if (tradeType === 'buy') {
            if (totalCost > (portfolio.cash_balance || 0)) {
                toast.error('Insufficient cash balance');
                return;
            }

            // Find existing holding
            const existingHolding = holdings.find(h => h.ticker === selectedStock);
            const newQuantity = (existingHolding?.quantity || 0) + quantity;
            const newAvgCost = existingHolding
                ? ((existingHolding.quantity * existingHolding.avg_cost) + totalCost) / newQuantity
                : price;

            // Update holding
            await upsertHolding({
                portfolio_id: portfolio.id,
                ticker: selectedStock,
                quantity: newQuantity,
                avg_cost: newAvgCost,
            }, userId);

            // Update cash
            await updatePortfolioCash(portfolio.id, portfolio.cash_balance - totalCost, userId);

            // Add transaction
            await addTransaction({
                portfolio_id: portfolio.id,
                ticker: selectedStock,
                type: 'buy',
                quantity,
                price,
                amount: totalCost,
            }, userId);

            toast.success(`Bought ${quantity} shares of ${selectedStock}`);
        } else {
            // Sell
            const existingHolding = holdings.find(h => h.ticker === selectedStock);
            if (!existingHolding || existingHolding.quantity < quantity) {
                toast.error('Insufficient shares to sell');
                return;
            }

            const newQuantity = existingHolding.quantity - quantity;

            // Update or remove holding
            await upsertHolding({
                portfolio_id: portfolio.id,
                ticker: selectedStock,
                quantity: newQuantity,
                avg_cost: existingHolding.avg_cost,
            }, userId);

            // Update cash
            await updatePortfolioCash(portfolio.id, portfolio.cash_balance + totalCost, userId);

            // Add transaction
            await addTransaction({
                portfolio_id: portfolio.id,
                ticker: selectedStock,
                type: 'sell',
                quantity,
                price,
                amount: totalCost,
            }, userId);

            toast.success(`Sold ${quantity} shares of ${selectedStock}`);
        }

        setShowTradeModal(false);
        loadData();
    };

    // Handle cash deposit/withdraw
    const handleCash = async () => {
        if (!portfolio) return;

        if (cashType === 'withdraw' && cashAmount > portfolio.cash_balance) {
            toast.error('Insufficient cash balance');
            return;
        }

        const newBalance = cashType === 'deposit'
            ? portfolio.cash_balance + cashAmount
            : portfolio.cash_balance - cashAmount;

        await updatePortfolioCash(portfolio.id, newBalance, userId);

        await addTransaction({
            portfolio_id: portfolio.id,
            ticker: '',
            type: cashType,
            amount: cashAmount,
        }, userId);

        toast.success(`${cashType === 'deposit' ? 'Deposited' : 'Withdrew'} ৳${cashAmount.toLocaleString()}`);
        setShowCashModal(false);
        loadData();
    };

    const filteredStocks = MOCK_STOCKS.filter(s =>
        s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Wallet className="w-8 h-8 text-primary" />
                        {t('portfolio.title', 'Portfolio')}
                    </h1>
                    <p className="text-muted-foreground mt-1">Paper trading simulation with ৳100,000 virtual money</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => { setCashType('deposit'); setShowCashModal(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        {t('portfolio.deposit', 'Deposit')}
                    </button>
                    <button
                        onClick={() => { setCashType('withdraw'); setShowCashModal(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                        <Minus className="w-4 h-4" />
                        {t('portfolio.withdraw', 'Withdraw')}
                    </button>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card border border-border rounded-xl p-5">
                    <p className="text-sm text-muted-foreground">{t('portfolio.totalValue', 'Total Value')}</p>
                    <p className="text-3xl font-bold mt-1">৳{metrics.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>

                <div className="bg-card border border-border rounded-xl p-5">
                    <p className="text-sm text-muted-foreground">{t('portfolio.dayGain', 'Day Gain')}</p>
                    <p className={`text-3xl font-bold mt-1 flex items-center gap-2 ${metrics.dayGain >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {metrics.dayGain >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                        {metrics.dayGain >= 0 ? '+' : ''}৳{metrics.dayGain.toFixed(2)}
                    </p>
                </div>

                <div className="bg-card border border-border rounded-xl p-5">
                    <p className="text-sm text-muted-foreground">{t('portfolio.totalGain', 'Total Gain')}</p>
                    <p className={`text-3xl font-bold mt-1 ${metrics.totalGain >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {metrics.totalGain >= 0 ? '+' : ''}৳{metrics.totalGain.toFixed(2)}
                        <span className="text-sm ml-2">({metrics.totalGainPercent >= 0 ? '+' : ''}{metrics.totalGainPercent.toFixed(2)}%)</span>
                    </p>
                </div>

                <div className="bg-card border border-border rounded-xl p-5">
                    <p className="text-sm text-muted-foreground">{t('portfolio.cashBalance', 'Cash Balance')}</p>
                    <p className="text-3xl font-bold mt-1 flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-primary" />
                        ৳{metrics.cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                </div>
            </div>

            {/* Holdings */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h2 className="text-lg font-semibold">{t('portfolio.holdings', 'Holdings')}</h2>
                    <button
                        onClick={() => { setTradeType('buy'); setShowTradeModal(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        {t('portfolio.buy', 'Buy Stock')}
                    </button>
                </div>

                {holdings.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>{t('portfolio.noHoldings', 'No holdings yet')}</p>
                        <p className="text-sm mt-1">Click "Buy Stock" to start trading</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-secondary/50">
                                <tr>
                                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Stock</th>
                                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">{t('portfolio.quantity', 'Qty')}</th>
                                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">{t('portfolio.avgCost', 'Avg Cost')}</th>
                                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">{t('portfolio.currentPrice', 'Current')}</th>
                                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Value</th>
                                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">{t('portfolio.gain', 'Gain/Loss')}</th>
                                    <th className="text-center p-4 text-sm font-medium text-muted-foreground">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {holdings.map((holding) => {
                                    const currentPrice = getStockPrice(holding.ticker);
                                    const value = holding.quantity * currentPrice;
                                    const cost = holding.quantity * holding.avg_cost;
                                    const gain = value - cost;
                                    const gainPercent = (gain / cost) * 100;
                                    const stock = MOCK_STOCKS.find(s => s.ticker === holding.ticker);

                                    return (
                                        <tr key={holding.id} className="border-t border-border hover:bg-secondary/30">
                                            <td className="p-4">
                                                <div className="font-medium">{holding.ticker}</div>
                                                <div className="text-xs text-muted-foreground">{stock?.name}</div>
                                            </td>
                                            <td className="p-4 text-right font-mono">{holding.quantity}</td>
                                            <td className="p-4 text-right font-mono">৳{holding.avg_cost.toFixed(2)}</td>
                                            <td className="p-4 text-right font-mono">৳{currentPrice.toFixed(2)}</td>
                                            <td className="p-4 text-right font-mono font-medium">৳{value.toFixed(2)}</td>
                                            <td className={`p-4 text-right font-mono ${gain >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                <div className="flex items-center justify-end gap-1">
                                                    {gain >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                                    {gain >= 0 ? '+' : ''}৳{gain.toFixed(2)}
                                                </div>
                                                <div className="text-xs">({gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%)</div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={() => {
                                                        setSelectedStock(holding.ticker);
                                                        setTradeType('sell');
                                                        setQuantity(1);
                                                        setShowTradeModal(true);
                                                    }}
                                                    className="px-3 py-1 text-sm bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                                                >
                                                    {t('portfolio.sell', 'Sell')}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Transaction History */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-4 border-b border-border">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <History className="w-5 h-5" />
                        {t('portfolio.transactions', 'Transaction History')}
                    </h2>
                </div>

                {transactions.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        <p>No transactions yet</p>
                    </div>
                ) : (
                    <div className="max-h-64 overflow-y-auto">
                        <table className="w-full">
                            <thead className="bg-secondary/50 sticky top-0">
                                <tr>
                                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Date</th>
                                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Type</th>
                                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Stock</th>
                                    <th className="text-right p-3 text-xs font-medium text-muted-foreground">Qty</th>
                                    <th className="text-right p-3 text-xs font-medium text-muted-foreground">Price</th>
                                    <th className="text-right p-3 text-xs font-medium text-muted-foreground">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx) => (
                                    <tr key={tx.id} className="border-t border-border text-sm">
                                        <td className="p-3 text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${tx.type === 'buy' ? 'bg-green-500/10 text-green-500' :
                                                    tx.type === 'sell' ? 'bg-red-500/10 text-red-500' :
                                                        tx.type === 'deposit' ? 'bg-blue-500/10 text-blue-500' :
                                                            'bg-orange-500/10 text-orange-500'
                                                }`}>
                                                {tx.type.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-3 font-medium">{tx.ticker || '-'}</td>
                                        <td className="p-3 text-right font-mono">{tx.quantity || '-'}</td>
                                        <td className="p-3 text-right font-mono">{tx.price ? `৳${tx.price.toFixed(2)}` : '-'}</td>
                                        <td className={`p-3 text-right font-mono font-medium ${tx.type === 'sell' || tx.type === 'deposit' ? 'text-green-500' : 'text-red-500'
                                            }`}>
                                            {tx.type === 'sell' || tx.type === 'deposit' ? '+' : '-'}৳{tx.amount.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Trade Modal */}
            {showTradeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl">
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <h3 className="text-lg font-bold">{tradeType === 'buy' ? 'Buy Stock' : 'Sell Stock'}</h3>
                            <button onClick={() => setShowTradeModal(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Stock Search */}
                            <div>
                                <label className="text-sm text-muted-foreground mb-1 block">Select Stock</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Search stocks..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-2 text-sm"
                                    />
                                </div>
                                <div className="mt-2 max-h-40 overflow-y-auto bg-secondary/50 rounded-lg">
                                    {filteredStocks.slice(0, 10).map(stock => (
                                        <button
                                            key={stock.ticker}
                                            onClick={() => { setSelectedStock(stock.ticker); setSearchQuery(''); }}
                                            className={`w-full flex items-center justify-between p-2 text-sm hover:bg-secondary transition-colors ${selectedStock === stock.ticker ? 'bg-primary/10 text-primary' : ''
                                                }`}
                                        >
                                            <span className="font-medium">{stock.ticker}</span>
                                            <span className="text-muted-foreground">৳{stock.price.toFixed(2)}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Selected Stock Info */}
                            <div className="p-3 bg-secondary/50 rounded-lg">
                                <div className="flex justify-between">
                                    <span className="font-bold text-lg">{selectedStock}</span>
                                    <span className="font-mono text-lg">৳{getStockPrice(selectedStock).toFixed(2)}</span>
                                </div>
                                {tradeType === 'sell' && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        You own: {holdings.find(h => h.ticker === selectedStock)?.quantity || 0} shares
                                    </p>
                                )}
                            </div>

                            {/* Quantity */}
                            <div>
                                <label className="text-sm text-muted-foreground mb-1 block">Quantity</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-full bg-secondary border border-border rounded-lg px-4 py-2"
                                />
                            </div>

                            {/* Total */}
                            <div className="p-3 bg-primary/10 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Total {tradeType === 'buy' ? 'Cost' : 'Proceeds'}</span>
                                    <span className="text-2xl font-bold">৳{(getStockPrice(selectedStock) * quantity).toFixed(2)}</span>
                                </div>
                                {tradeType === 'buy' && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Available: ৳{(portfolio?.cash_balance || 0).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="p-4 border-t border-border flex gap-3">
                            <button
                                onClick={() => setShowTradeModal(false)}
                                className="flex-1 py-2 px-4 rounded-lg bg-secondary text-foreground font-medium hover:bg-accent transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleTrade}
                                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${tradeType === 'buy'
                                        ? 'bg-green-500 text-white hover:bg-green-600'
                                        : 'bg-red-500 text-white hover:bg-red-600'
                                    }`}
                            >
                                {tradeType === 'buy' ? 'Buy' : 'Sell'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cash Modal */}
            {showCashModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl">
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <h3 className="text-lg font-bold">{cashType === 'deposit' ? 'Deposit Cash' : 'Withdraw Cash'}</h3>
                            <button onClick={() => setShowCashModal(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            <div>
                                <label className="text-sm text-muted-foreground mb-1 block">Amount (৳)</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={cashAmount}
                                    onChange={(e) => setCashAmount(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-lg font-mono"
                                />
                            </div>

                            <div className="flex gap-2">
                                {[5000, 10000, 25000, 50000].map(amount => (
                                    <button
                                        key={amount}
                                        onClick={() => setCashAmount(amount)}
                                        className="flex-1 py-2 text-sm bg-secondary rounded-lg hover:bg-accent transition-colors"
                                    >
                                        ৳{amount.toLocaleString()}
                                    </button>
                                ))}
                            </div>

                            <div className="p-3 bg-secondary/50 rounded-lg">
                                <p className="text-sm text-muted-foreground">Current Balance</p>
                                <p className="text-xl font-bold">৳{(portfolio?.cash_balance || 0).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="p-4 border-t border-border flex gap-3">
                            <button
                                onClick={() => setShowCashModal(false)}
                                className="flex-1 py-2 px-4 rounded-lg bg-secondary text-foreground font-medium hover:bg-accent transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCash}
                                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${cashType === 'deposit'
                                        ? 'bg-green-500 text-white hover:bg-green-600'
                                        : 'bg-red-500 text-white hover:bg-red-600'
                                    }`}
                            >
                                {cashType === 'deposit' ? 'Deposit' : 'Withdraw'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Portfolio;
