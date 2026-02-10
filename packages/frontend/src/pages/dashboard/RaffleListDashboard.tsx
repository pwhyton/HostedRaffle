import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '../../api/endpoints.js';
import type { Raffle } from '@raffle/shared';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  drawn: 'bg-purple-100 text-purple-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function RaffleListDashboard() {
  const queryClient = useQueryClient();

  const { data: raffles, isLoading } = useQuery({
    queryKey: ['dashboard-raffles'],
    queryFn: dashboardApi.getRaffles,
  });

  const deleteMutation = useMutation({
    mutationFn: dashboardApi.deleteRaffle,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dashboard-raffles'] }),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Raffles</h2>
        <Link
          to="/dashboard/raffles/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Create Raffle
        </Link>
      </div>

      {!raffles?.length ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow">
          <p className="text-lg mb-2">No raffles yet</p>
          <p>Create your first raffle to get started!</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Title</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Tickets</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Draw Date</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {raffles.map((raffle: Raffle) => (
                <tr key={raffle.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link to={`/dashboard/raffles/${raffle.id}`} className="font-medium text-indigo-600 hover:underline">
                      {raffle.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusColors[raffle.status]}`}>
                      {raffle.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {raffle._count?.tickets ?? 0} / {raffle.maxTickets}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(raffle.drawDate).toLocaleDateString('en-GB')}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Link
                      to={`/dashboard/raffles/${raffle.id}`}
                      className="text-sm text-indigo-600 hover:underline"
                    >
                      Edit
                    </Link>
                    {raffle.status === 'active' && (
                      <Link
                        to={`/dashboard/raffles/${raffle.id}/draw`}
                        className="text-sm text-purple-600 hover:underline"
                      >
                        Draw
                      </Link>
                    )}
                    {raffle.status === 'draft' && (
                      <button
                        onClick={() => {
                          if (confirm('Delete this raffle?')) deleteMutation.mutate(raffle.id);
                        }}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
