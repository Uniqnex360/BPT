import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Clock,
  Tag,
  Calendar,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { supabase, type Article } from "../lib/supabase";
import CommentsSection from "../components/CommentsSection";
import type { Page } from "../App";

type Props = {
  slug: string;
  onNavigate: (page: Page, slug?: string) => void;
};

export default function ArticlePage({ slug, onNavigate }: Props) {
  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    async function fetchArticle() {
      setLoading(true);
      setNotFound(false);

      const { data } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();

      if (!data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setArticle(data);

      const { data: rel } = await supabase
        .from("articles")
        .select("*")
        .eq("published", true)
        .eq("category", data.category)
        .neq("id", data.id)
        .limit(3);

      setRelated(rel ?? []);
      setLoading(false);
    }

    fetchArticle();
  }, [slug]);

  // Helper function that formats raw content text and changes media URLs into actual elements
  function renderMediaContent(htmlContent: string) {
    if (!htmlContent) return "";

    let parsedContent = htmlContent;

    // 1. CRITICAL FIX: Find any broken <video> blocks wrapping a YouTube link and convert them to clean iframes
    const wrappedYoutubeRegex =
      /<video[^>]*>[\s\S]*?(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w\-]+)[^\s"<]*?)[\s\S]*?<\/video>/g;
    parsedContent = parsedContent.replace(
      wrappedYoutubeRegex,
      (match, url, videoId) => {
        return `<div style="margin: 24px 0; position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 16px; background: #000;">
      <iframe 
        src="https://www.youtube.com/embed/${videoId}" 
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen>
      </iframe>
    </div>`;
      },
    );

    // 2. Catch any standalone plain text YouTube links just in case
    const plainYoutubeRegex =
      /(?<!src=")(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w\-]+)[^\s"<]*)/g;
    parsedContent = parsedContent.replace(
      plainYoutubeRegex,
      (match, url, videoId) => {
        return `<div style="margin: 24px 0; position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 16px; background: #000;">
      <iframe 
        src="https://www.youtube.com/embed/${videoId}" 
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen>
      </iframe>
    </div>`;
      },
    );

    // 3. Keep working direct MP4 files untouched
    const videoRegex =
      /(?<!source src=")(https?:\/\/[^\s"<]+(?:\.mp4|\.webm|\.mov)[^\s"<]*)/g;
    parsedContent = parsedContent.replace(videoRegex, (url) => {
      if (
        url.includes("iframe") ||
        url.includes("<video") ||
        url.includes("youtube.com") ||
        url.includes("youtu.be")
      )
        return url;
      return `<div style="margin: 24px 0;">
      <video controls playsinline preload="metadata" width="100%" style="border-radius: 16px; display: block; background: #000;">
        <source src="${url}" type="video/mp4" />
      </video>
    </div>`;
    });

    return parsedContent;
  }

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center pt-24"
        style={{
          background: "linear-gradient(180deg, #fff0f6 0%, #f8fafc 100%)",
        }}
      >
        <RefreshCw size={28} className="animate-spin text-pink-400" />
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center pt-24 px-6 text-center"
        style={{
          background: "linear-gradient(180deg, #fff0f6 0%, #f8fafc 100%)",
        }}
      >
        <AlertCircle size={48} className="text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Article not found
        </h1>
        <button
          onClick={() => onNavigate("articles")}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-full font-medium shadow-sm"
        >
          <ArrowLeft size={16} /> Back to Articles
        </button>
      </div>
    );
  }

  const date = article.published_at
    ? new Date(article.published_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div
      className="min-h-screen pt-24"
      style={{
        background: "linear-gradient(180deg, #fff0f6 0%, #f8fafc 100%)",
      }}
    >
      {/* Cover Header */}
      {article.cover_image && (
        <div className="relative w-full h-64 md:h-96 overflow-hidden">
          <img
            src={article.cover_image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-6 py-12">
        <button
          onClick={() => onNavigate("articles")}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-pink-500 transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Back to Articles
        </button>

        {/* Categories / Meta details */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="flex items-center gap-1 text-xs text-pink-600 font-medium bg-pink-50 px-3 py-1.5 rounded-full border border-pink-100">
            <Tag size={11} /> {article.category}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Clock size={11} /> {article.read_time} min read
          </span>
          {date && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Calendar size={11} /> {date}
            </span>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 leading-tight mb-6">
          {article.title}
        </h1>

        <p className="text-lg text-gray-500 leading-relaxed mb-8 pb-8 border-b border-pink-100">
          {article.excerpt}
        </p>

        {/* Profile metadata */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold text-sm">
            {article.author_name
              ? article.author_name.charAt(0).toUpperCase()
              : "B"}
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">
              {article.author_name}
            </p>
            <p className="text-xs text-gray-400">{date}</p>
          </div>
        </div>

        {/* Main Content Render Box using custom layout parser */}
        <div
          className="prose prose-lg prose-gray max-w-none prose-img:rounded-2xl"
          dangerouslySetInnerHTML={{
            __html: renderMediaContent(article.content),
          }}
        />

        {/* Bottom Nav Bar details */}
        <div className="mt-12 pt-8 border-t border-pink-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <button
            onClick={() => onNavigate("articles")}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-pink-500 transition-colors"
          >
            <ArrowLeft size={16} /> All Articles
          </button>
          <p className="text-sm text-teal-500 font-medium">
            #MindsetCreatesLife
          </p>
        </div>

        <CommentsSection articleId={article.id} />
      </div>

      {/* Related Content grid */}
      {related.length > 0 && (
        <div className="bg-white border-t border-pink-50 py-16">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-2xl font-black text-gray-900 mb-8">
              More in {article.category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onNavigate("article", rel.slug)}
                  className="group cursor-pointer bg-pink-50/50 rounded-2xl overflow-hidden hover:shadow-md transition-all border border-pink-100"
                >
                  {rel.cover_image && (
                    <img
                      src={rel.cover_image}
                      alt={rel.title}
                      className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <div className="p-5">
                    <p className="text-xs text-pink-500 font-medium mb-2">
                      {rel.category}
                    </p>
                    <h3 className="font-bold text-gray-900 leading-snug group-hover:text-pink-500 transition-colors line-clamp-2">
                      {rel.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-2">
                      {rel.read_time} min read
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
