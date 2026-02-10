import { useState } from 'react';
import { Link, useParams, useOutletContext } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { buyTicketsSchema, type BuyTicketsInput, type Organisation, type Ticket } from '@raffle/shared';
import { publicApi } from '../../api/endpoints.js';

interface PublicContext {
  org: Organisation | undefined;
  primaryColour: string;
}

export default function BuyTicketsPage() {
  const { orgSlug, id } = useParams<{ orgSlug: string; id: string }>();
  const { primaryColour } = useOutletContext<PublicContext>();
  const [purchasedTickets, setPurchasedTickets] = useState<Ticket[] | null>(null);

  const { data: raffle } = useQuery({
    queryKey: ['raffle', orgSlug, id],
    queryFn: () => publicApi.getRaffle(orgSlug!, id!),
    enabled: !!orgSlug && !!id,
  });

  const { register, handleSubmit, watch, formState: { errors } } = useForm<BuyTicketsInput>({
    resolver: zodResolver(buyTicketsSchema),
    defaultValues: { quantity: 1 },
  });

  const quantity = watch('quantity');
  const totalPrice = (raffle?.ticketPrice ?? 0) * (quantity || 0);

  const buyMutation = useMutation({
    mutationFn: (data: BuyTicketsInput) => publicApi.buyTickets(orgSlug!, id!, data),
    onSuccess: (tickets) => setPurchasedTickets(tickets),
  });

  if (purchasedTickets) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-5xl mb-4">🎟️</div>
          <h2 className="text-2xl font-bold mb-2">Tickets Purchased!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your purchase. Your ticket numbers are:
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {purchasedTickets.map((t) => (
              <span
                key={t.id}
                className="inline-block text-white font-mono font-bold px-4 py-2 rounded-lg text-lg"
                style={{ backgroundColor: primaryColour }}
              >
                #{t.ticketNumber}
              </span>
            ))}
          </div>

          <p className="text-sm text-gray-500 mb-6">
            A confirmation has been sent to your email. You can also look up your tickets anytime.
          </p>

          <div className="flex gap-3 justify-center">
            <Link
              to={`/${orgSlug}/raffle/${id}`}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Back to Raffle
            </Link>
            <Link
              to={`/${orgSlug}/my-tickets`}
              className="px-4 py-2 text-white rounded-md hover:opacity-90"
              style={{ backgroundColor: primaryColour }}
            >
              View My Tickets
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!raffle) return <div className="text-center py-12">Loading...</div>;

  const remaining = raffle.maxTickets - (raffle._count?.tickets ?? 0);

  return (
    <div className="max-w-lg mx-auto">
      <Link to={`/${orgSlug}/raffle/${id}`} className="text-sm hover:underline mb-4 inline-block" style={{ color: primaryColour }}>
        &larr; Back to raffle details
      </Link>

      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-2">Buy Tickets</h2>
        <p className="text-gray-600 mb-6">{raffle.title}</p>

        {buyMutation.error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
            {(buyMutation.error as Error).message}
          </div>
        )}

        <form onSubmit={handleSubmit((data) => buyMutation.mutate(data))} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <input
              {...register('buyerName')}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your full name"
            />
            {errors.buyerName && <p className="text-red-500 text-sm mt-1">{errors.buyerName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              {...register('buyerEmail')}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="your@email.com"
            />
            {errors.buyerEmail && <p className="text-red-500 text-sm mt-1">{errors.buyerEmail.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Tickets (max {Math.min(50, remaining)})
            </label>
            <input
              type="number"
              {...register('quantity', { valueAsNumber: true })}
              min={1}
              max={Math.min(50, remaining)}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity.message}</p>}
          </div>

          <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
            <span className="text-gray-700">Total:</span>
            <span className="text-2xl font-bold" style={{ color: primaryColour }}>
              £{totalPrice.toFixed(2)}
            </span>
          </div>

          <button
            type="submit"
            disabled={buyMutation.isPending}
            className="w-full text-white py-3 rounded-md font-medium text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ backgroundColor: primaryColour }}
          >
            {buyMutation.isPending ? 'Processing...' : `Buy ${quantity || 0} Ticket${(quantity || 0) !== 1 ? 's' : ''}`}
          </button>
        </form>
      </div>
    </div>
  );
}
