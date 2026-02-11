import { type User } from "@/features/settings/types";

let mockUsers: User[] = [
    {
        id: 1,
        username: "admin",
        full_name: "Admin Sistem",
        email: "admin@arsip.com",
        role: "admin",
        is_active: true,
        avatar: "https://github.com/shadcn.png"
    },
    {
        id: 2,
        username: "staff",
        full_name: "Staff Tata Usaha",
        email: "staff@arsip.com",
        role: "staff",
        is_active: true
    },
    {
        id: 3,
        username: "kadin",
        full_name: "Kepala Dinas",
        email: "kadin@arsip.com",
        role: "kepala_dinas",
        is_active: true
    }
];

export const mockUserService = {
    getAll: async (): Promise<User[]> => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return mockUsers;
    },

    getById: async (id: number): Promise<User | undefined> => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return mockUsers.find((u) => u.id === id);
    },

    create: async (data: Omit<User, "id" | "is_active">): Promise<User> => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const newUser: User = {
            ...data,
            id: Math.floor(Math.random() * 10000),
            is_active: true
        };
        mockUsers = [...mockUsers, newUser];
        return newUser;
    },

    update: async (id: number, data: Partial<User>): Promise<User | undefined> => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        mockUsers = mockUsers.map(u => u.id === id ? { ...u, ...data } : u);
        return mockUsers.find(u => u.id === id);
    },

    delete: async (id: number): Promise<void> => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        mockUsers = mockUsers.filter(u => u.id !== id);
    }
};
