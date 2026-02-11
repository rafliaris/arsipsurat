import { type User } from "@/features/settings/types";

let mockUsers: User[] = [
    {
        id: "1",
        name: "Admin Sistem",
        email: "admin@arsip.com",
        role: "admin",
        status: "active",
        avatar: "https://github.com/shadcn.png"
    },
    {
        id: "2",
        name: "Staff Tata Usaha",
        email: "staff@arsip.com",
        role: "staff",
        status: "active"
    },
    {
        id: "3",
        name: "Kepala Dinas",
        email: "kadin@arsip.com",
        role: "kepala_dinas",
        status: "active"
    }
];

export const mockUserService = {
    getAll: async (): Promise<User[]> => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return mockUsers;
    },

    getById: async (id: string): Promise<User | undefined> => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return mockUsers.find((u) => u.id === id);
    },

    create: async (data: Omit<User, "id" | "status">): Promise<User> => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const newUser: User = {
            ...data,
            id: Math.random().toString(36).substr(2, 9),
            status: "active"
        };
        mockUsers = [...mockUsers, newUser];
        return newUser;
    },

    update: async (id: string, data: Partial<User>): Promise<User | undefined> => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        mockUsers = mockUsers.map(u => u.id === id ? { ...u, ...data } : u);
        return mockUsers.find(u => u.id === id);
    },

    delete: async (id: string): Promise<void> => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        mockUsers = mockUsers.filter(u => u.id !== id);
    }
};
