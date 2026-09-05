# VIDLIX

A thin-slice, end-to-end build of the VIDLIX creator management platform: public
marketing site + creator directory, and a Super Admin panel covering creator
CRM, agreements with e-signature, billing/invoicing, and creator payouts.

This is a **local prototype**. External services (email, social APIs, object
storage) are mocked or file-backed so the whole system runs without any third
-party accounts — see [Swapping in real services](#swapping-in-real-services).

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind v4 + shadcn/ui (Radix base)
- PostgreSQL + Prisma 6
- `@react-pdf/renderer` for agreement/invoice/receipt/payout PDFs
- Resend for email (falls back to a DB-logged mock when `RESEND_API_KEY` is unset)
- `react-signature-canvas` for draw/type e-signatures

No Node.js is required on the host — everything runs inside Docker.

## Getting started

```bash
docker compose up -d          # starts Postgres + a Node dev container
docker compose exec app npm install        # first time only, if node_modules isn't already populated
docker compose exec app npx prisma migrate dev   # creates the schema
docker compose exec app npm run db:seed          # seeds demo data (see below)
docker compose exec app npm run dev              # starts Next.js on :3000
```

Then open:
- Public site: http://localhost:3000
- Admin panel: http://localhost:3000/admin/login — **admin@vidlix.in / vidlix@admin123**

To reset the database back to the clean seeded state at any point:

```bash
docker compose exec app npx prisma migrate reset --force
```

### Seed data

`prisma/seed.ts` creates: company settings, a super admin user, the two
default agreement templates (Creator Management / Brand Collaboration), a
demo creator ("Rahul Sharma") with connected Instagram/YouTube/Facebook
metrics, a demo brand ("Nike India") with an active campaign and
collaboration, an official `rahul@vidlix.in` mailbox, and one seeded inbox
thread demonstrating the creator↔brand email mapping.

## What's implemented (thin slice)

- **Public site**: home (hero, creator orbit, featured creators), creator
  directory with search, creator profile pages (verified social metrics,
  auto-computed total audience, journey timeline, collaborate CTA), brand &
  creator inquiry forms with confirmation emails.
- **Admin — Creators**: CRUD, social account metrics, financial summary,
  central profile with quick actions (spec §150).
- **Admin — Brands/Campaigns/Collaborations**: CRUD and cross-linking.
- **Agreements**: template-driven creation with auto-populated smart
  variables, section editor with live A4-style preview, admin e-signature,
  send-for-signature email, full audit trail, agreement numbering
  (`AGR-2026-00001`, never reused).
- **Creator-facing signing flow** (`/agreement/sign/[token]`): no login —
  review document → OTP email verification → draw/type signature → the
  final signed PDF is generated and locked automatically once both parties
  have signed.
- **Billing**: invoice creation (creator management & brand campaign),
  PDF generation, payment recording with receipts, payouts with an
  explicit gross/commission/creator-share split (never a single "net"
  number — spec §83), payout statements.
- **Creator email**: `@vidlix.in` mailbox provisioning with reserved-word/
  uniqueness checks, and a unified inbox with reply.
- **Inquiries, documents, reports, notifications, settings** (company /
  letterhead / billing prefixes / default commission).

Not built in this pass (see the original spec for scope): real social
platform API sync, roles/permissions beyond a single super admin, PDF
letterhead branding upload, document/agreement versioning UI, CSV export,
and the full reports/analytics suite.

## Swapping in real services

- **Email**: set `RESEND_API_KEY` and `EMAIL_FROM` in `.env`. Until then,
  every "sent" email is logged to the `EmailLog` table and to the console
  instead (`src/lib/email/send.ts`) — nothing is silently dropped.
- **Object storage**: generated PDFs are written to `./storage` on disk
  (bind-mounted, so they persist on the host) and served through
  `/api/files/[assetId]`, which enforces admin-session or agreement-token
  access. Swap `src/lib/storage.ts` for S3/Supabase Storage without
  touching any callers.
- **Social metrics**: currently manually entered per creator (Social tab).
  `src/lib/audience.ts` already treats totals as derived, never
  hand-typed, so wiring a real sync job just means writing into
  `SocialMetric`/`SocialMetricSnapshot` on a schedule.
- **Database**: point `DATABASE_URL` at a managed Postgres (e.g. Supabase)
  instead of the local Docker container.

## Project layout

```
prisma/schema.prisma        # full data model (creators, agreements, billing, email…)
src/lib/                    # framework-agnostic core: auth, PDF, email, numbering, OTP
src/server/actions/         # Next.js server actions (the only way data is mutated)
src/app/(public)/           # public marketing site
src/app/admin/(protected)/  # super admin panel (session-gated layout)
src/app/agreement/sign/     # creator-facing signing flow (no login)
scripts/smoke.mjs           # Playwright end-to-end test: login → agreement → e-sign → payout
scripts/smoke2.mjs          # Playwright pass over the remaining admin pages + public forms
```

## Notes for a lawyer / production launch

The agreement templates in `src/lib/default-templates.ts` are boilerplate
starting points, not vetted legal language — spec §165 explicitly calls
this out, and it's worth repeating here.
