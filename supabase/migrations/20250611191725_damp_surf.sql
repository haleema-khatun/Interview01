/*
  # Add evaluation_type column to evaluations_history table

  1. Changes
    - Add `evaluation_type` column to `evaluations_history` table
    - Set default value to maintain data consistency
    - Add constraint to ensure valid evaluation types

  2. Security
    - No changes to existing RLS policies needed
    - Column addition is backward compatible
*/

-- Add evaluation_type column to evaluations_history table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'evaluations_history' AND column_name = 'evaluation_type'
  ) THEN
    ALTER TABLE evaluations_history 
    ADD COLUMN evaluation_type text DEFAULT 'standard' NOT NULL;
    
    -- Add constraint to ensure valid evaluation types
    ALTER TABLE evaluations_history 
    ADD CONSTRAINT evaluations_history_evaluation_type_check 
    CHECK (evaluation_type = ANY (ARRAY['standard'::text, 'mock'::text, 'practice'::text]));
  END IF;
END $$;