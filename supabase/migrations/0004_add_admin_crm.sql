-- 0004_add_admin_crm.sql
-- Creates the super_admins gate table and client_billing table for the internal
-- operator CRM. Also adds super-admin read policies on all existing tables so
-- the admin panel can query across clients using the anon key + their session.
--
-- NOTE: Apply via n8n temp-workflow method. Do NOT re-run once applied.
-- Seed: INSERT INTO super_admins (user_id) VALUES ('f1885f1c-28a9-4172-8710-220af0231a4e');


-- ── super_admins ──────────────────────────────────────────────────────────────
-- A user is an admin if and only if their auth.uid() has a row here.
-- Completely separate from restaurants.owner_id — not a flag, a separate table.

CREATE TABLE super_admins (
  id         uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid        NOT NULL REFERENCES auth.users(id) UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;

-- Each admin can read only their own row — sufficient for the auth-gate check.
-- Restaurant owners (and all other users) see zero rows.
CREATE POLICY "Super admins can read their own record"
  ON super_admins FOR SELECT
  USING (user_id = auth.uid());


-- ── client_billing ────────────────────────────────────────────────────────────
-- Operator-only billing metadata per restaurant.
-- No owner-facing SELECT policy = restaurant owners cannot read this table.

CREATE TABLE client_billing (
  id             uuid         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id  uuid         NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  billing_status text         NOT NULL DEFAULT 'trial',
  billing_notes  text         NULL,
  monthly_rate   numeric(8,2) NULL,
  client_since   date         NULL,
  updated_at     timestamptz  NOT NULL DEFAULT now(),

  UNIQUE (restaurant_id),
  CONSTRAINT billing_status_check
    CHECK (billing_status IN ('trial', 'active', 'paused', 'cancelled'))
);

ALTER TABLE client_billing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view all billing"
  ON client_billing FOR SELECT
  USING (EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid()));

CREATE POLICY "Super admins can insert billing"
  ON client_billing FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid()));

CREATE POLICY "Super admins can update billing"
  ON client_billing FOR UPDATE
  USING (EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid()));


-- ── Admin read policies on existing tables ────────────────────────────────────
-- Lets the admin panel query across all clients using anon key + their session.
-- Existing owner policies are untouched — owners still only see their own data.

CREATE POLICY "Super admins can view all restaurants"
  ON restaurants FOR SELECT
  USING (EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid()));

CREATE POLICY "Super admins can view all reservations"
  ON reservations FOR SELECT
  USING (EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid()));

CREATE POLICY "Super admins can view all conversations"
  ON conversations FOR SELECT
  USING (EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid()));

CREATE POLICY "Super admins can view all customers"
  ON customers FOR SELECT
  USING (EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid()));


-- ── Seed ─────────────────────────────────────────────────────────────────────
INSERT INTO super_admins (user_id)
VALUES ('f1885f1c-28a9-4172-8710-220af0231a4e');
