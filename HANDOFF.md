# La Gondola Dashboard — Handoff Summary

> Last updated: 2026-06-28  
> Author: Claude Code (Sonnet 4.6)  
> Repo: https://github.com/rbnhbd71/la-gondola

---

## 1. What This Is

A Next.js restaurant management dashboard for **La Gondola**. The owner logs in and sees today's reservations, upcoming bookings, a live floor-plan view, a customer CRM, birthday campaigns, and a statistics page with historical performance charts.

The booking intake side (WhatsApp bot, reservation creation, customer tracking) lives in a separate **n8n cloud** automation — this dashboard is read/write on top of that data.

---

## 2. Tech Stack

| Layer | Choice | Version |
|---|---|---|
| Framework | Next.js App Router | 16.2.9 |
| React | React | 19.2.4 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS v4 | ^4 |
| Database / Auth | Supabase (Postgres + RLS + Auth) | @supabase/ssr ^0.12 |
| Charts | recharts | ^3.9 |
| Icons | lucide-react | ^1.22 |
| Drag-and-drop | @dnd-kit/core | ^6.3 |
| Fonts | Fraunces (display) + Inter (body) | Google Fonts via next/font |
| Automation | n8n cloud | assistinb.app.n8n.cloud |
| Git remote | GitHub | github.com/rbnhbd71/la-gondola |

**Important Tailwind v4 note:** Uses `@theme inline` with `--color-*` CSS variables, not the v3 `tailwind.config.js` pattern. All color tokens are registered in `app/globals.css`.

---

## 3. Repository & Local Dev

```bash
cd la-gondola-dashboard
npm install
npm run dev          # http://localhost:3000
npm run build        # production build check
```

Environment variables are in `.env.local` (not committed). Required vars:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Git credentials are cached via macOS Keychain (`osxkeychain` credential helper). Plain `git push origin main` works without a token file.

---

## 4. Design System

All tokens are in `app/globals.css`. Tailwind utilities like `bg-clay`, `text-ink-soft`, `border-line` work because of `@theme inline` registration.

| Token | Hex | Role |
|---|---|---|
| `--bg` | `#FAF8F4` | Page background |
| `--surface` | `#FFFFFF` | Cards |
| `--surface-sunk` | `#F4F1EA` | Recessed areas |
| `--ink` | `#211E1A` | Primary text |
| `--ink-soft` | `#6B655C` | Secondary text |
| `--ink-faint` | `#9C958A` | Labels, captions |
| `--line` | `#E8E2D6` | Borders, dividers |
| `--clay` | `#C2693D` | Primary accent (CTA, lunch bars) |
| `--clay-dark` | `#9A4E2A` | Clay hover/dark |
| `--clay-tint` | `#F6E3D7` | Clay background tints |
| `--sage` | `#74875F` | Positive / fulfillment |
| `--sky` | `#5C7C8C` | Info / dinner bars |
| `--amber` | `#C99A3C` | Warning / AI metrics |

Fonts: `font-display` = Fraunces (headings, numbers), `font-body` = Inter.

---

## 5. Database Schema

Production Supabase project. Schema lives in `supabase/migrations/` as documentation — migrations were applied via the n8n temp-workflow method (see §8), not Supabase CLI.

### `restaurants`
```
id                   uuid  PK
owner_id             uuid  → auth.users(id)   ← RLS anchor
nome_ristorante      text  NOT NULL
indirizzo            text
numero_twilio_from   text                      ← WhatsApp sender number
numero_manager       text                      ← escalation target
capacita_totale      int   DEFAULT 40
max_gruppo_singolo   int   DEFAULT 8
orari_apertura       text
accessibilita        text
finestra_ore         int   DEFAULT 2
timezone             text  DEFAULT 'Europe/Rome'
messaggio_compleanno text                      ← default birthday WhatsApp message
created_at           timestamptz
```

### `customers`
```
id             uuid  PK
restaurant_id  uuid  → restaurants(id)
telefono       text  NOT NULL  UNIQUE(restaurant_id, telefono)
nome           text
visite         int   DEFAULT 0   ← incremented by n8n on completed reservation
note           text
ultima_visita  date
compleanno     date
ultimo_messaggio_compleanno  date   ← prevents duplicate birthday sends per year
created_at     timestamptz
```

