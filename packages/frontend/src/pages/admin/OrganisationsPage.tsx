import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/endpoints.js';

export default function OrganisationsPage() {
  const queryClient = useQueryClient();

  const { data: orgs, isLoading } = useQuery({
    queryKey: ['admin-organisations'],
    queryFn: adminApi.getOrganisations,
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteOrganisation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-organisations'] }),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Organisations</h2>
        <Link
          to="/admin/organisations/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Add Organisation
        </Link>
      </div>

      <div className="grid gap-4">
        {orgs?.map((org) => (
          <div key={org.id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: org.primaryColour }}
              >
                {org.name[0]}
              </div>
              <div>
                <Link to={`/admin/organisations/${org.id}`} className="font-medium text-indigo-600 hover:underline">
                  {org.name}
                </Link>
                <div className="text-sm text-gray-500">/{org.slug}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                {(org as unknown as { _count: { raffles: number; users: number } })._count?.raffles ?? 0} raffles
                &middot;
                {(org as unknown as { _count: { raffles: number; users: number } })._count?.users ?? 0} users
              </div>
              <Link
                to={`/admin/organisations/${org.id}`}
                className="text-sm text-indigo-600 hover:underline"
              >
                Edit
              </Link>
              <button
                onClick={() => {
                  if (confirm(`Delete ${org.name}?`)) deleteMutation.mutate(org.id);
                }}
                className="text-sm text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
