import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '../../api/endpoints.js';
import type { Winner } from '@raffle/shared';

export default function DrawPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [numberOfWinners, setNumberOfWinners] = useState(3);
  const [drawnWinners, setDrawnWinners] = useState<Winner[] | null>(null);
  const [revealIndex, setRevealIndex] = useState(-1);

  const { data: raffle } = useQuery({
    queryKey: ['dashboard-raffle', id],
    queryFn: () => dashboardApi.getRaffle(id!),
    enabled: !!id,
  });

  const winnersQuery = useQuery({
    queryKey: ['dashboard-winners', id],
    queryFn: () => dashboardApi.getWinners(id!),
    enabled: !!id,
  });

  const drawMutation = useMutation({
    mutationFn: () => dashboardApi.runDraw(id!, { numberOfWinners }),
    onSuccess: (winners) => {
      setDrawnWinners(winners);
      setRevealIndex(-1);
      queryClient.invalidateQueries({ queryKey: ['dashboard-raffle', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-winners', id] });
    },
  });

  if (!raffle) return <div>Loading...</div>;

  const ticketsSold = raffle._count?.tickets ?? 0;
  const alreadyDrawn = raffle.status === 'drawn' || (winnersQuery.data && winnersQuery.data.length > 0);
  const existingWinners = winnersQuery.data;

  const revealNext = () => {
    if (drawnWinners && revealIndex < drawnWinners.length - 1) {
      setRevealIndex((prev) => prev + 1);
    }
  };

  const revealAll = () => {
    if (drawnWinners) {
      setRevealIndex(drawnWinners.length - 1);
    }
  };

  return (
    <div className="max-w-2xl">
      <Link to={`/dashboard/raffles/${id}`} className="text-sm text-indigo-600 hover:underline mb-4 inline-block">
        &larr; Back to raffle
      </Link>

      <h2 className="text-2xl font-bold mb-2">Draw Winners</h2>
      <p className="text-gray-600 mb-6">{raffle.title}</p>

      {alreadyDrawn && existingWinners && existingWinners.length > 0 && !drawnWinners && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Winners</h3>
          {existingWinners.map((w) => (
            <div key={w.id} className="flex items-center gap-4 py-3 border-b last:border-0">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center font-bold text-yellow-700">
                #{w.prizeRank}
              </div>
              <div>
                <div className="font-medium">{w.ticket?.buyerName}</div>
                <div className="text-sm text-gray-500">
                  Ticket {w.ticket?.ticketNumber} &middot; {w.ticket?.buyerEmail}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!alreadyDrawn && !drawnWinners && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Tickets sold: <strong>{ticketsSold}</strong></p>
          </div>

          {ticketsSold === 0 ? (
            <p className="text-gray-500">No tickets have been sold yet. Cannot run draw.</p>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Winners
                </label>
                <input
                  type="number"
                  min={1}
                  max={ticketsSold}
                  value={numberOfWinners}
                  onChange={(e) => setNumberOfWinners(parseInt(e.target.value) || 1)}
                  className="w-32 border rounded-md px-3 py-2"
                />
              </div>

              {drawMutation.error && (
                <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
                  {(drawMutation.error as Error).message}
                </div>
              )}

              <button
                onClick={() => {
                  if (confirm(`Draw ${numberOfWinners} winner(s)? This cannot be undone.`)) {
                    drawMutation.mutate();
                  }
                }}
                disabled={drawMutation.isPending}
                className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 disabled:opacity-50 font-medium"
              >
                {drawMutation.isPending ? 'Drawing...' : 'Run Draw'}
              </button>
            </>
          )}
        </div>
      )}

      {drawnWinners && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Draw Results</h3>

          <div className="space-y-3 mb-6">
            {drawnWinners.map((w, i) => (
              <div
                key={w.id}
                className={`flex items-center gap-4 py-3 border-b last:border-0 transition-all duration-500 ${
                  i <= revealIndex ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center font-bold text-yellow-700 text-lg">
                  #{w.prizeRank}
                </div>
                <div>
                  <div className="font-semibold text-lg">{w.ticket?.buyerName}</div>
                  <div className="text-gray-500">
                    Ticket {w.ticket?.ticketNumber} &middot; {w.ticket?.buyerEmail}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            {revealIndex < drawnWinners.length - 1 && (
              <>
                <button
                  onClick={revealNext}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                >
                  Reveal Next Winner
                </button>
                <button
                  onClick={revealAll}
                  className="border px-4 py-2 rounded-md hover:bg-gray-50"
                >
                  Reveal All
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
