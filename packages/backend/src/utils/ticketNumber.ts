import { PrismaClient } from '@prisma/client';

export async function generateTicketNumbers(
  prisma: PrismaClient,
  raffleId: string,
  quantity: number
): Promise<string[]> {
  // Get the current highest ticket number in a transaction
  return prisma.$transaction(async (tx) => {
    const lastTicket = await tx.ticket.findFirst({
      where: { raffleId },
      orderBy: { ticketNumber: 'desc' },
    });

    const startNum = lastTicket ? parseInt(lastTicket.ticketNumber, 10) + 1 : 1;
    const numbers: string[] = [];

    for (let i = 0; i < quantity; i++) {
      numbers.push(String(startNum + i).padStart(5, '0'));
    }

    return numbers;
  });
}
