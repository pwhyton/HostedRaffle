import { Router, Request, Response, NextFunction } from 'express';
import { createRaffleSchema, updateRaffleSchema, drawSchema } from '@raffle/shared';
import { authenticate, requireRole } from '../middleware/auth.js';
import { tenantScope } from '../middleware/tenantScope.js';
import * as raffleService from '../services/raffleService.js';
import * as ticketService from '../services/ticketService.js';
import * as drawService from '../services/drawService.js';

const router = Router();

// All dashboard routes require org_admin or super_admin
router.use(authenticate, requireRole('org_admin', 'super_admin'), tenantScope);

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

// Dashboard stats
router.get('/stats', asyncHandler(async (req, res) => {
  if (!req.organisationId) {
    res.status(400).json({ error: 'Organisation scope required' });
    return;
  }
  const stats = await raffleService.getDashboardStats(req.organisationId);
  res.json(stats);
}));

// List raffles (all statuses)
router.get('/raffles', asyncHandler(async (req, res) => {
  if (!req.organisationId) {
    res.status(400).json({ error: 'Organisation scope required' });
    return;
  }
  const raffles = await raffleService.getRafflesByOrg(req.organisationId);
  res.json(raffles);
}));

// Get single raffle
router.get('/raffles/:id', asyncHandler(async (req, res) => {
  const raffle = await raffleService.getRaffleById(req.params.id, req.organisationId);
  if (!raffle) {
    res.status(404).json({ error: 'Raffle not found' });
    return;
  }
  res.json(raffle);
}));

// Create raffle
router.post('/raffles', asyncHandler(async (req, res) => {
  if (!req.organisationId) {
    res.status(400).json({ error: 'Organisation scope required' });
    return;
  }
  const data = createRaffleSchema.parse(req.body);
  const raffle = await raffleService.createRaffle(req.organisationId, data);
  res.status(201).json(raffle);
}));

// Update raffle
router.put('/raffles/:id', asyncHandler(async (req, res) => {
  if (!req.organisationId) {
    res.status(400).json({ error: 'Organisation scope required' });
    return;
  }
  const data = updateRaffleSchema.parse(req.body);
  try {
    const raffle = await raffleService.updateRaffle(req.params.id, req.organisationId, data);
    res.json(raffle);
  } catch {
    res.status(404).json({ error: 'Raffle not found' });
  }
}));

// Delete raffle
router.delete('/raffles/:id', asyncHandler(async (req, res) => {
  if (!req.organisationId) {
    res.status(400).json({ error: 'Organisation scope required' });
    return;
  }
  try {
    await raffleService.deleteRaffle(req.params.id, req.organisationId);
    res.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Delete failed';
    res.status(400).json({ error: message });
  }
}));

// Get tickets for a raffle
router.get('/raffles/:id/tickets', asyncHandler(async (req, res) => {
  const raffle = await raffleService.getRaffleById(req.params.id, req.organisationId);
  if (!raffle) {
    res.status(404).json({ error: 'Raffle not found' });
    return;
  }
  const tickets = await ticketService.getTicketsByRaffle(raffle.id);
  res.json(tickets);
}));

// Run draw
router.post('/raffles/:id/draw', asyncHandler(async (req, res) => {
  if (!req.organisationId) {
    res.status(400).json({ error: 'Organisation scope required' });
    return;
  }
  const { numberOfWinners } = drawSchema.parse(req.body);
  try {
    const winners = await drawService.runDraw(req.params.id, req.organisationId, numberOfWinners);
    res.json(winners);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Draw failed';
    res.status(400).json({ error: message });
  }
}));

// Get winners for a raffle
router.get('/raffles/:id/winners', asyncHandler(async (req, res) => {
  const raffle = await raffleService.getRaffleById(req.params.id, req.organisationId);
  if (!raffle) {
    res.status(404).json({ error: 'Raffle not found' });
    return;
  }
  const winners = await drawService.getWinners(raffle.id);
  res.json(winners);
}));

export default router;
