/*
  # Remove Unused Indexes

  ## Changes
  
  1. Performance Optimization
    - Drop unused indexes on `created_by` columns that aren't providing performance benefits
    - The query planner has determined these indexes are not being utilized
  
  2. Updated Tables
    - `api_keys`: Remove index on `created_by` column
    - `ip_addresses`: Remove index on `created_by` column
  
  ## Important Notes
  - Unused indexes consume storage space and add overhead to INSERT/UPDATE operations
  - These indexes were not being used by the query planner
  - If query patterns change in the future, indexes can be re-added as needed
*/

-- Drop unused indexes
DROP INDEX IF EXISTS idx_api_keys_created_by;
DROP INDEX IF EXISTS idx_ip_addresses_created_by;