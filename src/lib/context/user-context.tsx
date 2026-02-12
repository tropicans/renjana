"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, validateLogin, getUserByEmail, UserRole } from '@/lib/data/users';

interface UserContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = 'renjana_user';
const SESSION_COOKIE = 'renjana_session';

interface StoredUserSession {
    email: string;
}

function setSessionCookie(payload: StoredUserSession & { role: UserRole }) {
    const encoded = encodeURIComponent(JSON.stringify(payload));
    document.cookie = `${SESSION_COOKIE}=${encoded}; path=/; max-age=2592000; samesite=lax`;
}

function clearSessionCookie() {
    document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        if (typeof window === 'undefined') {
            return null;
        }

        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            return null;
        }

        try {
            const parsedSession = JSON.parse(stored) as StoredUserSession;
            const currentUser = getUserByEmail(parsedSession.email);
            if (!currentUser) {
                localStorage.removeItem(STORAGE_KEY);
                clearSessionCookie();
                return null;
            }
            setSessionCookie({ email: currentUser.email, role: currentUser.role });
            return currentUser;
        } catch {
            localStorage.removeItem(STORAGE_KEY);
            clearSessionCookie();
            return null;
        }
    });
    const [isLoading, setIsLoading] = useState(false);

    const login = async (email: string, password: string) => {
        setIsLoading(true);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const validatedUser = validateLogin(email, password);

        if (validatedUser) {
            setUser(validatedUser);
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ email: validatedUser.email }));
            setSessionCookie({ email: validatedUser.email, role: validatedUser.role });
            setIsLoading(false);
            return { success: true, user: validatedUser };
        }

        setIsLoading(false);
        return { success: false, error: 'Email atau password salah' };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
        clearSessionCookie();
    };

    const updateUser = (updates: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...updates };
            setUser(updatedUser);
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ email: updatedUser.email }));
            setSessionCookie({ email: updatedUser.email, role: updatedUser.role });
        }
    };

    return (
        <UserContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                logout,
                updateUser,
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}

// Helper hook for role-based access
export function useRequireAuth(allowedRoles?: UserRole[]) {
    const { user, isLoading, isAuthenticated } = useUser();

    const hasAccess = isAuthenticated && (!allowedRoles || (user && allowedRoles.includes(user.role)));

    return {
        user,
        isLoading,
        isAuthenticated,
        hasAccess,
    };
}

// Helper to get dashboard URL based on role
export function getDashboardUrl(role: UserRole): string {
    switch (role) {
        case 'admin':
            return '/admin';
        case 'instructor':
            return '/instructor';
        case 'manager':
            return '/manager';
        case 'finance':
            return '/finance';
        case 'learner':
        default:
            return '/dashboard';
    }
}
