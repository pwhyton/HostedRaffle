import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/endpoints.js';

export default function AdminHomePage() {
  const { data: orgs } = useQuery({
    queryKey: ['admin-organisations'],
    queryFn: adminApi.getOrganisations,
  });

  const { data: users } = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminApi.getUsers,
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Super Admin</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Organisations</div>
          <div className="text-3xl font-bold">{orgs?.length ?? 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Admin Users</div>
          <div className="text-3xl font-bold">{users?.length ?? 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Quick Links</div>
          <div className="space-y-1 mt-2">
            <Link to="/admin/organisations" className="block text-indigo-600 hover:underline text-sm">
              Manage Organisations
            </Link>
            <Link to="/admin/settings" className="block text-indigo-600 hover:underline text-sm">
              Global Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
