import { prisma } from '../db.js';
import { hashPassword } from '../utils/password.js';
import type { CreateUserInput, UpdateUserInput } from '@raffle/shared';

export async function getAllUsers() {
  return prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, organisationId: true, organisation: true, createdAt: true, updatedAt: true },
    orderBy: { name: 'asc' },
  });
}

export async function getUsersByOrg(organisationId: string) {
  return prisma.user.findMany({
    where: { organisationId },
    select: { id: true, email: true, name: true, role: true, organisationId: true, createdAt: true, updatedAt: true },
    orderBy: { name: 'asc' },
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true, organisationId: true, organisation: true, createdAt: true, updatedAt: true },
  });
}

export async function createUser(data: CreateUserInput) {
  const passwordHash = await hashPassword(data.password);
  return prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      name: data.name,
      role: data.role,
      organisationId: data.organisationId || null,
    },
    select: { id: true, email: true, name: true, role: true, organisationId: true, createdAt: true, updatedAt: true },
  });
}

export async function updateUser(id: string, data: UpdateUserInput) {
  const updateData: Record<string, unknown> = {
    ...(data.email && { email: data.email }),
    ...(data.name && { name: data.name }),
    ...(data.role && { role: data.role }),
    ...(data.organisationId !== undefined && { organisationId: data.organisationId || null }),
  };

  if (data.password) {
    updateData.passwordHash = await hashPassword(data.password);
  }

  return prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, email: true, name: true, role: true, organisationId: true, createdAt: true, updatedAt: true },
  });
}

export async function deleteUser(id: string) {
  return prisma.user.delete({ where: { id } });
}
