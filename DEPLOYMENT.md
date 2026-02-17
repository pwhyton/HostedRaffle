# Deploying Raffle Tickets to Vercel

## Prerequisites

The codebase is already configured for Vercel deployment:
- `api/index.ts` — serverless entry point that wraps the Express app
- `vercel.json` — build config, output directory, and URL rewrites
- `packages/backend/src/db.ts` — automatically uses Turso when env vars are set, otherwise local SQLite

You just need to set up the infrastructure.

---

## Step 1: Create a Turso Database

Turso is a cloud-hosted SQLite-compatible database (Vercel has no persistent filesystem, so the local `dev.db` won't work there).

1. Sign up at [turso.tech](https://turso.tech)
2. Create a database from the **Turso dashboard** or using the CLI:

   **Option A — Web Dashboard (recommended for Windows):**
   - Go to your Turso dashboard and create a new database named `raffle-tickets`
   - Copy the **Database URL** (e.g. `libsql://raffle-tickets-yourname.turso.io`)
   - Generate an **Auth Token** from the database settings and copy it

   **Option B — Turso CLI (macOS / Linux only):**
   ```bash
   # Install (macOS)
   brew install tursodatabase/tap/turso

   # Install (Linux)
   curl -sSfL https://get.tur.so/install.sh | bash

   # Log in and create the database
   turso auth login
   turso db create raffle-tickets

   # Get connection URL and auth token
   turso db show raffle-tickets --url
   turso db tokens create raffle-tickets
   ```

   > **Note:** The Turso CLI does not have a native Windows build. On Windows, use the web dashboard or run the CLI through WSL.

## Step 2: Push Schema & Seed Data to Turso

Set the Turso env vars in `packages/backend/.env` (uncomment and fill in the values):

```
TURSO_DATABASE_URL="libsql://raffle-tickets-yourname.turso.io"
TURSO_AUTH_TOKEN="your-token"
```

Then push the Prisma schema and seed the database:

```bash
npx prisma db push --schema=packages/backend/prisma/schema.prisma
npm run seed -w packages/backend
```

Verify the data is in Turso:

```bash
# Using the CLI (macOS/Linux)
turso db shell raffle-tickets "SELECT * FROM User;"

# Or test via the API
curl https://your-app.vercel.app/api/public/springfield-school
```

Once confirmed, you can comment the Turso env vars back out in `.env` so local dev continues using the SQLite file.

## Step 3: Push Code to GitHub

If not already in a GitHub repo:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-user/raffle-tickets.git
git push -u origin main
```

## Step 4: Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository** and select your repo
3. Configure the project:
   - **Framework Preset:** Other
   - **Root Directory:** Leave as `/` (project root)
4. Add **Environment Variables**:

   | Variable | Value |
   |----------|-------|
   | `TURSO_DATABASE_URL` | `libsql://raffle-tickets-yourname.turso.io` |
   | `TURSO_AUTH_TOKEN` | Your Turso auth token |
   | `JWT_SECRET` | A strong random secret (generate with `openssl rand -hex 32`) |

5. Click **Deploy**

Vercel will automatically:
- Run `prisma generate` and build the frontend (per `vercel.json` buildCommand)
- Serve the frontend SPA from `packages/frontend/dist`
- Route `/api/*` requests to the serverless function in `api/index.ts`

## Step 5: Verify

Once deployed, Vercel will give you a URL like `https://raffle-tickets-xxx.vercel.app`. Test:

- **Frontend:** `https://your-app.vercel.app/` — should load the SPA
- **Public raffle page:** `https://your-app.vercel.app/springfield-school`
- **Admin login:** `https://your-app.vercel.app/login`
- **API endpoint:** `https://your-app.vercel.app/api/public/springfield-school`

---

## Local Development

No changes needed — `npm run dev` still uses the local SQLite file (`dev.db`) as long as the `TURSO_DATABASE_URL` env var is not set.

## Redeploying

Push to your `main` branch on GitHub and Vercel will automatically redeploy. To update the Turso database schema after Prisma model changes:

```bash
# Set TURSO env vars, then:
npx prisma db push --schema=packages/backend/prisma/schema.prisma
```
