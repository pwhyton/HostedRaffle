import { prisma } from '../db.js';
import type { BuyTicketsInput } from '@raffle/shared';

export async function buyTickets(raffleId: string, data: BuyTicketsInput) {
  return prisma.$transaction(async (tx) => {
    const raffle = await tx.raffle.findUnique({
      where: { id: raffleId },
      include: { _count: { select: { tickets: true } } },
    });

    if (!raffle) throw new Error('Not found');
    if (raffle.status !== 'active') throw new Error('Raffle is not active');

    const remaining = raffle.maxTickets - raffle._count.tickets;
    if (data.quantity > remaining) {
      throw new Error(`Only ${remaining} tickets remaining`);
    }

    // Get next ticket number
    const lastTicket = await tx.ticket.findFirst({
      where: { raffleId },
      orderBy: { ticketNumber: 'desc' },
    });
    const startNum = lastTicket ? parseInt(lastTicket.ticketNumber, 10) + 1 : 1;

    const tickets = [];
    for (let i = 0; i < data.quantity; i++) {
      const ticket = await tx.ticket.create({
        data: {
          raffleId,
          ticketNumber: String(startNum + i).padStart(5, '0'),
          buyerName: data.buyerName,
          buyerEmail: data.buyerEmail.toLowerCase(),
        },
      });
      tickets.push(ticket);
    }

    return tickets;
  });
}

export async function getTicketsByRaffle(raffleId: string) {
  return prisma.ticket.findMany({
    where: { raffleId },
    orderBy: { ticketNumber: 'asc' },
  });
}

export async function lookupTicketsByEmail(organisationId: string, email: string) {
  return prisma.ticket.findMany({
    where: {
      buyerEmail: email.toLowerCase(),
      raffle: { organisationId },
    },
    include: {
      raffle: { select: { title: true, status: true, drawDate: true } },
      winner: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}
