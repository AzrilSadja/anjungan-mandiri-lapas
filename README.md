# Anjungan Mandiri (Next.js)

Migrasi Laravel -> Next.js App Router + TypeScript.

## Production Ready (Vercel)

### 1) Buat database
- Di Vercel Dashboard: `Storage` -> `Create` -> `Postgres`.
- Ambil connection string dan set ke env `DATABASE_URL`.

### 2) Set Environment Variables (Vercel Project)
- `DATABASE_URL`
- `AUTH_SECRET` (minimal 16 karakter)
- `NEXT_PUBLIC_APP_URL` (contoh: `https://app-kamu.vercel.app`)
- `NEXT_PUBLIC_API_URL` (isi sama dengan URL app production)
- `NEXT_PUBLIC_MONITOR_YOUTUBE_ID` (opsional)
- `FILESYSTEM_DISK` (`local` atau `s3`)
- Jika `s3`, isi juga `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION`, `AWS_BUCKET`, `AWS_ENDPOINT` (opsional), `AWS_URL` (opsional), `AWS_USE_PATH_STYLE_ENDPOINT`

### 3) Prisma migrate di Vercel
Set Build Command di Vercel:

```bash
npx prisma migrate deploy && next build
```

### 4) Deploy
```bash
vercel
vercel --prod
```

## Local Development

```bash
cp .env.local.example .env.local
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

## Queue Architecture (Production)

- Data antrean tidak lagi hanya `localStorage`.
- Sumber data utama ada di Postgres (`queue_state`, `queue_tickets`).
- Endpoint:
  - `GET /api/queue/state`
  - `POST /api/queue/issue`
  - `POST /api/queue/call`
  - `POST /api/queue/reset`
- Reset harian otomatis server-side jam `01:00` WIB (sesuai Laravel).
