import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      organisationId?: string;
    }
  }
}

/**
 * Sets req.organisationId from the authenticated user's org.
 * Super admins can override via ?organisationId query param.
 */
export function tenantScope(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (req.user.role === 'super_admin') {
    // Super admins can scope to any org via query param
    const queryOrgId = req.query.organisationId as string | undefined;
    req.organisationId = queryOrgId || req.user.organisationId;
  } else {
    if (!req.user.organisationId) {
      res.status(403).json({ error: 'User not assigned to an organisation' });
      return;
    }
    req.organisationId = req.user.organisationId;
  }

  next();
}
