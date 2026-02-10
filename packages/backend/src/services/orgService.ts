import { prisma } from '../db.js';
import type { CreateOrganisationInput, UpdateOrganisationInput } from '@raffle/shared';

export async function getAllOrganisations() {
  return prisma.organisation.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { raffles: true, users: true } } },
  });
}

export async function getOrganisationById(id: string) {
  return prisma.organisation.findUnique({ where: { id } });
}

export async function getOrganisationBySlug(slug: string) {
  return prisma.organisation.findUnique({ where: { slug } });
}

export async function createOrganisation(data: CreateOrganisationInput) {
  return prisma.organisation.create({
    data: {
      name: data.name,
      slug: data.slug,
      logoUrl: data.logoUrl ?? null,
      primaryColour: data.primaryColour ?? '#4F46E5',
      secondaryColour: data.secondaryColour ?? '#10B981',
      customText: data.customText ? JSON.stringify(data.customText) : null,
    },
  });
}

export async function updateOrganisation(id: string, data: UpdateOrganisationInput) {
  const updateData: Record<string, unknown> = { ...data };
  if (data.customText !== undefined) {
    updateData.customText = data.customText ? JSON.stringify(data.customText) : null;
  }
  return prisma.organisation.update({ where: { id }, data: updateData });
}

export async function deleteOrganisation(id: string) {
  return prisma.organisation.delete({ where: { id } });
}
