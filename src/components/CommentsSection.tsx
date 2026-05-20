import { useEffect, useState } from 'react';
import { MessageCircle, Send, CheckCircle, AlertCircle, User } from 'lucide-react';
import { supabase, type Comment } from '../lib/supabase';

type Props = {
  articleId: string;
};

export default function CommentsSection({ articleId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchComments() {
      const { data } = await supabase
        .from('comments')
        .select('*')
        .eq('article_id', articleId)
        .eq('approved', true)
        .order('created_at', { ascending: true });
      setComments(data ?? []);
      setLoading(false);
    }
    fetchComments();
  }, [articleId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim() || !body.trim()) {
      setError('Please enter your name and comment.');
      return;
    }

    setSubmitting(true);

    const { error: insertError } = await supabase.from('comments').insert({
      article_id: articleId,
      author_name: name.trim(),
      author_email: email.trim(),
      body: body.trim(),
    });

    setSubmitting(false);

    if (insertError) {
      setError('Something went wrong. Please try again.');
      return;
    }

    setSubmitted(true);
    setName('');
    setEmail('');
    setBody('');
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <section className="mt-16 pt-10 border-t border-pink-100">
      <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-2">
        <MessageCircle size={22} className="text-pink-500" />
        {loading ? 'Comments' : comments.length > 0 ? `${comments.length} Comment${comments.length !== 1 ? 's' : ''}` : 'Comments'}
      </h2>

      {/* Existing comments */}
      {!loading && comments.length > 0 && (
        <div className="space-y-6 mb-12">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 border border-pink-200 flex items-center justify-center">
                <User size={16} className="text-pink-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="font-semibold text-gray-800 text-sm">{comment.author_name}</span>
                  <span className="text-xs text-gray-400">{formatDate(comment.created_at)}</span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{comment.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && comments.length === 0 && (
        <p className="text-gray-400 text-sm mb-10">Be the first to share your thoughts on this article.</p>
      )}

      {/* Comment form */}
      <div className="bg-gradient-to-br from-pink-50/80 to-rose-50/40 rounded-2xl border border-pink-100 p-6 md:p-8">
        <h3 className="text-lg font-bold text-gray-800 mb-1">Leave a Comment</h3>
        <p className="text-sm text-gray-500 mb-6">Your comment will appear after review. We read every one.</p>

        {submitted ? (
          <div className="flex items-start gap-3 bg-green-50 border border-green-100 rounded-xl p-4">
            <CheckCircle size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-700 text-sm">Thank you for your comment!</p>
              <p className="text-green-600 text-xs mt-0.5">It will appear here once approved — usually within 24 hours.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                <AlertCircle size={15} />
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Your Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full px-4 py-3 bg-white border border-pink-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full px-4 py-3 bg-white border border-pink-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
                <p className="text-xs text-gray-400 mt-1">Never shown publicly</p>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Your Thoughts *</label>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={4}
                placeholder="Share what this article meant to you..."
                className="w-full px-4 py-3 bg-white border border-pink-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold px-6 py-3 rounded-full hover:from-pink-600 hover:to-rose-600 transition-all disabled:opacity-60 shadow-sm shadow-pink-200"
            >
              <Send size={15} />
              {submitting ? 'Sending...' : 'Post Comment'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
