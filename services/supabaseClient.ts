import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// IMPORTANT: Replace these with your actual Supabase project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
    return (
        supabaseUrl !== 'https://your-project.supabase.co' &&
        supabaseAnonKey !== 'your-anon-key' &&
        supabaseUrl.includes('supabase.co')
    );
};

// Database table types
export interface DBUser {
    id: string;
    email: string;
    name: string;
    phone?: string;
    avatar_url?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    preferred_language: 'en' | 'bn';
    preferred_theme: 'dark' | 'light' | 'system';
    created_at: string;
    updated_at: string;
}

export interface DBPortfolio {
    id: string;
    user_id: string;
    cash_balance: number;
    created_at: string;
    updated_at: string;
}

export interface DBHolding {
    id: string;
    portfolio_id: string;
    ticker: string;
    quantity: number;
    avg_cost: number;
    created_at: string;
    updated_at: string;
}

export interface DBTransaction {
    id: string;
    portfolio_id: string;
    ticker: string;
    type: 'buy' | 'sell' | 'deposit' | 'withdraw';
    quantity?: number;
    price?: number;
    amount: number;
    created_at: string;
}

export interface DBAlert {
    id: string;
    user_id: string;
    ticker: string;
    condition: 'above' | 'below';
    target_price: number;
    is_active: boolean;
    email_notify: boolean;
    triggered_at?: string;
    created_at: string;
    updated_at: string;
}

export interface DBWatchlistItem {
    id: string;
    user_id: string;
    ticker: string;
    is_favorite: boolean;
    created_at: string;
}

export default supabase;
