"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useSession, signOut } from 'next-auth/react';

// Minimal user type based on NextAuth session
export type UserRole = 'ADMIN' | 'INSTRUCTOR' | 'MANAGER' | 'FINANCE' | 'LEARNER';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
}

interface UserContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();

    const user: User | null = session?.user
        ? {
            id: (session.user as { id?: string }).id ?? '',
            email: session.user.email ?? '',
            name: session.user.name ?? '',
            role: ((session.user as { role?: string }).role as UserRole) ?? 'LEARNER',
        }
        : null;

    const login = async () => {
        // Login is now handled by NextAuth signIn() in the login form
        return { success: false, error: 'Use NextAuth signIn() instead' };
    };

    const logout = async () => {
        await signOut({ callbackUrl: '/login' });
    };

    const updateUser = () => {
        // No-op — user data comes from session
    };

    return (
        <UserContext.Provider
            value={{
                user,
                isLoading: status === 'loading',
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
    return { user, isLoading, isAuthenticated, hasAccess };
}

// Helper to get dashboard URL based on role
export function getDashboardUrl(role: UserRole): string {
    switch (role) {
        case 'ADMIN': return '/admin';
        case 'INSTRUCTOR': return '/instructor';
        case 'MANAGER': return '/manager';
        case 'FINANCE': return '/finance';
        case 'LEARNER':
        default: return '/dashboard';
    }
}
