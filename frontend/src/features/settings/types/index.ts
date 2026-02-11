export interface User {
    id: number;
    username: string;
    email: string;
    full_name: string;
    role: string;
    is_active: boolean;
    created_at?: string;
    avatar?: string;
}

export interface Category {
    id: string;
    name: string;
    description: string;
    color: string; // Hex code or tailwind class
    created_at: string;
}
