import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

if (process.env.TURSO_DATABASE_URL) {
  const { PrismaLibSQL } = await import('@prisma/adapter-libsql');

  const adapter = new PrismaLibSQL({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  prisma = new PrismaClient({ adapter });
} else {
  prisma = new PrismaClient();
}

export { prisma };
