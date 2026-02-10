import { Router, Request, Response, NextFunction } from 'express';
import { createOrganisationSchema, updateOrganisationSchema, createUserSchema, updateUserSchema, updateSettingSchema } from '@raffle/shared';
import { authenticate, requireRole } from '../middleware/auth.js';
import * as orgService from '../services/orgService.js';
import * as userService from '../services/userService.js';
import * as settingService from '../services/settingService.js';

const router = Router();

// All admin routes require super_admin
router.use(authenticate, requireRole('super_admin'));

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

// === Organisations ===
router.get('/organisations', asyncHandler(async (_req, res) => {
  const orgs = await orgService.getAllOrganisations();
  // Parse customText JSON for each org
  const parsed = orgs.map((o) => ({
    ...o,
    customText: o.customText ? JSON.parse(o.customText) : null,
  }));
  res.json(parsed);
}));

router.get('/organisations/:id', asyncHandler(async (req, res) => {
  const org = await orgService.getOrganisationById(req.params.id);
  if (!org) {
    res.status(404).json({ error: 'Organisation not found' });
    return;
  }
  res.json({
    ...org,
    customText: org.customText ? JSON.parse(org.customText) : null,
  });
}));

router.post('/organisations', asyncHandler(async (req, res) => {
  const data = createOrganisationSchema.parse(req.body);
  const org = await orgService.createOrganisation(data);
  res.status(201).json(org);
}));

router.put('/organisations/:id', asyncHandler(async (req, res) => {
  const data = updateOrganisationSchema.parse(req.body);
  try {
    const org = await orgService.updateOrganisation(req.params.id, data);
    res.json(org);
  } catch {
    res.status(404).json({ error: 'Organisation not found' });
  }
}));

router.delete('/organisations/:id', asyncHandler(async (req, res) => {
  try {
    await orgService.deleteOrganisation(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(400).json({ error: 'Cannot delete organisation' });
  }
}));

// === Users ===
router.get('/users', asyncHandler(async (_req, res) => {
  const users = await userService.getAllUsers();
  res.json(users);
}));

router.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json(user);
}));

router.post('/users', asyncHandler(async (req, res) => {
  const data = createUserSchema.parse(req.body);
  try {
    const user = await userService.createUser(data);
    res.status(201).json(user);
  } catch {
    res.status(400).json({ error: 'User creation failed (email may already exist)' });
  }
}));

router.put('/users/:id', asyncHandler(async (req, res) => {
  const data = updateUserSchema.parse(req.body);
  try {
    const user = await userService.updateUser(req.params.id, data);
    res.json(user);
  } catch {
    res.status(404).json({ error: 'User not found' });
  }
}));

router.delete('/users/:id', asyncHandler(async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(400).json({ error: 'Cannot delete user' });
  }
}));

// === Settings ===
router.get('/settings', asyncHandler(async (_req, res) => {
  const settings = await settingService.getAllSettings();
  res.json(settings);
}));

router.put('/settings', asyncHandler(async (req, res) => {
  const { key, value } = updateSettingSchema.parse(req.body);
  const setting = await settingService.upsertSetting(key, value);
  res.json(setting);
}));

router.delete('/settings/:key', asyncHandler(async (req, res) => {
  try {
    await settingService.deleteSetting(req.params.key);
    res.json({ success: true });
  } catch {
    res.status(404).json({ error: 'Setting not found' });
  }
}));

export default router;
