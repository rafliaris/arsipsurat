# Frontend Initialization Guide (2026 Edition)

This guide outlines the steps to initialize the frontend for the **Arsip Surat** application, leveraging the latest technologies as of February 2026: **React 19**, **Vite**, **Tailwind CSS 4**, and **shadcn/ui**.

## 1. Prerequisites

Ensure you have the following installed:
- **Node.js**: v22+ (LTS recommended)
- **pnpm** (recommended for speed) or `npm`/`yarn`

## 2. Project Initialization

We will use Vite to scaffold the project.

```bash
# Initialize Vite with React + TypeScript
pnpm create vite frontend --template react-ts

# Navigate to the directory
cd frontend

# Install dependencies
pnpm install
```

## 3. Tailwind CSS 4 Setup

Tailwind CSS 4 is the standard in 2026, offering zero-configuration by default with Vite.

1.  **Install Tailwind and its Vite plugin:**
    ```bash
    pnpm add -D tailwindcss @tailwindcss/vite
    ```

2.  **Configure Vite (`vite.config.ts`):**
    ```typescript
    import { defineConfig } from 'vite'
    import react from '@vitejs/plugin-react'
    import tailwindcss from '@tailwindcss/vite'
    import path from "path"

    export default defineConfig({
      plugins: [
        react(),
        tailwindcss(),
      ],
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "./src"),
        },
      },
    })
    ```

3.  **Import Tailwind in CSS (`src/index.css`):**
    ```css
    @import "tailwindcss";
    ```

## 4. shadcn/ui Initialization (2026)

We will use the latest `shadcn` CLI which supports the new "new-york" style with unified `radix-ui` packages.

1.  **Run the init command:**
    ```bash
    pnpm dlx shadcn@latest init
    ```

2.  **Configuration Choices:**
    - **Style**: New York (Recommended for professional apps)
    - **Base Color**: Slate (or Zinc)
    - **CSS Variables**: Yes
    - **React Server Components**: No (since we are using client-side Vite, though React 19 supports them, typical SPA setup might toggle this off unless using a meta-framework, but for Vite SPA, keep 'No' or default)
    *Note: In 2026, shadcn might support Base UI. Choose "Radix UI" as the foundation if asked, for stability compatible with existing docs.*

3.  **Add Core Components:**
    ```bash
    pnpm dlx shadcn@latest add button input card dropdown-menu table sheet dialog form
    ```

## 5. Directory Structure & Cleanup

Organize your `src` folder to match the `PLAN.md` architecture:

```
src/
├── app/                # Application layer
│   ├── router.tsx      # React Router definition
│   └── provider.tsx    # Global providers (QueryClient, etc.)
├── features/           # Feature-based modules
│   ├── auth/           # Login, Register
│   ├── dashboard/      # Analytics overview
│   ├── mail-in/        # Surat Masuk
│   └── mail-out/       # Surat Keluar
├── components/
│   ├── ui/             # shadcn/ui components
│   └── common/         # Shared app components (Layouts, etc.)
├── hooks/              # Custom hooks
├── lib/                # Utilities (exclude utils.ts if using lib/utils.ts from shadcn)
│   └── utils.ts
├── services/           # API calls (Axios)
├── store/              # State management (Zustand)
└── types/              # TypeScript definitions
```

## 6. Install Additional Dependencies

Based on `PLAN.md`:

```bash
# Routing & State
pnpm add react-router-dom@7 zustand @tanstack/react-query

# Forms & Validation
pnpm add react-hook-form @hookform/resolvers zod

# Utilities
pnpm add date-fns clsx tailwind-merge axios lucide-react

# Data Visualization
pnpm add recharts

# PDF & File Handling
pnpm add react-pdf react-dropzone
```

## 7. Configuration Updates

### TypeScript (`tsconfig.json`)
Ensure path aliases are configured:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### React 19 Features
Utilize the new hooks where appropriate:
- Use `useActionState` for form submissions.
- Use `useOptimistic` for instant UI feedback on mutations.
- Use the new `<title>` and `<meta>` support for SEO directly in components.

## 8. Development
Run the dev server:
```bash
pnpm dev
```
