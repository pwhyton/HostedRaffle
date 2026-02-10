import { Link, useParams, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../../api/endpoints.js';
import type { Organisation, Raffle } from '@raffle/shared';

interface PublicContext {
  org: Organisation | undefined;
  primaryColour: string;
  secondaryColour: string;
}

export default function RaffleListPage() {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const { org, primaryColour } = useOutletContext<PublicContext>();

  const { data: raffles, isLoading } = useQuery({
    queryKey: ['raffles', orgSlug],
    queryFn: () => publicApi.getRaffles(orgSlug!),
    enabled: !!orgSlug,
  });

  const customText = org?.customText as Record<string, string> | null;

  return (
    <div>
      {customText?.welcomeTitle && (
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2">{customText.welcomeTitle}</h2>
          {customText.welcomeMessage && (
            <p className="text-gray-600 text-lg">{customText.welcomeMessage}</p>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading raffles...</div>
      ) : !raffles?.length ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No active raffles at the moment.</p>
          <p className="mt-2">Check back soon!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {raffles.map((raffle: Raffle) => {
            const ticketsSold = raffle._count?.tickets ?? 0;
            const remaining = raffle.maxTickets - ticketsSold;
            const percentSold = Math.round((ticketsSold / raffle.maxTickets) * 100);

            return (
              <Link
                key={raffle.id}
                to={`/${orgSlug}/raffle/${raffle.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{raffle.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{raffle.description}</p>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold" style={{ color: primaryColour }}>
                      £{raffle.ticketPrice.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500">
                      per ticket
                    </span>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>{ticketsSold} sold</span>
                      <span>{remaining} remaining</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${percentSold}%`, backgroundColor: primaryColour }}
                      />
                    </div>
                  </div>

                  <div className="text-sm text-gray-500">
                    Draw: {new Date(raffle.drawDate).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
