import { useEffect, useState } from 'react';
import {
  Plus, CreditCard as Edit2, Trash2, Eye, EyeOff, RefreshCw, Save, X, LogOut,
  CheckCircle, AlertCircle, BookOpen, MessageCircle, Mail, ThumbsUp, ThumbsDown,
  Tag, FileText
} from 'lucide-react';
import { supabase, type Article, type Comment, type Subscriber, type Category, type ArticleSubmission } from '../lib/supabase';
import type { Page } from '../App';

type Tab = 'articles' | 'submissions' | 'comments' | 'subscribers' | 'categories';

type Props = {
  onNavigate: (page: Page, slug?: string) => void;
  onLogout: () => void;
};

type ArticleForm = {
  title: string; slug: string; excerpt: string; content: string;
  cover_image: string; category: string; read_time: number;
  author_name: string; published: boolean;
};

const EMPTY_FORM: ArticleForm = {
  title: '', slug: '', excerpt: '', content: '',
  cover_image: '', category: 'Mindfulness', read_time: 3,
  author_name: 'BePositiveThinking', published: false,
};

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

export default function AdminPage({ onNavigate, onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('articles');

  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ArticleForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<Category[]>([]);

  const [submissions, setSubmissions] = useState<ArticleSubmission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [subscribersLoading, setSubscribersLoading] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [savingCategory, setSavingCategory] = useState(false);

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => { fetchArticles(); fetchCategoryOptions(); }, []);

  useEffect(() => {
    if (activeTab === 'submissions' && submissions.length === 0) fetchSubmissions();
    if (activeTab === 'comments' && comments.length === 0) fetchComments();
    if (activeTab === 'subscribers' && subscribers.length === 0) fetchSubscribers();
    if (activeTab === 'categories') fetchCategories();
  }, [activeTab]);

  async function fetchArticles() {
    setArticlesLoading(true);
    const { data } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
    setArticles(data ?? []);
    setArticlesLoading(false);
  }
  async function fetchCategoryOptions() {
    const { data } = await supabase.from('categories').select('*').order('name');
    setCategoryOptions(data ?? []);
  }
  async function fetchSubmissions() {
    setSubmissionsLoading(true);
    const { data } = await supabase.from('article_submissions').select('*').order('created_at', { ascending: false });
    setSubmissions(data ?? []);
    setSubmissionsLoading(false);
  }
  async function fetchComments() {
    setCommentsLoading(true);
    const { data } = await supabase.from('comments').select('*').order('created_at', { ascending: false });
    setComments(data ?? []);
    setCommentsLoading(false);
  }
  async function fetchSubscribers() {
    setSubscribersLoading(true);
    const { data } = await supabase.from('subscribers').select('*').order('subscribed_at', { ascending: false });
    setSubscribers(data ?? []);
    setSubscribersLoading(false);
  }
  async function fetchCategories() {
    setCategoriesLoading(true);
    const { data } = await supabase.from('categories').select('*').order('name');
    setCategories(data ?? []);
    setCategoriesLoading(false);
  }

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  }

  // Article CRUD
  function openNew() { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); window.scrollTo(0, 0); }
  function openEdit(a: Article) {
    setForm({ title: a.title, slug: a.slug, excerpt: a.excerpt, content: a.content, cover_image: a.cover_image, category: a.category, read_time: a.read_time, author_name: a.author_name, published: a.published });
    setEditingId(a.id); setShowForm(true); window.scrollTo(0, 0);
  }
  function handleTitleChange(title: string) { setForm(f => ({ ...f, title, slug: editingId ? f.slug : slugify(title) })); }

  async function handleSave() {
    if (!form.title.trim() || !form.slug.trim()) { showToast('error', 'Title and slug are required.'); return; }
    setSaving(true);
    const payload = { ...form, published_at: form.published ? (editingId ? undefined : new Date().toISOString()) : null };
    if (editingId) {
      const { error } = await supabase.from('articles').update(payload).eq('id', editingId);
      error ? showToast('error', 'Update failed: ' + error.message) : (showToast('success', 'Article updated!'), setShowForm(false), fetchArticles());
    } else {
      const { error } = await supabase.from('articles').insert(payload);
      error ? showToast('error', 'Create failed: ' + error.message) : (showToast('success', 'Article created!'), setShowForm(false), fetchArticles());
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from('articles').delete().eq('id', id);
    error ? showToast('error', 'Delete failed.') : (showToast('success', 'Deleted.'), setDeleteConfirm(null), fetchArticles());
  }

  async function togglePublished(a: Article) {
    const pub = !a.published;
    const { error } = await supabase.from('articles').update({ published: pub, published_at: pub ? new Date().toISOString() : null }).eq('id', a.id);
    error ? showToast('error', 'Failed.') : (showToast('success', pub ? 'Published!' : 'Unpublished.'), fetchArticles());
  }

  // Submissions
  async function approveSubmission(sub: ArticleSubmission) {
    const slug = slugify(sub.title) + '-' + Date.now().toString().slice(-5);
    const { data: article, error: artErr } = await supabase.from('articles').insert({
      title: sub.title, slug, excerpt: sub.excerpt, content: sub.content,
      cover_image: sub.cover_image, category: sub.category,
      author_name: sub.author_name, published: true,
      published_at: new Date().toISOString(), read_time: 5,
    }).select().maybeSingle();
    if (artErr) { showToast('error', 'Failed to publish article.'); return; }
    await supabase.from('article_submissions').update({ status: 'approved', article_id: article?.id }).eq('id', sub.id);
    showToast('success', 'Submission approved and published!');
    fetchSubmissions(); fetchArticles();
  }

  async function rejectSubmission(id: string) {
    await supabase.from('article_submissions').update({ status: 'rejected', admin_note: rejectNote }).eq('id', id);
    showToast('success', 'Submission rejected.');
    setReviewingId(null); setRejectNote(''); fetchSubmissions();
  }

  // Comments
  async function approveComment(id: string) {
    const { error } = await supabase.from('comments').update({ approved: true }).eq('id', id);
    error ? showToast('error', 'Failed.') : (showToast('success', 'Comment approved!'), fetchComments());
  }
  async function deleteComment(id: string) {
    const { error } = await supabase.from('comments').delete().eq('id', id);
    error ? showToast('error', 'Failed.') : (showToast('success', 'Deleted.'), fetchComments());
  }

  // Subscribers
  async function deleteSubscriber(id: string) {
    const { error } = await supabase.from('subscribers').delete().eq('id', id);
    error ? showToast('error', 'Failed.') : (showToast('success', 'Removed.'), fetchSubscribers());
  }

  // Categories
  async function addCategory() {
    if (!newCategoryName.trim()) return;
    setSavingCategory(true);
    const { error } = await supabase.from('categories').insert({ name: newCategoryName.trim() });
    setSavingCategory(false);
    error ? showToast('error', error.code === '23505' ? 'Category already exists.' : 'Failed to add.') : (showToast('success', 'Category added!'), setNewCategoryName(''), fetchCategories(), fetchCategoryOptions());
  }

  async function deleteCategory(id: string) {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    error ? showToast('error', 'Failed to delete.') : (showToast('success', 'Category deleted.'), fetchCategories(), fetchCategoryOptions());
  }

  async function toggleFooter(cat: Category) {
    const { error } = await supabase.from('categories').update({ show_in_footer: !cat.show_in_footer }).eq('id', cat.id);
    error ? showToast('error', 'Failed.') : fetchCategories();
  }

  async function handleLogout() { await supabase.auth.signOut(); onLogout(); }

  const pendingSubmissions = submissions.filter(s => s.status === 'pending').length;
  const pendingComments = comments.filter(c => !c.approved).length;
  const activeSubscribers = subscribers.filter(s => s.active).length;

  const tabs: { id: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'articles', label: 'Articles', icon: BookOpen },
    { id: 'submissions', label: 'Submissions', icon: FileText, badge: pendingSubmissions },
    { id: 'comments', label: 'Comments', icon: MessageCircle, badge: pendingComments },
    { id: 'subscribers', label: 'Subscribers', icon: Mail },
    { id: 'categories', label: 'Categories', icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg text-sm font-medium ${toast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-6">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-black text-gray-900 mb-2">Delete this article?</h3>
            <p className="text-sm text-gray-500 mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-600 transition-colors">Delete</button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {reviewingId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-6">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-black text-gray-900 mb-2">Reject Submission</h3>
            <p className="text-sm text-gray-500 mb-4">Optionally add a note for the author.</p>
            <textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)} rows={3} placeholder="Reason for rejection (optional)..." className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-red-200 resize-none" />
            <div className="flex gap-3">
              <button onClick={() => rejectSubmission(reviewingId)} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-600 transition-colors">Reject</button>
              <button onClick={() => { setReviewingId(null); setRejectNote(''); }} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <img src="/image.png" alt="" className="h-10 w-10 object-contain" />
            <div>
              <h1 className="text-2xl font-black text-gray-900">CMS Dashboard</h1>
              <p className="text-gray-400 text-xs">bepositivethinking</p>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <button onClick={() => onNavigate('home')} className="text-sm px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">View Site</button>
            {activeTab === 'articles' && (
              <button onClick={openNew} className="inline-flex items-center gap-2 text-sm px-5 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all shadow-sm">
                <Plus size={15} /> New Article
              </button>
            )}
            <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Sign out"><LogOut size={18} /></button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Articles', value: articles.filter(a => a.published).length, sub: `${articles.length} total`, icon: BookOpen, color: 'text-pink-400' },
            { label: 'Pending Submissions', value: pendingSubmissions, sub: `${submissions.length} total`, icon: FileText, color: 'text-amber-400' },
            { label: 'Pending Comments', value: pendingComments, sub: `${comments.length} total`, icon: MessageCircle, color: 'text-teal-400' },
            { label: 'Subscribers', value: activeSubscribers, sub: 'active readers', icon: Mail, color: 'text-green-400' },
          ].map(({ label, value, sub, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 px-5 py-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon size={16} className={color} />
                <span className="text-xs text-gray-500 font-medium">{label}</span>
              </div>
              <p className="text-2xl font-black text-gray-900">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit mb-8 flex-wrap">
          {tabs.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id); setShowForm(false); }}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Icon size={14} />
              {label}
              {!!badge && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">{badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── ARTICLES TAB ── */}
        {activeTab === 'articles' && (
          <>
            {showForm && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-8 overflow-hidden">
                <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-pink-50/50">
                  <h2 className="text-lg font-black text-gray-900">{editingId ? 'Edit Article' : 'New Article'}</h2>
                  <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Title *</label>
                      <input type="text" value={form.title} onChange={e => handleTitleChange(e.target.value)} placeholder="Article title" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Slug *</label>
                      <input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="url-friendly-slug" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 font-mono" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Excerpt</label>
                    <textarea value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} rows={2} placeholder="Short summary..." className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Content (HTML)</label>
                    <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={14} placeholder="<p>Write your article...</p>" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 resize-y font-mono" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Category</label>
                      <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white">
                        {categoryOptions.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Read Time (min)</label>
                      <input type="number" min={1} max={60} value={form.read_time} onChange={e => setForm(f => ({ ...f, read_time: Number(e.target.value) }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Author Name</label>
                      <input type="text" value={form.author_name} onChange={e => setForm(f => ({ ...f, author_name: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Cover Image URL</label>
                    <input type="url" value={form.cover_image} onChange={e => setForm(f => ({ ...f, cover_image: e.target.value }))} placeholder="https://images.pexels.com/..." className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300" />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-pink-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                    </label>
                    <span className="text-sm font-medium text-gray-700">{form.published ? 'Published — visible to everyone' : 'Draft — not visible to public'}</span>
                  </div>
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:from-pink-600 hover:to-rose-600 disabled:opacity-60 shadow-sm transition-all">
                      {saving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
                      {saving ? 'Saving...' : editingId ? 'Update Article' : 'Create Article'}
                    </button>
                    <button onClick={() => setShowForm(false)} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">Cancel</button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-black text-gray-900">All Articles <span className="text-gray-400 font-normal text-sm">({articles.length})</span></h2>
                <button onClick={fetchArticles} className="text-gray-400 hover:text-gray-600"><RefreshCw size={16} /></button>
              </div>
              {articlesLoading ? (
                <div className="flex items-center justify-center py-24 text-gray-400"><RefreshCw size={22} className="animate-spin mr-3" /> Loading...</div>
              ) : articles.length === 0 ? (
                <div className="text-center py-24 text-gray-400"><BookOpen size={48} className="mx-auto mb-4 opacity-30" /><p className="font-medium">No articles yet</p></div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {articles.map(a => (
                    <div key={a.id} className="px-8 py-4 flex items-center gap-4 hover:bg-gray-50/60 transition-colors">
                      {a.cover_image && <img src={a.cover_image} alt={a.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">{a.title}</h3>
                          <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${a.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{a.published ? 'Published' : 'Draft'}</span>
                        </div>
                        <p className="text-xs text-gray-400">{a.category} · {a.author_name} · {new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {a.published && <button onClick={() => onNavigate('article', a.slug)} className="p-2 text-gray-400 hover:text-teal-500 transition-colors" title="View"><Eye size={15} /></button>}
                        <button onClick={() => togglePublished(a)} className={`p-2 transition-colors ${a.published ? 'text-green-500 hover:text-gray-400' : 'text-gray-400 hover:text-green-500'}`} title={a.published ? 'Unpublish' : 'Publish'}>{a.published ? <Eye size={15} /> : <EyeOff size={15} />}</button>
                        <button onClick={() => openEdit(a)} className="p-2 text-gray-400 hover:text-pink-500 transition-colors" title="Edit"><Edit2 size={15} /></button>
                        <button onClick={() => setDeleteConfirm(a.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Delete"><Trash2 size={15} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── SUBMISSIONS TAB ── */}
        {activeTab === 'submissions' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-black text-gray-900">Reader Submissions <span className="text-gray-400 font-normal text-sm">({submissions.length})</span></h2>
                {pendingSubmissions > 0 && <p className="text-xs text-amber-500 font-medium mt-0.5">{pendingSubmissions} awaiting your review</p>}
              </div>
              <button onClick={fetchSubmissions} className="text-gray-400 hover:text-gray-600"><RefreshCw size={16} /></button>
            </div>
            {submissionsLoading ? (
              <div className="flex items-center justify-center py-24 text-gray-400"><RefreshCw size={22} className="animate-spin mr-3" /> Loading...</div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-24 text-gray-400"><FileText size={48} className="mx-auto mb-4 opacity-30" /><p className="font-medium">No submissions yet</p></div>
            ) : (
              <div className="divide-y divide-gray-50">
                {submissions.map(sub => (
                  <div key={sub.id} className={`px-8 py-6 ${sub.status === 'pending' ? 'bg-amber-50/30' : ''}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="font-bold text-gray-900">{sub.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${sub.status === 'pending' ? 'bg-amber-100 text-amber-700' : sub.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{sub.excerpt}</p>
                        <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                          <span>By <strong className="text-gray-700">{sub.author_name}</strong> ({sub.author_email})</span>
                          <span>{sub.category}</span>
                          <span>{new Date(sub.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        {sub.admin_note && <p className="text-xs text-red-500 mt-2">Note: {sub.admin_note}</p>}
                      </div>
                      {sub.status === 'pending' && (
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => approveSubmission(sub)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 text-sm font-semibold rounded-xl hover:bg-green-100 border border-green-200 transition-colors">
                            <ThumbsUp size={14} /> Approve & Publish
                          </button>
                          <button onClick={() => setReviewingId(sub.id)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-100 border border-red-200 transition-colors">
                            <ThumbsDown size={14} /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                    {/* Preview content */}
                    <details className="mt-4">
                      <summary className="text-xs text-pink-500 cursor-pointer font-medium hover:text-pink-600">Preview content</summary>
                      <div className="mt-3 p-4 bg-gray-50 rounded-xl text-sm text-gray-600 leading-relaxed max-h-48 overflow-y-auto" dangerouslySetInnerHTML={{ __html: sub.content.slice(0, 1200) + (sub.content.length > 1200 ? '…' : '') }} />
                    </details>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── COMMENTS TAB ── */}
        {activeTab === 'comments' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-black text-gray-900">Comments <span className="text-gray-400 font-normal text-sm">({comments.length})</span></h2>
                {pendingComments > 0 && <p className="text-xs text-orange-500 font-medium mt-0.5">{pendingComments} awaiting approval</p>}
              </div>
              <button onClick={fetchComments} className="text-gray-400 hover:text-gray-600"><RefreshCw size={16} /></button>
            </div>
            {commentsLoading ? (
              <div className="flex items-center justify-center py-24 text-gray-400"><RefreshCw size={22} className="animate-spin mr-3" /> Loading...</div>
            ) : comments.length === 0 ? (
              <div className="text-center py-24 text-gray-400"><MessageCircle size={48} className="mx-auto mb-4 opacity-30" /><p className="font-medium">No comments yet</p></div>
            ) : (
              <div className="divide-y divide-gray-50">
                {comments.map(c => (
                  <div key={c.id} className={`px-8 py-5 flex gap-4 ${!c.approved ? 'bg-orange-50/40' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="font-semibold text-gray-800 text-sm">{c.author_name}</span>
                        {c.author_email && <span className="text-xs text-gray-400">{c.author_email}</span>}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.approved ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-600'}`}>{c.approved ? 'Approved' : 'Pending'}</span>
                        <span className="text-xs text-gray-400 ml-auto">{new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{c.body}</p>
                    </div>
                    <div className="flex items-start gap-1 flex-shrink-0 pt-1">
                      {!c.approved && <button onClick={() => approveComment(c.id)} className="p-2 text-gray-400 hover:text-green-500 transition-colors" title="Approve"><ThumbsUp size={15} /></button>}
                      <button onClick={() => deleteComment(c.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Delete"><Trash2 size={15} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SUBSCRIBERS TAB ── */}
        {activeTab === 'subscribers' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-black text-gray-900">Newsletter Subscribers <span className="text-gray-400 font-normal text-sm">({activeSubscribers} active)</span></h2>
              </div>
              <button onClick={fetchSubscribers} className="text-gray-400 hover:text-gray-600"><RefreshCw size={16} /></button>
            </div>
            {subscribersLoading ? (
              <div className="flex items-center justify-center py-24 text-gray-400"><RefreshCw size={22} className="animate-spin mr-3" /> Loading...</div>
            ) : subscribers.length === 0 ? (
              <div className="text-center py-24 text-gray-400"><Mail size={48} className="mx-auto mb-4 opacity-30" /><p className="font-medium">No subscribers yet</p></div>
            ) : (
              <>
                <div className="divide-y divide-gray-50">
                  {subscribers.map(sub => (
                    <div key={sub.id} className="px-8 py-4 flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center text-pink-500 text-xs font-bold flex-shrink-0">
                        {(sub.name || sub.email)[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">{sub.name || '—'}</p>
                        <p className="text-xs text-gray-400">{sub.email}</p>
                      </div>
                      <span className="text-xs text-gray-400">{new Date(sub.subscribed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <button onClick={() => deleteSubscriber(sub.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                    </div>
                  ))}
                </div>
                <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
                  <button onClick={() => { navigator.clipboard.writeText(subscribers.filter(s => s.active).map(s => s.email).join(', ')); showToast('success', 'Emails copied!'); }} className="text-xs font-semibold text-pink-500 hover:text-pink-600 transition-colors">
                    Copy all email addresses to clipboard
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── CATEGORIES TAB ── */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-black text-gray-900">Categories <span className="text-gray-400 font-normal text-sm">({categories.length})</span></h2>
                <p className="text-xs text-gray-400 mt-0.5">Toggle which categories appear in the website footer</p>
              </div>
              <button onClick={fetchCategories} className="text-gray-400 hover:text-gray-600"><RefreshCw size={16} /></button>
            </div>

            {/* Add new category */}
            <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/50">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Add New Category</p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCategory()}
                  placeholder="e.g. Sleep & Recovery"
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
                <button
                  onClick={addCategory}
                  disabled={savingCategory || !newCategoryName.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all disabled:opacity-50"
                >
                  <Plus size={15} /> Add
                </button>
              </div>
            </div>

            {categoriesLoading ? (
              <div className="flex items-center justify-center py-24 text-gray-400"><RefreshCw size={22} className="animate-spin mr-3" /> Loading...</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {categories.map(cat => (
                  <div key={cat.id} className="px-8 py-4 flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{cat.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={cat.show_in_footer} onChange={() => toggleFooter(cat)} className="sr-only peer" />
                          <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-pink-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                        </label>
                        <span className="text-xs text-gray-500">Show in footer</span>
                      </div>
                      <button onClick={() => deleteCategory(cat.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Delete category"><Trash2 size={15} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
