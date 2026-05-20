/*
  # Add Site Settings, Categories Management, and Article Submissions

  1. New Tables
    - `categories` — admin-managed list of categories shown on site/footer
      - `id` (uuid)
      - `name` (text, unique)
      - `show_in_footer` (boolean) — toggle visibility in footer
      - `created_at` (timestamptz)

    - `article_submissions` — user-submitted articles awaiting review
      - `id` (uuid)
      - `title`, `excerpt`, `content`, `cover_image`, `category` (text)
      - `author_name`, `author_email` (text)
      - `status` — 'pending' | 'approved' | 'rejected'
      - `admin_note` (text) — reason for rejection etc.
      - `article_id` (uuid, nullable FK) — set when approved & published
      - `created_at`, `updated_at`

  2. Security
    - RLS on both tables
    - Categories: public read; authenticated write
    - Submissions: anyone can insert; only authenticated can read/update all

  3. Seed default categories
*/

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  show_in_footer boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (true);

-- Seed default categories
INSERT INTO categories (name, show_in_footer) VALUES
  ('Mindfulness', true),
  ('Gratitude', true),
  ('Resilience', true),
  ('Self-Love', true),
  ('Morning Rituals', false),
  ('Emotional Wellness', true),
  ('Positive Habits', false),
  ('Mental Strength', true),
  ('Purpose & Clarity', false),
  ('Relationships', false),
  ('Overcoming Fear', false),
  ('Daily Inspiration', true)
ON CONFLICT (name) DO NOTHING;

-- Article submissions table
CREATE TABLE IF NOT EXISTS article_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  excerpt text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  cover_image text DEFAULT '',
  category text NOT NULL DEFAULT 'Mindfulness',
  author_name text NOT NULL DEFAULT '',
  author_email text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note text DEFAULT '',
  article_id uuid REFERENCES articles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE article_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an article"
  ON article_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read all submissions"
  ON article_submissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update submissions"
  ON article_submissions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete submissions"
  ON article_submissions FOR DELETE
  TO authenticated
  USING (true);

-- updated_at trigger for submissions
CREATE TRIGGER article_submissions_updated_at
  BEFORE UPDATE ON article_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
