import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ArticlesPage from './pages/ArticlesPage';
import ArticlePage from './pages/ArticlePage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import SubmitArticlePage from './pages/SubmitArticlePage';
import type { User } from '@supabase/supabase-js';

export type Page = 'home' | 'articles' | 'article' | 'admin' | 'login' | 'submit';

function getInitialPage(): Page {
  const hash = window.location.hash;
  if (hash === '#/admin') return 'login';
  return 'home';
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>(getInitialPage());
  const [articleSlug, setArticleSlug] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user && window.location.hash === '#/admin') {
        setCurrentPage('admin');
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    const onHashChange = () => {
      if (window.location.hash === '#/admin') {
        setCurrentPage(prev => prev === 'admin' ? 'admin' : 'login');
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  function navigate(page: Page, slug?: string) {
    if (page === 'admin' && !user) {
      window.location.hash = '#/admin';
      setCurrentPage('login');
      return;
    }
    if (page === 'admin') {
      window.location.hash = '#/admin';
    } else if (window.location.hash === '#/admin') {
      window.location.hash = '';
    }
    if (page === 'article' && slug) {
      setArticleSlug(slug);
    }
    setCurrentPage(page);
    window.scrollTo(0, 0);
  }

  function handleLoginSuccess() {
    setCurrentPage('admin');
  }

  function handleLogout() {
    window.location.hash = '';
    setCurrentPage('home');
  }

  const hideChrome = currentPage === 'login' || currentPage === 'admin';

  return (
    <div className="font-sans antialiased">
      {!hideChrome && (
        <Header currentPage={currentPage} onNavigate={navigate} isAdmin={!!user} />
      )}

      <main>
        {currentPage === 'home' && <HomePage onNavigate={navigate} />}
        {currentPage === 'articles' && <ArticlesPage onNavigate={navigate} />}
        {currentPage === 'article' && <ArticlePage slug={articleSlug} onNavigate={navigate} />}
        {currentPage === 'submit' && <SubmitArticlePage onNavigate={navigate} />}
        {currentPage === 'login' && (
          <LoginPage onNavigate={navigate} onLoginSuccess={handleLoginSuccess} />
        )}
        {currentPage === 'admin' && user && (
          <AdminPage onNavigate={navigate} onLogout={handleLogout} />
        )}
      </main>

      {!hideChrome && <Footer onNavigate={navigate} />}
    </div>
  );
}
