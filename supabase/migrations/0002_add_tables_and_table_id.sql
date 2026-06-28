-- 0002_add_tables_and_table_id.sql
-- Adds the tables table for floor-plan management and a table_id FK on reservations.
--
-- NOTE: Already applied to production on 2026-06-28 via the temp-workflow
-- method. This file exists to sync migration history only — do not re-run.

CREATE TABLE tables (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID        NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  capacity      INTEGER     NOT NULL CHECK (capacity BETWEEN 1 AND 20),
  x             FLOAT       NOT NULL DEFAULT 0,
  y             FLOAT       NOT NULL DEFAULT 0,
  label         TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE reservations
  ADD COLUMN table_id UUID REFERENCES tables(id) ON DELETE SET NULL;

ALTER TABLE tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view their own tables"
  ON tables FOR SELECT
  USING (restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid()));

CREATE POLICY "Owners can insert their own tables"
  ON tables FOR INSERT
  WITH CHECK (restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid()));

CREATE POLICY "Owners can update their own tables"
  ON tables FOR UPDATE
  USING (restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid()));

CREATE POLICY "Owners can delete their own tables"
  ON tables FOR DELETE
  USING (restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid()));
