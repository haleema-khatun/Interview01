/*
  # Create evaluations_history table for storing interview evaluation results

  1. New Tables
    - `evaluations_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `question_id` (text)
      - `question_title` (text)
      - `question_category` (enum: behavioral, technical, situational)
      - `answer_text` (text)
      - `clarity_score` (integer, 1-10)
      - `relevance_score` (integer, 1-10)
      - `critical_thinking_score` (integer, 1-10)
      - `thoroughness_score` (integer, 1-10)
      - `overall_score` (integer, 1-10)
      - `feedback_text` (text)
      - `strengths` (text array)
      - `improvements` (text array)
      - `ai_provider` (text)
      - `rating_mode` (text: tough/lenient)
      - `evaluation_type` (text: simple/detailed)
      - `response_time_seconds` (integer)
      - `face_report` (jsonb)
      - `violations` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `evaluations_history` table
    - Add policies for users to manage their own evaluations
    - Add admin policy to read all evaluations

  3. Performance
    - Add indexes for common query patterns
    - Unique constraint on user_id + question_id
*/

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can read own evaluation history" ON evaluations_history;
DROP POLICY IF EXISTS "Users can insert own evaluations" ON evaluations_history;
DROP POLICY IF EXISTS "Users can update own evaluations" ON evaluations_history;
DROP POLICY IF EXISTS "Users can delete own evaluations" ON evaluations_history;
DROP POLICY IF EXISTS "Admins can read all evaluations" ON evaluations_history;

-- Create evaluations_history table
CREATE TABLE IF NOT EXISTS evaluations_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id text NOT NULL,
  question_title text NOT NULL,
  question_category question_category NOT NULL,
  answer_text text NOT NULL,
  clarity_score integer NOT NULL CHECK (clarity_score >= 1 AND clarity_score <= 10),
  relevance_score integer NOT NULL CHECK (relevance_score >= 1 AND relevance_score <= 10),
  critical_thinking_score integer NOT NULL CHECK (critical_thinking_score >= 1 AND critical_thinking_score <= 10),
  thoroughness_score integer NOT NULL CHECK (thoroughness_score >= 1 AND thoroughness_score <= 10),
  overall_score integer NOT NULL CHECK (overall_score >= 1 AND overall_score <= 10),
  feedback_text text NOT NULL,
  strengths text[] DEFAULT '{}',
  improvements text[] DEFAULT '{}',
  ai_provider text NOT NULL,
  rating_mode text NOT NULL CHECK (rating_mode IN ('tough', 'lenient')),
  evaluation_type text DEFAULT 'simple' CHECK (evaluation_type IN ('simple', 'detailed')),
  response_time_seconds integer DEFAULT 0,
  face_report jsonb,
  violations jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_evaluations_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_evaluations_history_updated_at_trigger ON evaluations_history;
CREATE TRIGGER update_evaluations_history_updated_at_trigger
BEFORE UPDATE ON evaluations_history
FOR EACH ROW
EXECUTE FUNCTION update_evaluations_history_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_evaluations_history_user_id ON evaluations_history(user_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_history_question_id ON evaluations_history(question_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_history_created_at ON evaluations_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_evaluations_history_overall_score ON evaluations_history(overall_score);
CREATE INDEX IF NOT EXISTS idx_evaluations_history_category ON evaluations_history(question_category);

-- Drop existing unique index if it exists and recreate
DROP INDEX IF EXISTS idx_evaluations_history_user_question;
CREATE UNIQUE INDEX idx_evaluations_history_user_question ON evaluations_history(user_id, question_id);

-- Enable Row Level Security
ALTER TABLE evaluations_history ENABLE ROW LEVEL SECURITY;

-- Create policies (after dropping existing ones above)
-- Users can read their own evaluation history
CREATE POLICY "Users can read own evaluation history"
  ON evaluations_history
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own evaluations
CREATE POLICY "Users can insert own evaluations"
  ON evaluations_history
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own evaluations
CREATE POLICY "Users can update own evaluations"
  ON evaluations_history
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own evaluations
CREATE POLICY "Users can delete own evaluations"
  ON evaluations_history
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can read all evaluations
CREATE POLICY "Admins can read all evaluations"
  ON evaluations_history
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));