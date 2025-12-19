import * as React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';

interface UserProfileContextType {
    profile: UserProfile | null;
    updateProfile: (updates: Partial<UserProfile>) => void;
    addToWatchlist: (ticker: string) => void;
    removeFromWatchlist: (ticker: string) => void;
    addToFavorites: (ticker: string) => void;
    removeFromFavorites: (ticker: string) => void;
    isInWatchlist: (ticker: string) => boolean;
    isInFavorites: (ticker: string) => boolean;
    clearProfile: () => void;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

const STORAGE_KEY = 'dse_user_profile';

// Default avatar options
export const AVATAR_OPTIONS = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=trader1',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=trader2',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=investor1',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=investor2',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=analyst1',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=analyst2',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=finance1',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=finance2',
];

export const UserProfileProvider: React.FC<{ children: React.ReactNode; user?: { id: string; name: string; email: string } }> = ({
    children,
    user
}) => {
    const [profile, setProfile] = useState<UserProfile | null>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    return {
                        ...parsed,
                        createdAt: new Date(parsed.createdAt),
                        updatedAt: new Date(parsed.updatedAt),
                    };
                } catch (e) {
                    console.error('Failed to parse stored profile:', e);
                }
            }
        }
        return null;
    });

    // Initialize profile when user logs in
    useEffect(() => {
        if (user && !profile) {
            const newProfile: UserProfile = {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)],
                watchlist: ['BRACBANK', 'GP', 'SQURPHARMA'], // Default watchlist
                favorites: [],
                preferredLanguage: 'en',
                preferredTheme: 'dark',
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            setProfile(newProfile);
        }
    }, [user, profile]);

    // Persist to localStorage
    useEffect(() => {
        if (profile) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
        }
    }, [profile]);

    const updateProfile = useCallback((updates: Partial<UserProfile>) => {
        setProfile(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                ...updates,
                updatedAt: new Date(),
            };
        });
    }, []);

    const addToWatchlist = useCallback((ticker: string) => {
        setProfile(prev => {
            if (!prev) return prev;
            if (prev.watchlist.includes(ticker)) return prev;
            return {
                ...prev,
                watchlist: [...prev.watchlist, ticker],
                updatedAt: new Date(),
            };
        });
    }, []);

    const removeFromWatchlist = useCallback((ticker: string) => {
        setProfile(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                watchlist: prev.watchlist.filter(t => t !== ticker),
                updatedAt: new Date(),
            };
        });
    }, []);

    const addToFavorites = useCallback((ticker: string) => {
        setProfile(prev => {
            if (!prev) return prev;
            if (prev.favorites.includes(ticker)) return prev;
            return {
                ...prev,
                favorites: [...prev.favorites, ticker],
                updatedAt: new Date(),
            };
        });
    }, []);

    const removeFromFavorites = useCallback((ticker: string) => {
        setProfile(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                favorites: prev.favorites.filter(t => t !== ticker),
                updatedAt: new Date(),
            };
        });
    }, []);

    const isInWatchlist = useCallback((ticker: string) => {
        return profile?.watchlist.includes(ticker) || false;
    }, [profile?.watchlist]);

    const isInFavorites = useCallback((ticker: string) => {
        return profile?.favorites.includes(ticker) || false;
    }, [profile?.favorites]);

    const clearProfile = useCallback(() => {
        setProfile(null);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    return (
        <UserProfileContext.Provider value={{
            profile,
            updateProfile,
            addToWatchlist,
            removeFromWatchlist,
            addToFavorites,
            removeFromFavorites,
            isInWatchlist,
            isInFavorites,
            clearProfile,
        }}>
            {children}
        </UserProfileContext.Provider>
    );
};

export const useUserProfile = (): UserProfileContextType => {
    const context = useContext(UserProfileContext);
    if (context === undefined) {
        throw new Error('useUserProfile must be used within a UserProfileProvider');
    }
    return context;
};

export default UserProfileContext;
