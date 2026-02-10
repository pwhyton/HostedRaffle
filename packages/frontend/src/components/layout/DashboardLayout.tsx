import { Outlet, Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';

export default function DashboardLayout() {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user || (user.role !== 'org_admin' && user.role !== 'super_admin')) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="font-bold text-lg">Dashboard</h2>
          <p className="text-sm text-gray-400 truncate">{user.organisation?.name || 'Admin'}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link to="/dashboard" className="block px-3 py-2 rounded hover:bg-gray-800">
            Home
          </Link>
          <Link to="/dashboard/raffles" className="block px-3 py-2 rounded hover:bg-gray-800">
            Raffles
          </Link>
          {user.role === 'super_admin' && (
            <>
              <div className="pt-4 pb-2 text-xs uppercase text-gray-500 font-semibold">Admin</div>
              <Link to="/admin" className="block px-3 py-2 rounded hover:bg-gray-800">
                Admin Home
              </Link>
              <Link to="/admin/organisations" className="block px-3 py-2 rounded hover:bg-gray-800">
                Organisations
              </Link>
              <Link to="/admin/settings" className="block px-3 py-2 rounded hover:bg-gray-800">
                Settings
              </Link>
            </>
          )}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <p className="text-sm text-gray-400 truncate mb-2">{user.email}</p>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded hover:bg-gray-800 text-sm text-red-400"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900">Raffle Tickets Management</h1>
          </div>
        </header>
        <main className="flex-1 p-6 bg-gray-50 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
