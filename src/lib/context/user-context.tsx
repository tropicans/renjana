"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, validateLogin, getUserByEmail, UserRole } from '@/lib/data/users';

interface UserContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = 'renjana_user';

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsedUser = JSON.parse(stored);
                // Validate user still exists
                const currentUser = getUserByEmail(parsedUser.email);
                if (currentUser) {
                    setUser(currentUser);
                } else {
                    localStorage.removeItem(STORAGE_KEY);
                }
            } catch {
                localStorage.removeItem(STORAGE_KEY);
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const validatedUser = validateLogin(email, password);

        if (validatedUser) {
            setUser(validatedUser);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(validatedUser));
            setIsLoading(false);
            return { success: true };
        }

        setIsLoading(false);
        return { success: false, error: 'Email atau password salah' };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    const updateUser = (updates: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...updates };
            setUser(updatedUser);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
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