### `reservations`
```
id             uuid  PK
restaurant_id  uuid  → restaurants(id)
telefono       text  NOT NULL
nome           text
data           date  NOT NULL
ora            time  NOT NULL
ospiti         int   NOT NULL
stato          text  DEFAULT 'attiva'   ← 'attiva' | 'cancellata'
table_id       uuid  → tables(id) ON DELETE SET NULL   (nullable)
created_at     timestamptz
```

**Lunch/dinner boundary:** `ora < '16:00:00'` = lunch, `ora >= '16:00:00'` = dinner. Used consistently in BookingCanvas.tsx, StatsClient.tsx, and dashboard queries.

### `tables`
```
id             uuid  PK
restaurant_id  uuid  → restaurants(id) ON DELETE CASCADE
capacity       int   CHECK (1–20)
x              float DEFAULT 0
y              float DEFAULT 0
label          text  NOT NULL
created_at     timestamptz
```

### `conversations`
```
id             uuid  PK
restaurant_id  uuid  → restaurants(id)
telefono       text  NOT NULL  UNIQUE(restaurant_id, telefono)
storia         text             ← JSON array {role, content} objects
stato          text             ← 'aperta' | 'completata' | 'escalation'
updated_at     timestamptz
```
> Dashboard currently does not display conversations — managed entirely by n8n.

### Row-Level Security

RLS is enabled on all tables. The Next.js app uses the **anon key** and is subject to RLS. n8n connects as the **postgres superuser** and bypasses RLS.

Security rule enforced in all server components: **never trust `restaurant_id` from the client — always derive it server-side** via:
```ts
const { data: restaurant } = await supabase
  .from('restaurants')
  .select('id')
  .eq('owner_id', user.id)  // user.id comes from auth.getUser()
  .single()
```

---

## 6. i18n

Cookie-based locale (`locale` cookie). Supported: `en`, `it`, `fr`, `es`.

- `lib/i18n/dictionary.ts` — all strings typed in `Dictionary`, values for all 4 locales
- `lib/i18n/getLocale.ts` — reads the cookie server-side
- `lib/i18n/setLocale.ts` — sets the cookie (used by `LanguageSwitcher`)
- `app/dashboard/LanguageSwitcher.tsx` — UI toggle in sidebar

To add a string: add the key to the `Dictionary` type, then add values in all 4 locale objects.

---

## 7. Feature Map

### `/dashboard` — Main Dashboard (`app/dashboard/page.tsx`)
Server component. Runs 10 parallel Supabase queries.

**Sections:**
- **Greeting** — time-of-day greeting + date
- **Stat cards** (4) — Reservations today (real), New customers this month (real), Occupancy (placeholder 78%), AI handled (placeholder 91%)
- **Upcoming reservations** — next 8 active bookings, ordered by date/time
- **Mini floor plan** — table availability for current service (lunch/dinner auto-detected by hour)
- **Performance rings** — 4 SVG donut rings: Occupancy (placeholder), Fulfillment rate (real = non-cancelled/total this month), Repeat guests (real = customers with visite > 1), AI handled (placeholder)
- **Campaigns strip** — Birthday sent count (real), Win-back (coming soon), Seasonal (coming soon)
- **Top 5 customers** — by `visite` count

**Placeholders to replace with real data:**
- Occupancy (78%) — requires seat capacity × service × days denominator; no clean source yet
- AI handled (91%) — requires conversation analytics from n8n

### `/dashboard/reservations` — Reservations List
Server component + client `TableSelect`. Shows all reservations, allows assigning a table via dropdown (server action writes `table_id`).

### `/dashboard/floor-plan` — Floor Plan
Two modes:
- **Edit mode** (`FloorEditor.tsx`) — drag tables, add/delete tables, save positions via server action
- **Booking mode** (`BookingCanvas.tsx`) — client component, fetches real-time data from Supabase. Date navigation (prev/next day arrows), lunch/dinner service toggle. Shows which tables are booked with guest name/count overlay.

### `/dashboard/customers` — Customer CRM
Lists all customers. Inline birthday date editing (`BirthdayCell.tsx` — client component, calls server action). Shows visit count, notes, last visit.

