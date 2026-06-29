-- 0005_add_tiers.sql
-- Adds tier plans (operator-managed) and links them to client_billing.
-- Apply via Supabase SQL editor. Do NOT re-run once applied.

-- ── tiers ─────────────────────────────────────────────────────────────────────
CREATE TABLE tiers (
  id                    uuid         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name                  text         NOT NULL,
  monthly_message_limit int          NOT NULL,
  monthly_price         numeric(8,2) NOT NULL,
  created_at            timestamptz  NOT NULL DEFAULT now()
);

ALTER TABLE tiers ENABLE ROW LEVEL SECURITY;

-- Operator-only — same pattern as client_billing.
-- No owner-facing policy: restaurant owners cannot read tier data.
CREATE POLICY "Super admins can view all tiers"
  ON tiers FOR SELECT
  USING (EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid()));

CREATE POLICY "Super admins can insert tiers"
  ON tiers FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid()));

CREATE POLICY "Super admins can update tiers"
  ON tiers FOR UPDATE
  USING (EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid()));

CREATE POLICY "Super admins can delete tiers"
  ON tiers FOR DELETE
  USING (EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid()));


-- ── client_billing.tier_id ────────────────────────────────────────────────────
-- Nullable FK — a client may not have a tier assigned yet.
-- ON DELETE SET NULL: deleting a tier unassigns clients rather than cascading.
ALTER TABLE client_billing
  ADD COLUMN tier_id uuid NULL REFERENCES tiers(id) ON DELETE SET NULL;


-- ── Seed tiers ────────────────────────────────────────────────────────────────
INSERT INTO tiers (name, monthly_message_limit, monthly_price) VALUES
  ('Starter',  200,  49.00),
  ('Growth',   600,  99.00),
  ('Pro',     2000, 199.00);
