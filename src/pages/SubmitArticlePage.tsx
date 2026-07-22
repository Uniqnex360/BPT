import { useEffect, useState, useRef } from "react";
import {
  ArrowLeft,
  Send,
  CheckCircle,
  AlertCircle,
  PenLine,
  Eye,
  Edit3,
  Link as LinkIcon,
} from "lucide-react";
import { supabase, type Category } from "../lib/supabase";
import type { Page } from "../App";

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
  title: "",
  excerpt: "",
  content: "",
  cover_image: "",
  category: "",
  author_name: "",
  author_email: "",
};

export default function SubmitArticlePage({ onNavigate }: Props) {
  const [form, setForm] = useState<FormData>(EMPTY);
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Media states
  const [uploading, setUploading] = useState(false);
  const [mediaUrl, setMediaUrl] = useState("");
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    supabase
      .from("categories")
      .select("*")
      .order("name")
      .then(({ data }) => {
        const cats = data ?? [];
        setCategories(cats);
        if (cats.length > 0) setForm((f) => ({ ...f, category: cats[0].name }));
      });
  }, []);

  function set(key: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // Bulletproof raw HTML injection using safe cursor monitoring
  function insertMarkup(markup: string) {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentContent = form.content;

      const updatedContent =
        currentContent.substring(0, start) +
        markup +
        currentContent.substring(end, currentContent.length);

      set("content", updatedContent);

      // Restore cursor view focus smoothly
      setTimeout(() => {
        textarea.focus();
        const nextCursorPosition = start + markup.length;
        textarea.setSelectionRange(nextCursorPosition, nextCursorPosition);
      }, 50);
    } else {
      set("content", form.content + markup);
    }
  }

  // Storage Upload Logic
  async function uploadMedia(file: File) {
    setUploading(true);
    setError("");
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { error: storageError } = await supabase.storage
        .from("articles-media")
        .upload(fileName, file);

      if (storageError) throw storageError;

      const { data } = supabase.storage
        .from("articles-media")
        .getPublicUrl(fileName);

      const url = data.publicUrl;
      const html = file.type.startsWith("video")
        ? `\n<video controls width="100%" style="border-radius:12px; margin:12px 0;"><source src="${url}" /></video>\n`
        : `\n<img src="${url}" alt="Uploaded asset" style="max-width:100%; border-radius:12px; margin:12px 0; display:block;" />\n`;

      insertMarkup(html);
    } catch (err) {
      setError(
        "Upload failed. Please double check your bucket configuration rules in your dashboard.",
      );
    } finally {
      setUploading(false);
    }
  }

  // Paste Url Logic (Images & Videos)
  function addMediaUrl(type: "image" | "video") {
    const clean = mediaUrl.trim();
    if (!clean) return;

    const html =
      type === "video"
        ? `\n<video controls width="100%" style="border-radius:12px; margin:12px 0;"><source src="${clean}" /></video>\n`
        : `\n<img src="${clean}" alt="Linked asset" style="max-width:100%; border-radius:12px; margin:12px 0; display:block;" />\n`;

    insertMarkup(html);
    setMediaUrl("");
  }

  // Hyperlink Logic (Documents & External Websites)
  function addHyperlink() {
    const clean = mediaUrl.trim();
    if (!clean) return;

    const textarea = textareaRef.current;
    let selectedText = "";

    if (textarea) {
      selectedText = textarea.value.substring(
        textarea.selectionStart,
        textarea.selectionEnd,
      );
    }

    // Use highlighted text, or ask for a label, or default to the URL
    const label =
      selectedText ||
      window.prompt("Enter display text for this link:", "Read Document") ||
      clean;

    const html = `<a href="${clean}" target="_blank" rel="noopener noreferrer" style="color: #ec4899; font-weight: 600; underline: true;">${label}</a>`;

    insertMarkup(html);
    setMediaUrl("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (
      !form.title.trim() ||
      !form.content.trim() ||
      !form.author_name.trim() ||
      !form.author_email.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    const { error: err } = await supabase.from("article_submissions").insert({
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      content: form.content.trim(),
      cover_image: form.cover_image.trim(),
      category: form.category,
      author_name: form.author_name.trim(),
      author_email: form.author_email.trim(),
    });
    setSubmitting(false);
    if (err) {
      setError("Something went wrong. Please try again.");
      return;
    }
    setSubmitted(true);
    window.scrollTo(0, 0);
  }

  if (submitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6 pt-24"
        style={{
          background: "linear-gradient(180deg, #fff0f6 0%, #f0fdf4 100%)",
        }}
      >
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-50 border-2 border-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={36} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-3">
            Article Submitted!
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Thank you for sharing your story. We will reach out at{" "}
            <strong>{form.author_email}</strong> once reviewed.
          </p>
          <button
            onClick={() => onNavigate("home")}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-full shadow-sm"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pt-28"
      style={{
        background:
          "linear-gradient(180deg, #fff0f6 0%, #f0fdf4 60%, #f8fafc 100%)",
      }}
    >
      <div className="max-w-3xl mx-auto px-6 mb-8 text-center">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-pink-100">
          <PenLine size={28} className="text-pink-500" />
        </div>
        <h1 className="text-3xl font-black text-gray-900">Write for Us</h1>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-20">
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-pink-500 mb-6"
        >
          <ArrowLeft size={15} /> Back to Home
        </button>

        <div className="bg-white rounded-3xl border border-pink-100 shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                <AlertCircle size={15} /> {error}
              </div>
            )}

            {/* Author Inputs Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.author_name}
                  onChange={(e) => set("author_name", e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={form.author_email}
                  onChange={(e) => set("author_email", e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
                />
              </div>
            </div>

            {/* Meta Title Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="e.g. How Gratitude Changed My Morning"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                  Category *
                </label>
                <select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Excerpt Summary Text Area */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                Short Summary
              </label>
              <textarea
                value={form.excerpt}
                onChange={(e) => set("excerpt", e.target.value)}
                rows={2}
                placeholder="Brief summary of your piece..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 resize-none"
              />
            </div>

            {/* Content Segment with Workspace Tab Switching */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Article Content *
                </label>
                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setActiveTab("write")}
                    className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                      activeTab === "write"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    <Edit3 size={12} /> Write
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("preview")}
                    className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                      activeTab === "preview"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    <Eye size={12} /> Live Preview
                  </button>
                </div>
              </div>

              {/* Main Text Area / Preview Display Layout Box */}
              <div className="w-full border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-pink-200 bg-white">
                {activeTab === "write" ? (
                  <textarea
                    ref={textareaRef}
                    value={form.content}
                    onChange={(e) => set("content", e.target.value)}
                    rows={14}
                    placeholder="Write your article copy here. Use the utility frame below to add images, videos, documents, or website links cleanly."
                    className="w-full p-4 text-sm font-mono focus:outline-none border-none shadow-none resize-y block"
                  />
                ) : (
                  <div
                    style={{ minHeight: "336px" }}
                    className="w-full p-4 overflow-y-auto text-sm max-w-none prose prose-pink bg-gray-50/50"
                    dangerouslySetInnerHTML={{
                      __html:
                        form.content ||
                        '<p class="text-gray-400 italic">Nothing to preview yet. Start writing and add media links below!</p>',
                    }}
                  />
                )}

                {/* Lower Utility Dashboard Bar Panel */}
                <div className="bg-pink-50/30 border-t border-gray-100 p-3">
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    {/* Native File Uploader */}
                    <label className="cursor-pointer px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white font-semibold text-xs rounded-lg transition-colors inline-block shadow-sm shrink-0">
                      {uploading ? "Uploading..." : "Upload File"}
                      <input
                        type="file"
                        accept="image/*,video/*"
                        disabled={uploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadMedia(file);
                        }}
                        className="hidden"
                      />
                    </label>

                    <span className="text-xs text-gray-400 font-bold hidden sm:inline">
                      OR
                    </span>

                    {/* URL Link Action Bar */}
                    <div className="flex-1 w-full flex flex-wrap sm:flex-nowrap gap-1.5">
                      <input
                        value={mediaUrl}
                        onChange={(e) => setMediaUrl(e.target.value)}
                        placeholder="Paste image, video, doc, or website URL..."
                        className="flex-1 min-w-[180px] px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => addMediaUrl("image")}
                        className="px-2.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs rounded-lg shadow-sm shrink-0"
                      >
                        + Image
                      </button>
                      <button
                        type="button"
                        onClick={() => addMediaUrl("video")}
                        className="px-2.5 py-1.5 bg-green-500 hover:bg-green-600 text-white font-semibold text-xs rounded-lg shadow-sm shrink-0"
                      >
                        + Video
                      </button>
                      <button
                        type="button"
                        onClick={addHyperlink}
                        className="px-2.5 py-1.5 bg-purple-500 hover:bg-purple-600 text-white font-semibold text-xs rounded-lg shadow-sm shrink-0 inline-flex items-center gap-1"
                      >
                        <LinkIcon size={12} /> + Doc / Link
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cover Image Input Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                Cover Image URL{" "}
                <span className="text-gray-400 font-normal normal-case">
                  (optional)
                </span>
              </label>
              <input
                type="url"
                value={form.cover_image}
                onChange={(e) => set("cover_image", e.target.value)}
                placeholder="https://images.pexels.com/..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
              />
            </div>

            <div className="pt-2 border-t border-gray-100">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold px-8 py-3.5 rounded-full hover:from-pink-600 hover:to-rose-600 disabled:opacity-60 shadow-md"
              >
                {submitting ? "Submitting..." : "Submit Article"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
