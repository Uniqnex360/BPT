import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  useParams,
} from "react-router-dom";

import { supabase } from "./lib/supabase";
import type { User } from "@supabase/supabase-js";

import Header from "./components/Header";
import Footer from "./components/Footer";

import HomePage from "./pages/HomePage";
import ArticlesPage from "./pages/ArticlesPage";
import ArticlePage from "./pages/ArticlePage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";
import SubmitArticlePage from "./pages/SubmitArticlePage";

export type Page =
  | "home"
  | "articles"
  | "article"
  | "admin"
  | "login"
  | "submit"
  | "write-us";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setUser(session?.user ?? null);
      setLoading(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  function routeNavigate(page: Page, slug?: string) {
    switch (page) {
      case "home":
        navigate("/");
        break;

      case "articles":
        navigate("/articles");
        break;

      case "article":
        if (slug) {
          navigate(`/articles/${slug}`);
        }
        break;

      case "submit":
        navigate("/submit");
        break;

      case "write-us":
        navigate("/write-for-us");
        break;

      case "admin":
        if (user) {
          navigate("/admin");
        } else {
          navigate("/login");
        }
        break;

      case "login":
        navigate("/login");
        break;

      default:
        navigate("/");
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleLoginSuccess() {
    navigate("/admin");
  }

  function handleLogout() {
    supabase.auth.signOut();
    navigate("/");
  }

  const hideChrome =
    location.pathname === "/login" || location.pathname === "/admin";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="font-sans antialiased">
      {!hideChrome && <Header onNavigate={routeNavigate} isAdmin={!!user} />}

      <main>
        <Routes>
          <Route path="/" element={<HomePage onNavigate={routeNavigate} />} />

          <Route
            path="/articles"
            element={<ArticlesPage onNavigate={routeNavigate} />}
          />

          <Route
            path="/articles/:slug"
            element={<ArticleRouteWrapper onNavigate={routeNavigate} />}
          />

          <Route
            path="/submit"
            element={<SubmitArticlePage onNavigate={routeNavigate} />}
          />

          <Route
            path="/write-for-us"
            element={<SubmitArticlePage onNavigate={routeNavigate} />}
          />

          <Route
            path="/login"
            element={
              <LoginPage
                onNavigate={routeNavigate}
                onLoginSuccess={handleLoginSuccess}
              />
            }
          />

          <Route
            path="/admin"
            element={
              user ? (
                <AdminPage onNavigate={routeNavigate} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!hideChrome && <Footer onNavigate={routeNavigate} />}
    </div>
  );
}

function ArticleRouteWrapper({
  onNavigate,
}: {
  onNavigate: (page: Page, slug?: string) => void;
}) {
  const { slug } = useParams();

  return <ArticlePage slug={slug || ""} onNavigate={onNavigate} />;
}
