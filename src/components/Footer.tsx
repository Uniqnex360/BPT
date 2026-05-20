import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { supabase, type Category } from '../lib/supabase';
import SubscribeInline from './SubscribeInline';
import type { Page } from '../App';

type Props = {
  onNavigate: (page: Page) => void;
};

export default function Footer({ onNavigate }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .eq('show_in_footer', true)
      .order('name')
      .then(({ data }) => setCategories(data ?? []));
  }, []);

  return (
    <footer className="bg-gray-950 text-gray-400 mt-24">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <button onClick={() => onNavigate('home')} className="flex items-center mb-4">
              <img src="/image.png" alt="bepositivethinking" className="h-32 w-32 object-contain" />
            </button>
            <p className="text-xs text-gray-500 italic mb-2">Thoughts That Change Lives</p>
            <p className="text-sm leading-relaxed text-gray-500">
              A place to slow down, reflect, and reconnect with the best version of yourself — one article at a time.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => onNavigate('home')} className="hover:text-pink-400 transition-colors">Home</button></li>
              <li><button onClick={() => onNavigate('articles')} className="hover:text-pink-400 transition-colors">All Articles</button></li>
              <li><button onClick={() => onNavigate('submit')} className="hover:text-pink-400 transition-colors">Write for Us</button></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Topics</h4>
            <ul className="space-y-2 text-sm">
              {categories.map(c => (
                <li key={c.id}>
                  <span className="hover:text-pink-400 transition-colors cursor-default">{c.name}</span>
                </li>
              ))}
              {categories.length === 0 && (
                <li><span className="text-gray-600 text-xs">Loading...</span></li>
              )}
            </ul>
          </div>

          {/* Subscribe */}
          <div>
            <h4 className="text-white font-semibold mb-1 text-sm">Weekly Newsletter</h4>
            <p className="text-xs text-gray-500 mb-4">Get articles straight to your inbox</p>
            <SubscribeInline dark />
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>&copy; {new Date().getFullYear()} bepositivethinking. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart size={12} className="text-pink-500 fill-pink-500 mx-0.5" /> for a better world &nbsp;·&nbsp; #MindsetCreatesLife
          </p>
        </div>
      </div>
    </footer>
  );
}
