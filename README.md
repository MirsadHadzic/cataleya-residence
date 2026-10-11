# Cataleya Residence

Luxury apartment booking site for Cataleya Residence, Sarajevo.

## Stack

- Next.js 15
- PostgreSQL + Prisma
- Tailwind CSS
- Resend (booking emails)

## Local development

```bash
npm install
cp .env.example .env
# Edit .env with your database and API keys
npx prisma db push
npm run db:seed
npm run dev
```

Open http://localhost:3000 — admin panel at `/admin/login`.

## Deploy on Vercel

1. Push this repo to GitHub (images use **Git LFS**).
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. Add environment variables (same as `.env.example`):
   - `DATABASE_URL` — use [Supabase](https://supabase.com), [Neon](https://neon.tech), or Vercel Postgres
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL` — a sender address verified with Resend
   - `BOOKING_EMAIL`
   - `ADMIN_PASSWORD`
   - `SESSION_SECRET`
4. Build command: `prisma generate && next build` (or use the default `npm run build` with postinstall).
5. Initialize an empty production database once:
   ```bash
   npx prisma db push
   ```
   For an existing Cataleya database, update the apartment names, images, and nightly rates without deleting booking data:
   ```bash
   npm run db:update-apartments
   ```
   This sets President Suite (Cataleya 1) to €80/night, Lumiere (Cataleya 2) to €70/night, and Maison Noire (Cataleya 3) to €90/night.
   Do not run `db:seed` against a live database; it deletes existing reservations.

## Git LFS

Large images and videos are stored with Git LFS. Install [Git LFS](https://git-lfs.com/) before cloning:

```bash
git lfs install
git clone https://github.com/MirsadHadzic/cataleya-residence.git
```
