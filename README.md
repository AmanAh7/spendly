# Spendly

A premium, production-oriented personal finance and expense tracking web
application. Built as a single Next.js application — no separate backend.

> **Status:** Phase 1 — Project Foundation complete. Database, auth, and all
> feature modules land in subsequent phases. This README grows with every
> phase; treat it as a living document until the final security/QA phase.

## Tech Stack

| Layer      | Choice                                 |
| ---------- | -------------------------------------- |
| Framework  | Next.js 15 (App Router)                |
| Language   | TypeScript (strict)                    |
| Styling    | Tailwind CSS v4 (CSS-first config)     |
| UI         | shadcn/ui + Lucide React               |
| Animation  | Framer Motion                          |
| Database   | Neon PostgreSQL (Phase 2)              |
| ORM        | Prisma (Phase 2)                       |
| Auth       | Auth.js v5, Credentials only (Phase 3) |
| Forms      | React Hook Form + Zod (Phase 5+)       |
| Charts     | Recharts (Phase 11)                    |
| Email      | Resend (Phase 3)                       |
| PDF        | @react-pdf/renderer (Phase 12)         |
| Deployment | Vercel                                 |

## Requirements

- Node.js **20.11+**
- npm 10+
- A free [Neon](https://neon.tech) PostgreSQL project (added in Phase 2)

## Getting Started (Phase 1)

1. Create your project folder and place every file from this phase at the
   exact paths shown (no `src/` prefix — `app/`, `components/`, `lib/` sit
   at the project root).
2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the dev server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000). You should see a
   glassmorphic "Spendly" placeholder card with a working theme toggle
   (Light → Dark → System, persisted via `next-themes`).

## Environment Variables

Copy `.env.example` to `.env` (not committed). Phase 1 does not consume any
variables yet — `DATABASE_URL`, `AUTH_SECRET`, `RESEND_API_KEY`, and
`RESEND_FROM_EMAIL` will be wired up in Phases 2–3.

## Project Structure (so far)
