import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, TrendingDown, Clock, Star, Command } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Stock } from '../types';
import { MOCK_STOCKS } from '../services/marketService';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectStock: (stock: Stock) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelectStock }) => {
    const { t } = useTranslation();
    const [query, setQuery] = useState('');
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    // Load recent searches from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('dse_recent_searches');
        if (stored) {
            setRecentSearches(JSON.parse(stored));
        }
    }, []);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setQuery('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Open with Cmd+K or Ctrl+K
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (!isOpen) {
                    // This needs to be handled by parent
                }
            }

            if (!isOpen) return;

            // Close with Escape
            if (e.key === 'Escape') {
                onClose();
            }

            // Navigate with arrows
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => Math.min(prev + 1, filteredStocks.length - 1));
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => Math.max(prev - 1, 0));
            }

            // Select with Enter
            if (e.key === 'Enter' && filteredStocks[selectedIndex]) {
                handleSelect(filteredStocks[selectedIndex]);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, selectedIndex]);

    // Filter stocks
    const filteredStocks = query.length > 0
        ? MOCK_STOCKS.filter(s =>
            s.ticker.toLowerCase().includes(query.toLowerCase()) ||
            s.name.toLowerCase().includes(query.toLowerCase()) ||
            s.sector.toLowerCase().includes(query.toLowerCase())
        )
        : MOCK_STOCKS.slice(0, 5);

    // Handle stock selection
    const handleSelect = (stock: Stock) => {
        // Add to recent searches
        const updated = [stock.ticker, ...recentSearches.filter(s => s !== stock.ticker)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('dse_recent_searches', JSON.stringify(updated));

        onSelectStock(stock);
        onClose();
    };

    // Clear recent searches
    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('dse_recent_searches');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-card border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-200">
                {/* Search Input */}
                <div className="flex items-center gap-3 p-4 border-b border-border">
                    <Search className="w-5 h-5 text-muted-foreground" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder={t('search.placeholder', 'Search stocks, sectors...')}
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                        className="flex-1 bg-transparent text-lg outline-none placeholder:text-muted-foreground"
                    />
                    {query && (
                        <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                        <span>ESC</span>
                    </div>
                </div>

                {/* Results */}
                <div className="max-h-[60vh] overflow-y-auto">
                    {/* Recent Searches */}
                    {query.length === 0 && recentSearches.length > 0 && (
                        <div className="p-3 border-b border-border">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    {t('search.recentSearches', 'Recent Searches')}
                                </div>
                                <button
                                    onClick={clearRecentSearches}
                                    className="text-xs text-muted-foreground hover:text-foreground"
                                >
                                    Clear
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {recentSearches.map(ticker => {
                                    const stock = MOCK_STOCKS.find(s => s.ticker === ticker);
                                    if (!stock) return null;
                                    return (
                                        <button
                                            key={ticker}
                                            onClick={() => handleSelect(stock)}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg text-sm hover:bg-accent transition-colors"
                                        >
                                            <span className="font-medium">{stock.ticker}</span>
                                            <span className={stock.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                                                {stock.change >= 0 ? '+' : ''}{stock.changePercent}%
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Stock Results */}
                    {filteredStocks.length > 0 ? (
                        <div className="p-2">
                            {filteredStocks.map((stock, index) => (
                                <button
                                    key={stock.ticker}
                                    onClick={() => handleSelect(stock)}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                    className={`w-full flex items-center gap-4 p-3 rounded-xl text-left transition-colors ${selectedIndex === index ? 'bg-primary/10' : 'hover:bg-secondary'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stock.change >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'
                                        }`}>
                                        {stock.change >= 0
                                            ? <TrendingUp className="w-5 h-5 text-green-500" />
                                            : <TrendingDown className="w-5 h-5 text-red-500" />
                                        }
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold">{stock.ticker}</span>
                                            <span className="text-xs px-1.5 py-0.5 bg-secondary rounded text-muted-foreground">
                                                {stock.sector}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground truncate">{stock.name}</p>
                                    </div>

                                    <div className="text-right">
                                        <p className="font-mono font-bold">৳{stock.price.toFixed(2)}</p>
                                        <p className={`text-sm ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent}%)
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-muted-foreground">
                            <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>{t('search.noResults', 'No results found')}</p>
                            <p className="text-sm mt-1">Try searching for a different stock or sector</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-border bg-secondary/30 flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <span className="px-1.5 py-0.5 bg-secondary rounded">↑↓</span>
                            <span>Navigate</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="px-1.5 py-0.5 bg-secondary rounded">↵</span>
                            <span>Select</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="px-1.5 py-0.5 bg-secondary rounded">ESC</span>
                            <span>Close</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Command className="w-3 h-3" />
                        <span>+ K to open search</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchModal;
