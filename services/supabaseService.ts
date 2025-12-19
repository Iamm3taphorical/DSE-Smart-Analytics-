import { supabase, isSupabaseConfigured, DBUser, DBPortfolio, DBHolding, DBTransaction, DBAlert, DBWatchlistItem } from './supabaseClient';

// Re-export types for external use
export type { DBUser, DBPortfolio, DBHolding, DBTransaction, DBAlert, DBWatchlistItem };

// ============================================
// Supabase Service - Database Operations
// ============================================

// Fallback to localStorage when Supabase is not configured
const useLocalStorage = !isSupabaseConfigured();

// ========== USER OPERATIONS ==========

export const getUser = async (userId: string): Promise<DBUser | null> => {
    if (useLocalStorage) {
        const stored = localStorage.getItem(`dse_user_${userId}`);
        return stored ? JSON.parse(stored) : null;
    }

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching user:', error);
        return null;
    }
    return data;
};

export const upsertUser = async (user: Partial<DBUser> & { id: string; email: string }): Promise<DBUser | null> => {
    if (useLocalStorage) {
        const existing = await getUser(user.id);
        const updated = {
            ...existing,
            ...user,
            updated_at: new Date().toISOString(),
            created_at: existing?.created_at || new Date().toISOString(),
        };
        localStorage.setItem(`dse_user_${user.id}`, JSON.stringify(updated));
        return updated as DBUser;
    }

    const { data, error } = await supabase
        .from('users')
        .upsert(user, { onConflict: 'id' })
        .select()
        .single();

    if (error) {
        console.error('Error upserting user:', error);
        return null;
    }
    return data;
};

// ========== PORTFOLIO OPERATIONS ==========

export const getPortfolio = async (userId: string): Promise<DBPortfolio | null> => {
    if (useLocalStorage) {
        const stored = localStorage.getItem(`dse_portfolio_${userId}`);
        return stored ? JSON.parse(stored) : null;
    }

    const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error && error.code !== 'PGRST116') { // Not found is ok
        console.error('Error fetching portfolio:', error);
    }
    return data || null;
};

export const createPortfolio = async (userId: string, initialCash: number = 100000): Promise<DBPortfolio | null> => {
    const portfolio: Omit<DBPortfolio, 'id'> = {
        user_id: userId,
        cash_balance: initialCash,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    if (useLocalStorage) {
        const id = `portfolio_${Date.now()}`;
        const full = { ...portfolio, id };
        localStorage.setItem(`dse_portfolio_${userId}`, JSON.stringify(full));
        return full;
    }

    const { data, error } = await supabase
        .from('portfolios')
        .insert(portfolio)
        .select()
        .single();

    if (error) {
        console.error('Error creating portfolio:', error);
        return null;
    }
    return data;
};

export const updatePortfolioCash = async (portfolioId: string, newBalance: number, userId?: string): Promise<boolean> => {
    if (useLocalStorage && userId) {
        const portfolio = await getPortfolio(userId);
        if (portfolio) {
            portfolio.cash_balance = newBalance;
            portfolio.updated_at = new Date().toISOString();
            localStorage.setItem(`dse_portfolio_${userId}`, JSON.stringify(portfolio));
            return true;
        }
        return false;
    }

    const { error } = await supabase
        .from('portfolios')
        .update({ cash_balance: newBalance, updated_at: new Date().toISOString() })
        .eq('id', portfolioId);

    if (error) {
        console.error('Error updating portfolio cash:', error);
        return false;
    }
    return true;
};

// ========== HOLDINGS OPERATIONS ==========

export const getHoldings = async (portfolioId: string, userId?: string): Promise<DBHolding[]> => {
    if (useLocalStorage && userId) {
        const stored = localStorage.getItem(`dse_holdings_${userId}`);
        return stored ? JSON.parse(stored) : [];
    }

    const { data, error } = await supabase
        .from('holdings')
        .select('*')
        .eq('portfolio_id', portfolioId);

    if (error) {
        console.error('Error fetching holdings:', error);
        return [];
    }
    return data || [];
};

export const upsertHolding = async (holding: Partial<DBHolding> & { portfolio_id: string; ticker: string }, userId?: string): Promise<DBHolding | null> => {
    if (useLocalStorage && userId) {
        const holdings = await getHoldings(holding.portfolio_id, userId);
        const existingIndex = holdings.findIndex(h => h.ticker === holding.ticker);

        const newHolding: DBHolding = {
            id: existingIndex >= 0 ? holdings[existingIndex].id : `holding_${Date.now()}`,
            portfolio_id: holding.portfolio_id,
            ticker: holding.ticker,
            quantity: holding.quantity || 0,
            avg_cost: holding.avg_cost || 0,
            created_at: existingIndex >= 0 ? holdings[existingIndex].created_at : new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        if (existingIndex >= 0) {
            holdings[existingIndex] = newHolding;
        } else {
            holdings.push(newHolding);
        }

        // Remove holdings with 0 quantity
        const filtered = holdings.filter(h => h.quantity > 0);
        localStorage.setItem(`dse_holdings_${userId}`, JSON.stringify(filtered));
        return newHolding;
    }

    const { data, error } = await supabase
        .from('holdings')
        .upsert(holding, { onConflict: 'portfolio_id,ticker' })
        .select()
        .single();

    if (error) {
        console.error('Error upserting holding:', error);
        return null;
    }
    return data;
};

// ========== TRANSACTION OPERATIONS ==========

export const getTransactions = async (portfolioId: string, userId?: string, limit: number = 50): Promise<DBTransaction[]> => {
    if (useLocalStorage && userId) {
        const stored = localStorage.getItem(`dse_transactions_${userId}`);
        const all = stored ? JSON.parse(stored) : [];
        return all.slice(0, limit);
    }

    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }
    return data || [];
};

export const addTransaction = async (transaction: Omit<DBTransaction, 'id' | 'created_at'>, userId?: string): Promise<DBTransaction | null> => {
    const full: DBTransaction = {
        ...transaction,
        id: `tx_${Date.now()}`,
        created_at: new Date().toISOString(),
    };

    if (useLocalStorage && userId) {
        const transactions = await getTransactions(transaction.portfolio_id, userId, 1000);
        transactions.unshift(full);
        localStorage.setItem(`dse_transactions_${userId}`, JSON.stringify(transactions));
        return full;
    }

    const { data, error } = await supabase
        .from('transactions')
        .insert(transaction)
        .select()
        .single();

    if (error) {
        console.error('Error adding transaction:', error);
        return null;
    }
    return data;
};

// ========== ALERT OPERATIONS ==========

export const getAlerts = async (userId: string): Promise<DBAlert[]> => {
    if (useLocalStorage) {
        const stored = localStorage.getItem(`dse_alerts_${userId}`);
        return stored ? JSON.parse(stored) : [];
    }

    const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching alerts:', error);
        return [];
    }
    return data || [];
};

