/*
  # Create bepositivethinking Articles Schema

  1. New Tables
    - `articles`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `slug` (text, unique, not null) - URL-friendly identifier
      - `excerpt` (text) - short summary shown on listing pages
      - `content` (text) - full article content (HTML or markdown)
      - `cover_image` (text) - URL to cover image
      - `category` (text) - article category/tag
      - `published` (boolean) - draft vs published state
      - `published_at` (timestamptz) - when article was published
      - `author_name` (text) - author display name
      - `read_time` (int) - estimated read time in minutes
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `articles` table
    - Public can read published articles
    - Only authenticated users (admins) can insert/update/delete

  3. Notes
    - slug must be unique for clean URLs
    - published_at is set when an article transitions to published state
*/

CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  slug text UNIQUE NOT NULL DEFAULT '',
  excerpt text DEFAULT '',
  content text DEFAULT '',
  cover_image text DEFAULT '',
  category text DEFAULT 'General',
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  author_name text NOT NULL DEFAULT 'BePositiveThinking',
  read_time int NOT NULL DEFAULT 3,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published articles"
  ON articles FOR SELECT
  TO anon, authenticated
  USING (published = true);

CREATE POLICY "Authenticated users can read all articles"
  ON articles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert articles"
  ON articles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update articles"
  ON articles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete articles"
  ON articles FOR DELETE
  TO authenticated
  USING (true);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
