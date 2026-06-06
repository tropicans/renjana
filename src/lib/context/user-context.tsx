"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { type UserRole } from "@/lib/dashboard-routing";

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatarUrl?: string | null;
}

interface UserContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    logout: () => void;
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
            avatarUrl: session.user.image ?? null,
        }
        : null;

    const logout = async () => {
        await signOut({ callbackUrl: '/login' });
    };

    return (
        <UserContext.Provider
            value={{
                user,
                isLoading: status === 'loading',
                isAuthenticated: !!user,
                logout,
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
