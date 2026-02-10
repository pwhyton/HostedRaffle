export type RaffleStatus = 'draft' | 'active' | 'drawn' | 'cancelled';
export type UserRole = 'super_admin' | 'org_admin';

export interface Organisation {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  primaryColour: string;
  secondaryColour: string;
  customText: Record<string, string> | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organisationId: string | null;
  organisation?: Organisation;
  createdAt: string;
}

export interface Raffle {
  id: string;
  organisationId: string;
  title: string;
  description: string;
  prizeInfo: string;
  ticketPrice: number;
  maxTickets: number;
  drawDate: string;
  status: RaffleStatus;
  organisation?: Organisation;
  tickets?: Ticket[];
  winners?: Winner[];
  _count?: { tickets: number };
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  raffleId: string;
  ticketNumber: string;
  buyerName: string;
  buyerEmail: string;
  raffle?: Raffle;
  winner?: Winner | null;
  createdAt: string;
}

export interface Winner {
  id: string;
  raffleId: string;
  ticketId: string;
  prizeRank: number;
  ticket?: Ticket;
  raffle?: Raffle;
  createdAt: string;
}

export interface Setting {
  key: string;
  value: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'createdAt'>;
}

export interface DashboardStats {
  totalRaffles: number;
  activeRaffles: number;
  totalTicketsSold: number;
  totalRevenue: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
