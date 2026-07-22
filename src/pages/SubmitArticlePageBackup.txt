import { useEffect, useState } from 'react';
import { ArrowLeft, Send, CheckCircle, AlertCircle, PenLine } from 'lucide-react';
import { supabase, type Category } from '../lib/supabase';
import type { Page } from '../App';

type Props = {
  onNavigate: (page: Page) => void;
};

type FormData = {
  title: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category: string;
  author_name: string;
  author_email: string;
};

const EMPTY: FormData = {
  title: '',
  excerpt: '',
  content: '',
  cover_image: '',
  category: '',
  author_name: '',
  author_email: '',
};

export default function SubmitArticlePage({ onNavigate }: Props) {
  const [form, setForm] = useState<FormData>(EMPTY);
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      const cats = data ?? [];
      setCategories(cats);
      if (cats.length > 0) setForm(f => ({ ...f, category: cats[0].name }));
    });
  }, []);

  function set(key: keyof FormData, value: string) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.title.trim() || !form.content.trim() || !form.author_name.trim() || !form.author_email.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    const { error: err } = await supabase.from('article_submissions').insert({
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      content: form.content.trim(),
      cover_image: form.cover_image.trim(),
      category: form.category,
      author_name: form.author_name.trim(),
      author_email: form.author_email.trim(),
    });
    setSubmitting(false);
    if (err) { setError('Something went wrong. Please try again.'); return; }
    setSubmitted(true);
    window.scrollTo(0, 0);
  }

  if (submitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6 pt-24"
        style={{ background: 'linear-gradient(180deg, #fff0f6 0%, #f0fdf4 100%)' }}
      >
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-50 border-2 border-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={36} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-3">Article Submitted!</h1>
          <p className="text-gray-500 leading-relaxed mb-8">
            Thank you for sharing your story. Our team will review your submission and reach out to you at <strong>{form.author_email}</strong> once a decision is made.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => onNavigate('home')}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-full hover:from-pink-600 hover:to-rose-600 transition-all shadow-sm"
            >
              Back to Home
            </button>
            <button
              onClick={() => { setForm(EMPTY); setSubmitted(false); }}
              className="px-6 py-3 bg-white border border-pink-200 text-pink-500 font-semibold rounded-full hover:bg-pink-50 transition-colors"
            >
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pt-28"
      style={{ background: 'linear-gradient(180deg, #fff0f6 0%, #f0fdf4 60%, #f8fafc 100%)' }}
    >
      {/* Hero */}
      <div className="max-w-3xl mx-auto px-6 mb-12 text-center">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-5 border border-pink-100">
          <PenLine size={28} className="text-pink-500" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Write for Us</h1>
        <p className="text-lg text-gray-500 leading-relaxed max-w-xl mx-auto">
          Have a story, insight, or experience that could uplift someone's day? Share it with our community. We review every submission with care.
        </p>
      </div>

      {/* Guidelines */}
      <div className="max-w-3xl mx-auto px-6 mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: 'Be Authentic', desc: 'Write from your real experience. Vulnerability connects.' },
            { title: 'Stay Positive', desc: 'Focus on growth, hope, and what\'s possible.' },
            { title: 'Keep it Clear', desc: 'Aim for 400–1200 words. Simple, honest language.' },
          ].map(({ title, desc }) => (
            <div key={title} className="bg-white rounded-2xl p-5 border border-pink-100 shadow-sm">
              <p className="font-bold text-gray-800 text-sm mb-1">{title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-6 pb-20">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-pink-500 transition-colors mb-8"
        >
          <ArrowLeft size={15} /> Back to Home
        </button>

        <div className="bg-white rounded-3xl border border-pink-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 px-8 py-6 border-b border-pink-100">
            <h2 className="text-xl font-black text-gray-900">Your Submission</h2>
            <p className="text-sm text-gray-500 mt-1">Fields marked * are required</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                <AlertCircle size={15} /> {error}
              </div>
            )}

            {/* Author info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Your Name *</label>
                <input
                  type="text"
                  value={form.author_name}
                  onChange={e => set('author_name', e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Email Address *</label>
                <input
                  type="email"
                  value={form.author_email}
                  onChange={e => set('author_email', e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
                <p className="text-xs text-gray-400 mt-1">We'll notify you about your submission here</p>
              </div>
            </div>

            {/* Title + Category */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Article Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                  placeholder="e.g. How Gratitude Changed My Morning Routine"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Category *</label>
                <select
                  value={form.category}
                  onChange={e => set('category', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
                >
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Short Summary <span className="text-gray-400 font-normal normal-case">(1–2 sentences)</span></label>
              <textarea
                value={form.excerpt}
                onChange={e => set('excerpt', e.target.value)}
                rows={2}
                placeholder="A brief description of what your article is about..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Article Content *</label>
              <textarea
                value={form.content}
                onChange={e => set('content', e.target.value)}
                rows={16}
                placeholder="Write your article here. You can use plain text or basic HTML tags like <p>, <h2>, <strong>, <em>, <ul>, <li>."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 resize-y"
              />
              <p className="text-xs text-gray-400 mt-1">Aim for 400–1200 words. HTML tags supported: &lt;p&gt;, &lt;h2&gt;, &lt;h3&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;blockquote&gt;</p>
            </div>

            {/* Cover image */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Cover Image URL <span className="text-gray-400 font-normal normal-case">(optional)</span></label>
              <input
                type="url"
                value={form.cover_image}
                onChange={e => set('cover_image', e.target.value)}
                placeholder="https://images.pexels.com/photos/..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
              <p className="text-xs text-gray-400 mt-1">Paste a direct link to an image (Pexels, Unsplash, etc.)</p>
            </div>

            <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row gap-3 items-start">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold px-8 py-3.5 rounded-full hover:from-pink-600 hover:to-rose-600 transition-all disabled:opacity-60 shadow-md shadow-pink-200"
              >
                <Send size={16} />
                {submitting ? 'Submitting...' : 'Submit Article'}
              </button>
              <p className="text-xs text-gray-400 pt-3">By submitting, you confirm this is your original work and agree to our editorial review process.</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
