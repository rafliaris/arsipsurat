export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'staff' | 'kepala_dinas';
    avatar?: string;
    status: 'active' | 'inactive';
}

export interface Category {
    id: string;
    name: string;
    description: string;
    color: string; // Hex code or tailwind class
    created_at: string;
}
