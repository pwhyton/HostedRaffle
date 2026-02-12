import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

if (process.env.TURSO_DATABASE_URL) {
  const { createClient } = await import('@libsql/client');
  const { PrismaLibSQL } = await import('@prisma/adapter-libsql');

  const libsql = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const adapter = new PrismaLibSQL(libsql);
  prisma = new PrismaClient({ adapter });
} else {
  prisma = new PrismaClient();
}

export { prisma };
