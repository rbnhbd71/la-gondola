-- 0003_add_reservations_update_policy.sql
-- Adds UPDATE RLS policy for reservations so the Next.js dashboard can
-- assign table_id via server actions authenticated with the user's session.
-- Previously only a SELECT policy existed; n8n updates via postgres superuser
-- (bypasses RLS) so this was not needed until now.
--
-- NOTE: Applied to production on 2026-06-28 via the temp-workflow method.
-- This file exists to sync migration history only — do not re-run.

CREATE POLICY "Owners can update their restaurant's reservations"
  ON reservations FOR UPDATE
  USING (restaurant_id IN (
    SELECT id FROM restaurants WHERE owner_id = auth.uid()
  ));
