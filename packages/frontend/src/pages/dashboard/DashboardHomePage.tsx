import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../api/endpoints.js';

export default function DashboardHomePage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Raffles" value={stats?.totalRaffles ?? 0} />
        <StatCard label="Active Raffles" value={stats?.activeRaffles ?? 0} color="text-green-600" />
        <StatCard label="Tickets Sold" value={stats?.totalTicketsSold ?? 0} color="text-blue-600" />
        <StatCard
          label="Revenue"
          value={`£${(stats?.totalRevenue ?? 0).toFixed(2)}`}
          color="text-purple-600"
        />
      </div>

      <Link
        to="/dashboard/raffles"
        className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
      >
        Manage Raffles
      </Link>
    </div>
  );
}

function StatCard({ label, value, color = 'text-gray-900' }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
