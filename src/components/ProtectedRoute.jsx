import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// Layout-style route guard: renders the child routes via <Outlet/> only if allowed.
export default function ProtectedRoute({ role }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/" replace />
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
