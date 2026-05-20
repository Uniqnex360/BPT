import { useState } from 'react';
import { Mail, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function SubscribeSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setSubmitting(true);

    const { error: insertError } = await supabase.from('subscribers').insert({
      email: email.trim().toLowerCase(),
      name: name.trim(),
    });

    setSubmitting(false);

    if (insertError) {
      if (insertError.code === '23505') {
        setError("You're already subscribed — we'll keep you posted!");
      } else {
        setError('Something went wrong. Please try again.');
      }
      return;
    }

    setSubmitted(true);
  }

  return (
    <section className="mx-4 md:mx-8 mb-8 rounded-3xl overflow-hidden">
      <div
        className="relative py-16 px-6"
        style={{ background: 'linear-gradient(135deg, #fce7f3 0%, #dcfce7 60%, #ccfbf1 100%)' }}
      >
        <div className="absolute top-0 left-0 w-48 h-48 bg-pink-300 rounded-full opacity-20 blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-56 h-56 bg-green-300 rounded-full opacity-20 blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <div className="max-w-xl mx-auto text-center relative">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
            <Mail size={24} className="text-pink-500" />
          </div>
          <div className="inline-flex items-center gap-2 bg-white/60 text-pink-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-4 border border-pink-200">
            <Sparkles size={12} /> Free Weekly Newsletter
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-800 mb-3">
            Words That Find You When You Need Them
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            New articles delivered straight to your inbox — no noise, no spam. Just one thoughtful read a week to help you grow.
          </p>

          {submitted ? (
            <div className="flex items-center justify-center gap-3 bg-white/80 border border-green-200 rounded-2xl px-6 py-5">
              <CheckCircle size={22} className="text-green-500 flex-shrink-0" />
              <div className="text-left">
                <p className="font-bold text-green-700">You're in!</p>
                <p className="text-sm text-green-600">Expect your first article in your inbox very soon.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              {error && (
                <div className="flex items-center justify-center gap-2 bg-white/80 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                  <AlertCircle size={15} />
                  {error}
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your first name"
                  className="flex-1 px-4 py-3.5 bg-white border border-pink-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 shadow-sm"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="flex-1 px-4 py-3.5 bg-white border border-pink-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 shadow-sm"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-7 py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-full hover:from-pink-600 hover:to-rose-600 transition-all disabled:opacity-60 shadow-md shadow-pink-200 whitespace-nowrap"
                >
                  {submitting ? 'Joining...' : 'Subscribe Free'}
                </button>
              </div>
              <p className="text-xs text-gray-400">Unsubscribe anytime. We respect your inbox.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
