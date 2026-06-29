-- Allow dashboard-created reservations to have no phone number.
-- The WhatsApp bot always provides telefono; the dashboard booking flow does not.
-- NULL is allowed in UNIQUE(restaurant_id, telefono) — Postgres treats NULL != NULL.
ALTER TABLE reservations ALTER COLUMN telefono DROP NOT NULL;
