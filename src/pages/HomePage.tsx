import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, RefreshCw, Sparkles } from 'lucide-react';
import { supabase, type Article } from '../lib/supabase';
import ArticleCard from '../components/ArticleCard';
import SubscribeSection from '../components/SubscribeSection';
import type { Page } from '../App';

type Props = {
  onNavigate: (page: Page, slug?: string) => void;
};

export default function HomePage({ onNavigate }: Props) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      const { data } = await supabase
        .from('articles')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false })
        .limit(4);
      setArticles(data ?? []);
      setLoading(false);
    }
    fetchArticles();
  }, []);

  const [featured, ...rest] = articles;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #fff0f6 0%, #f0fdf4 60%, #f8fafc 100%)' }}>

      {/* Hero */}
      <section className="relative pt-28 pb-24 px-6 overflow-hidden">
        {/* Soft blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-16 -right-16 w-80 h-80 bg-pink-200 rounded-full opacity-30 blur-3xl" />
          <div className="absolute top-32 -left-20 w-72 h-72 bg-teal-200 rounded-full opacity-20 blur-3xl" />
          <div className="absolute bottom-10 right-1/3 w-64 h-64 bg-amber-100 rounded-full opacity-40 blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-pink-50 border border-pink-200 text-pink-600 text-sm font-medium px-4 py-2 rounded-full mb-6">
            <Sparkles size={13} />
            Thoughts That Change Lives
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-6 tracking-tight">
            <span className="text-gray-900">Small Shifts.</span><br />
            <span className="bg-gradient-to-r from-pink-500 via-rose-400 to-pink-600 bg-clip-text text-transparent">
              Big Life Changes.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-4">
            Real stories, gentle reminders, and practical tools to help you show up for yourself — with more peace, more courage, and more joy.
          </p>

          <p className="text-sm font-semibold text-teal-500 mb-10 tracking-wide">#MindsetCreatesLife</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('articles')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold px-8 py-4 rounded-full hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg shadow-pink-200"
            >
              Explore Articles <ArrowRight size={18} />
            </button>
            <button
              onClick={() => featured && onNavigate('article', featured?.slug)}
              className="inline-flex items-center gap-2 bg-white text-gray-700 font-semibold px-8 py-4 rounded-full hover:bg-gray-50 transition-colors border border-pink-100 shadow-sm"
            >
              <BookOpen size={18} className="text-teal-500" /> Read Latest
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-y border-pink-100 py-8">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 divide-x divide-pink-100 text-center">
          {[
            { value: '52+', label: 'Articles per year', color: 'text-pink-500' },
            { value: '5 min', label: 'Average read time', color: 'text-teal-500' },
            { value: '100%', label: 'Free to read', color: 'text-green-500' },
          ].map(({ value, label, color }) => (
            <div key={label} className="px-4">
              <p className={`text-2xl font-black mb-1 ${color}`}>{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Articles */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-black text-gray-900">Latest Articles</h2>
            <p className="text-gray-400 mt-1">Hand-picked reads to brighten your week</p>
          </div>
          <button
            onClick={() => onNavigate('articles')}
            className="hidden sm:flex items-center gap-2 text-sm font-semibold text-pink-500 hover:text-pink-600 transition-colors"
          >
            View all <ArrowRight size={16} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400">
            <RefreshCw size={24} className="animate-spin mr-3 text-pink-400" />
            Loading articles...
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Something beautiful is on its way</p>
            <p className="text-sm mt-1">The first article is being crafted with care — check back soon.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {featured && (
              <ArticleCard
                article={featured}
                featured
                onClick={() => onNavigate('article', featured.slug)}
              />
            )}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map(article => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onClick={() => onNavigate('article', article.slug)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-12 sm:hidden">
          <button
            onClick={() => onNavigate('articles')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-pink-500"
          >
            View all articles <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Subscribe section replaces old CTA */}
      <SubscribeSection />
    </div>
  );
}
