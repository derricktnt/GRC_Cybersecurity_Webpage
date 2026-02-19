/*
  # Add SSH Credentials Management

  1. New Tables
    - `ssh_credentials`
      - `id` (uuid, primary key) - Unique identifier
      - `user_id` (uuid, foreign key) - References auth.users
      - `name` (text) - Friendly name for the credential
      - `host` (text) - SSH server hostname or IP
      - `port` (integer) - SSH port (default 22)
      - `username` (text) - SSH username
      - `auth_type` (text) - Authentication type (password, key, key_with_passphrase)
      - `private_key` (text, nullable) - Encrypted private key
      - `passphrase` (text, nullable) - Encrypted passphrase
      - `password` (text, nullable) - Encrypted password
      - `description` (text, nullable) - Optional description
      - `last_used` (timestamptz, nullable) - Last time credential was used
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
      - `is_active` (boolean) - Whether credential is active

  2. Security
    - Enable RLS on `ssh_credentials` table
    - Add policies for authenticated users to manage their own credentials
    - Users can only view, insert, update, and delete their own SSH credentials

  3. Indexes
    - Index on `user_id` for faster queries
    - Index on `is_active` for filtering active credentials
*/

-- Create ssh_credentials table
CREATE TABLE IF NOT EXISTS ssh_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  host text NOT NULL,
  port integer NOT NULL DEFAULT 22,
  username text NOT NULL,
  auth_type text NOT NULL CHECK (auth_type IN ('password', 'key', 'key_with_passphrase')),
  private_key text,
  passphrase text,
  password text,
  description text,
  last_used timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  CONSTRAINT valid_port CHECK (port > 0 AND port <= 65535)
);

-- Enable RLS
ALTER TABLE ssh_credentials ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users
CREATE POLICY "Users can view own SSH credentials"
  ON ssh_credentials
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own SSH credentials"
  ON ssh_credentials
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own SSH credentials"
  ON ssh_credentials
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own SSH credentials"
  ON ssh_credentials
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ssh_credentials_user_id ON ssh_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_ssh_credentials_is_active ON ssh_credentials(is_active);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ssh_credentials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS ssh_credentials_updated_at ON ssh_credentials;
CREATE TRIGGER ssh_credentials_updated_at
  BEFORE UPDATE ON ssh_credentials
  FOR EACH ROW
  EXECUTE FUNCTION update_ssh_credentials_updated_at();