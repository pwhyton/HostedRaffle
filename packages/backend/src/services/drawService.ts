import { prisma } from '../db.js';
import { secureDrawWinners } from '../utils/draw.js';

export async function runDraw(raffleId: string, organisationId: string, numberOfWinners: number) {
  return prisma.$transaction(async (tx) => {
    const raffle = await tx.raffle.findFirst({
      where: { id: raffleId, organisationId },
      include: { tickets: true, winners: true },
    });

    if (!raffle) throw new Error('Not found');
    if (raffle.status !== 'active') throw new Error('Raffle must be active to draw');
    if (raffle.winners.length > 0) throw new Error('Draw has already been performed');
    if (raffle.tickets.length === 0) throw new Error('No tickets sold');
    if (numberOfWinners > raffle.tickets.length) {
      throw new Error(`Cannot draw ${numberOfWinners} winners from ${raffle.tickets.length} tickets`);
    }

    const winningTickets = secureDrawWinners(raffle.tickets, numberOfWinners);

    const winners = [];
    for (let i = 0; i < winningTickets.length; i++) {
      const winner = await tx.winner.create({
        data: {
          raffleId,
          ticketId: winningTickets[i].id,
          prizeRank: i + 1,
        },
        include: { ticket: true },
      });
      winners.push(winner);
    }

    // Update raffle status
    await tx.raffle.update({
      where: { id: raffleId },
      data: { status: 'drawn' },
    });

    return winners;
  });
}

export async function getWinners(raffleId: string) {
  return prisma.winner.findMany({
    where: { raffleId },
    include: { ticket: true },
    orderBy: { prizeRank: 'asc' },
  });
}
