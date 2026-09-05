# Deploying VIDLIX to Hostinger (Shared Hosting)

This guide is written specifically for the Hostinger account already
connected to this project (`u324559756`, SSH port 65002) — confirmed via
SSH to be **shared/business hosting** (hPanel + CloudLinux + Passenger),
not a VPS: no root, no `sudo`, no Node.js pre-installed, MariaDB as the
database engine. Node.js apps on this kind of hosting run through
Hostinger's **"Node.js App"** feature (CloudLinux's Node Selector +
Passenger), not a normal `next start` process.

## 0. What changed in the codebase for this

- `prisma/schema.prisma` — datasource switched from PostgreSQL to MySQL,
  and every field that can hold more than ~191 characters (signatures,
  email bodies, template HTML, notes/bio fields) got `@db.Text` /
  `@db.LongText` so MySQL doesn't silently reject or truncate long values.
  `Creator.languages` (a Postgres-only array type) became a `Json` field.
- `src/app/(public)/creators/page.tsx` — dropped `mode: "insensitive"`
  from a search filter (Postgres-only option; MySQL's default collation
  is already case-insensitive).
- `server.js` (new) — a custom Next.js server. Passenger runs this file
  directly and expects it to listen on `process.env.PORT`; the normal
  `next start` CLI can't be driven that way.
- `prisma/seed.prod.ts` (new) — a production-safe seed with **only**
  company settings + the super admin login + default agreement
  templates. `prisma/seed.ts` also creates a demo creator (Rahul Sharma),
  a demo brand (Nike India), etc. — fine for local dev, must never run
  against the real database.
- `prisma/migrations/20260905120000_init_mysql/` — a fresh baseline
  migration for MySQL (the old Postgres migration history was deleted,
  since migration SQL is provider-specific).

All of this has been verified locally against a real MySQL 8 container:
`prisma migrate deploy` applies cleanly to a fresh database, the full
regression suite (creator management + brand collaboration agreements,
e-signing, invoices/payments/payouts, PDF generation) passes, and
`npm run build` completes with no errors.

## 1. Create the MySQL database (if not already done)

hPanel → **Databases** → MySQL Databases → create a database + user, or
reuse the one already created for this account:

- Database: `u324559756_vidlix`
- Username: `u324559756_vidlix`

Note the password you set — you'll need it in step 4.

## 2. Create the Node.js App

hPanel → **Websites** → pick the domain (or add a new one/subdomain
first) → **Node.js** (under Advanced):

- **Node.js version**: 20.x (Next.js 16 requires 18.18+; use the newest
  20.x offered)
- **Application mode**: Production
- **Application root**: a folder for the code, e.g. `vidlix_app` —
  keep it **outside** `public_html` (the app root and the domain's web
  root are different things; Passenger wires the domain to the app root
  automatically once you save this)
- **Application URL**: the domain/subdomain you want VIDLIX on
- **Application startup file**: `server.js`

Save it. hPanel will show you a line like:

```
source /home/u324559756/nodevenv/vidlix_app/20/bin/activate && cd /home/u324559756/vidlix_app
```

Copy that exact line — you'll run it before every `npm`/`npx`/`node`
command in the SSH steps below, since it puts the right Node/npm
version on your `PATH` (there's no system-wide Node otherwise).

## 3. Upload the code

Over SSH (port 65002):

```bash
cd ~/vidlix_app
git clone <your-repo-url> .
# or: upload the project as a zip via hPanel's File Manager and extract it here
```

## 4. Environment variables

Either paste these into hPanel's Node.js App → **Environment Variables**
section, or create `~/vidlix_app/.env` directly over SSH — Next.js reads
`.env` at the app root either way:

```bash
DATABASE_URL="mysql://u324559756_vidlix:<db-password>@localhost:3306/u324559756_vidlix"
ADMIN_SESSION_SECRET="<generate a long random string — see below>"
NEXT_PUBLIC_SITE_URL="https://<your-domain>"
RESEND_API_KEY="<your real Resend API key>"
EMAIL_FROM="VIDLIX <hello@vidlix.in>"
```

Generate `ADMIN_SESSION_SECRET` with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Never reuse the `dev-only-change-me-in-production-please` value from
local development.

## 5. Install, migrate, seed, build

Run the `source .../activate` line from step 2 first, then:

```bash
cd ~/vidlix_app
npm install
npx prisma migrate deploy
npm run db:seed:prod
npm run build
```

`db:seed:prod` creates the super-admin login
(`admin@vidlix.in` / `vidlix@admin123`) and default agreement templates
— **not** the demo creator/brand data. Log in immediately after and:

- Change the admin password (Settings, or ask for a password-change
  action if the UI doesn't expose one yet)
- Fill in your real company name, GSTIN, and address at
  **Admin → Settings** (the seed leaves placeholder text there on
  purpose, so it can't be mistaken for real data)

## 6. Start / restart the app

Back in hPanel's Node.js App page, click **Restart**. Passenger picks up
`server.js` and starts serving the domain.

Whenever you deploy new code afterward: `git pull`, re-run
`npm install` (if `package.json` changed) and `npm run build`, then
**Restart** again from hPanel.

## 7. File storage — read this before going live

Signed PDFs, invoice/receipt PDFs, and payout statements are written to
a local `storage/` folder inside the app root
(`src/lib/storage.ts`) — there is no S3/cloud storage wired up. On
shared hosting this folder is **not guaranteed to survive** every kind
of panel action, and there's no automated backup of it. Two things to
do:

1. Set up a periodic backup (hPanel → Backups, or a cron-like scheduled
   task if your plan offers one) that includes `~/vidlix_app/storage/`
   — these are signed legal documents, not disposable cache.
2. If you outgrow shared hosting, migrating `storage.ts` to actual
   object storage (S3-compatible) is the natural next step — the code
   already has a comment flagging this as the intended production path.

## 8. Known limitation of this hosting tier

This app does real work per request — PDF rendering with embedded fonts
(`@react-pdf/renderer`), Prisma's native query engine, occasional
larger file writes. Shared hosting via Passenger enforces memory/CPU
limits per account that a VPS wouldn't. If PDF generation becomes slow
or the app gets killed/restarted under load, that's this hosting tier's
ceiling, not a bug in the code — the fix at that point is moving to a
Hostinger VPS (KVM) plan, which this same codebase already runs on
without changes (just swap the deployment mechanism in this doc: PM2 +
Nginx instead of Passenger, plain `npm run start` instead of
`server.js`/Passenger).
