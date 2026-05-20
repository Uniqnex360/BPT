import { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Page } from '../App';

type Props = {
  onNavigate: (page: Page) => void;
  onLoginSuccess: () => void;
};

export default function LoginPage({ onNavigate, onLoginSuccess }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
      return;
    }

    onLoginSuccess();
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 pt-20"
      style={{ background: 'linear-gradient(135deg, #fff0f6 0%, #dcfce7 100%)' }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <button onClick={() => onNavigate('home')} className="inline-flex flex-col items-center gap-2 mb-6">
            <img src="/image.png" alt="bepositivethinking" className="h-20 w-20 object-contain drop-shadow-md" />
            <span className="font-black text-xl">
              <span className="text-orange-400">be</span>
              <span className="text-pink-500">positive</span>
              <span className="text-teal-500">thinking</span>
            </span>
          </button>
          <h1 className="text-2xl font-black text-gray-900">Admin Login</h1>
          <p className="text-gray-500 text-sm mt-2">Sign in to publish and manage articles</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-pink-100 p-8 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-500"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold py-3 rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-pink-100"
          >
            {loading ? (
              <span className="animate-pulse">Signing in...</span>
            ) : (
              <><LogIn size={17} /> Sign In</>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          <button onClick={() => onNavigate('home')} className="hover:text-pink-500 transition-colors">
            ← Back to site
          </button>
        </p>
      </div>
    </div>
  );
}
