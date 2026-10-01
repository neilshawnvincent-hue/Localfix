-- ============================================================================
-- LocalFix: Worker Registration — Supabase Schema Migration
-- ============================================================================
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Prerequisites: the `profiles` table already exists and pgcrypto is available.
-- ============================================================================

-- 1. Enable pgcrypto (idempotent — safe to run again)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Add the new columns (IF NOT EXISTS keeps this re-runnable)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS profession TEXT,
  ADD COLUMN IF NOT EXISTS uan_number TEXT,
  ADD COLUMN IF NOT EXISTS aadhaar_number_encrypted BYTEA;  -- stored encrypted, NOT plain text

-- 3. CHECK constraints — enforce exactly 12 digits on the UAN plain-text column.
--    (Aadhaar is encrypted so the constraint is applied in the encrypt function.)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uan_number_12_digits'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT uan_number_12_digits CHECK (uan_number ~ '^\d{12}$');
  END IF;
END $$;


-- ============================================================================
-- 4. Aadhaar encryption / decryption helpers (uses pgcrypto AES-256)
-- ============================================================================
-- IMPORTANT: Replace 'YOUR-VERY-STRONG-SECRET-KEY-HERE' with a real 32+ char
-- secret kept in Vault or an env var. Never commit the raw key to source control.
-- You can use Supabase Vault:  SELECT vault.create_secret('aadhaar_key', '<key>');
-- then reference it with:     (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'aadhaar_key')
-- ============================================================================

-- Encrypt and store an Aadhaar number (validates 12 digits first)
CREATE OR REPLACE FUNCTION encrypt_aadhaar(
  p_profile_id UUID,
  p_aadhaar    TEXT,
  p_key        TEXT DEFAULT 'CHANGE-ME-USE-VAULT-SECRET-32CHARS!'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER   -- runs with table-owner privileges
SET search_path = public
AS $$
BEGIN
  IF p_aadhaar !~ '^\d{12}$' THEN
    RAISE EXCEPTION 'Aadhaar number must be exactly 12 digits';
  END IF;

  UPDATE profiles
     SET aadhaar_number_encrypted = pgp_sym_encrypt(p_aadhaar, p_key)
   WHERE id = p_profile_id;
END;
$$;

-- Decrypt an Aadhaar number (returns masked result for safety — last 4 digits only)
CREATE OR REPLACE FUNCTION decrypt_aadhaar_masked(
  p_profile_id UUID,
  p_key        TEXT DEFAULT 'CHANGE-ME-USE-VAULT-SECRET-32CHARS!'
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_raw TEXT;
BEGIN
  SELECT pgp_sym_decrypt(aadhaar_number_encrypted, p_key)
    INTO v_raw
    FROM profiles
   WHERE id = p_profile_id;

  IF v_raw IS NULL THEN RETURN NULL; END IF;
  RETURN 'XXXX-XXXX-' || RIGHT(v_raw, 4);   -- e.g. XXXX-XXXX-7890
END;
$$;


-- ============================================================================
-- 5. Row Level Security — workers can only read/write their OWN row
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow workers (and customers) to view their own profile
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'profiles_select_own'
  ) THEN
    EXECUTE $p$
      CREATE POLICY profiles_select_own ON profiles
        FOR SELECT
        USING (auth.uid() = id);
    $p$;
  END IF;
END $$;

-- Allow a worker to insert their own profile row on first registration
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'profiles_insert_own'
  ) THEN
    EXECUTE $p$
      CREATE POLICY profiles_insert_own ON profiles
        FOR INSERT
        WITH CHECK (auth.uid() = id);
    $p$;
  END IF;
END $$;

-- Allow a worker to update only their own row
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'profiles_update_own'
  ) THEN
    EXECUTE $p$
      CREATE POLICY profiles_update_own ON profiles
        FOR UPDATE
        USING  (auth.uid() = id)
        WITH CHECK (auth.uid() = id);
    $p$;
  END IF;
END $$;


-- ============================================================================
-- 6. Helper RPC: "register_worker" — one call from the client to do everything
-- ============================================================================
CREATE OR REPLACE FUNCTION register_worker(
  p_full_name   TEXT,
  p_profession  TEXT,
  p_uan_number  TEXT,
  p_aadhaar     TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Upsert the non-sensitive columns
  INSERT INTO profiles (id, full_name, profession, uan_number)
  VALUES (v_uid, p_full_name, p_profession, p_uan_number)
  ON CONFLICT (id) DO UPDATE
    SET full_name  = EXCLUDED.full_name,
        profession = EXCLUDED.profession,
        uan_number = EXCLUDED.uan_number;

  -- Encrypt and store the Aadhaar separately
  PERFORM encrypt_aadhaar(v_uid, p_aadhaar);
END;
$$;
