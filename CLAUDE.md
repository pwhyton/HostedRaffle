# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RaffleTickets is a multi-tenant raffle management platform built as a monorepo with three packages:
- **backend**: Express.js REST API with Prisma ORM
- **frontend**: React SPA with Vite, TailwindCSS, and React Router
- **shared**: Shared TypeScript types and Zod validation schemas

## Development Commands

### Local Development
```bash
# Run both frontend and backend in development mode
npm run dev

# Run individual packages
npm run dev -w packages/backend   # Backend only (runs on port 3001)
npm run dev -w packages/frontend  # Frontend only (Vite dev server)
```

### Building
```bash
# Build all packages (builds shared → backend → frontend in order)
npm run build

# Build individual packages
npm run build -w packages/shared
npm run build -w packages/backend
npm run build -w packages/frontend
```

### Database Operations
```bash
# Push schema changes to database (development)
npm run db:push

# Create and run migrations (production-ready)
npm run db:migrate

# Seed the database with sample data
npm run seed
```

### Backend-Specific Commands
```bash
# From packages/backend directory or use -w flag
tsx watch src/server.ts           # Development with hot reload
tsc                                # Compile TypeScript
node dist/server.js                # Run compiled code
prisma db push                     # Push schema to database
prisma migrate dev                 # Create migration
tsx prisma/seed.ts                 # Run seed script
```

### Frontend-Specific Commands
```bash
# From packages/frontend directory or use -w flag
vite                               # Development server
tsc -b && vite build              # Type check and build
vite preview                       # Preview production build
```

## Architecture

### Multi-Tenant System

The application uses organization-based multi-tenancy:

- **Public Routes** (`/:orgSlug`): Each organization has a unique slug. Public users access raffles via `/{orgSlug}/raffle/{raffleId}`.
- **Tenant Scoping**: The `tenantScope` middleware (packages/backend/src/middleware/tenantScope.ts:15) automatically restricts data access based on the authenticated user's organisation.
- **Super Admin Override**: Super admins can access any organization's data via `?organisationId=xxx` query parameter.

### Authentication & Authorization

- **JWT-based authentication** using the `jose` library (packages/backend/src/utils/jwt.ts)
- **Middleware chain**: `authenticate` → `requireRole(['role'])` → `tenantScope` for protected routes
- **Roles**: `super_admin` (platform-wide access) and `org_admin` (organization-scoped access)
- **Frontend**: Token stored in localStorage, AuthContext (packages/frontend/src/context/AuthContext.tsx:13) provides auth state globally

### Database

- **Prisma ORM** with SQLite locally, Turso (LibSQL) in production
- **Dual database support** in packages/backend/src/db.ts:5 - automatically uses Turso adapter if `TURSO_DATABASE_URL` is set
- **Schema location**: packages/backend/prisma/schema.prisma
- **Key models**: Organisation, User, Raffle, Ticket, Winner, Setting

### API Structure

Backend routes are organized by access level:
- `/api/public/*` - Public raffle browsing and ticket purchasing (packages/backend/src/routes/public.ts)
- `/api/auth/*` - Login and user management (packages/backend/src/routes/auth.ts)
- `/api/dashboard/*` - Org admin raffle management (packages/backend/src/routes/dashboard.ts)
- `/api/admin/*` - Super admin organization management (packages/backend/src/routes/admin.ts)

Services layer (packages/backend/src/services/) handles business logic:
- `raffleService.ts` - Raffle CRUD operations
- `ticketService.ts` - Ticket purchasing and management
- `drawService.ts` - Winner selection logic
- `orgService.ts` - Organization management
- `userService.ts` - User management
- `settingService.ts` - Platform settings

### Frontend Structure

- **React Router v7** with nested layouts (packages/frontend/src/App.tsx:44)
- **Three layout types**: PublicLayout (org-branded), DashboardLayout (org admin), AdminLayout (super admin)
- **API client** (packages/frontend/src/api/client.ts:1) - Centralized fetch wrapper with automatic auth header injection
- **TanStack Query** for server state management (configured in App.tsx:31)
- **Form handling** via react-hook-form with Zod validation

### Shared Package

The `@raffle/shared` package exports TypeScript types and Zod schemas used by both frontend and backend:
- Ensures type safety across client-server boundary
- Imported directly as source (packages/shared/src/index.ts) - no build step needed
- Includes validation schemas for API request/response bodies

## Deployment

Configured for Vercel deployment (vercel.json):
- **Build command**: Generates Prisma client, then builds frontend
- **Output**: packages/frontend/dist (static SPA)
- **API routes**: Served by Express backend, rewrites configured to proxy `/api/*` requests
- **Database**: Uses Turso (edge-hosted LibSQL) via `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` environment variables

## Important Patterns

### Adding a New API Endpoint

1. Define request/response types in `packages/shared/src/types/`
2. Add Zod validation schema in `packages/shared/src/validation/`
3. Create service function in appropriate `packages/backend/src/services/*` file
4. Add route handler in `packages/backend/src/routes/*` with middleware chain
5. Add API method to `packages/frontend/src/api/endpoints.ts`

### Working with Multi-Tenancy

- Always use `tenantScope` middleware for org-scoped routes in packages/backend/src/routes/dashboard.ts
- Access the scoped org ID via `req.organisationId` (set by middleware)
- Filter all queries by organisationId to prevent cross-tenant data leaks
- Public routes accept `:orgSlug` param and look up org via slug (packages/backend/src/routes/public.ts)

### Database Schema Changes

1. Modify `packages/backend/prisma/schema.prisma`
2. Run `npm run db:push` for quick dev changes OR `npm run db:migrate` to create a migration
3. Prisma Client types auto-generate on push/migrate
4. Update seed script if needed (packages/backend/prisma/seed.ts)
