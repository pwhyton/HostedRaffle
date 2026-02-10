import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createRaffleSchema, type CreateRaffleInput } from '@raffle/shared';
import { dashboardApi } from '../../api/endpoints.js';

export default function RaffleEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = id === 'new';

  const { data: raffle } = useQuery({
    queryKey: ['dashboard-raffle', id],
    queryFn: () => dashboardApi.getRaffle(id!),
    enabled: !isNew && !!id,
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateRaffleInput>({
    resolver: zodResolver(createRaffleSchema),
  });

  useEffect(() => {
    if (raffle) {
      reset({
        title: raffle.title,
        description: raffle.description,
        prizeInfo: raffle.prizeInfo,
        ticketPrice: raffle.ticketPrice,
        maxTickets: raffle.maxTickets,
        drawDate: new Date(raffle.drawDate).toISOString().split('T')[0],
      });
    }
  }, [raffle, reset]);

  const createMutation = useMutation({
    mutationFn: dashboardApi.createRaffle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-raffles'] });
      navigate('/dashboard/raffles');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CreateRaffleInput) => dashboardApi.updateRaffle(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-raffles'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-raffle', id] });
      navigate('/dashboard/raffles');
    },
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => dashboardApi.updateRaffle(id!, { status: status as 'active' | 'draft' | 'cancelled' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-raffles'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-raffle', id] });
    },
  });

  const ticketsQuery = useQuery({
    queryKey: ['dashboard-tickets', id],
    queryFn: () => dashboardApi.getTickets(id!),
    enabled: !isNew && !!id,
  });

  const onSubmit = (data: CreateRaffleInput) => {
    if (isNew) {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate(data);
    }
  };

  const error = createMutation.error || updateMutation.error;

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">{isNew ? 'Create Raffle' : 'Edit Raffle'}</h2>

      {!isNew && raffle && (
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-500">Status: </span>
            <span className="font-semibold capitalize">{raffle.status}</span>
            <span className="text-sm text-gray-500 ml-4">
              Tickets sold: {raffle._count?.tickets ?? 0} / {raffle.maxTickets}
            </span>
          </div>
          <div className="space-x-2">
            {raffle.status === 'draft' && (
              <button
                onClick={() => statusMutation.mutate('active')}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                Activate
              </button>
            )}
            {raffle.status === 'active' && (
              <button
                onClick={() => statusMutation.mutate('cancelled')}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
          {(error as Error).message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            {...register('title')}
            className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500"
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prize Information</label>
          <textarea
            {...register('prizeInfo')}
            rows={3}
            className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500"
          />
          {errors.prizeInfo && <p className="text-red-500 text-sm mt-1">{errors.prizeInfo.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Price (£)</label>
            <input
              type="number"
              step="0.01"
              {...register('ticketPrice', { valueAsNumber: true })}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            />
            {errors.ticketPrice && <p className="text-red-500 text-sm mt-1">{errors.ticketPrice.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Tickets</label>
            <input
              type="number"
              {...register('maxTickets', { valueAsNumber: true })}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            />
            {errors.maxTickets && <p className="text-red-500 text-sm mt-1">{errors.maxTickets.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Draw Date</label>
          <input
            type="date"
            {...register('drawDate')}
            className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500"
          />
          {errors.drawDate && <p className="text-red-500 text-sm mt-1">{errors.drawDate.message}</p>}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {isNew ? 'Create Raffle' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard/raffles')}
            className="px-6 py-2 border rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Ticket list for existing raffles */}
      {!isNew && ticketsQuery.data && ticketsQuery.data.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-bold mb-4">Tickets Sold ({ticketsQuery.data.length})</h3>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Ticket #</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Buyer</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Email</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Purchased</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {ticketsQuery.data.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono">{ticket.ticketNumber}</td>
                    <td className="px-4 py-3">{ticket.buyerName}</td>
                    <td className="px-4 py-3 text-gray-600">{ticket.buyerEmail}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString('en-GB')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
