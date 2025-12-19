import { User } from '../types';

// Mock session storage key
const SESSION_KEY = 'dse_auth_session';

export interface AuthSession {
    user: User;
    token: string;
    expiresAt: number;
}

// Mock delay to simulate network request
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
    // Check if user is currently logged in
    checkSession: (): User | null => {
        try {
            const sessionStr = localStorage.getItem(SESSION_KEY);
            if (!sessionStr) return null;

            const session: AuthSession = JSON.parse(sessionStr);
            if (Date.now() > session.expiresAt) {
                localStorage.removeItem(SESSION_KEY);
                return null;
            }

            return session.user;
        } catch (e) {
            console.error("Session parse error", e);
            return null;
        }
    },

    // Simple rate limiter simulation
    checkRateLimit: (key: string): boolean => {
        const attempts = parseInt(localStorage.getItem(`rate_limit_${key}`) || '0');
        const lastAttempt = parseInt(localStorage.getItem(`last_attempt_${key}`) || '0');
        const now = Date.now();

        // Reset after 5 minutes
        if (now - lastAttempt > 5 * 60 * 1000) {
            localStorage.setItem(`rate_limit_${key}`, '1');
            localStorage.setItem(`last_attempt_${key}`, now.toString());
            return true;
        }

        if (attempts >= 5) {
            return false;
        }

        localStorage.setItem(`rate_limit_${key}`, (attempts + 1).toString());
        localStorage.setItem(`last_attempt_${key}`, now.toString());
        return true;
    },

    // Login with OTP
    verifyOTP: async (email: string, otp: string): Promise<{ user: User; token: string }> => {
        if (!authService.checkRateLimit(`otp_${email}`)) {
            throw new Error("Too many attempts. Please try again later.");
        }

        await delay(1500); // Simulate API call

        // In a real app, this would verify with backend
        if (otp.length !== 6) {
            throw new Error("Invalid OTP format");
        }

        const user: User = {
            id: Math.random().toString(36).substr(2, 9),
            name: email.split('@')[0],
            email: email,
            isAuthenticated: true,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
        };

        const session: AuthSession = {
            user,
            token: 'mock-jwt-token-' + Date.now(),
            expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        };

        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        return { user, token: session.token };
    },

    // Login with Google (Simulated)
    loginWithGoogle: async (): Promise<{ user: User; token: string }> => {
        if (!authService.checkRateLimit('google_login')) {
            throw new Error("Too many login attempts. Please wait.");
        }
        await delay(1000);

        const user: User = {
            id: 'google-user-123',
            name: 'Mahir Demo',
            email: 'mahir@example.com',
            isAuthenticated: true,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mahir'
        };

        const session: AuthSession = {
            user,
            token: 'mock-google-token-' + Date.now(),
            expiresAt: Date.now() + 24 * 60 * 60 * 1000
        };

        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        return { user, token: session.token };
    },

    // Send OTP
    sendOTP: async (email: string): Promise<boolean> => {
        await delay(1000);
        console.log(`Sending OTP to ${email}`);
        return true;
    },

    // Logout
    logout: async (): Promise<void> => {
        await delay(500);
        localStorage.removeItem(SESSION_KEY);
    }
};
