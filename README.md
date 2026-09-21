# Car Rental SaaS

Simple, multi-tenant car rental management app: contracts, fleet, and income reports.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Prisma 7 + PostgreSQL (via `@prisma/adapter-pg`)

## Getting started

1. Copy `.env.example` to `.env` and set `DATABASE_URL` to a Postgres connection string.
2. Install dependencies: `npm install`
3. Apply migrations: `npx prisma migrate deploy`
4. Run the dev server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000).

## Data model

`Company` (tenant) → `User`, `Car`, `Client`, `Contract`, all scoped by `companyId`.

A database-level exclusion constraint (`prisma/migrations/*_car_no_overlap`) guarantees a car can never have two overlapping active contracts, even under concurrent bookings.

## Deploying

Push to GitHub and connect the repo to [Vercel](https://vercel.com). Point `DATABASE_URL` at a managed Postgres instance (e.g. [Neon](https://neon.tech) or [Supabase](https://supabase.com) free tier), then run `npx prisma migrate deploy` against it before the first deploy.
