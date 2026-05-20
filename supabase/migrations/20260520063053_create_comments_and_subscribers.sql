/*
  # Add Comments and Newsletter Subscribers

  1. New Tables
    - `comments`
      - `id` (uuid, primary key)
      - `article_id` (uuid, FK to articles)
      - `author_name` (text) - commenter's display name
      - `author_email` (text) - commenter's email (not shown publicly)
      - `body` (text) - comment text
      - `approved` (boolean) - admin must approve before showing
      - `created_at` (timestamptz)

    - `subscribers`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `subscribed_at` (timestamptz)
      - `active` (boolean) - allows unsubscribing

  2. Security
    - Enable RLS on both tables
    - Comments: anyone can read approved comments; anyone can insert; only authenticated users can update/delete
    - Subscribers: anyone can insert their own email; only authenticated users can read/delete
*/

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  author_name text NOT NULL DEFAULT '',
  author_email text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read approved comments"
  ON comments FOR SELECT
  TO anon, authenticated
  USING (approved = true);

CREATE POLICY "Authenticated users can read all comments"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can post a comment"
  ON comments FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete comments"
  ON comments FOR DELETE
  TO authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  subscribed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe"
  ON subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read subscribers"
  ON subscribers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update subscribers"
  ON subscribers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete subscribers"
  ON subscribers FOR DELETE
  TO authenticated
  USING (true);
