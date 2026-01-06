/*
  # GRC & Cybersecurity Database Schema

  1. New Tables
    - `api_keys`
      - `id` (uuid, primary key)
      - `name` (text) - Descriptive name for the API key
      - `key_value` (text) - The actual API key
      - `service` (text) - Service/platform name
      - `environment` (text) - prod, staging, dev, etc.
      - `status` (text) - active, inactive, expired
      - `last_rotated` (timestamptz) - Last rotation date
      - `created_at` (timestamptz)
      - `created_by` (uuid) - Reference to user
    
    - `ip_addresses`
      - `id` (uuid, primary key)
      - `ip_address` (text) - The IP address
      - `hostname` (text) - Associated hostname
      - `location` (text) - Geographic location
      - `risk_level` (text) - low, medium, high, critical
      - `category` (text) - internal, external, partner, threat
      - `notes` (text) - Additional notes
      - `last_seen` (timestamptz) - Last activity timestamp
      - `created_at` (timestamptz)
      - `created_by` (uuid) - Reference to user

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  key_value text NOT NULL,
  service text NOT NULL,
  environment text DEFAULT 'production',
  status text DEFAULT 'active',
  last_rotated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS ip_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  hostname text,
  location text,
  risk_level text DEFAULT 'low',
  category text DEFAULT 'external',
  notes text,
  last_seen timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE ip_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own API keys"
  ON api_keys FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can insert own API keys"
  ON api_keys FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own API keys"
  ON api_keys FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete own API keys"
  ON api_keys FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can view own IP addresses"
  ON ip_addresses FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can insert own IP addresses"
  ON ip_addresses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own IP addresses"
  ON ip_addresses FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete own IP addresses"
  ON ip_addresses FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);