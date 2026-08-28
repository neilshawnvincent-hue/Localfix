-- Bookings table links customers to workers for the labour marketplace.
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID,
  worker_id UUID,
  service_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  -- 4-digit code the customer shares with the worker to start the job.
  start_otp TEXT NOT NULL DEFAULT lpad((floor(random() * 10000))::int::text, 4, '0'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fast lookups for the worker's open-jobs feed.
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status);

-- Enable Row Level Security.
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Prototype policies: allow the app (anon + authenticated) to read, create and
-- update bookings. Tighten these before production.
DROP POLICY IF EXISTS "bookings_select" ON bookings;
CREATE POLICY "bookings_select" ON bookings
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "bookings_insert" ON bookings;
CREATE POLICY "bookings_insert" ON bookings
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "bookings_update" ON bookings;
CREATE POLICY "bookings_update" ON bookings
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
