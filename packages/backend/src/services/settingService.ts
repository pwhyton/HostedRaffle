import { prisma } from '../db.js';

export async function getAllSettings() {
  return prisma.setting.findMany({ orderBy: { key: 'asc' } });
}

export async function getSetting(key: string) {
  return prisma.setting.findUnique({ where: { key } });
}

export async function upsertSetting(key: string, value: string) {
  return prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function deleteSetting(key: string) {
  return prisma.setting.delete({ where: { key } });
}
