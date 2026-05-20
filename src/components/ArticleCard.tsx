import { Clock, Tag } from 'lucide-react';
import type { Article } from '../lib/supabase';

type Props = {
  article: Article;
  onClick: () => void;
  featured?: boolean;
};

export default function ArticleCard({ article, onClick, featured = false }: Props) {
  const date = article.published_at
    ? new Date(article.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  if (featured) {
    return (
      <article
        onClick={onClick}
        className="group cursor-pointer grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-300 border border-pink-100"
      >
        <div className="relative overflow-hidden h-64 lg:h-auto">
          {article.cover_image ? (
            <img
              src={article.cover_image}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-pink-100 to-rose-100" />
          )}
          <span className="absolute top-4 left-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
            Featured
          </span>
        </div>
        <div className="p-8 lg:p-10 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center gap-1 text-xs text-pink-600 font-medium bg-pink-50 px-2 py-1 rounded-full">
              <Tag size={11} /> {article.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Clock size={11} /> {article.read_time} min read
            </span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-pink-500 transition-colors">
            {article.title}
          </h2>
          <p className="text-gray-500 leading-relaxed mb-6 line-clamp-3">{article.excerpt}</p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white text-sm font-bold">
              B
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{article.author_name}</p>
              <p className="text-xs text-gray-400">{date}</p>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
    >
      <div className="relative overflow-hidden h-48">
        {article.cover_image ? (
          <img
            src={article.cover_image}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-pink-100 to-teal-100" />
        )}
      </div>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="flex items-center gap-1 text-xs text-pink-600 font-medium bg-pink-50 px-2 py-1 rounded-full">
            <Tag size={11} /> {article.category}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Clock size={11} /> {article.read_time} min read
          </span>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug group-hover:text-pink-500 transition-colors line-clamp-2">
          {article.title}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">{article.excerpt}</p>
        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <span className="text-xs text-gray-400">{date}</span>
          <span className="text-xs font-semibold text-pink-500 group-hover:text-pink-600">Read more →</span>
        </div>
      </div>
    </article>
  );
}
