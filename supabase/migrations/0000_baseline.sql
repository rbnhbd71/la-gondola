-- =============================================================================
-- 0000_baseline.sql
-- Schema snapshot as of 2026-06-28.
--
-- This file documents the current state of the Supabase database.
-- It is NOT intended to be re-run — the schema already exists in production.
-- Future changes should be made via numbered migration files
-- (e.g. 0001_add_something.sql) applied through the temp-workflow method.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- RESTAURANTS
-- One row per restaurant. owner_id links to auth.users so that RLS policies
-- can scope all data to the authenticated owner.
-- -----------------------------------------------------------------------------
CREATE TABLE restaurants (
  id                   uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id             uuid        NULL     REFERENCES auth.users(id),
  nome_ristorante      text        NOT NULL,
  indirizzo            text        NULL,
  numero_twilio_from   text        NULL,
  numero_manager       text        NULL,
  capacita_totale      integer     NOT NULL DEFAULT 40,
  max_gruppo_singolo   integer     NOT NULL DEFAULT 8,
  orari_apertura       text        NULL,
  accessibilita        text        NULL,
  finestra_ore         integer     NOT NULL DEFAULT 2,
  timezone             text        NOT NULL DEFAULT 'Europe/Rome',
  created_at           timestamptz NOT NULL DEFAULT now(),
  -- Added 2026-06-28: default birthday message sent by the WhatsApp bot
  messaggio_compleanno text        NULL     DEFAULT 'Buon compleanno! 🎉 Per festeggiare, ti offriamo un bicchiere di vino in omaggio alla tua prossima visita.'
);


-- -----------------------------------------------------------------------------
-- CUSTOMERS
-- One row per unique phone number per restaurant. visite is incremented by the
-- n8n workflow each time a reservation is completed. compleanno is set manually
-- via the dashboard Customers page.
-- -----------------------------------------------------------------------------
CREATE TABLE customers (
  id             uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id  uuid        NOT NULL REFERENCES restaurants(id),
  telefono       text        NOT NULL,
  nome           text        NULL,
  visite         integer     NOT NULL DEFAULT 0,
  note           text        NULL,
  ultima_visita  date        NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  -- Added 2026-06-28
  compleanno     date        NULL,

  UNIQUE (restaurant_id, telefono)
);


-- -----------------------------------------------------------------------------
-- RESERVATIONS
-- One row per booking. stato defaults to 'attiva'; the n8n workflow sets it to
-- 'cancellata' when a customer cancels via WhatsApp.
-- -----------------------------------------------------------------------------
CREATE TABLE reservations (
  id             uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id  uuid        NOT NULL REFERENCES restaurants(id),
  telefono       text        NOT NULL,
  nome           text        NULL,
  data           date        NOT NULL,
  ora            time        NOT NULL,
  ospiti         integer     NOT NULL,
  stato          text        NOT NULL DEFAULT 'attiva',
  created_at     timestamptz NOT NULL DEFAULT now()
);


-- -----------------------------------------------------------------------------
-- CONVERSATIONS
-- One row per phone number per restaurant — upserted on every WhatsApp message.
-- storia stores the full conversation as a JSON array of {role, content} objects.
-- stato is one of: 'aperta', 'completata', 'escalation'.
-- The n8n workflow resets storia when stato was 'completata' or 'escalation'
-- on the previous turn.
-- -----------------------------------------------------------------------------
CREATE TABLE conversations (
  id             uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id  uuid        NOT NULL REFERENCES restaurants(id),
  telefono       text        NOT NULL,
  storia         text        NULL,
  stato          text        NULL,
  updated_at     timestamptz NOT NULL DEFAULT now(),

  UNIQUE (restaurant_id, telefono)
);


-- =============================================================================
-- ROW-LEVEL SECURITY
-- RLS is enabled on all four tables. The anon key (used by the Next.js dashboard
-- and Supabase JS client) is therefore subject to these policies.
-- The n8n Postgres credential connects as the postgres superuser and bypasses RLS.
-- =============================================================================

ALTER TABLE restaurants   ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers     ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;


-- restaurants: owner identified directly via owner_id = auth.uid()
CREATE POLICY "Owners can view their own restaurant"
  ON restaurants FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can update their own restaurant"
  ON restaurants FOR UPDATE
  USING (auth.uid() = owner_id);


-- customers, reservations, conversations: owner identified via the restaurants
-- table (restaurant_id → restaurants.owner_id = auth.uid())
CREATE POLICY "Owners can view their restaurant's customers"
  ON customers FOR SELECT
  USING (restaurant_id IN (
    SELECT id FROM restaurants WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Owners can update their restaurant's customers"
  ON customers FOR UPDATE
  USING (restaurant_id IN (
    SELECT id FROM restaurants WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Owners can view their restaurant's reservations"
  ON reservations FOR SELECT
  USING (restaurant_id IN (
    SELECT id FROM restaurants WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Owners can view their restaurant's conversations"
  ON conversations FOR SELECT
  USING (restaurant_id IN (
    SELECT id FROM restaurants WHERE owner_id = auth.uid()
  ));
