// Mock User Data Store
export type UserRole = 'learner' | 'admin' | 'instructor' | 'manager' | 'finance';

export interface User {
    id: string;
    name: string;
    email: string;
    password: string; // In real app, this would be hashed
    role: UserRole;
    avatar?: string;
    title?: string;
    department?: string;
    joinedAt: string;
}

export const users: User[] = [
    {
        id: 'user-1',
        name: 'Ahmad Pratama',
        email: 'ahmad@example.com',
        password: 'password123',
        role: 'learner',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad',
        title: 'Legal Associate',
        department: 'Corporate Law',
        joinedAt: '2024-01-15',
    },
    {
        id: 'user-2',
        name: 'Siti Rahayu',
        email: 'siti@example.com',
        password: 'password123',
        role: 'learner',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti',
        title: 'Junior Lawyer',
        department: 'Litigation',
        joinedAt: '2024-02-01',
    },
    {
        id: 'user-3',
        name: 'Budi Santoso',
        email: 'budi@example.com',
        password: 'password123',
        role: 'instructor',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi',
        title: 'Senior Partner',
        department: 'Corporate Law',
        joinedAt: '2023-06-01',
    },
    {
        id: 'user-4',
        name: 'Admin Renjana',
        email: 'admin@renjana.com',
        password: 'admin123',
        role: 'admin',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
        title: 'Platform Administrator',
        joinedAt: '2023-01-01',
    },
    {
        id: 'user-5',
        name: 'Diana Putri',
        email: 'diana@example.com',
        password: 'password123',
        role: 'manager',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana',
        title: 'HR Manager',
        department: 'Human Resources',
        joinedAt: '2023-08-15',
    },
    {
        id: 'user-6',
        name: 'Eko Wijaya',
        email: 'eko@example.com',
        password: 'password123',
        role: 'finance',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eko',
        title: 'Finance Officer',
        department: 'Finance',
        joinedAt: '2023-09-01',
    },
];

// Helper functions
export function getUserById(id: string): User | undefined {
    return users.find(user => user.id === id);
}

export function getUserByEmail(email: string): User | undefined {
    return users.find(user => user.email === email);
}

export function getUsersByRole(role: UserRole): User[] {
    return users.filter(user => user.role === role);
}

export function validateLogin(email: string, password: string): User | null {
    const user = users.find(u => u.email === email && u.password === password);
    return user || null;
}
