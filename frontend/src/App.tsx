import { Toaster } from "@/components/ui/sonner"
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom"
import LoginPage from "@/features/auth/pages/LoginPage"
import { useAuthStore } from "@/store/authStore"
import DashboardPage from "@/features/dashboard/pages/DashboardPage"
import SuratMasukPage from "@/features/surat-masuk/pages/SuratMasukPage"
import SuratMasukCreatePage from "@/features/surat-masuk/pages/SuratMasukCreatePage"
import SuratMasukDetailPage from "@/features/surat-masuk/pages/SuratMasukDetailPage"
import DisposisiPage from "@/features/disposisi/pages/DisposisiPage"
import SuratKeluarPage from "@/features/surat-keluar/pages/SuratKeluarPage"
import SuratKeluarCreatePage from "@/features/surat-keluar/pages/SuratKeluarCreatePage"
import SuratKeluarDetailPage from "@/features/surat-keluar/pages/SuratKeluarDetailPage"
import { SettingsLayout } from "./features/settings/pages/SettingsLayout"
import SettingsPage from "./features/settings/pages/SettingsPage"
import UserManagementPage from "./features/settings/pages/UserManagementPage"
import CategoryManagementPage from "./features/settings/pages/CategoryManagementPage"

// Protected Route Wrapper
const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

// Global App Layout (if needed) or simple wrapper
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/surat-masuk" element={<SuratMasukPage />} />
          <Route path="/surat-masuk/create" element={<SuratMasukCreatePage />} />
          <Route path="/surat-masuk/:id" element={<SuratMasukDetailPage />} />
          <Route path="/disposisi" element={<DisposisiPage />} />
          <Route path="/surat-keluar" element={<SuratKeluarPage />} />
          <Route path="/surat-keluar/create" element={<SuratKeluarCreatePage />} />
          <Route path="/surat-keluar/:id" element={<SuratKeluarDetailPage />} />

          {/* Settings Routes */}
          <Route path="/settings" element={<SettingsLayout />}>
            <Route index element={<SettingsPage />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="categories" element={<CategoryManagementPage />} />
          </Route>
          {/* Add other protected routes here */}
        </Route>

        {/* Catch all - Redirect to dashboard if logged in, else login */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}

export default App
