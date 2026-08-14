# Paradise Christian School — Report Card System

Staff register for adding learners, entering marks, and printing official academic progress reports.

- **Next.js** on Vercel
- **Neon** Postgres (`DATABASE_URL`)
- Default working period: **2026 · Term 2**
- Add / edit students and subjects in modals
- Report cards print on a standalone sheet — no averages
- Optional DeepSeek drafts for character remarks and the teacher comment

## Local

```bash
docker compose up -d
cp .env.example .env
npm install
npm run db:init
npm run dev
```

Open http://localhost:3000  
Login: `admin` / `admin123`

## Vercel + Neon

1. Create a Neon project and copy the **pooled** connection string.
2. Import the repo into Vercel.
3. Set environment variables (Vercel only — never commit them):
   - `DATABASE_URL` — Neon pooled URL (`?sslmode=require`)
   - `AUTH_SECRET` — a long random string
   - `DEEPSEEK_API_KEY` — DeepSeek key for comment drafts
4. After the first deploy, tables and the sample learner are created automatically on first visit. Or run `DATABASE_URL=... npm run db:init` locally against Neon.

Change the admin password in Registry after the first login.
