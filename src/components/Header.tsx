import { useState, useEffect, useRef } from "react";
import { Menu, X, Mail } from "lucide-react";
import { useLocation } from "react-router-dom";
import SubscribeInline from "./SubscribeInline";

type Page =
  | "home"
  | "articles"
  | "article"
  | "admin"
  | "login"
  | "submit"
  | "write-us";

type Props = {
  onNavigate: (page: Page) => void;
  isAdmin: boolean;
};

export default function Header({ onNavigate, isAdmin }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [subscribeOpen, setSubscribeOpen] = useState(false);

  const subscribeRef = useRef<HTMLDivElement>(null);

  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        subscribeRef.current &&
        !subscribeRef.current.contains(e.target as Node)
      ) {
        setSubscribeOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks: {
    label: string;
    page: Page;
    path: string;
  }[] = [
    {
      label: "Home",
      page: "home",
      path: "/",
    },
    {
      label: "Articles",
      page: "articles",
      path: "/articles",
    },
    {
      label: "Write for Us",
      page: "write-us",
      path: "/write-for-us",
    },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(path);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-sm shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-0 flex items-center justify-between">
        <button
          onClick={() => onNavigate("home")}
          className="flex items-center"
        >
          <img
            src="/image.png"
            alt="bepositivethinking"
            className="h-32 w-32 object-contain"
          />
        </button>

        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map(({ label, page, path }) => (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              className={`text-sm font-medium transition-colors hover:text-pink-500 ${
                isActive(path) ? "text-pink-500" : "text-gray-600"
              }`}
            >
              {label}
            </button>
          ))}

          <div className="relative" ref={subscribeRef}>
            <button
              onClick={() => setSubscribeOpen((o) => !o)}
              className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full border transition-all ${
                subscribeOpen
                  ? "bg-pink-500 text-white border-pink-500"
                  : "bg-white border-pink-300 text-pink-500 hover:bg-pink-50"
              }`}
            >
              <Mail size={14} />
              Subscribe
            </button>

            {subscribeOpen && (
              <div className="absolute right-0 top-full mt-3 w-72 bg-white rounded-2xl shadow-xl border border-pink-100 p-5 z-50">
                <p className="text-sm font-bold text-gray-800 mb-1">
                  Get articles in your inbox
                </p>

                <p className="text-xs text-gray-500 mb-4">
                  Join our free weekly newsletter
                </p>

                <SubscribeInline />
              </div>
            )}
          </div>

          {isAdmin && (
            <button
              onClick={() => onNavigate("admin")}
              className="text-sm font-semibold px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full hover:from-pink-600 hover:to-rose-600 transition-all shadow-sm shadow-pink-200"
            >
              Admin
            </button>
          )}
        </nav>

        <button
          className="md:hidden text-gray-700"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-pink-50 px-6 py-5 flex flex-col gap-5">
          {navLinks.map(({ label, page, path }) => (
            <button
              key={page}
              onClick={() => {
                onNavigate(page);

                setMobileOpen(false);
              }}
              className={`text-sm font-medium text-left transition-colors ${
                isActive(path) ? "text-pink-500" : "text-gray-600"
              }`}
            >
              {label}
            </button>
          ))}

          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
              Newsletter
            </p>

            <SubscribeInline />
          </div>

          {isAdmin && (
            <button
              onClick={() => {
                onNavigate("admin");

                setMobileOpen(false);
              }}
              className="text-sm font-semibold text-left text-pink-500"
            >
              Admin
            </button>
          )}
        </div>
      )}
    </header>
  );
}