export const createAlert = async (alert: Omit<DBAlert, 'id' | 'created_at' | 'updated_at'>): Promise<DBAlert | null> => {
    const full: DBAlert = {
        ...alert,
        id: `alert_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    if (useLocalStorage) {
        const alerts = await getAlerts(alert.user_id);
        alerts.unshift(full);
        localStorage.setItem(`dse_alerts_${alert.user_id}`, JSON.stringify(alerts));
        return full;
    }

    const { data, error } = await supabase
        .from('alerts')
        .insert(alert)
        .select()
        .single();

    if (error) {
        console.error('Error creating alert:', error);
        return null;
    }
    return data;
};

export const updateAlert = async (alertId: string, updates: Partial<DBAlert>, userId?: string): Promise<boolean> => {
    if (useLocalStorage && userId) {
        const alerts = await getAlerts(userId);
        const index = alerts.findIndex(a => a.id === alertId);
        if (index >= 0) {
            alerts[index] = { ...alerts[index], ...updates, updated_at: new Date().toISOString() };
            localStorage.setItem(`dse_alerts_${userId}`, JSON.stringify(alerts));
            return true;
        }
        return false;
    }

    const { error } = await supabase
        .from('alerts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', alertId);

    if (error) {
        console.error('Error updating alert:', error);
        return false;
    }
    return true;
};

export const deleteAlert = async (alertId: string, userId?: string): Promise<boolean> => {
    if (useLocalStorage && userId) {
        const alerts = await getAlerts(userId);
        const filtered = alerts.filter(a => a.id !== alertId);
        localStorage.setItem(`dse_alerts_${userId}`, JSON.stringify(filtered));
        return true;
    }

    const { error } = await supabase
        .from('alerts')
        .delete()
        .eq('id', alertId);

    if (error) {
        console.error('Error deleting alert:', error);
        return false;
    }
    return true;
};

// ========== WATCHLIST OPERATIONS ==========

export const getWatchlist = async (userId: string): Promise<DBWatchlistItem[]> => {
    if (useLocalStorage) {
        const stored = localStorage.getItem(`dse_watchlist_${userId}`);
        return stored ? JSON.parse(stored) : [];
    }

    const { data, error } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching watchlist:', error);
        return [];
    }
    return data || [];
};

export const addToWatchlist = async (userId: string, ticker: string, isFavorite: boolean = false): Promise<DBWatchlistItem | null> => {
    const item: DBWatchlistItem = {
        id: `wl_${Date.now()}`,
        user_id: userId,
        ticker,
        is_favorite: isFavorite,
        created_at: new Date().toISOString(),
    };

    if (useLocalStorage) {
        const watchlist = await getWatchlist(userId);
        if (!watchlist.find(w => w.ticker === ticker)) {
            watchlist.push(item);
            localStorage.setItem(`dse_watchlist_${userId}`, JSON.stringify(watchlist));
        }
        return item;
    }

    const { data, error } = await supabase
        .from('watchlist')
        .upsert({ user_id: userId, ticker, is_favorite: isFavorite }, { onConflict: 'user_id,ticker' })
        .select()
        .single();

    if (error) {
        console.error('Error adding to watchlist:', error);
        return null;
    }
    return data;
};

export const removeFromWatchlist = async (userId: string, ticker: string): Promise<boolean> => {
    if (useLocalStorage) {
        const watchlist = await getWatchlist(userId);
        const filtered = watchlist.filter(w => w.ticker !== ticker);
        localStorage.setItem(`dse_watchlist_${userId}`, JSON.stringify(filtered));
        return true;
    }

    const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', userId)
        .eq('ticker', ticker);

    if (error) {
        console.error('Error removing from watchlist:', error);
        return false;
    }
    return true;
};

export const toggleFavorite = async (userId: string, ticker: string, isFavorite: boolean): Promise<boolean> => {
    if (useLocalStorage) {
        const watchlist = await getWatchlist(userId);
        const item = watchlist.find(w => w.ticker === ticker);
        if (item) {
            item.is_favorite = isFavorite;
            localStorage.setItem(`dse_watchlist_${userId}`, JSON.stringify(watchlist));
            return true;
        }
        // If not in watchlist, add it
        await addToWatchlist(userId, ticker, isFavorite);
        return true;
    }

    const { error } = await supabase
        .from('watchlist')
        .update({ is_favorite: isFavorite })
        .eq('user_id', userId)
        .eq('ticker', ticker);

    if (error) {
        console.error('Error toggling favorite:', error);
        return false;
    }
    return true;
};