### `/dashboard/campaigns` — Campaigns
Birthday message campaign. `CampaignsForm.tsx` allows editing the default birthday message stored in `restaurants.messaggio_compleanno`. Sending is done by a separate n8n workflow (not triggered from the dashboard).

### `/dashboard/stats` — Statistics
Server component (`page.tsx`) + client chart (`StatsClient.tsx`).

**Time ranges:** Last month / Last 3 months / Last 6 months (toggle, default 3 months)

**Stat cards:**
- Total reservations (with lunch/dinner subtotals)
- New customers
- Cancellation rate (% and raw counts)
- Period-over-period delta (vs equivalent prior period)

**Bar chart:** Grouped paired bars — clay for lunch, sky for dinner. Granularity auto-scales:
- 1 month → daily bars
- 3 months → weekly bars (ISO Mon-start weeks)
- 6 months → monthly bars

Future dates are excluded from the chart. The chart shows only non-cancelled reservations; stat cards include cancelled in the total (for cancellation rate).

**Data flow:** Server fetches `data, stato, ora` for 12 months of reservations. Client builds `MonthBucket[]` for stat cards and re-groups raw rows for chart granularity.

### `/dashboard/settings` — Settings
Edit restaurant profile: name, address, Twilio number, manager number, capacity, opening hours, accessibility notes, etc.

---

## 8. n8n Automation

**Instance:** https://assistinb.app.n8n.cloud  
**Credentials in n8n:**
- `Postgres account` (id: `zbp4JrTYGgxC1jaF`) — connects as postgres superuser, bypasses RLS
- `Twilio account` — WhatsApp sending
- `OpenAI account` — conversation AI

**Known active workflows:**
- Birthday Campaign Sender (id: `hK3HSVsCA9utcKkt`) — queries customers with `compleanno` matching today, sends WhatsApp via Twilio, stamps `ultimo_messaggio_compleanno` to prevent duplicates

**Temp-workflow pattern (for DB writes outside the app):**
1. Create workflow with Webhook trigger + Postgres node
2. Activate it
3. Test via webhook
4. **Immediately delete** — never leave temp workflows active
5. Do NOT activate/publish workflows that should remain inactive

This pattern was used for all schema migrations (0001–0003) and for seeding test data.

---

## 9. Seed / Test Data

120 fake reservation rows were inserted on 2026-06-28 for testing the Statistics page charts. They are identifiable by `nome` values from this list:

```
Marco Bianchi, Giulia Rossi, Luca Ferrari, Sofia Esposito, Alessandro Romano,
Francesca Ricci, Matteo Lombardi, Valentina Conti, Lorenzo Moretti, Chiara Costa,
Davide Bruno, Elena Greco, Simone Mancini, Martina Barbieri, Federico Fontana,
Laura De Luca, Riccardo Marini, Alice Gallo, Stefano Vitale, Monica Caruso
```

To remove all seed data:
```sql
DELETE FROM reservations
WHERE restaurant_id = 'fc1dc756-8e83-473d-9d6d-c32720e4d258'
  AND nome IN (
    'Marco Bianchi','Giulia Rossi','Luca Ferrari','Sofia Esposito','Alessandro Romano',
    'Francesca Ricci','Matteo Lombardi','Valentina Conti','Lorenzo Moretti','Chiara Costa',
    'Davide Bruno','Elena Greco','Simone Mancini','Martina Barbieri','Federico Fontana',
    'Laura De Luca','Riccardo Marini','Alice Gallo','Stefano Vitale','Monica Caruso'
  );
```

**The `customers` table is clean** — seed rows only exist in `reservations`. There are no DB triggers on `reservations`, so no customer rows were auto-created. The dashboard's "new customers" and "top customers" stats are unaffected.

---

## 10. Key Files Reference

