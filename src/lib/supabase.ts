import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category: string;
  published: boolean;
  published_at: string | null;
  author_name: string;
  read_time: number;
  created_at: string;
  updated_at: string;
};

export type Comment = {
  id: string;
  article_id: string;
  author_name: string;
  author_email: string;
  body: string;
  approved: boolean;
  created_at: string;
};

export type Subscriber = {
  id: string;
  email: string;
  name: string;
  active: boolean;
  subscribed_at: string;
};

export type Category = {
  id: string;
  name: string;
  show_in_footer: boolean;
  created_at: string;
};

export type ArticleSubmission = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category: string;
  author_name: string;
  author_email: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_note: string;
  article_id: string | null;
  created_at: string;
  updated_at: string;
};
