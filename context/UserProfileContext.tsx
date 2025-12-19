import * as React from 'react';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DBUser, getUser, upsertUser } from '../services/supabaseService';
import { UserProfile } from '../types';

interface UserProfileContextType {
    profile: UserProfile | null;
    loading: boolean;
    updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
    addToWatchlist: (ticker: string) => void;
    removeFromWatchlist: (ticker: string) => void;
    isWatchlisted: (ticker: string) => boolean;
    addToFavorites: (ticker: string) => void;
    removeFromFavorites: (ticker: string) => void;
    isFavorite: (ticker: string) => boolean;
    refreshProfile: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

// Available avatar options
export const AVATAR_OPTIONS = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Scooter',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Precious',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Bandit',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Mittens',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Tinkerbell',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Bubba',
];

interface UserProfileProviderProps {
    children: ReactNode;
    initialUser?: { id: string; name: string; email: string };
}

export const UserProfileProvider: React.FC<UserProfileProviderProps> = ({
    children,
    initialUser = { id: 'demo-user', name: 'Demo User', email: 'demo@example.com' }
}) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Load profile on mount
    useEffect(() => {
        loadProfile();
    }, [initialUser.id]);

    const loadProfile = async () => {
        setLoading(true);
        try {
            // 1. Try to get from Supabase/Local via Service
            const dbUser = await getUser(initialUser.id);

            if (dbUser) {
                // Convert DBUser to UserProfile
                setProfile({
                    id: dbUser.id,
                    name: dbUser.name,
                    email: dbUser.email,
                    phone: dbUser.phone || '',
                    avatar: dbUser.avatar_url || AVATAR_OPTIONS[0],
                    gender: dbUser.gender,
                    preferredLanguage: dbUser.preferred_language,
                    preferredTheme: dbUser.preferred_theme,
                    watchlist: [], // Fetched separately in real app, simplified for now
                    favorites: [],
                    createdAt: new Date(dbUser.created_at),
                    updatedAt: new Date(dbUser.updated_at),
                });
            } else {
                // 2. If not found, create new profile
                const newProfile: UserProfile = {
                    id: initialUser.id,
                    name: initialUser.name,
                    email: initialUser.email,
                    avatar: AVATAR_OPTIONS[0],
                    watchlist: [],
                    favorites: [],
                    preferredLanguage: 'en',
                    preferredTheme: 'dark',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                // Save to DB
                await upsertUser({
                    id: newProfile.id,
                    email: newProfile.email,
                    name: newProfile.name,
                    avatar_url: newProfile.avatar,
                    preferred_language: 'en',
                    preferred_theme: 'dark',
                });

                setProfile(newProfile);
            }
        } catch (err) {
            console.error('Failed to load profile:', err);
        }
        setLoading(false);
    };

    const updateProfile = async (updates: Partial<UserProfile>) => {
        if (!profile) return;

        // Optimistic update
        const updatedProfile = { ...profile, ...updates, updatedAt: new Date() };
        setProfile(updatedProfile);

        // Save to DB
        await upsertUser({
            id: profile.id,
            email: profile.email,
            name: updates.name || profile.name,
            phone: updates.phone,
            avatar_url: updates.avatar,
            gender: updates.gender,
            preferred_language: updates.preferredLanguage,
        });
    };

    const addToWatchlist = (ticker: string) => {
        if (!profile) return;
        if (profile.watchlist.includes(ticker)) return;
        updateProfile({ watchlist: [...profile.watchlist, ticker] });
    };

    const removeFromWatchlist = (ticker: string) => {
        if (!profile) return;
        updateProfile({ watchlist: profile.watchlist.filter(t => t !== ticker) });
    };

    const isWatchlisted = (ticker: string) => {
        return profile?.watchlist.includes(ticker) || false;
    };

    const addToFavorites = (ticker: string) => {
        if (!profile) return;
        if (profile.favorites.includes(ticker)) return;
        updateProfile({ favorites: [...profile.favorites, ticker] });
    };

    const removeFromFavorites = (ticker: string) => {
        if (!profile) return;
        updateProfile({ favorites: profile.favorites.filter(t => t !== ticker) });
    };

    const isFavorite = (ticker: string) => {
        return profile?.favorites.includes(ticker) || false;
    };

    const refreshProfile = async () => {
        await loadProfile();
    };

    return (
        <UserProfileContext.Provider value={{
            profile,
            loading,
            updateProfile,
            addToWatchlist,
            removeFromWatchlist,
            isWatchlisted,
            addToFavorites,
            removeFromFavorites,
            isFavorite,
            refreshProfile
        }}>
            {children}
        </UserProfileContext.Provider>
    );
};

export const useUserProfile = () => {
    const context = useContext(UserProfileContext);
    if (context === undefined) {
        throw new Error('useUserProfile must be used within a UserProfileProvider');
    }
    return context;
};
