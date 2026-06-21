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
   - `BOOKING_EMAIL`
   - `ADMIN_PASSWORD`
   - `SESSION_SECRET`
4. Build command: `prisma generate && next build` (or use the default `npm run build` with postinstall).
5. After first deploy, run migrations against production:
   ```bash
   npx prisma db push
   npm run db:seed
   ```

## Git LFS

Large images and videos are stored with Git LFS. Install [Git LFS](https://git-lfs.com/) before cloning:

```bash
git lfs install
git clone https://github.com/MirsadHadzic/cataleya-residence.git
```