```
la-gondola-dashboard/
├── app/
│   ├── globals.css                    # Design tokens + Tailwind v4 theme
│   ├── layout.tsx                     # Root layout, fonts
│   ├── admin/                         # Admin CRM — see §14 for full detail
│   │   ├── layout.tsx                 # Auth gate (super_admins check) + dark sidebar
│   │   ├── page.tsx                   # Redirect → /admin/clients
│   │   └── clients/
│   │       ├── page.tsx               # All-client table
│   │       └── [id]/
│   │           ├── page.tsx           # Client detail + usage metrics
│   │           ├── BillingForm.tsx    # Inline billing editor (client component)
│   │           ├── UsageChart.tsx     # Recharts 6-month bar chart (client)
│   │           └── actions.ts         # updateBilling server action
│   ├── dashboard/
│   │   ├── layout.tsx                 # Sidebar layout
│   │   ├── SidebarNav.tsx             # Nav links (active state via pathname)
│   │   ├── LanguageSwitcher.tsx       # Locale cookie toggle
│   │   ├── page.tsx                   # Main dashboard (10 queries)
│   │   ├── reservations/
│   │   │   ├── page.tsx               # Reservations list
│   │   │   ├── TableSelect.tsx        # Client dropdown for table assignment
│   │   │   └── actions.ts             # assignTable server action
│   │   ├── floor-plan/
│   │   │   ├── page.tsx               # Floor plan page shell
│   │   │   ├── FloorEditor.tsx        # Edit mode (drag, add, delete)
│   │   │   ├── FloorCanvas.tsx        # Read-only canvas (used by editor)
│   │   │   ├── BookingCanvas.tsx      # Live booking view (client, real-time)
│   │   │   └── actions.ts             # saveTables server action
│   │   ├── customers/
│   │   │   ├── page.tsx               # Customer list
│   │   │   ├── BirthdayCell.tsx       # Inline date editor
│   │   │   └── actions.ts             # updateBirthday server action
│   │   ├── campaigns/
│   │   │   ├── page.tsx               # Campaigns page
│   │   │   ├── CampaignsForm.tsx      # Birthday message editor
│   │   │   └── actions.ts             # updateBirthdayMessage server action
│   │   ├── stats/
│   │   │   ├── page.tsx               # Server: fetches 12mo data, builds buckets
│   │   │   ├── StatsClient.tsx        # Client: range toggle, charts, stat cards
│   │   │   └── types.ts               # MonthBucket type
│   │   └── settings/
│   │       ├── page.tsx               # Settings page
│   │       ├── SettingsForm.tsx       # Restaurant profile form
│   │       └── actions.ts             # updateSettings server action
├── lib/
│   ├── supabase/
│   │   ├── server.ts                  # createClient() for server components
│   │   └── client.ts                  # createBrowserClient() for client components
│   └── i18n/
│       ├── dictionary.ts              # All strings, 4 locales, typed Dictionary
│       ├── getLocale.ts               # Read locale cookie (server)
│       └── setLocale.ts               # Set locale cookie (server action)
└── supabase/
    └── migrations/
        ├── 0000_baseline.sql          # Full schema snapshot (DO NOT RE-RUN)
        ├── 0001_add_ultimo_messaggio_compleanno.sql
        ├── 0002_add_tables_and_table_id.sql
        ├── 0003_add_reservations_update_policy.sql
        └── 0004_add_admin_crm.sql     # super_admins + client_billing + admin RLS
```

---

## 11. Security Rules (Never Break These)

1. **Never trust `restaurant_id` from the client.** Always derive it server-side from `auth.uid()` via `restaurants.owner_id`.
2. **RLS on all tables.** Any new table must have RLS enabled and appropriate SELECT/UPDATE/INSERT/DELETE policies.
3. **New migrations must be reviewed before running** via the n8n temp-workflow. Show the DDL to the owner before execution.
4. **Temp n8n workflows must be deleted immediately** after use. Never leave them active.
5. **Never commit secrets** (`.env.local`, tokens). The `.env.local` file is not in `.gitignore` by default in this repo — verify before `git add`.

---

## 12. Known Placeholders & Open Work

