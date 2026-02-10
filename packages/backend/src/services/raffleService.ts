import { prisma } from '../db.js';
import type { CreateRaffleInput, UpdateRaffleInput } from '@raffle/shared';

export async function getRafflesByOrg(organisationId: string) {
  return prisma.raffle.findMany({
    where: { organisationId },
    include: { _count: { select: { tickets: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getActiveRafflesByOrg(organisationId: string) {
  return prisma.raffle.findMany({
    where: { organisationId, status: 'active' },
    include: { _count: { select: { tickets: true } } },
    orderBy: { drawDate: 'asc' },
  });
}

export async function getRaffleById(id: string, organisationId?: string) {
  return prisma.raffle.findFirst({
    where: { id, ...(organisationId ? { organisationId } : {}) },
    include: {
      _count: { select: { tickets: true } },
      winners: { include: { ticket: true }, orderBy: { prizeRank: 'asc' } },
    },
  });
}

export async function createRaffle(organisationId: string, data: CreateRaffleInput) {
  return prisma.raffle.create({
    data: {
      organisationId,
      title: data.title,
      description: data.description,
      prizeInfo: data.prizeInfo,
      ticketPrice: data.ticketPrice,
      maxTickets: data.maxTickets,
      drawDate: new Date(data.drawDate),
      status: 'draft',
    },
  });
}

export async function updateRaffle(id: string, organisationId: string, data: UpdateRaffleInput) {
  const updateData: Record<string, unknown> = { ...data };
  if (data.drawDate) {
    updateData.drawDate = new Date(data.drawDate);
  }
  return prisma.raffle.update({
    where: { id, organisationId },
    data: updateData,
  });
}

export async function deleteRaffle(id: string, organisationId: string) {
  // Only allow deleting draft raffles
  const raffle = await prisma.raffle.findFirst({ where: { id, organisationId } });
  if (!raffle) throw new Error('Not found');
  if (raffle.status !== 'draft') throw new Error('Can only delete draft raffles');
  return prisma.raffle.delete({ where: { id } });
}

export async function getDashboardStats(organisationId: string) {
  const [totalRaffles, activeRaffles, ticketData] = await Promise.all([
    prisma.raffle.count({ where: { organisationId } }),
    prisma.raffle.count({ where: { organisationId, status: 'active' } }),
    prisma.ticket.findMany({
      where: { raffle: { organisationId } },
      include: { raffle: { select: { ticketPrice: true } } },
    }),
  ]);

  const totalTicketsSold = ticketData.length;
  const totalRevenue = ticketData.reduce((sum, t) => sum + t.raffle.ticketPrice, 0);

  return { totalRaffles, activeRaffles, totalTicketsSold, totalRevenue };
}
