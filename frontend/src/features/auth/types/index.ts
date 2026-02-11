export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'staff' | 'pimpinan';
    avatar?: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
}
