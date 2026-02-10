import { api } from './client.js';
import type {
  Organisation, Raffle, Ticket, Winner, AuthResponse,
  DashboardStats, Setting, User,
  LoginInput, CreateOrganisationInput, UpdateOrganisationInput,
  CreateRaffleInput, UpdateRaffleInput, BuyTicketsInput,
  DrawInput, CreateUserInput, UpdateUserInput, UpdateSettingInput,
} from '@raffle/shared';

// Public
export const publicApi = {
  getOrg: (slug: string) => api.get<Organisation>(`/public/${slug}`),
  getRaffles: (slug: string) => api.get<Raffle[]>(`/public/${slug}/raffles`),
  getRaffle: (slug: string, id: string) => api.get<Raffle>(`/public/${slug}/raffles/${id}`),
  buyTickets: (slug: string, id: string, data: BuyTicketsInput) =>
    api.post<Ticket[]>(`/public/${slug}/raffles/${id}/buy`, data),
  lookupTickets: (slug: string, email: string) =>
    api.get<Ticket[]>(`/public/${slug}/tickets?email=${encodeURIComponent(email)}`),
};

// Auth
export const authApi = {
  login: (data: LoginInput) => api.post<AuthResponse>('/auth/login', data),
  me: () => api.get<User>('/auth/me'),
};

// Dashboard
export const dashboardApi = {
  getStats: () => api.get<DashboardStats>('/dashboard/stats'),
  getRaffles: () => api.get<Raffle[]>('/dashboard/raffles'),
  getRaffle: (id: string) => api.get<Raffle>(`/dashboard/raffles/${id}`),
  createRaffle: (data: CreateRaffleInput) => api.post<Raffle>('/dashboard/raffles', data),
  updateRaffle: (id: string, data: UpdateRaffleInput) => api.put<Raffle>(`/dashboard/raffles/${id}`, data),
  deleteRaffle: (id: string) => api.delete(`/dashboard/raffles/${id}`),
  getTickets: (raffleId: string) => api.get<Ticket[]>(`/dashboard/raffles/${raffleId}/tickets`),
  runDraw: (raffleId: string, data: DrawInput) => api.post<Winner[]>(`/dashboard/raffles/${raffleId}/draw`, data),
  getWinners: (raffleId: string) => api.get<Winner[]>(`/dashboard/raffles/${raffleId}/winners`),
};

// Admin
export const adminApi = {
  getOrganisations: () => api.get<Organisation[]>('/admin/organisations'),
  getOrganisation: (id: string) => api.get<Organisation>('/admin/organisations/' + id),
  createOrganisation: (data: CreateOrganisationInput) => api.post<Organisation>('/admin/organisations', data),
  updateOrganisation: (id: string, data: UpdateOrganisationInput) =>
    api.put<Organisation>(`/admin/organisations/${id}`, data),
  deleteOrganisation: (id: string) => api.delete(`/admin/organisations/${id}`),
  getUsers: () => api.get<User[]>('/admin/users'),
  createUser: (data: CreateUserInput) => api.post<User>('/admin/users', data),
  updateUser: (id: string, data: UpdateUserInput) => api.put<User>(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  getSettings: () => api.get<Setting[]>('/admin/settings'),
  updateSetting: (data: UpdateSettingInput) => api.put<Setting>('/admin/settings', data),
  deleteSetting: (key: string) => api.delete(`/admin/settings/${key}`),
};
