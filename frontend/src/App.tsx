import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom"
import LoginPage from "@/features/auth/pages/LoginPage"
import { useAuthStore } from "@/store/authStore"
import DashboardPage from "@/features/dashboard/pages/DashboardPage"
import SuratMasukPage from "@/features/surat-masuk/pages/SuratMasukPage"
import SuratMasukCreatePage from "@/features/surat-masuk/pages/SuratMasukCreatePage"
import SuratMasukDetailPage from "@/features/surat-masuk/pages/SuratMasukDetailPage"
import SuratKeluarPage from "@/features/surat-keluar/pages/SuratKeluarPage"
import SuratKeluarCreatePage from "@/features/surat-keluar/pages/SuratKeluarCreatePage"
import SuratKeluarDetailPage from "@/features/surat-keluar/pages/SuratKeluarDetailPage"

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
          <Route path="/surat-keluar" element={<SuratKeluarPage />} />
          <Route path="/surat-keluar/create" element={<SuratKeluarCreatePage />} />
          <Route path="/surat-keluar/:id" element={<SuratKeluarDetailPage />} />
          {/* Add other protected routes here */}
        </Route>

        {/* Catch all - Redirect to dashboard if logged in, else login */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
