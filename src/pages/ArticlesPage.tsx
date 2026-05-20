import { useEffect, useState } from 'react';
import { Search, RefreshCw, BookOpen } from 'lucide-react';
import { supabase, type Article } from '../lib/supabase';
import ArticleCard from '../components/ArticleCard';
import type { Page } from '../App';

type Props = {
  onNavigate: (page: Page, slug?: string) => void;
};

const CATEGORIES = [
  'All',
  'Mindfulness',
  'Gratitude',
  'Resilience',
  'Self-Love',
  'Morning Rituals',
  'Emotional Wellness',
  'Positive Habits',
  'Mental Strength',
  'Purpose & Clarity',
  'Relationships',
  'Overcoming Fear',
  'Daily Inspiration',
];

export default function ArticlesPage({ onNavigate }: Props) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    async function fetchArticles() {
      const { data } = await supabase
        .from('articles')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false });
      setArticles(data ?? []);
      setLoading(false);
    }
    fetchArticles();
  }, []);

  const filtered = articles.filter(a => {
    const matchCat = activeCategory === 'All' || a.category === activeCategory;
    const matchSearch = search === '' ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen pt-24" style={{ background: 'linear-gradient(180deg, #fff0f6 0%, #f0fdf4 50%, #f8fafc 100%)' }}>
      {/* Page Header */}
      <div className="px-6 pt-12 pb-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">Read & Reflect</h1>
          <p className="text-gray-500 text-lg">Every piece is written to move you — toward clarity, calm, and courage</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-20">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-10 -mt-4">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-300" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-pink-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 shadow-sm"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs font-medium px-4 py-2 rounded-full transition-colors ${
                  activeCategory === cat
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-pink-300 hover:text-pink-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32 text-gray-400">
            <RefreshCw size={24} className="animate-spin mr-3 text-pink-400" />
            Loading articles...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32 text-gray-400">
            <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Nothing found</p>
            <p className="text-sm mt-1">Try a different search term or browse another category</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-6">{filtered.length} article{filtered.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(article => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onClick={() => onNavigate('article', article.slug)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
