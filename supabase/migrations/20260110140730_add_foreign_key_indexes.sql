/*
  # Add Foreign Key Indexes for Performance

  1. Changes
    - Add index on `api_keys.created_by` foreign key column
    - Add index on `ip_addresses.created_by` foreign key column
  
  2. Performance Impact
    - Improves query performance for joins and foreign key lookups
    - Optimizes queries that filter by created_by
    - Enhances database constraint checking performance
  
  3. Notes
    - Uses IF NOT EXISTS to prevent errors if indexes already exist
    - B-tree indexes are optimal for foreign key columns
*/

-- Add index on api_keys.created_by foreign key
CREATE INDEX IF NOT EXISTS idx_api_keys_created_by 
ON public.api_keys(created_by);

-- Add index on ip_addresses.created_by foreign key
CREATE INDEX IF NOT EXISTS idx_ip_addresses_created_by 
ON public.ip_addresses(created_by);
