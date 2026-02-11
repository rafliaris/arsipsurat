import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom"
import LoginPage from "@/features/auth/pages/LoginPage"
import { useAuthStore } from "@/store/authStore"

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
          <Route path="/dashboard" element={
            <div className="p-10">
              <h1 className="text-2xl font-bold">Dashboard Placeholder</h1>
              <p>Welcome, you are logged in!</p>
            </div>
          } />
          {/* Add other protected routes here */}
        </Route>

        {/* Catch all - Redirect to dashboard if logged in, else login */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
