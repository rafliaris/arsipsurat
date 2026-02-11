import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom"
import LoginPage from "@/features/auth/pages/LoginPage"
import { useAuthStore } from "@/store/authStore"
import DashboardPage from "@/features/dashboard/pages/DashboardPage"
import SuratMasukPage from "@/features/surat-masuk/pages/SuratMasukPage"
import SuratMasukCreatePage from "@/features/surat-masuk/pages/SuratMasukCreatePage"
import SuratMasukDetailPage from "@/features/surat-masuk/pages/SuratMasukDetailPage"

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
          {/* Add other protected routes here */}
        </Route>

        {/* Catch all - Redirect to dashboard if logged in, else login */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
