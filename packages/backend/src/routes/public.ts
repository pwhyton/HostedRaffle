import { Router, Request, Response, NextFunction } from 'express';
import { buyTicketsSchema, ticketLookupSchema } from '@raffle/shared';
import * as orgService from '../services/orgService.js';
import * as raffleService from '../services/raffleService.js';
import * as ticketService from '../services/ticketService.js';

const router = Router();

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

// Get organisation details by slug
router.get('/:orgSlug', asyncHandler(async (req, res) => {
  const org = await orgService.getOrganisationBySlug(req.params.orgSlug);
  if (!org) {
    res.status(404).json({ error: 'Organisation not found' });
    return;
  }
  res.json({
    ...org,
    customText: org.customText ? JSON.parse(org.customText) : null,
  });
}));

// Get active raffles for an organisation
router.get('/:orgSlug/raffles', asyncHandler(async (req, res) => {
  const org = await orgService.getOrganisationBySlug(req.params.orgSlug);
  if (!org) {
    res.status(404).json({ error: 'Organisation not found' });
    return;
  }
  const raffles = await raffleService.getActiveRafflesByOrg(org.id);
  res.json(raffles);
}));

// Get raffle details
router.get('/:orgSlug/raffles/:id', asyncHandler(async (req, res) => {
  const org = await orgService.getOrganisationBySlug(req.params.orgSlug);
  if (!org) {
    res.status(404).json({ error: 'Organisation not found' });
    return;
  }
  const raffle = await raffleService.getRaffleById(req.params.id, org.id);
  if (!raffle) {
    res.status(404).json({ error: 'Raffle not found' });
    return;
  }
  res.json(raffle);
}));

// Buy tickets
router.post('/:orgSlug/raffles/:id/buy', asyncHandler(async (req, res) => {
  const org = await orgService.getOrganisationBySlug(req.params.orgSlug);
  if (!org) {
    res.status(404).json({ error: 'Organisation not found' });
    return;
  }
  const data = buyTicketsSchema.parse(req.body);
  const raffle = await raffleService.getRaffleById(req.params.id, org.id);
  if (!raffle) {
    res.status(404).json({ error: 'Raffle not found' });
    return;
  }
  try {
    const tickets = await ticketService.buyTickets(raffle.id, data);
    res.status(201).json(tickets);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Purchase failed';
    res.status(400).json({ error: message });
  }
}));

// Lookup tickets by email
router.get('/:orgSlug/tickets', asyncHandler(async (req, res) => {
  const org = await orgService.getOrganisationBySlug(req.params.orgSlug);
  if (!org) {
    res.status(404).json({ error: 'Organisation not found' });
    return;
  }
  const { email } = ticketLookupSchema.parse({ email: req.query.email });
  const tickets = await ticketService.lookupTicketsByEmail(org.id, email);
  res.json(tickets);
}));

export default router;