| Item | Location | Status |
|---|---|---|
| Occupancy % (78%) | Dashboard stat card + performance ring | Placeholder — real calculation needs capacity × services model |
| AI handled % (91%) | Dashboard stat card + performance ring | Placeholder — needs n8n conversation analytics |
| Win-back campaign | `/dashboard/campaigns` | "Coming soon" stub |
| Seasonal campaign | `/dashboard/campaigns` | "Coming soon" stub |
| Seed data cleanup | `reservations` table | 120 fake rows, removable via SQL above (§9) |
| `conversations` table | Dashboard | Not surfaced in UI yet |
| Pricing tiers | Admin CRM / billing | Backlog — e.g. 50/100/200 message tiers with different API/AI usage limits. Needs its own scoping session; ties into future Stripe integration and usage enforcement logic. |
| Rebrand to TeamIQ | Product / all UIs | Backlog — product name may change from "La Gondola" (per-restaurant dashboard) to a platform brand (e.g. TeamIQ). Scope TBD, not started. No code changes until naming is finalised. |
| Multi-tenant architecture | All new tables | Confirmed — La Gondola is the first of many clients. All new tables must be multi-tenant with a `restaurant_id` FK and appropriate RLS. The admin CRM at `/admin` is the operator panel for managing all clients. Never design for single-tenant only. |

---

## 14. Admin CRM (`/admin`)

Internal operator-only panel. Completely separate from the restaurant-owner dashboard — no access to operational data (reservations/customers) in terms of write access; read-only for usage metrics only.

**Route:** `/admin` → redirect to `/admin/clients`

**Auth gate:** `app/admin/layout.tsx` checks `auth.uid()` against `super_admins` table. Non-admins redirect to `/dashboard`. Unauthenticated users redirect to `/login`.

**Security model:**
- `super_admins` table: RLS allows each admin to read only their own row (sufficient for the auth check). No owner-facing policy.
- `client_billing` table: RLS allows SELECT/INSERT/UPDATE only if `auth.uid()` is in `super_admins`. No owner-facing policy — restaurant owners cannot read billing data.
- Admin read policies added to `restaurants`, `reservations`, `conversations`, `customers` — allows the admin to query across all clients using the anon key + their session. Owner policies are untouched.
- Admin uses the same `createClient()` (anon key) as the owner dashboard — no service-role key needed.

**Pages:**
- `/admin/clients` — table of all restaurants with billing status, monthly rate, client since
- `/admin/clients/[id]` — client detail: billing section (editable inline), usage section (4 stat cards + 6-month bar chart)

**Usage chart data sources:**
- Reservations / month → `reservations.data` grouped by month
- Conversations / month → `conversations.updated_at` grouped by month (thread count by last activity, NOT per-message count — `conversations` has no per-message event log)
- Stat cards: reservations last 30d, active conversations (stato='aperta'), total customers, campaigns sent (customers with `ultimo_messaggio_compleanno` set)

**Files:**
```
app/admin/
  layout.tsx                      # Auth gate + dark sidebar
  page.tsx                        # Redirect to /admin/clients
  clients/
    page.tsx                      # Client list table
    [id]/
      page.tsx                    # Client detail + usage
      BillingForm.tsx             # Edit/view billing (client component)
      UsageChart.tsx              # Recharts bar chart (client component)
      actions.ts                  # updateBilling server action
supabase/migrations/
  0004_add_admin_crm.sql          # super_admins + client_billing + admin RLS policies
```

**Migration applied:** via n8n temp-workflow method on 2026-06-28.
**Admin seeded:** `f1885f1c-28a9-4172-8710-220af0231a4e` (rubenhubschmid@gmail.com).

---

## 13. Git History (Recent)

```
85e0097  feat: admin CRM at /admin with billing management and usage metrics
5c3e398  feat: split stats chart into lunch/dinner grouped bars with subtotals
adbe574  feat: performance rings bar on dashboard (fulfillment + repeat guests real data)
10820d9  fix: consistent future-date exclusion across daily/weekly stats views
16e9094  feat: floor plan date arrows + statistics page with recharts
da54ab3  feat: prev/next day arrows on floor plan date picker
9432079  feat: dashboard rebuild with real data + stat cards, sidebar nav active state fix
e251a9c  feat: update login page to match design system
f836092  feat: new design system (clay/sage/sky/amber palette)
91b24f5  feat: booking view mode for floor plan
18a1411  feat: manual table assignment from reservations
776c0a0  fix: prevent duplicate table labels after deletion
7578847  feat: drag-to-move tables in floor plan edit mode
4f743ef  feat: add/remove tables in floor plan edit mode
8c948d1  feat: add read-only floor plan canvas
2338984  feat: add tables schema for floor plan with RLS policies
```
