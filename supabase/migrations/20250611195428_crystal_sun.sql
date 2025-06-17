/*
  # Fix evaluation_type constraint in evaluations_history table

  1. Changes
    - Update the constraint for evaluation_type to accept 'simple' and 'detailed' values
    - This allows frontend values to be properly stored in the database

  2. Security
    - No changes to existing RLS policies needed
    - Column modification is backward compatible
*/

-- Drop the existing constraint
ALTER TABLE evaluations_history 
DROP CONSTRAINT IF EXISTS evaluations_history_evaluation_type_check;

-- Add the updated constraint with new values
ALTER TABLE evaluations_history 
ADD CONSTRAINT evaluations_history_evaluation_type_check 
CHECK (evaluation_type = ANY (ARRAY['standard'::text, 'mock'::text, 'practice'::text, 'simple'::text, 'detailed'::text]));