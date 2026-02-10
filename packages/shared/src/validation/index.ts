import { z } from 'zod';

// Auth
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Organisation
export const createOrganisationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  logoUrl: z.string().url().nullable().optional(),
  primaryColour: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex colour').default('#4F46E5'),
  secondaryColour: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex colour').default('#10B981'),
  customText: z.record(z.string()).nullable().optional(),
});

export const updateOrganisationSchema = createOrganisationSchema.partial();

// Raffle
export const createRaffleSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  prizeInfo: z.string().min(3, 'Prize info is required'),
  ticketPrice: z.number().min(0, 'Price cannot be negative').max(10000),
  maxTickets: z.number().int().min(1, 'Must have at least 1 ticket').max(100000),
  drawDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
});

export const updateRaffleSchema = createRaffleSchema.partial().extend({
  status: z.enum(['draft', 'active', 'drawn', 'cancelled']).optional(),
});

// Ticket purchase
export const buyTicketsSchema = z.object({
  buyerName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  buyerEmail: z.string().email('Invalid email address'),
  quantity: z.number().int().min(1, 'Must buy at least 1 ticket').max(50, 'Maximum 50 tickets per purchase'),
});

// Ticket lookup
export const ticketLookupSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Draw
export const drawSchema = z.object({
  numberOfWinners: z.number().int().min(1, 'Must draw at least 1 winner').max(100),
});

// User management
export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  role: z.enum(['super_admin', 'org_admin']),
  organisationId: z.string().optional(),
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true }).extend({
  password: z.string().min(6).optional(),
});

// Settings
export const updateSettingSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
});

// Type exports from schemas
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateOrganisationInput = z.infer<typeof createOrganisationSchema>;
export type UpdateOrganisationInput = z.infer<typeof updateOrganisationSchema>;
export type CreateRaffleInput = z.infer<typeof createRaffleSchema>;
export type UpdateRaffleInput = z.infer<typeof updateRaffleSchema>;
export type BuyTicketsInput = z.infer<typeof buyTicketsSchema>;
export type TicketLookupInput = z.infer<typeof ticketLookupSchema>;
export type DrawInput = z.infer<typeof drawSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateSettingInput = z.infer<typeof updateSettingSchema>;
