/*
  # Create study_plan_progress table

  1. New Tables
    - `study_plan_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `plan_id` (text)
      - `completed_days` (integer array)
      - `progress_percentage` (integer)
      - `last_updated` (timestamptz)
      - `created_at` (timestamptz)
  2. Security
    - Enable RLS on `study_plan_progress` table
    - Add policies for users to manage their own progress
  3. Indexes
    - Create index on user_id
    - Create unique index on user_id, plan_id
*/

-- Create study_plan_progress table
CREATE TABLE IF NOT EXISTS study_plan_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id text NOT NULL,
  completed_days integer[] DEFAULT '{}',
  progress_percentage integer DEFAULT 0,
  last_updated timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_study_plan_progress_user_id ON study_plan_progress(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_study_plan_progress_user_plan ON study_plan_progress(user_id, plan_id);

-- Enable Row Level Security
ALTER TABLE study_plan_progress ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can read their own progress
CREATE POLICY "Users can read own study plan progress"
  ON study_plan_progress
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own progress
CREATE POLICY "Users can insert own study plan progress"
  ON study_plan_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own progress
CREATE POLICY "Users can update own study plan progress"
  ON study_plan_progress
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own progress
CREATE POLICY "Users can delete own study plan progress"
  ON study_plan_progress
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());