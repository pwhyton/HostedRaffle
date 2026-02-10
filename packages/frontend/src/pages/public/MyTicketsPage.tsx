import { useState } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../../api/endpoints.js';
import type { Organisation } from '@raffle/shared';

interface PublicContext {
  org: Organisation | undefined;
  primaryColour: string;
}

export default function MyTicketsPage() {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const { primaryColour } = useOutletContext<PublicContext>();
  const [email, setEmail] = useState('');
  const [searchEmail, setSearchEmail] = useState('');

  const { data: tickets, isLoading, error } = useQuery({
    queryKey: ['my-tickets', orgSlug, searchEmail],
    queryFn: () => publicApi.lookupTickets(orgSlug!, searchEmail),
    enabled: !!searchEmail && !!orgSlug,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) setSearchEmail(email.trim());
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">My Tickets</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enter the email address you used when purchasing tickets
        </label>
        <div className="flex gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="your@email.com"
            required
          />
          <button
            type="submit"
            className="text-white px-6 py-2 rounded-md hover:opacity-90"
            style={{ backgroundColor: primaryColour }}
          >
            Search
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
          Failed to look up tickets. Please check your email and try again.
        </div>
      )}

      {isLoading && <div className="text-center py-8 text-gray-500">Searching...</div>}

      {tickets && !tickets.length && (
        <div className="text-center py-8 text-gray-500">
          No tickets found for {searchEmail}
        </div>
      )}

      {tickets && tickets.length > 0 && (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{ticket.raffle?.title}</div>
                <div className="text-sm text-gray-500">
                  {ticket.raffle?.status === 'drawn' ? 'Draw completed' : `Draw: ${new Date(ticket.raffle?.drawDate || '').toLocaleDateString('en-GB')}`}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="font-mono font-bold text-white px-3 py-1 rounded"
                  style={{ backgroundColor: primaryColour }}
                >
                  #{ticket.ticketNumber}
                </span>
                {ticket.winner && (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-semibold">
                    Winner #{ticket.winner.prizeRank}!
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
