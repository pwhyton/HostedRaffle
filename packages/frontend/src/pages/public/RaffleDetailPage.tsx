import { Link, useParams, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../../api/endpoints.js';
import type { Organisation } from '@raffle/shared';

interface PublicContext {
  org: Organisation | undefined;
  primaryColour: string;
  secondaryColour: string;
}

export default function RaffleDetailPage() {
  const { orgSlug, id } = useParams<{ orgSlug: string; id: string }>();
  const { primaryColour } = useOutletContext<PublicContext>();

  const { data: raffle, isLoading } = useQuery({
    queryKey: ['raffle', orgSlug, id],
    queryFn: () => publicApi.getRaffle(orgSlug!, id!),
    enabled: !!orgSlug && !!id,
  });

  if (isLoading) return <div className="text-center py-12">Loading...</div>;
  if (!raffle) return <div className="text-center py-12">Raffle not found</div>;

  const ticketsSold = raffle._count?.tickets ?? 0;
  const remaining = raffle.maxTickets - ticketsSold;
  const isSoldOut = remaining <= 0;
  const isDrawn = raffle.status === 'drawn';
  const percentSold = Math.round((ticketsSold / raffle.maxTickets) * 100);

  return (
    <div className="max-w-2xl mx-auto">
      <Link to={`/${orgSlug}`} className="text-sm hover:underline mb-4 inline-block" style={{ color: primaryColour }}>
        &larr; Back to all raffles
      </Link>

      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold mb-4">{raffle.title}</h2>

        {isDrawn && raffle.winners && raffle.winners.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-yellow-800 mb-2">Winners Announced!</h3>
            {raffle.winners.map((w) => (
              <div key={w.id} className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-yellow-700">#{w.prizeRank}</span>
                <span>{w.ticket?.buyerName}</span>
                <span className="text-gray-500">- Ticket {w.ticket?.ticketNumber}</span>
              </div>
            ))}
          </div>
        )}

        <p className="text-gray-700 mb-6 whitespace-pre-line">{raffle.description}</p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-2">Prizes</h3>
          <p className="text-gray-700 whitespace-pre-line">{raffle.prizeInfo}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold" style={{ color: primaryColour }}>
              £{raffle.ticketPrice.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">per ticket</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold" style={{ color: primaryColour }}>
              {remaining}
            </div>
            <div className="text-sm text-gray-500">tickets left</div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>{ticketsSold} of {raffle.maxTickets} sold</span>
            <span>{percentSold}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all"
              style={{ width: `${percentSold}%`, backgroundColor: primaryColour }}
            />
          </div>
        </div>

        <div className="text-gray-600 mb-6">
          Draw date: <strong>{new Date(raffle.drawDate).toLocaleDateString('en-GB', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
          })}</strong>
        </div>

        {isDrawn ? (
          <div className="bg-gray-100 text-gray-500 text-center py-3 rounded-md font-medium">
            This raffle has been drawn
          </div>
        ) : isSoldOut ? (
          <div className="bg-gray-100 text-gray-500 text-center py-3 rounded-md font-medium">
            Sold Out
          </div>
        ) : (
          <Link
            to={`/${orgSlug}/raffle/${raffle.id}/buy`}
            className="block text-center text-white py-3 rounded-md font-medium text-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: primaryColour }}
          >
            Buy Tickets
          </Link>
        )}
      </div>
    </div>
  );
}
