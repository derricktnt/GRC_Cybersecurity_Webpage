/*
  # Fix Security Issues

  ## Changes
  
  1. Performance Improvements
    - Add indexes on foreign key columns `created_by` in both `api_keys` and `ip_addresses` tables
    - Optimize RLS policies to use `(select auth.uid())` instead of `auth.uid()` to prevent re-evaluation for each row
  
  2. Updated Tables
    - `api_keys`: Added index on `created_by` column
    - `ip_addresses`: Added index on `created_by` column
  
  3. Security
    - Drop and recreate all RLS policies with optimized auth.uid() calls
    - This improves query performance at scale by evaluating auth.uid() once per query instead of once per row
  
  ## Important Notes
  - The new RLS policies are functionally equivalent to the old ones but significantly more performant
  - Indexes will improve JOIN and foreign key lookup performance
*/

-- Add indexes on foreign key columns
CREATE INDEX IF NOT EXISTS idx_api_keys_created_by ON api_keys(created_by);
CREATE INDEX IF NOT EXISTS idx_ip_addresses_created_by ON ip_addresses(created_by);

-- Drop existing RLS policies for api_keys
DROP POLICY IF EXISTS "Users can view own API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can insert own API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can update own API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can delete own API keys" ON api_keys;

-- Drop existing RLS policies for ip_addresses
DROP POLICY IF EXISTS "Users can view own IP addresses" ON ip_addresses;
DROP POLICY IF EXISTS "Users can insert own IP addresses" ON ip_addresses;
DROP POLICY IF EXISTS "Users can update own IP addresses" ON ip_addresses;
DROP POLICY IF EXISTS "Users can delete own IP addresses" ON ip_addresses;

-- Create optimized RLS policies for api_keys
CREATE POLICY "Users can view own API keys"
  ON api_keys FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = created_by);

CREATE POLICY "Users can insert own API keys"
  ON api_keys FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY "Users can update own API keys"
  ON api_keys FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = created_by)
  WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY "Users can delete own API keys"
  ON api_keys FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = created_by);

-- Create optimized RLS policies for ip_addresses
CREATE POLICY "Users can view own IP addresses"
  ON ip_addresses FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = created_by);

CREATE POLICY "Users can insert own IP addresses"
  ON ip_addresses FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY "Users can update own IP addresses"
  ON ip_addresses FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = created_by)
  WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY "Users can delete own IP addresses"
  ON ip_addresses FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = created_by);