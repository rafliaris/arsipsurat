export interface User {
    id: number;
    username: string;
    email: string;
    full_name: string;
    role: string; // 'admin' | 'staff' | 'pimpinan'
    is_active: boolean;
    created_at: string;
    avatar?: string; // Optional, might not be in backend response yet
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
}
