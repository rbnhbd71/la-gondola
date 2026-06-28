-- 0001_add_ultimo_messaggio_compleanno.sql
-- Adds tracking column for the last birthday message sent to each customer.
-- Used by the Birthday Campaign Sender (n8n workflow hK3HSVsCA9utcKkt) to
-- prevent duplicate sends within the same year.
--
-- NOTE: Already applied to production on 2026-06-28 via the temp-workflow
-- method. This file exists to sync migration history only — do not re-run.

ALTER TABLE customers
  ADD COLUMN ultimo_messaggio_compleanno DATE NULL;
