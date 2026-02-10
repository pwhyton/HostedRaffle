import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';

export default function AdminLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user || user.role !== 'super_admin') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
